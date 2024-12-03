import { NextResponse } from "next/server";
import { HeatmapService } from "@/server/services/heatmap.service";
import { createClient } from "@/utils/supabase/server";

export async function POST(
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

    await HeatmapService.setActiveHeatmap(user.id, heatmapId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting active heatmap:", error);
    return NextResponse.json(
      { error: "Failed to set active heatmap" },
      { status: 500 }
    );
  }
} 