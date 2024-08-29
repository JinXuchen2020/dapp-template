"use server";

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'alipay'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'test',
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/?canceled=true`,
    });
    return { id: session.id };
  } catch (err: any) {
    throw new Error(err.message);
  }
}