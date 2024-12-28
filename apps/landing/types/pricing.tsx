export interface PricingPlan {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
    description: string;
    features: string[];
    limits: {
      sessions: number;
      retention: number;
    };
  }
  
  export interface SubscriptionStatus {
    plan: string;
    status: 'active' | 'canceled' | 'past_due';
    currentPeriodEnd: string;
    sessionsUsed: number;
    sessionsLimit: number;
  }