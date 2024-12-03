import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { HeatmapsSkeleton } from "@/components/Heatmap/HeatmapsSkeleton";
import HeatmapDataLoader from "@/components/Heatmap/HeatmapDataLoader";

export default async function HeatmapPage({
  params,
}: {
  params: Promise<{
    heatmapSlug: string;
    orgSlug: string;
    projectSlug: string;
  }>;
}) {
  const { heatmapSlug, projectSlug } = await params;
  const supabase = await createClient();

  // Parallel fetch critical data
  const [projectResult, heatmapResult] = await Promise.all([
    supabase.from("websites").select("id").eq("slug", projectSlug).single(),
    supabase.from("heatmaps").select("*").eq("slug", heatmapSlug).single(),
  ]);

  const { data: heatmapSession } = await supabase
    .from("heatmaps")
    .select("selected_session_ids")
    .eq("id", heatmapResult.data.id)
    .single();

  let snapshotUrl = null;
  let dimensions = { width: 0, height: 0 };

  if (heatmapSession?.selected_session_ids?.[0]) {
    const sessionId = heatmapSession.selected_session_ids[0];

    // Parallel fetch session data and snapshot URL
    const [sessionResult, urlResult] = await Promise.all([
      supabase
        .from("sessions")
        .select("screen_width, screen_height")
        .eq("id", sessionId)
        .single(),
      supabase.storage
        .from("screenshots")
        .getPublicUrl(`${projectResult.data?.id}/${sessionId}/screenshot.jpg`),
    ]);

    snapshotUrl = urlResult.data.publicUrl;
    dimensions = {
      width: sessionResult.data?.screen_width,
      height: sessionResult.data?.screen_height,
    };
  }

  if (!snapshotUrl) {
    return <div>No snapshot found</div>;
  }

  return (
    <Suspense fallback={<HeatmapsSkeleton />}>
      <HeatmapDataLoader
        initialHeatmap={{
          id: heatmapResult.data.id,
          name: heatmapResult.data.name,
          snapshotUrl,
          dimensions,
        }}
      />
    </Suspense>
  );
}
