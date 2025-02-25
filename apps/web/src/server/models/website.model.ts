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
      })
      .select()
      .single();

    if (error) throw error;
    return website;
  }
  static async getIdBySlug( projectSlug: string): Promise<string> {
    const supabase = await createClient();
    const { data: website, error } = await supabase
      .from("websites")
      .select("id")
      .eq("slug", projectSlug)
      .single();

    if (error) throw error;
    return website.id;
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

  static async setVerified(websiteId: string, data: { verified: boolean; domain?: string }): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("websites")
      .update(data)
      .eq("id", websiteId);

    return !error;
  }
}
