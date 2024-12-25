import { createClient } from "@/utils/supabase/server";
import { SessionModel } from "../models/session.model";
import { TablesInsert } from "supabase/types";
import { ServiceRequest } from "@/types/api";
import { Session } from "@/types/api";
import { eventWithTime } from "@rrweb/types";
const BUCKET_NAME = "sessions";

export class SessionService {
  static async getAllSessions(req: ServiceRequest): Promise<Session[]> {
    return SessionModel.findAll(req);
  }

  static async getSession(
    id: string
  ): Promise<Session & { events: eventWithTime[] }> {
    const session = await SessionModel.findOne(id);
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
      const createdSession = await SessionModel.create(session);
      return createdSession;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  static async updateSession(
    sessionId: string,
    updates: Partial<Session>
  ): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("sessions")
      .update(updates)
      .eq("id", sessionId);

    if (error) {
      throw error;
    }
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
    pageMetrics: Array<{
      href: string,
      timestamp: string,
      referrer: string | null,
      loadTime: number | null,
      timeSpent: number | null,
      scrollDepth: number,
      errorCount: number
    }>
  ): Promise<void> {
    const supabase = await createClient();
    
    const pageEvents = pageMetrics.map(metric => ({
      session_id: sessionId,
      site_id: siteId,
      href: metric.href,
      timestamp: metric.timestamp,
      referrer: metric.referrer,
      page_load_time: metric.loadTime,
      time_spent: metric.timeSpent,
      scroll_depth: metric.scrollDepth,
      error_count: metric.errorCount
    }));

    if (pageEvents.length === 0) return;

    const { error } = await supabase
      .from('page_events')
      .insert(pageEvents);

    if (error) throw error;
  }

  static async deleteSession(req: ServiceRequest, id: string): Promise<void> {
    const session = await SessionModel.findOne(id);
    if (!session) {
      throw new Error("Session not found");
    }
  
    const supabase = await createClient();
    // Delete session events from storage
    const prefix = `${session.site_id}/${session.id}/chunks/`;
    const { data: chunks, error: listError } = await supabase.storage
      .from('sessions')
      .list(prefix);
  
    if (listError) {
      throw new Error(`Failed to list chunks: ${listError.message}`);
    }
  
    if (chunks?.length) {
      const { error: removeError } = await supabase.storage
        .from('sessions')
        .remove(chunks.map(chunk => `${prefix}${chunk.name}`));
      
      if (removeError) {
        throw new Error(`Failed to remove chunks: ${removeError.message}`);
      }
    }
  
    // Delete session record and related page_events
    const { error: deleteError } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);
  
    if (deleteError) {
      throw new Error(`Failed to delete session record: ${deleteError.message}`);
    }
  }
}