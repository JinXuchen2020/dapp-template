'use client'
import { createCheckoutSession } from "@/app/actions/checkout";
import { Stripe } from "@stripe/stripe-js";
import { Button } from "antd"
import { FunctionComponent } from "react";

export const CheckoutForm: FunctionComponent<{stripePromise: () => Promise<Stripe | null>}> = ({stripePromise}) => {
  const handleClick = async (formData: FormData) => {
    const stripe = await stripePromise();
    // const response = await fetch(new URL('/api/create-checkout-session', 'http://localhost:3000'), {
    //   method: 'POST',
    // });

    // const session = await response.json();
    const session = await createCheckoutSession();

    const result = await stripe!.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error(result.error.message);
    }
  };
  return (
    <form
      action={handleClick}
    >
      <Button type="primary" htmlType="submit">Check Out</Button>
    </form>
  )
}