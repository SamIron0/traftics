import { createClient } from "@/utils/supabase/server";
import Dashboard from "@/components/Dashboard/Dashboard";
export default async function DashboardPage({
  params,
}: {
  params: { orgId: string; projectId: string; dashboardId: string };
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  // check if website is verified

  const { data: websiteVerified } = await supabase
    .from("websites")
    .select("verified")
    .eq("id", projectId)
    .single();

  return (
    <div>
      <Dashboard
        websiteId={projectId}
        websiteVerified={websiteVerified?.verified || false}
      />
    </div>
  );
}
