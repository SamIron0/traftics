import { createClient } from "@/utils/supabase/server";
import { SessionModel } from "../models/session.model";
import { TablesInsert } from "supabase/types";
import { ServiceRequest } from "@/types/api";
import { Session } from "@/types/api";
import { eventWithTime } from "@rrweb/types";
const BUCKET_NAME = "sessions";

export class SessionService {
  static async getSessions(req: ServiceRequest): Promise<Session[]> {
    return SessionModel.findAll(req);
  }

  static async getSession(
    req: ServiceRequest,
    id: string
  ): Promise<Session & { events: eventWithTime[] }> {
    const session = await SessionModel.findOne(req, id);
    if (!session) {
      throw new Error("Session not found");
    }

    const supabase = await createClient();
    const prefix = `${session.site_id}/${session.id}/chunks/`;

    // List all chunks for this session
    const { data: chunks, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(prefix);

    if (listError) {
      throw listError;
    }
    // Download and merge chunks in parallel
    const events = await Promise.all(
      chunks.map(async (chunk) => {
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .download(`${prefix}${chunk.name}`);

        if (error) throw error;
        return JSON.parse(await data.text());
      })
    ).then((chunkArrays) =>
      chunkArrays.flat().sort((a, b) => a.timestamp - b.timestamp)
    );

    return { ...session, events };
  }

  static async createSession(
    session: Session
  ): Promise<TablesInsert<"sessions">> {
    try {
      // 1. Create/update session record in database
      const createdSession = await SessionModel.create(session);
      return createdSession;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  static async updateDuration(sessionId: string, duration: number): Promise<void> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('sessions')
      .update({ duration })
      .eq('id', sessionId);

    if (error) throw error;
  }

  static async storeEvents(
    sessionId: string, 
    siteId: string, 
    events: eventWithTime[]
  ): Promise<void> {
    const supabase = await createClient();
    const chunkNumber = Math.floor(Date.now() / 1000);
    const filePath = `${siteId}/${sessionId}/chunks/${chunkNumber}.json`;

    const { error } = await supabase.storage
      .from('sessions')
      .upload(filePath, JSON.stringify(events), {
        contentType: "application/json",
        upsert: false,
      });

    if (error) throw error;
  }

  static async storePageEvents(
    sessionId: string,
    siteId: string,
    events: eventWithTime[]
  ): Promise<void> {
    const supabase = await createClient();
    
    // Process events to extract page visits
    const pageVisits: Array<{
      session_id: string;
      site_id: string;
      href: string;
      timestamp: string;
    }> = [];
    
    let currentHref: string | null = null;
    let currentTimestamp: number | null = null;

    for (const event of events) {
      // Check for Meta events that indicate page changes
      if (event.type === 4 && 'href' in event.data) {
        // If we find a meta event with href, record it as a page visit
        currentHref = event.data.href as string;
        currentTimestamp = event.timestamp;
        
        pageVisits.push({
          session_id: sessionId,
          site_id: siteId,
          href: currentHref,
          timestamp: new Date(currentTimestamp).toISOString()
        });
      }
    }

    if (pageVisits.length === 0) return;

    const { error } = await supabase
      .from('page_events')
      .insert(pageVisits);

    if (error) throw error;
  }
}
