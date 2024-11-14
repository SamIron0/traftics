import { createClient } from "@/utils/supabase/server";
import { SessionModel } from "../models/session.model";
import { RecordedEvent } from "@/types";
import { Tables } from "../../supabase/types";
const supabase = await createClient();

const BUCKET_NAME = "sessions";

export class SessionService {
  static async getSessions(
    req: any,
    siteId?: string
  ): Promise<Tables<"sessions">[]> {
    return SessionModel.findAll(req, siteId);
  }

  static async getSession(
    req: any,
    id: string
  ): Promise<{
    session: Tables<"sessions">;
    events: RecordedEvent[];
  }> {
    const session = await SessionModel.findOne(req, id);
    if (!session) {
      throw new Error("Session not found");
    }

    // Get events from Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(`${session.site_id}/${session.id}/events.json`);

    if (error) {
      throw new Error("Failed to fetch session events");
    }

    const text = await data.text();
    const events = JSON.parse(text || "[]");

    return {
      session,
      events,
    };
  }
}
