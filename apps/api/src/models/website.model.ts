import { createClient } from "@supabase/supabase-js";
import { AuthRequest } from "../middleware/auth";
import { Website } from '@session-recorder/types';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export class WebsiteModel {
  static async create(
    req: AuthRequest,
    data: Partial<Website>
  ): Promise<Website> {
    const { name, domain } = data;
    const { data: website, error } = await supabase
      .from("websites")
      .insert({
        name,
        domain,
        org_id: req.user?.orgId,
      })
      .select()
      .single();

    if (error) throw error;
    return website;
  }

  static async findAll(req: AuthRequest): Promise<Website[]> {
    const { data: websites, error } = await supabase
      .from("websites")
      .select("*")
      .eq("org_id", req.user?.orgId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return websites;
  }

  static async findOne(req: AuthRequest, id: string): Promise<Website | null> {
    const { data: website, error } = await supabase
      .from("websites")
      .select("*")
      .eq("id", id)
      .eq("org_id", req.user?.orgId)
      .single();

    if (error) return null;
    return website;
  }

  static async update(
    req: AuthRequest,
    id: string,
    data: Partial<Website>
  ): Promise<Website | null> {
    const { name, domain } = data;
    const { data: website, error } = await supabase
      .from("websites")
      .update({
        name,
        domain,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("org_id", req.user?.orgId)
      .select()
      .single();

    if (error) return null;
    return website;
  }

  static async delete(req: AuthRequest, id: string): Promise<boolean> {
    const { error } = await supabase
      .from("websites")
      .delete()
      .eq("id", id)
      .eq("org_id", req.user?.orgId);

    return !error;
  }
}
