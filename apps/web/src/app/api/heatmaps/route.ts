import { NextResponse } from "next/server";
import { HeatmapService } from "@/server/services/heatmap.service";
import { createClient } from "@/utils/supabase/server";
import { generateSlug } from "@/utils/slug";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization and active project
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("org_id, active_project_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.org_id || !profile?.active_project_id) {
      return NextResponse.json(
        { error: "Organization or project not found" },
        { status: 404 }
      );
    }

    const heatmapData = await request.json();
    const heatmap = await HeatmapService.createHeatmap(
      { 
        user: {
          id: user.id,
          email: user.email!,
          orgId: profile.org_id
        },
        params: { projectId: profile.active_project_id }
      },
      {
        name: heatmapData.name,
        slug: generateSlug(heatmapData.name), // Add this line
        website_id: profile.active_project_id,
        url_protocol: heatmapData.url.protocol,
        url_domain: heatmapData.url.domain,
        url_match_type: heatmapData.url.matchType,
        precision: heatmapData.precision,
        use_history_data: heatmapData.useHistoryData,
        filters: heatmapData.filters,
        created_by: user.id
      }
    );

    return NextResponse.json({ success: true, heatmap });
  } catch (error) {
    console.error("Error creating heatmap:", error);
    return NextResponse.json(
      { error: "Failed to create heatmap" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization and active project
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("org_id, active_project_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.org_id || !profile?.active_project_id) {
      return NextResponse.json(
        { error: "Organization or project not found" },
        { status: 404 }
      );
    }

    const heatmaps = await HeatmapService.getHeatmaps({
      user: {
        id: user.id,
        email: user.email!,
        orgId: profile.org_id
      },
      params: { projectId: profile.active_project_id }
    });

    return NextResponse.json({ heatmaps });
  } catch (error) {
    console.error("Error fetching heatmaps:", error);
    return NextResponse.json(
      { error: "Failed to fetch heatmaps" },
      { status: 500 }
    );
  }
} 