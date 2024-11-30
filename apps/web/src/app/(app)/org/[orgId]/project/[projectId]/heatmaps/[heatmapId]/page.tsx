import { HeatmapService } from "@/server/services/heatmap.service";
import { createClient } from "@/utils/supabase/server";
import Heatmap from "@/components/Heatmap/Heatmap";

export default async function HeatmapPage({
  params,
}: {
  params: Promise<{ heatmapId: string; orgId: string; projectId: string }>;
}) {
  const { heatmapId, orgId, projectId } = await params;
  const supabase = await createClient();
  let dimensions = {
    width: 0,
    height: 0,
  };
  // Fetch initial data server-side
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error("User not found");
  }
  const events = await HeatmapService.getHeatmapEvents({
    user: {
      id: user.data.user?.id,
      email: user.data.user?.email || "",
      orgId,
    },
    params: {
      projectId,
      heatmapId,
    },
  });

  // Get the first session ID to fetch its screenshot
  const { data: heatmap } = await supabase
    .from("heatmaps")
    .select("selected_session_ids")
    .eq("id", heatmapId)
    .single();

  let snapshotUrl = null;
  if (heatmap?.selected_session_ids?.[0]) {
    const sessionId = heatmap.selected_session_ids[0];

    const { data: url } = await supabase.storage
      .from("screenshots")
      .getPublicUrl(`${projectId}/${sessionId}/screenshot.jpg`);
    snapshotUrl = url.publicUrl;

    //get thee width and height of the screenshot of session
    const { data: session } = await supabase
      .from("sessions")
      .select("screen_width, screen_height")
      .eq("id", sessionId)
      .single();
    dimensions = {
      width: session?.screen_width,
      height: session?.screen_height,
    };
  }

  if (!snapshotUrl) {
    return <div>No snapshot found</div>;
  }
  return (
    <Heatmap
      events={events}
      width={dimensions.width}
      height={dimensions.height}
      url={snapshotUrl}
    />
  );
}
