import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendBscRecoverEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, language } = await req.json();

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'email_required' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT id, company_name, full_name, language
       FROM bsc_sessions
       WHERE LOWER(email) = LOWER($1)
       ORDER BY created_at DESC`,
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const session = result.rows[0];

    await sendBscRecoverEmail({
      to: email.trim(),
      fullName: session.full_name,
      companyName: session.company_name,
      sessionId: session.id,
      language: language || session.language || 'ka',
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('recover error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
