import React from "react";
import { SessionsPage } from "@/components/sessions/SessionsPage";
import { SessionService } from "@/server/services/session.service";
import { createClient } from "@/utils/supabase/server";

export default async function Sessions({
  params,
}: {
  params: Promise<{ projectId: string; orgId: string }>;
}) {
  const { projectId, orgId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const sessions = await SessionService.getSessions({
    user: {
      id: user?.id || "",
      email: user?.email || "",
      orgId: orgId,
    },
    params: {
      projectId,
    },
  });
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Sessions</h1>
      <SessionsPage sessions={sessions} />
    </div>
  );
}
