import { CheckoutForm } from '@/components/CheckoutForm';
import { getStripe } from '@/utils/stripe';
export default function Checkout() {
  return (
    <div>
      <h1>Checkout</h1>
      <CheckoutForm stripePromise={getStripe} />
    </div>
  );
}