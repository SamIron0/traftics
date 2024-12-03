import Dashboard from "@/components/Dashboard/Dashboard";
import { UnverifiedDashboard } from "@/components/Dashboard/UnverifiedDashboard";
import { generateScript } from "@/utils/script";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{
    orgSlug: string;
    projectSlug: string;
    dashboardId: string;
  }>;
}) {
  const supabase = await createClient();
  const { projectSlug } = await params;
  // Get project ID from slug
  const { data: project } = await supabase
    .from("websites")
    .select("id, verified")
    .eq("slug", projectSlug)
    .single();

  if (!project?.verified) {
    const script = await generateScript(project?.id);
    return <UnverifiedDashboard script={script} />;
  }

  return <Dashboard />;
}
