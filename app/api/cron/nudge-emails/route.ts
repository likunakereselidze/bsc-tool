import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendBscNudge1Email, sendBscNudge2Email, sendBscCompletionEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Verify secret
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const results = { nudge1: 0, nudge2: 0, completion: 0, errors: [] as string[] };

  // ── Nudge 1: sessions with no objectives, email set, created 2+ days ago, not yet nudged ──
  const nudge1Rows = await pool.query<{
    id: string;
    company_name: string;
    full_name: string;
    email: string;
    language: string;
  }>(`
    SELECT s.id, s.company_name, s.full_name, s.email, s.language
    FROM bsc_sessions s
    LEFT JOIN bsc_objectives o ON o.session_id = s.id
    WHERE s.email IS NOT NULL
      AND s.full_name IS NOT NULL
      AND s.nudge1_sent_at IS NULL
      AND s.created_at <= NOW() - INTERVAL '2 days'
    GROUP BY s.id
    HAVING COUNT(o.id) = 0
  `);

  for (const row of nudge1Rows.rows) {
    try {
      await sendBscNudge1Email({
        to: row.email,
        fullName: row.full_name,
        companyName: row.company_name,
        sessionId: row.id,
        language: row.language,
      });
      await pool.query(
        'UPDATE bsc_sessions SET nudge1_sent_at = $1 WHERE id = $2',
        [now, row.id]
      );
      results.nudge1++;
    } catch (err) {
      results.errors.push(`nudge1 ${row.id}: ${String(err)}`);
    }
  }

  // ── Nudge 2: sessions with objectives but no KPIs on any of them, 7+ days ago, not yet nudged ──
  const nudge2Rows = await pool.query<{
    id: string;
    company_name: string;
    full_name: string;
    email: string;
    language: string;
  }>(`
    SELECT DISTINCT s.id, s.company_name, s.full_name, s.email, s.language
    FROM bsc_sessions s
    JOIN bsc_objectives o ON o.session_id = s.id
    LEFT JOIN bsc_kpis k ON k.objective_id = o.id
    WHERE s.email IS NOT NULL
      AND s.full_name IS NOT NULL
      AND s.nudge2_sent_at IS NULL
      AND s.created_at <= NOW() - INTERVAL '7 days'
    GROUP BY s.id
    HAVING COUNT(k.id) = 0
  `);

  for (const row of nudge2Rows.rows) {
    try {
      await sendBscNudge2Email({
        to: row.email,
        fullName: row.full_name,
        companyName: row.company_name,
        sessionId: row.id,
        language: row.language,
      });
      await pool.query(
        'UPDATE bsc_sessions SET nudge2_sent_at = $1 WHERE id = $2',
        [now, row.id]
      );
      results.nudge2++;
    } catch (err) {
      results.errors.push(`nudge2 ${row.id}: ${String(err)}`);
    }
  }

  // ── Completion: all 4 perspectives have objectives, every objective has ≥1 KPI ──
  const completionRows = await pool.query<{
    id: string;
    company_name: string;
    full_name: string;
    email: string;
    language: string;
  }>(`
    SELECT s.id, s.company_name, s.full_name, s.email, s.language
    FROM bsc_sessions s
    WHERE s.email IS NOT NULL
      AND s.full_name IS NOT NULL
      AND s.completion_email_sent_at IS NULL
      AND (
        SELECT COUNT(DISTINCT perspective) FROM bsc_objectives WHERE session_id = s.id
      ) = 4
      AND NOT EXISTS (
        SELECT 1 FROM bsc_objectives o
        LEFT JOIN bsc_kpis k ON k.objective_id = o.id
        WHERE o.session_id = s.id
        GROUP BY o.id
        HAVING COUNT(k.id) = 0
      )
  `);

  for (const row of completionRows.rows) {
    try {
      await sendBscCompletionEmail({
        to: row.email,
        fullName: row.full_name,
        companyName: row.company_name,
        sessionId: row.id,
        language: row.language,
      });
      await pool.query(
        'UPDATE bsc_sessions SET completion_email_sent_at = $1 WHERE id = $2',
        [now, row.id]
      );
      results.completion++;
    } catch (err) {
      results.errors.push(`completion ${row.id}: ${String(err)}`);
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
