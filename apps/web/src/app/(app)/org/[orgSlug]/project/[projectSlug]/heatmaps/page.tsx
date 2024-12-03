import UnverifiedHeatmap from "@/components/Heatmap/UnverifiedHeatmap";
import { HeatmapService } from "@/server/services/heatmap.service";
import { WebsiteService } from "@/server/services/website.service";
import { redirect } from "next/navigation";

export default async function HeatmapsPage({
  params,
}: {
  params: Promise<{ orgSlug: string; projectSlug: string }>;
}) {
  const { orgSlug, projectSlug } = await params;
  const websiteId = await WebsiteService.getIdBySlug(orgSlug, projectSlug);
  const isWebsiteVerified = await WebsiteService.getVerificationStatus(websiteId);
  
  if (!isWebsiteVerified) {
    return <UnverifiedHeatmap />;
  }

  const activeHeatmap = await HeatmapService.getActiveHeatmap(websiteId);
  
  if (activeHeatmap) {
    redirect(`/org/${orgSlug}/project/${projectSlug}/heatmaps/${activeHeatmap.slug}`);
  }

  return <div>No active heatmap</div>;
}
