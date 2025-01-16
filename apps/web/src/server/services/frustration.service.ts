import { eventWithTime } from "@rrweb/types";
import { MouseInteractions, EventType, IncrementalSource } from "@rrweb/types";

export class FrustrationService {
  private static RAGE_CLICK_THRESHOLD = 3;
  private static RAGE_CLICK_TIMEFRAME = 1000;

  public static async calculateFrustrationScore(
    events: eventWithTime[],
    pageEvents: { href: string; timestamp: string }[]
  ): Promise<number> {
    const rageClickScore = this.detectRageClicks(events);
    const uturnScore = 0; // TODO: implement uturn detection
    console.log(pageEvents)
    // Apply weights (2:1 ratio)
    const weightedScore = (rageClickScore * 2 + uturnScore) / 3;

    // Normalize to 0-3 scale
    return this.normalizeScore(weightedScore);
  }

  private static detectRageClicks(events: eventWithTime[]): number {
    let rageClickCount = 0;
    let clickSequence: number[] = [];

    events.forEach(event => {
      if (
        event.type === EventType.IncrementalSnapshot &&
        event.data?.source === IncrementalSource.MouseInteraction && // Check source type
        event.data?.type === MouseInteractions.Click // Check for Click interaction
      ) {
        const timestamp = event.timestamp;
        
        // Remove clicks outside the timeframe
        clickSequence = clickSequence.filter(
          t => timestamp - t < this.RAGE_CLICK_TIMEFRAME
        );
        
        clickSequence.push(timestamp);

        if (clickSequence.length >= this.RAGE_CLICK_THRESHOLD) {
          rageClickCount++;
          clickSequence = []; // Reset after detecting rage click
        }
      }
    });

    // Normalize rage clicks (0-1 scale)
    return Math.min(rageClickCount / 5, 1);
  }

  private static normalizeScore(score: number): number {
    if (score < 0.25) return 0;
    if (score < 0.5) return 1;
    if (score < 0.75) return 2;
    return 3;
  }
}