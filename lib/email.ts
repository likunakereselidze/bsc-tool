const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://bsc.demospace.online';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function sendEmail({
  to,
  name,
  subject,
  html,
}: {
  to: string;
  name: string;
  subject: string;
  html: string;
}) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'BSC Tool', email: 'noreply@demospace.online' },
      to: [{ email: to, name }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo error ${res.status}: ${body}`);
  }
}

// ── Flow 1: Welcome — BSC saved ────────────────────────────────────────────
export async function sendBscWelcomeEmail({
  to,
  fullName,
  companyName,
  sessionId,
  language,
}: {
  to: string;
  fullName: string;
  companyName: string;
  sessionId: string;
  language: string;
}) {
  const bscUrl = `${BASE_URL}/bsc/${sessionId}`;
  const isKa = language === 'ka';
  const n = esc(fullName);
  const c = esc(companyName);

  const subject = isKa
    ? `${companyName} — შენი BSC მზადაა`
    : `${companyName} — Your BSC is ready`;

  const html = isKa ? `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">${n},</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 24px;">შენი Balanced Scorecard <strong>${c}</strong>-სთვის შეინახა.</p>

      <a href="${bscUrl}" style="display: inline-block; background: #2563eb; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 28px;">
        BSC-ში გადასვლა →
      </a>

      <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px;">ლინკი ყოველთვის ხელმისაწვდომია:</p>
      <p style="font-size: 12px; color: #9ca3af; word-break: break-all; margin: 0 0 28px;">${bscUrl}</p>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0 0 20px;" />
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">BSC Tool · bsc.demospace.online</p>
    </div>
  ` : `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">Hi ${n},</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 24px;">Your Balanced Scorecard for <strong>${c}</strong> has been saved.</p>

      <a href="${bscUrl}" style="display: inline-block; background: #2563eb; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 28px;">
        Open my BSC →
      </a>

      <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px;">Your link — bookmark it:</p>
      <p style="font-size: 12px; color: #9ca3af; word-break: break-all; margin: 0 0 28px;">${bscUrl}</p>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0 0 20px;" />
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">BSC Tool · bsc.demospace.online</p>
    </div>
  `;

  await sendEmail({ to, name: fullName, subject, html });
}

// ── Flow 2: Nudge 1 — no objectives after 2 days ───────────────────────────
export async function sendBscNudge1Email({
  to,
  fullName,
  companyName,
  sessionId,
  language,
}: {
  to: string;
  fullName: string;
  companyName: string;
  sessionId: string;
  language: string;
}) {
  const bscUrl = `${BASE_URL}/bsc/${sessionId}`;
  const isKa = language === 'ka';
  const n = esc(fullName);
  const c = esc(companyName);

  const subject = isKa
    ? `${companyName} — BSC ჯერ ცარიელია`
    : `${companyName} — Your BSC is still empty`;

  const html = isKa ? `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">${n},</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 16px;">შენი <strong>${c}</strong>-ის BSC ჯერ კიდევ ცარიელია — სტრატეგიული მიზნები ჯერ არ არის დამატებული.</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 24px;">სცადე AI ასისტენტი — ის გარამდ მოგამზადებს პირველ მიზნებს 30 წამში.</p>

      <a href="${bscUrl}" style="display: inline-block; background: #2563eb; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 28px;">
        BSC-ის შევსება →
      </a>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0 0 20px;" />
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">BSC Tool · bsc.demospace.online</p>
    </div>
  ` : `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">Hi ${n},</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 16px;">Your BSC for <strong>${c}</strong> is still empty — no strategic objectives have been added yet.</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 24px;">Try the AI assistant — it can generate your first objectives in 30 seconds.</p>

      <a href="${bscUrl}" style="display: inline-block; background: #2563eb; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 28px;">
        Fill in my BSC →
      </a>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0 0 20px;" />
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">BSC Tool · bsc.demospace.online</p>
    </div>
  `;

  await sendEmail({ to, name: fullName, subject, html });
}

// ── Flow 3: Nudge 2 — BSC incomplete after 7 days ─────────────────────────
export async function sendBscNudge2Email({
  to,
  fullName,
  companyName,
  sessionId,
  language,
}: {
  to: string;
  fullName: string;
  companyName: string;
  sessionId: string;
  language: string;
}) {
  const bscUrl = `${BASE_URL}/bsc/${sessionId}`;
  const isKa = language === 'ka';
  const n = esc(fullName);
  const c = esc(companyName);

  const subject = isKa
    ? `${companyName} — BSC დაასრულე`
    : `${companyName} — Finish your BSC`;

  const html = isKa ? `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">${n},</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 16px;">შენი <strong>${c}</strong>-ის Balanced Scorecard თითქმის მზადაა — დაამატე KPI-ები და ინიციატივები, რათა სრულად ისარგებლო.</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 24px;">სტრატეგია მაშინ მუშაობს, როდესაც ყველა ბლოკი არის შევსებული.</p>

      <a href="${bscUrl}" style="display: inline-block; background: #2563eb; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 28px;">
        BSC-ის დასრულება →
      </a>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0 0 20px;" />
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">BSC Tool · bsc.demospace.online</p>
    </div>
  ` : `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">Hi ${n},</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 16px;">Your Balanced Scorecard for <strong>${c}</strong> is almost there — add KPIs and initiatives to get the full picture.</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 24px;">Strategy works best when every block is filled in.</p>

      <a href="${bscUrl}" style="display: inline-block; background: #2563eb; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 28px;">
        Finish my BSC →
      </a>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0 0 20px;" />
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">BSC Tool · bsc.demospace.online</p>
    </div>
  `;

  await sendEmail({ to, name: fullName, subject, html });
}

// ── Flow 4: Recover — resend BSC link ─────────────────────────────────────
export async function sendBscRecoverEmail({
  to,
  fullName,
  companyName,
  sessionId,
  language,
}: {
  to: string;
  fullName: string;
  companyName: string;
  sessionId: string;
  language: string;
}) {
  const bscUrl = `${BASE_URL}/bsc/${sessionId}`;
  const isKa = language === 'ka';
  const n = esc(fullName);
  const c = esc(companyName);

  const subject = isKa
    ? `${companyName} — შენი BSC ლინკი`
    : `${companyName} — Your BSC link`;

  const html = isKa ? `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">${n},</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 24px;">ეს შენი <strong>${c}</strong>-ის Balanced Scorecard-ის ლინკია — ბოლო შენახული სესია.</p>

      <a href="${bscUrl}" style="display: inline-block; background: #2563eb; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 28px;">
        BSC-ში გადასვლა →
      </a>

      <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px;">შეინახე ლინკი:</p>
      <p style="font-size: 12px; color: #9ca3af; word-break: break-all; margin: 0 0 28px;">${bscUrl}</p>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0 0 20px;" />
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">BSC Tool · bsc.demospace.online</p>
    </div>
  ` : `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">Hi ${n},</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 24px;">Here is your Balanced Scorecard link for <strong>${c}</strong> — your most recent session.</p>

      <a href="${bscUrl}" style="display: inline-block; background: #2563eb; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 28px;">
        Open my BSC →
      </a>

      <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px;">Bookmark your link:</p>
      <p style="font-size: 12px; color: #9ca3af; word-break: break-all; margin: 0 0 28px;">${bscUrl}</p>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0 0 20px;" />
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">BSC Tool · bsc.demospace.online</p>
    </div>
  `;

  await sendEmail({ to, name: fullName, subject, html });
}

// ── Flow 5: Completion — BSC fully filled ─────────────────────────────────
export async function sendBscCompletionEmail({
  to,
  fullName,
  companyName,
  sessionId,
  language,
}: {
  to: string;
  fullName: string;
  companyName: string;
  sessionId: string;
  language: string;
}) {
  const bscUrl = `${BASE_URL}/bsc/${sessionId}`;
  const isKa = language === 'ka';
  const n = esc(fullName);
  const c = esc(companyName);

  const subject = isKa
    ? `${companyName} — BSC სრულია`
    : `${companyName} — Your BSC is complete`;

  const html = isKa ? `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">${n},</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 16px;"><strong>${c}</strong>-ის Balanced Scorecard სრულად შევსებულია — ყველა პერსპექტივა, მიზანი და KPI ადგილზეა.</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 24px;">შემდეგი ნაბიჯი: <strong>დაიწყე პროგრესის ჩაწერა.</strong> ყოველ კვარტალში შეიყვანე რეალური მაჩვენებლები — სტრატეგია მხოლოდ მაშინ მუშაობს, როდესაც ის ცოცხალია.</p>

      <a href="${bscUrl}?tab=progress" style="display: inline-block; background: #059669; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 28px;">
        პროგრესის ჩაწერა →
      </a>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0 0 20px;" />
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">BSC Tool · bsc.demospace.online</p>
    </div>
  ` : `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">Hi ${n},</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 16px;">Your Balanced Scorecard for <strong>${c}</strong> is fully complete — all four perspectives, objectives, and KPIs are in place.</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 24px;">Next step: <strong>start logging progress.</strong> Enter actual values each quarter — strategy only works when it stays alive.</p>

      <a href="${bscUrl}?tab=progress" style="display: inline-block; background: #059669; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 28px;">
        Log my progress →
      </a>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0 0 20px;" />
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">BSC Tool · bsc.demospace.online</p>
    </div>
  `;

  await sendEmail({ to, name: fullName, subject, html });
}

// ── Payment confirmation ───────────────────────────────────────────────────
export async function sendBscPaymentEmail({
  to,
  fullName,
  companyName,
  sessionId,
  language,
  plan,
}: {
  to: string;
  fullName: string;
  companyName: string;
  sessionId: string;
  language: string;
  plan: string;
}) {
  const bscUrl = `${BASE_URL}/bsc/${sessionId}`;
  const calendlyUrl = process.env.CALENDLY_URL || 'https://calendly.com/likunakereselidze/30min';
  const isKa = language === 'ka';
  const n = esc(fullName);
  const c = esc(companyName);
  const planName = plan === 'sprint' ? 'BSC Sprint' : 'BSC Implementation';

  const subject = isKa
    ? `${companyName} — გადახდა დადასტურდა`
    : `${companyName} — Payment confirmed`;

  const html = isKa ? `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">${n},</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 8px;"><strong>${planName}</strong> — გადახდა წარმატებით დასრულდა.</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 24px;">შემდეგი ნაბიჯი: დაჯავშნე პირველი სესია.</p>

      <a href="${calendlyUrl}" style="display: inline-block; background: #059669; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 28px;">
        სესიის დაჯავშნა →
      </a>

      <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px;">შენი BSC:</p>
      <p style="font-size: 12px; color: #9ca3af; word-break: break-all; margin: 0 0 28px;">${bscUrl}</p>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0 0 20px;" />
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">BSC Tool · bsc.demospace.online</p>
    </div>
  ` : `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">Hi ${n},</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 8px;">Your payment for <strong>${planName}</strong> is confirmed.</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 24px;">Next step: book your first session.</p>

      <a href="${calendlyUrl}" style="display: inline-block; background: #059669; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 28px;">
        Book my session →
      </a>

      <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px;">Your BSC:</p>
      <p style="font-size: 12px; color: #9ca3af; word-break: break-all; margin: 0 0 28px;">${bscUrl}</p>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0 0 20px;" />
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">BSC Tool · bsc.demospace.online</p>
    </div>
  `;

  await sendEmail({ to, name: fullName, subject, html });
}
