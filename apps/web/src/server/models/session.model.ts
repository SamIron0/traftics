import { createClient } from "@/utils/supabase/server";
import { TablesInsert } from "supabase/types";
import { ServiceRequest } from "@/types/api";
import { Session } from "@/types/api";
export class SessionModel {
  static async findAll(req: ServiceRequest): Promise<Session[]> {
    const supabase = await createClient();
    const query = supabase
      .from("sessions")
      .select(
        `
        *,
        websites!inner (
          id,
          org_id
        )
      `
      )
      .eq("websites.org_id", req.user?.orgId)
      .eq("site_id", req.params?.projectId)
      .order("started_at", { ascending: false })
      .limit(100);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async findOne(
    req: ServiceRequest,
    id: string
  ): Promise<Session | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("sessions")
      .select(
        `
        *,
        websites!inner (
          id,
          org_id
        )
      `
      )
      .eq("id", id)
      .eq("websites.org_id", req.user?.orgId)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(data: Session): Promise<TablesInsert<"sessions">> {
    const {
      id,
      site_id,
      started_at,
      duration,
      user_agent,
      screen_width,   
      screen_height,
    } = data;

    // Convert milliseconds timestamp to ISO string
    const startedAtDate = new Date(started_at).toISOString();

    const supabase = await createClient();
    const { data: session, error } = await supabase
      .from("sessions")
      .upsert({
        id,
        site_id,
        started_at: startedAtDate,
        duration,
        user_agent,
        screen_width,
        screen_height,
      })
      .select()
      .single();

    if (error) throw error;
    return session;
  }
}
