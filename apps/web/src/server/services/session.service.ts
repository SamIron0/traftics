import { createClient } from "@/utils/supabase/server";
import { SessionModel } from "../models/session.model";
import { TablesInsert } from "supabase/types";
import { ServiceRequest } from "types/api";
import { Session } from "types/api";
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
    const supabase = await createClient();

    try {
      // 1. Create/update session record in database
      const createdSession = await SessionModel.create(session);

      // 2. Store events in chunks
      const chunkNumber = Math.floor(Date.now() / 1000); // Use timestamp as chunk identifier
      const filePath = `${session.site_id}/${session.id}/chunks/${chunkNumber}.json`;

      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, JSON.stringify(session.events), {
          contentType: "application/json",
          upsert: false, // We never update chunks, only create new ones
        });

      if (storageError) {
        throw storageError;
      }
      return createdSession;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }
}
