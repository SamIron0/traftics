import Dashboard from "@/components/Dashboard/Dashboard";
import { UnverifiedView } from "@/components/Dashboard/UnverifiedView";
import { generateScript } from "@/utils/helpers";
import { getDashboardDataCached } from "@/utils/cache";
import { createClient } from "@/utils/supabase/server";
import { DashboardMetrics } from "@/services/metrics";
import { notFound } from "next/navigation";

async function getDashboardData(websiteId: string): Promise<DashboardMetrics> {
  const supabase = await createClient();
  const data = await getDashboardDataCached(websiteId, supabase);

  return {
    totalSessions: data.metrics.total_sessions,
    avgSessionDuration: data.metrics.avg_duration,
    pagesPerSession: data.metrics.pages_per_session,
    bounceRate: data.metrics.bounce_rate || 0,
    topPages: data.metrics.top_pages || [],
    trends: data.trends,
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const supabase = await createClient();
  const { data: website } = await supabase
    .from("websites")
    .select("id,verified")
    .eq("slug", projectSlug)
    .single();

  if (!website) {
    notFound();
  }
  if (!website?.verified) {
    const script = generateScript(website.id);
    return <UnverifiedView script={script} />;
  }

  const metrics = await getDashboardData(website.id);
  return <Dashboard metrics={metrics} />;
}
