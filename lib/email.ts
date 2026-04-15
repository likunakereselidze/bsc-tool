import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://bsc.demospace.online';

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

  const subject = isKa
    ? `${companyName} — შენი BSC მზადაა`
    : `${companyName} — Your BSC is ready`;

  const html = isKa ? `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">${fullName},</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 24px;">შენი Balanced Scorecard <strong>${companyName}</strong>-სთვის შეინახა.</p>

      <a href="${bscUrl}" style="display: inline-block; background: #2563eb; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 28px;">
        BSC-ში გადასვლა →
      </a>

      <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px;">ლინკი ყოველთვის ხელმისაწვდომია:</p>
      <p style="font-size: 12px; color: #9ca3af; word-break: break-all; margin: 0 0 28px;">${bscUrl}</p>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0 0 20px;" />
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">
        Digital Export Manager · Lia Kereselidze<br/>
        კითხვების შემთხვევაში: <a href="mailto:likunakereselidze@gmail.com" style="color: #6b7280;">likunakereselidze@gmail.com</a>
      </p>
    </div>
  ` : `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">Hi ${fullName},</p>
      <p style="font-size: 15px; color: #374151; margin: 0 0 24px;">Your Balanced Scorecard for <strong>${companyName}</strong> has been saved.</p>

      <a href="${bscUrl}" style="display: inline-block; background: #2563eb; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 28px;">
        Open my BSC →
      </a>

      <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px;">Your link — bookmark it:</p>
      <p style="font-size: 12px; color: #9ca3af; word-break: break-all; margin: 0 0 28px;">${bscUrl}</p>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0 0 20px;" />
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">
        Digital Export Manager · Lia Kereselidze<br/>
        Questions: <a href="mailto:likunakereselidze@gmail.com" style="color: #6b7280;">likunakereselidze@gmail.com</a>
      </p>
    </div>
  `;

  await resend.emails.send({
    from: 'Digital Export Manager <noreply@saletool.ninja>',
    to,
    subject,
    html,
  });
}
