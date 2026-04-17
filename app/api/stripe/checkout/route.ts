import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSessionIdFromCookie } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://bsc.demospace.online';

const PRICE_MAP: Record<string, string> = {
  sprint:         process.env.STRIPE_PRICE_SPRINT!,
  implementation: process.env.STRIPE_PRICE_IMPLEMENTATION!,
};

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();
    const sessionId = getSessionIdFromCookie(req);

    if (!sessionId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const priceId = PRICE_MAP[plan];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${BASE_URL}/bsc/${sessionId}?tab=table&paid=1`,
      cancel_url:  `${BASE_URL}/bsc/${sessionId}?tab=table&cancelled=1`,
      metadata: { bsc_session_id: sessionId, plan },
      payment_method_types: ['card'],
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error('Stripe checkout error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
