import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/bsc-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company_name, industry, export_stage, language } = body;

    if (!company_name?.trim()) {
      return NextResponse.json({ error: 'company_name required' }, { status: 400 });
    }

    const session = await createSession({
      company_name: company_name.trim(),
      industry: industry?.trim() || undefined,
      export_stage: export_stage || undefined,
      language: language === 'en' ? 'en' : 'ka',
    });

    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    console.error('POST /api/sessions', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
