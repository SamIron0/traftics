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
    orgSlug: string;
    projectSlug: string;
    dashboardId: string;
  }>;
}) {
  const supabase = await createClient();
  const { orgSlug, projectSlug, dashboardId } = await params;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single();

  if (!org) {
    notFound();
  }

  const { data: project } = await supabase
    .from('websites')
    .select('id')
    .eq('slug', projectSlug)
    .eq('org_id', org.id)
    .single();

  if (!project) {
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
    const isVerified = await WebsiteService.getVerificationStatus(project.id);
    const script = await generateScript(project.id);

    if (!isVerified) {
      return (
        <UnverifiedDashboard
          websiteId={project.id}
          orgId={org.id}
          projectId={project.id}
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
