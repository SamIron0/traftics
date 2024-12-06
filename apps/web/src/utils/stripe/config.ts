import Stripe from 'stripe';

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY ?? '',
  {
    // @ts-expect-error - Stripe types are not properly resolved in this context
    apiVersion: null,
    appInfo: {
      name: 'Traftic',
      version: '0.0.0',
      url: 'https://traftic.com'
    }
  }
);