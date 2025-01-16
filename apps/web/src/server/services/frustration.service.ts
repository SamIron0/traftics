import { eventWithTime } from "@rrweb/types";
import { MouseInteractions, EventType, IncrementalSource } from "@rrweb/types";

export class FrustrationService {
  private static RAGE_CLICK_THRESHOLD = 3;
  private static RAGE_CLICK_TIMEFRAME = 1000;
  private static UTURN_THRESHOLD = 5000; // 5 seconds threshold for U-turn detection

  public static async calculateFrustrationScore(
    events: eventWithTime[],
    pageEvents: { href: string; timestamp: string }[]
  ): Promise<number> {
    const rageClickScore = this.detectRageClicks(events);
    const uturnScore = this.detectUturns(events);
    
    // Apply weights (1:1 ratio)
    const weightedScore = (rageClickScore + uturnScore) / 2;

    // Normalize to 0-3 scale
    return this.normalizeScore(weightedScore);
  }

  private static detectRageClicks(events: eventWithTime[]): number {
    let rageClickCount = 0;
    let clickSequence: number[] = [];

    events.forEach(event => {
      if (
        event.type === EventType.IncrementalSnapshot &&
        event.data?.source === IncrementalSource.MouseInteraction &&
        event.data?.type === MouseInteractions.Click
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

  private static detectUturns(events: eventWithTime[]): number {
    let uturnCount = 0;
    const navigationEvents: {
      url: string;
      timestamp: number;
      referrer: string;
    }[] = [];

    events.forEach(event => {
      if (event.type === EventType.Custom && event.data?.tag === "url_change") {
        const payload = event.data.payload as { href: string; referrer: string };
        const currentUrl = payload.href;
        const currentTimestamp = event.timestamp;
        const referrer = payload.referrer;

        navigationEvents.push({
          url: currentUrl,
          timestamp: currentTimestamp,
          referrer: referrer,
        });

        if (navigationEvents.length >= 2) {
          const currentNav = navigationEvents[navigationEvents.length - 1];
          const prevNav = navigationEvents[navigationEvents.length - 2];
          const timeDifference = currentNav.timestamp - prevNav.timestamp;

          if (timeDifference <= this.UTURN_THRESHOLD && currentUrl === prevNav.referrer) {
            uturnCount++;
          }
        }
      }
    });

    // Normalize U-turns (0-1 scale)
    return Math.min(uturnCount / 3, 1);
  }

  private static normalizeScore(score: number): number {
    if (score < 0.25) return 0;
    if (score < 0.5) return 1;
    if (score < 0.75) return 2;
    return 3;
  }
}