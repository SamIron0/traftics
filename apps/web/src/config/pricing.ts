import { PricingPlan } from "@/types/pricing";

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
    id: "price_1QSuZ5BwxSl9KXhsirvklxRu",
    name: "Growth",
    price: 29,
    interval: "month",
    description: "For growing businesses",
    features: [
      "Everything in Free, plus:",
      "Up to 10,000 monthly sessions",
      "Custom events tracking",
      "Priority email support",
    ],
    limits: {
      sessions: 10000,
      retention: 30,
    },
  },
];
