import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string; dashboardId: string; orgId: string }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const { orgId, projectId, dashboardId } = await params;

  // verify user has access to this org and project
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("org_id, active_project_id")
    .eq("user_id", user?.user?.id)
    .single();

  if (!userProfile) {
    notFound();
  }

  if (userProfile.org_id !== orgId || userProfile.active_project_id !== projectId) {
    notFound();
  }

  // Verify dashboard exists and belongs to the project
  const { data: dashboard } = await supabase
    .from("dashboards")
    .select("id")
    .eq("id", dashboardId)
    .eq("website_id", projectId)
    .single();

  if (!dashboard) {
    notFound();
  }

  return <div className="flex flex-col min-h-screen">{children}</div>;
}
