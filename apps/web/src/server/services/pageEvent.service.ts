import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";
import { EventType, eventWithTime } from "@rrweb/types";

export interface PageEvent {
  id: string;
  session_id: string;
  site_id: string;
  href: string;
  referrer: string | null;
  timestamp: string;
  error_count: number;
  page_load_time: number | null;
  scroll_depth: number | null;
  time_spent: number | null;
}

export class PageEventService {
  static async savePageMetrics(pageMetric: Partial<PageEvent>) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("page_events")
      .insert(pageMetric);

    if (error) {
      console.error("Error saving page metrics:", error);
      throw error;
    }
    return data;
  }

  static async calculatePageMetrics(
    sessionId: string,
    siteId: string,
    events: eventWithTime[]
  ) {
    try {
      const pageEvents = [];
      let lastMetaOrUrlChangeEvent: PageEvent | null = null;

      for (const event of events) {
        lastMetaOrUrlChangeEvent = this.handleEvent(event, sessionId, siteId, lastMetaOrUrlChangeEvent);
        if (lastMetaOrUrlChangeEvent) {
          pageEvents.push(lastMetaOrUrlChangeEvent);
        }
      }

      for (const pageEvent of pageEvents) {
        console.log("Saving page metrics:", pageEvent);
        await this.savePageMetrics(pageEvent);
      }

      return pageEvents;
    } catch (error) {
      console.error("Error calculating page metrics:", error);
      throw error;
    }
  }

  private static handleEvent(event: eventWithTime, sessionId: string, siteId: string, lastEvent: PageEvent | null): PageEvent | null {
    if (event.type === EventType.Custom && event.data.tag === "url_change") {
      return this.createPageEvent(event, sessionId, siteId);
    } else if (event.type === EventType.Custom && event.data.tag === "page_load" && lastEvent) {
      lastEvent.page_load_time = (event.data.payload as { pageLoadTime: number }).pageLoadTime || null;
      return null; // Return null as we push the lastEvent to pageEvents in the main loop
    }
    return lastEvent; // Return the last event if no new event is created
  }

  private static createPageEvent(event: eventWithTime, sessionId: string, siteId: string): PageEvent {
    const href = event.type === EventType.Meta ? event.data.href : (event.data as { payload: { href: string } })?.payload.href || '';
    return {
      id: uuidv4(),
      session_id: sessionId,
      site_id: siteId,
      href,
      referrer: event.type === EventType.Custom ? (event.data as { payload: { referrer: string } }).payload.referrer : null,
      timestamp: new Date(event.timestamp).toISOString(),
      page_load_time: null,
      error_count: 0,
      scroll_depth: 0,
      time_spent: 0,
    };
  }
}
