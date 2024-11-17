import { createClient } from "@/utils/supabase/server";
import Dashboard from "@/components/Dashboard/Dashboard";
import { notFound } from "next/navigation";
import { UnverifiedDashboard } from "@/components/Dashboard/UnverifiedDashboard";
import { generateScript } from "@/utils/script";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{
    orgId: string;
    projectId: string;
    dashboardId: string;
  }>;
}) {
  const supabase = await createClient();
  const { orgId, projectId, dashboardId } = await params;

  // Check if website exists and get verification status
  const { data: website, error: websiteError } = await supabase
    .from("websites")
    .select("verified")
    .eq("id", projectId)
    .single();

  if (websiteError || !website) {
    notFound();
  }
  // generate tracking script
  const script = await generateScript(projectId);
  if (!website.verified) {
    return (
      <UnverifiedDashboard
        websiteId={projectId}
        orgId={orgId}
        projectId={projectId}
        dashboardId={dashboardId}
        script={script}
      />
    );
  }
  return <Dashboard />;
}
