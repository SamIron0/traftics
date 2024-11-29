import { createClient } from "@/utils/supabase/server";
import Dashboard from "@/components/Dashboard/Dashboard";
import { notFound } from "next/navigation";
import { UnverifiedDashboard } from "@/components/Dashboard/UnverifiedDashboard";
import { generateScript } from "@/utils/script";
import { WebsiteService } from "@/server/services/website.service";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.org_id) {
    notFound();
  }

  try {
    const isVerified = await WebsiteService.getVerificationStatus(projectId);
    const script = await generateScript(projectId);

    if (!isVerified) {
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
  } catch (error) {
    console.error(error);
    notFound();
  }
}
