import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export interface SessionRecord {
  id: string;
  site_id: string;
  started_at: Date;
  duration: number;
  user_agent: string;
  screen_width: number;
  screen_height: number;
  created_at: Date;
}

export class SessionModel {
  static async findAll(req: any, siteId?: string): Promise<SessionRecord[]> {
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

  static async findOne(req: any, id: string): Promise<SessionRecord | null> {
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

  static async create(data: Partial<SessionRecord>): Promise<SessionRecord> {
    const { data: session, error } = await supabase
      .from('sessions')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return session;
  }
}
