import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/bsc-db';
import { sendBscWelcomeEmail } from '@/lib/email';

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
      full_name: body.full_name?.trim() || undefined,
      email: body.email?.trim().toLowerCase() || undefined,
    });

    const response = NextResponse.json(session, { status: 201 });
    response.cookies.set('bsc_session_id', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    // Send welcome email (fire-and-forget — don't block the response)
    if (session.email && session.full_name) {
      sendBscWelcomeEmail({
        to: session.email,
        fullName: session.full_name,
        companyName: session.company_name,
        sessionId: session.id,
        language: session.language,
      }).catch((err) => console.error('Email send failed:', err));
    }

    return response;
  } catch (err) {
    console.error('POST /api/sessions', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
