import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
        (event.data.object as any).id,
        {
          expand: ["line_items"],
        }
      );
      const lineItems = sessionWithLineItems.line_items;

      if (!lineItems) return NextResponse.json({ statusCode: 500, message: "Internal Server Error" });

      try {
        // Save the data, change customer account info, etc
        console.log("Fullfill the order with custom logic");
        console.log("data", lineItems.data);
        console.log(
          "customer email",
          (event.data.object as any).customer_details.email
        );
        console.log("created", (event.data.object as any).created);
      } catch (error) {
        console.log("Handling when you're unable to save an order");
      }
    }

    return NextResponse.json({ received: true}) ;
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ statusCode: 500, message: error.message });
  }
}