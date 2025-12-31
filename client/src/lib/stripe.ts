import { loadStripe, type Stripe } from "@stripe/stripe-js";

const DEFAULT_TEST_KEY =
  "pk_test_51SZal26DEBxCnRhdMu56iaEmlW3a4f66LOxfYk3xXABTjnvDfreSoQOxjEYJQkcBgutgnpPyH90gwnGEqCWOinPT00JAePClQG";

const publishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || DEFAULT_TEST_KEY;

export const stripePromise: Promise<Stripe | null> | null = publishableKey
  ? loadStripe(publishableKey)
  : null;
