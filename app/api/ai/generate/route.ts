import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/bsc-db';
import { getSessionIdFromCookie } from '@/lib/auth';
import pool from '@/lib/db';

const FREE_TIER_LIMIT = 1;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const STAGE_LABELS: Record<string, string> = {
  pre_export:    'pre-export (not yet exporting)',
  first_export:  'first exports (just started)',
  active_export: 'active exporter',
  scaling:       'scaling exports internationally',
};

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
  }

  try {
    const { session_id } = await req.json();
    if (!session_id) return NextResponse.json({ error: 'session_id required' }, { status: 400 });

    if (getSessionIdFromCookie(req) !== session_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const session = await getSession(session_id);
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const { company_name, industry, export_stage, language } = session;
    const stageName = export_stage ? (STAGE_LABELS[export_stage] ?? export_stage) : 'unknown stage';
    const langInstr = language === 'ka'
      ? 'Write ALL text (objective titles, KPI names) in Georgian (ქართული). Use proper Georgian business vocabulary.'
      : 'Write all text in English.';

    const prompt = `You are a strategic planning expert specializing in export development for Georgian companies.

Generate a Balanced Scorecard (BSC) for:
- Company: ${company_name}
- Industry/Sector: ${industry ?? 'not specified'}
- Export stage: ${stageName}

${langInstr}

Return ONLY a valid JSON object with exactly this structure (no markdown, no extra text):
{
  "financial": [
    { "title": "...", "kpis": [{ "name": "...", "unit": "...", "baseline": "...", "target": "..." }] }
  ],
  "customer": [...],
  "internal": [...],
  "learning": [...]
}

Rules for each perspective — be STRICT about which goals belong where:

FINANCIAL: Revenue, profit, export volume, margins. Examples: "Increase export revenue by 40%", "Achieve 25% gross margin on exports". NEVER put operational or HR goals here.

CUSTOMER: Buyer relationships, market access, customer satisfaction, brand. Examples: "Enter 2 new export markets", "Achieve 95% on-time delivery to buyers". NEVER put financial metrics here.

INTERNAL: Operations, production efficiency, supply chain, quality, compliance, certifications. Examples: "Obtain GlobalGAP certification", "Reduce production lead time by 20%". NEVER put financial goals or HR development here.

LEARNING: Team capabilities, technology, systems, organizational learning. Examples: "Build in-house export sales capability", "Implement CRM system for buyer management". NEVER put financial or operational goals here.

Additional rules:
- Generate 2-4 objectives per perspective, each with 2-3 KPIs
- KPI targets should be realistic and measurable for the given industry and export stage
- Baseline values should reflect current typical state; targets should be achievable in 12 months
- Use industry-specific vocabulary
- All four perspectives MUST have objectives`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 });
    }

    // Strip any markdown code fences if present
    let jsonText = content.text.trim();
    jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let result;
    try {
      result = JSON.parse(jsonText);
    } catch {
      console.error('Failed to parse AI response', jsonText);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    // Validate structure
    const perspectives = ['financial', 'customer', 'internal', 'learning'];
    for (const p of perspectives) {
      if (!Array.isArray(result[p])) {
        return NextResponse.json({ error: `Invalid response: missing ${p}` }, { status: 500 });
      }
    }

    // Atomically increment counter, enforcing free-tier limit
    const limitRes = await pool.query(
      `UPDATE bsc_sessions
       SET ai_generations_used = ai_generations_used + 1
       WHERE id = $1 AND (paid_tier = true OR ai_generations_used < $2)
       RETURNING id`,
      [session_id, FREE_TIER_LIMIT]
    );
    if ((limitRes.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: 'limit_reached' }, { status: 403 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('POST /api/ai/generate', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
