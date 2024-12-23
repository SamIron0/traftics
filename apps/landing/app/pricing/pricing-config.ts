import { PricingPlan } from "@/types/ppricing";

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    description: "Perfect for personal projects and small websites",
    features: [
      "Real-time analytics",
      "Session recordings",
      "Up to 1,000 monthly sessions",
      "Data retention - 30 days",
    ],
    limits: {
      sessions: 1000,
      retention: 30,
    },
  },
  {
    id: "price_1QSvE6BwxSl9KXhs2RFlD6xL",
    name: "Pro",
    price: 20,
    interval: "month",
    description: "For larger organizations",
    features: [
      "Everything in Growth, plus:",
      "Unlimited monthly sessions",
      "Data retention - 1 year",
      "Dedicated support",
    ],
    limits: {
      sessions: -1, // Unlimited
      retention: 365,
    },
  },
];
