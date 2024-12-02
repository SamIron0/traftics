import React from "react";
import { SessionsPage } from "@/components/sessions/SessionsPage";
import { SessionService } from "@/server/services/session.service";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function Sessions({
  params,
}: {
  params: Promise<{ projectSlug: string; orgSlug: string }>;
}) {
  const { projectSlug, orgSlug } = await params;
  const supabase = await createClient();
  
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sessions = await SessionService.getSessions({
    user: {
      id: user?.id || "",
      email: user?.email || "",
      orgId: org.id,
    },
    params: {
      projectId: project.id,
    },
  });

  return <SessionsPage sessions={sessions} />;
}
