import { createClient } from "@/utils/supabase/server";
import { ServiceRequest } from "@/types/api";
import { Tables, TablesInsert } from "supabase/types";

export class HeatmapModel {
  static async create(
    req: ServiceRequest,
    data: TablesInsert<"heatmaps">
  ): Promise<Tables<"heatmaps">> {
    const supabase = await createClient();

    // Ensure selected_session_ids is properly typed as a UUID array
    const heatmapData = {
      ...data,
      selected_session_ids: data.selected_session_ids || [],
    };

    const { data: heatmap, error } = await supabase
      .from("heatmaps")
      .insert(heatmapData)
      .select()
      .single();

    if (error) throw error;
    return heatmap;
  }

  
  static async findAll(req: ServiceRequest): Promise<Tables<"heatmaps">[]> {
    const supabase = await createClient();
    const { data: heatmaps, error } = await supabase
      .from("heatmaps")
      .select("*")
      .eq("website_id", req.params?.projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return heatmaps;
  }

  static async findOne(
    req: ServiceRequest,
    id: string
  ): Promise<Tables<"heatmaps"> | null> {
    const supabase = await createClient();
    const { data: heatmap, error } = await supabase
      .from("heatmaps")
      .select("*")
      .eq("id", id)
      .eq("website_id", req.params?.projectId)
      .single();

    if (error) return null;
    return heatmap;
  }

  static async getActiveHeatmap(
    websiteId: string
  ): Promise<Tables<"heatmaps">> {
    const supabase = await createClient();
    
    // First get the user profile with active heatmap ID
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("active_heatmap_id")
      .eq("active_project_id", websiteId)
      .single();

    if (profileError) throw profileError;

    // If no active heatmap is set, get the most recent one as fallback
    if (!profile?.active_heatmap_id) {
      const { data: heatmap, error } = await supabase
        .from("heatmaps")
        .select("*")
        .eq("website_id", websiteId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return heatmap;
    }

    // Get the active heatmap
    const { data: heatmap, error } = await supabase
      .from("heatmaps")
      .select("*")
      .eq("id", profile.active_heatmap_id)
      .single();

    if (error) throw error;
    return heatmap;
  }

  static async delete(req: ServiceRequest, id: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("heatmaps")
      .delete()
      .eq("id", id)
      .eq("website_id", req.params?.projectId);

    return !error;
  }

  static async setActiveHeatmap(
    userId: string,
    heatmapId: string
  ): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("user_profiles")
      .update({ active_heatmap_id: heatmapId })
      .eq("user_id", userId);

    return !error;
  }
}
