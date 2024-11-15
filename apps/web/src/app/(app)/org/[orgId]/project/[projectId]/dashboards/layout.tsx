import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: {
    orgId: string;
    projectId: string;
  };
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const { orgId, projectId } = await params;

  // verify user has access to this org and project
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("org_id, active_project_id")
    .eq("user_id", user?.user?.id)
    .single();

  if (!userProfile) {
    notFound();
  }

  if (
    userProfile.org_id !== orgId ||
    userProfile.active_project_id !== projectId
  ) {
    notFound();
  }

  const { data: defaultDashboard } = await supabase
    .from("dashboards")
    .select("id")
    .eq("website_id", projectId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (defaultDashboard) {
    redirect(
      `/org/${orgId}/project/${projectId}/dashboards/${defaultDashboard.id}`
    );
  }

  return <div className="flex flex-col min-h-screen">{children}</div>;
}
