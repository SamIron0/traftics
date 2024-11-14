import { createClient } from "@/utils/supabase/server";
import { Tables, TablesInsert } from "../../../supabase/types";
import { ServiceRequest } from "@/types/api";

export class SessionModel {
  static async findAll(req: ServiceRequest, siteId?: string): Promise<Tables<'sessions'>[]> {
    const supabase = await createClient();
    let query = supabase
      .from('sessions')
      .select(`
        *,
        websites!inner (
          id,
          org_id
        )
      `)
      .eq('websites.org_id', req.user?.orgId)
      .order('started_at', { ascending: false })
      .limit(100);

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async findOne(req: ServiceRequest, id: string): Promise<Tables<'sessions'> | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        websites!inner (
          id,
          org_id
        )
      `)
      .eq('id', id)
      .eq('websites.org_id', req.user?.orgId)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(data: TablesInsert<'sessions'>): Promise<Tables<'sessions'>> {
    const supabase = await createClient();
    const { data: session, error } = await supabase
      .from("sessions")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return session;
  }
}
