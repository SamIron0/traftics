import { HeatmapService } from "@/server/services/heatmap.service";
import { createClient } from "@/utils/supabase/server";
import Heatmap from "@/components/Heatmap/Heatmap";
import { Suspense } from "react";
import { HeatmapsSkeleton } from "@/components/Heatmap/HeatmapsSkeleton";

export default async function HeatmapPage({
  params,
}: {
  params: Promise<{
    heatmapSlug: string;
    orgSlug: string;
    projectSlug: string;
  }>;
}) {
  const { heatmapSlug, orgSlug, projectSlug } = await params;
  const supabase = await createClient();

  // Fetch IDs using slugs
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", orgSlug)
    .single();

  const { data: project } = await supabase
    .from("websites")
    .select("id")
    .eq("slug", projectSlug)
    .eq("org_id", org?.id)
    .single();

  const { data: heatmap } = await supabase
    .from("heatmaps")
    .select("*")
    .eq("slug", heatmapSlug)
    .eq("website_id", project?.id)
    .single();

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
      orgId: org?.id,
    },
    params: {
      projectId: project?.id,
      heatmapId: heatmap.id,
    },
  });

  // Second instance renamed to heatmapSession
  const { data: heatmapSession } = await supabase
    .from("heatmaps")
    .select("selected_session_ids")
    .eq("id", heatmap.id)
    .single();

  let snapshotUrl = null;
  if (heatmapSession?.selected_session_ids?.[0]) {
    const sessionId = heatmapSession.selected_session_ids[0];

    const { data: url } = await supabase.storage
      .from("screenshots")
      .getPublicUrl(`${project?.id}/${sessionId}/screenshot.jpg`);
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
    <Suspense fallback={<HeatmapsSkeleton />}>
      <Heatmap
        name={heatmap.name}
        events={events}
        width={dimensions.width}
        height={dimensions.height}
        url={snapshotUrl}
      />
    </Suspense>
  );
}
