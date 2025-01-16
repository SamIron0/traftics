import { createClient } from "@/utils/supabase/server";

export type SessionEventType =
  | "rage_click"
  | "refresh"
  | "selection"
  | "uturn"
  | "window_resize"
  | "click"
  | "input"
  | "page_view"
  | "error";
interface SessionEvent {
  session_id: string;
  event_type: SessionEventType;
  timestamp: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
}

export class SessionEventService {
  static async storeEvent(event: SessionEvent): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from("session_events").insert([event]);

    if (error) throw error;
  }

  static async getSessionEvents(sessionId: string): Promise<SessionEvent[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("session_events")
      .select("*")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: true });

    if (error) throw error;
    return data;
  }
}
