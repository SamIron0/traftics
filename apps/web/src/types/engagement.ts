export interface EngagementMetrics {
  durationScore: number;
  interactionScore: number; 
  pageVisitScore: number;
  totalScore: number;
  normalizedScore: number;
}

export interface EngagementThresholds {
  duration: {
    low: number;
    medium: number;
    high: number;
  };
  interactions: {
    low: number;
    medium: number;
    high: number;
  };
  pageVisits: {
    low: number;
    medium: number;
    high: number;
  };
}