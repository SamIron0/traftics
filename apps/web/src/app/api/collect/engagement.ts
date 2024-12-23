import { EventType, IncrementalSource, MouseInteractions } from "@rrweb/types";
import { Session } from "@/types/api";
import { EngagementMetrics, EngagementThresholds } from "@/types/engagement";

const WEIGHTS = {
  DURATION: 30,
  INTERACTIONS: 50, 
  PAGE_VISITS: 20
} as const;

const THRESHOLDS: EngagementThresholds = {
  duration: {
    low: 60 * 1000,
    medium: 300 * 1000,
    high: 900 * 1000
  },
  interactions: {
    low: 5,
    medium: 20,
    high: 50
  },
  pageVisits: {
    low: 1,
    medium: 3,
    high: 5
  }
};

export function calculateEngagement(session: Session): EngagementMetrics {
  const durationScore = calculateDurationScore(session.duration || 0);
  const { interactionScore, pageVisitScore } = calculateInteractionScores(session);
  
  const totalScore = Math.min(100, 
    durationScore + interactionScore + pageVisitScore
  );

  const normalizedScore = normalizeEngagementScore(totalScore);

  return {
    durationScore,
    interactionScore, 
    pageVisitScore,
    totalScore,
    normalizedScore
  };
}

function calculateDurationScore(duration: number): number {
  const { low, medium, high } = THRESHOLDS.duration;
  
  if (duration >= high) return WEIGHTS.DURATION;
  if (duration >= medium) return WEIGHTS.DURATION * 0.7;
  if (duration >= low) return WEIGHTS.DURATION * 0.3;
  return WEIGHTS.DURATION * 0.1;
}

function calculateInteractionScores(session: Session) {
  let interactionCount = 0;
  const uniquePages = new Set<string>();

  session.events?.forEach(event => {
    if (event.type === EventType.IncrementalSnapshot) {
      if (event.data.source === IncrementalSource.MouseInteraction) {
        const validInteractions = [
          MouseInteractions.Click,
          MouseInteractions.MouseDown,
        ];
        if (validInteractions.includes(event.data.type)) {
          interactionCount++;
        }
      }
      if (event.data.source === IncrementalSource.Input) {
        interactionCount++;
      }
      if(event.data.source === IncrementalSource.Scroll) {
        interactionCount++;
      }
    }
    
    if (event.type === EventType.Meta) {
      uniquePages.add(event.data.href);
    }
  });

  const interactionScore = normalizeScore(
    interactionCount,
    THRESHOLDS.interactions,
    WEIGHTS.INTERACTIONS
  );

  const pageVisitScore = normalizeScore(
    uniquePages.size,
    THRESHOLDS.pageVisits,
    WEIGHTS.PAGE_VISITS
  );

  return { interactionScore, pageVisitScore };
}

function normalizeScore(
  value: number, 
  thresholds: { low: number; medium: number; high: number },
  maxWeight: number
): number {
  if (value >= thresholds.high) return maxWeight;
  if (value >= thresholds.medium) return maxWeight * 0.7;
  if (value >= thresholds.low) return maxWeight * 0.3;
  return maxWeight * 0.1;
}

function normalizeEngagementScore(score: number): number {
  // Convert 0-100 scale to 0-3 discrete scale
  if (score < 25) return 0;
  if (score < 50) return 1; 
  if (score < 75) return 2;
  return 3;
}