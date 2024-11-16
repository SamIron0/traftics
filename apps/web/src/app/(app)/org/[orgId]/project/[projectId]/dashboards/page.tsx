import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardsPage({
  params,
}: {
  params: { orgId: string; projectId: string };
}) {
  const supabase = await createClient();

  // Get default dashboard
  const { data: defaultDashboard } = await supabase
    .from("dashboards")
    .select("id")
    .eq("website_id", params.projectId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (defaultDashboard) {
    redirect(
      `/org/${params.orgId}/project/${params.projectId}/dashboards/${defaultDashboard.id}`
    );
  }

  return <div>No dashboards found</div>;
}
