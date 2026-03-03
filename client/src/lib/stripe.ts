import { loadStripe, type Stripe } from "@stripe/stripe-js";

// Type declaration for Vite environment variables
interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    readonly __importMetaEnv__: ImportMetaEnv;
  }
}

const DEFAULT_TEST_KEY =
  "pk_test_51SZal26DEBxCnRhdMu56iaEmlW3a4f66LOxfYk3xXABTjnvDfreSoQOxjEYJQkcBgutgnpPyH90gwnGEqCWOinPT00JAePClQG";

const publishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || DEFAULT_TEST_KEY;

export const stripePromise: Promise<Stripe | null> | null = publishableKey
  ? loadStripe(publishableKey)
  : null;
