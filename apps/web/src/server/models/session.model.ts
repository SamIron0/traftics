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
      .single();

    if (error) throw error;
    return data;
  }

  static async create(data: Session): Promise<TablesInsert<"sessions">> {
    const startedAtDate = data.started_at ? new Date(data.started_at).toISOString() : undefined;
    
    const supabase = await createClient();
    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        ...data,
        started_at: startedAtDate,
      })
      .select()
      .single();

    if (error) throw error;
    return session;
  }
}
