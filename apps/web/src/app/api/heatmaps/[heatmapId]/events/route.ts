import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { HeatmapService } from "@/server/services/heatmap.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ heatmapId: string }> }
) {
  try {
    const { heatmapId } = await params;
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

    const events = await HeatmapService.getHeatmapEvents({
      user: {
        id: user.id,
        email: user.email!,
        orgId: profile.org_id
      },
      params: { 
        projectId: profile.active_project_id,
        heatmapId
      }
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching heatmap events:", error);
    return NextResponse.json(
      { error: "Failed to fetch heatmap events" },
      { status: 500 }
    );
  }
} 