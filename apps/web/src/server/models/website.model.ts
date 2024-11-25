import { createClient } from "@/utils/supabase/server";
import { Tables } from "../../../supabase/types";
import { TablesInsert } from "../../../supabase/types";
import { ServiceRequest } from "@/types/api";
export class WebsiteModel {
  static async create(
    req: ServiceRequest,
    data: TablesInsert<"websites">
  ): Promise<Tables<"websites">> {
    const supabase = await createClient();
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

  static async findAll(req: ServiceRequest): Promise<Tables<"websites">[]> {
    const supabase = await createClient();
    const { data: websites, error } = await supabase
      .from("websites")
      .select("*")
      .eq("org_id", req.user?.orgId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return websites;
  }

  static async findOne(
    req: ServiceRequest,
    id: string
  ): Promise<Tables<"websites"> | null> {
    const supabase = await createClient();
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
    req: ServiceRequest,
    id: string,
    data: Partial<Tables<"websites">>
  ): Promise<Tables<"websites"> | null> {
    const supabase = await createClient();
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

  static async delete(req: ServiceRequest, id: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("websites")
      .delete()
      .eq("id", id)
      .eq("org_id", req.user?.orgId);

    return !error;
  }

  static async getVerificationStatus(websiteId: string): Promise<boolean | null> {
    const supabase = await createClient();
    const { data: website, error } = await supabase
      .from("websites")
      .select("verified")
      .eq("id", websiteId)
      .single();

    if (error) return null;
    return website.verified;
  }

  static async setVerified(websiteId: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("websites")
      .update({ verified: true })
      .eq("id", websiteId);

    return !error;
  }
}
