import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import pool from '@/lib/db';
import { sendBscPaymentEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // No webhook secret yet (dev mode) — parse directly
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error('Webhook signature error', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bscSessionId = session.metadata?.bsc_session_id;
    const plan = session.metadata?.plan;

    if (bscSessionId && plan) {
      try {
        // Unlock paid tier and record plan
        await pool.query(
          `UPDATE bsc_sessions
           SET paid_tier = true, paid_tier_plan = $1
           WHERE id = $2`,
          [plan, bscSessionId]
        );

        // Fetch session details to send confirmation email
        const res = await pool.query(
          'SELECT email, full_name, company_name, language FROM bsc_sessions WHERE id = $1',
          [bscSessionId]
        );
        const row = res.rows[0];
        if (row?.email) {
          await sendBscPaymentEmail({
            to: row.email,
            fullName: row.full_name,
            companyName: row.company_name,
            sessionId: bscSessionId,
            language: row.language,
            plan,
          });
        }
      } catch (err) {
        console.error('Webhook processing error', err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
