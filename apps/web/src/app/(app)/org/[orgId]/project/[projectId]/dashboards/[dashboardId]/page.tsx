import { createClient } from "@/utils/supabase/server";
import UnverifiedDashboard from "@/components/Dashboard/UnverifiedDashboard";
export default async function DashboardPage({
  params,
}: {
  params: { orgId: string; projectId: string; dashboardId: string };
}) {
  const { projectId, dashboardId } = await params;
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  // check if user is setup
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("setup_completed")
    .eq("id", user?.user?.id)
    .single();
  let websiteVerified = false;
  if (userProfile?.setup_completed) {
    websiteVerified = true;
  }
  let dashboard: any;
  if (websiteVerified) {
    // Get dashboard
    const { data: dashboard } = await supabase
      .from("dashboards")
      .select("*")
      .eq("id", dashboardId)
      .single();
  }
  return (
    <div>
      {websiteVerified ? (
        <div>{dashboard?.name}</div>
      ) : (
        <UnverifiedDashboard websiteVerified={websiteVerified} />
      )}
    </div>
  );
}
