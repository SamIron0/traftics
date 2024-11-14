import { createClient } from "@/utils/supabase/server";
import { Tables } from "../../supabase/types";
import { TablesInsert } from "../../supabase/types";

const supabase = await createClient();

export class WebsiteModel {
  static async create(
    req: any,
    data: TablesInsert<"websites">
  ): Promise<Tables<"websites">> {
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

  static async findAll(req: any): Promise<Tables<"websites">[]> {
    const { data: websites, error } = await supabase
      .from("websites")
      .select("*")
      .eq("org_id", req.user?.orgId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return websites;
  }

  static async findOne(
    req: any,
    id: string
  ): Promise<Tables<"websites"> | null> {
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
    req: any,
    id: string,
    data: Partial<Tables<"websites">>
  ): Promise<Tables<"websites"> | null> {
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

  static async delete(req: any, id: string): Promise<boolean> {
    const { error } = await supabase
      .from("websites")
      .delete()
      .eq("id", id)
      .eq("org_id", req.user?.orgId);

    return !error;
  }
}
