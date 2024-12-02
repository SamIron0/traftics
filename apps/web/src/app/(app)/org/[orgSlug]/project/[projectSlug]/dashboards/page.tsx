import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardsPage({
  params,
}: {
  params: Promise<{ orgId: string; projectId: string }>;
}) {
  const { orgId, projectId } = await params;
  const supabase = await createClient();

  // Get default dashboard
  const { data: defaultDashboard } = await supabase
    .from("dashboards")
    .select("id")
    .eq("website_id", projectId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (defaultDashboard) {
    redirect(
      `/org/${orgId}/project/${projectId}/dashboards/${defaultDashboard.id}`
    );
  }
}
