import { createClient } from "@/utils/supabase/server";
import Dashboard from "@/components/Dashboard/Dashboard";
import { notFound } from "next/navigation";
import { UnverifiedDashboard } from "@/components/Dashboard/UnverifiedDashboard";
import { generateScript } from "@/utils/script";
import { WebsiteService } from "@/server/services/website.service";
import { useAppStore } from "@/stores/useAppStore";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { orgId, projectId, defaultDashboardId } = useAppStore.getState();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }
  if (!projectId || !defaultDashboardId || !orgId) {
    notFound();
  }
  try {
    const isVerified = await WebsiteService.getVerificationStatus(projectId);

    if (!isVerified) {
      const script = await generateScript(projectId);
      return (
        <UnverifiedDashboard
          websiteId={projectId}
          orgId={orgId}
          projectId={projectId}
          dashboardId={defaultDashboardId}
          script={script}
        />
      );
    }
    return <Dashboard />;
  } catch (error) {
    console.error(error);
    notFound();
  }
}
