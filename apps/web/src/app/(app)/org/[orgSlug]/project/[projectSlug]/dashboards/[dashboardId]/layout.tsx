import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ 
    orgSlug: string;
    projectSlug: string;
    dashboardId: string 
  }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const { orgSlug, projectSlug, dashboardId } = await params;

  // Fetch organization ID using slug
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single();

  if (!org) {
    notFound();
  }

  // Fetch project ID using slug
  const { data: project } = await supabase
    .from('websites')
    .select('id')
    .eq('slug', projectSlug)
    .eq('org_id', org.id)
    .single();

  if (!project) {
    notFound();
  }

  // verify user has access to this org and project
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("org_id, active_project_id")
    .eq("user_id", user?.user?.id)
    .single();

  if (!userProfile) {
    notFound();
  }

  if (userProfile.org_id !== org.id || userProfile.active_project_id !== project.id) {
    notFound();
  }

  // Verify dashboard exists and belongs to the project
  const { data: dashboard } = await supabase
    .from("dashboards")
    .select("id")
    .eq("id", dashboardId)
    .eq("website_id", project.id)
    .single();

  if (!dashboard) {
    notFound();
  }

  return <div className="flex flex-col min-h-screen">{children}</div>;
}
