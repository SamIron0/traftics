"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
export default function HomePage() {
  useEffect(() => {
    async function redirectToDashboard() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        redirect("/login");
        return;
      }

      // Get user profile with org and project info
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("org_id, active_project_id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        redirect("/project-setup");
        return;
      }

      // Get organization slug
      const { data: org } = await supabase
        .from("organizations")
        .select("slug")
        .eq("id", profile.org_id || "")
        .single();

      // Get project slug
      const { data: project } = await supabase
        .from("websites")
        .select("slug")
        .eq("id", profile.active_project_id || "")
        .single();

      if (!org?.slug || !project?.slug) {
        redirect("/project-setup");
        return;
      }

      // Get default dashboard
      const { data: defaultDashboard } = await supabase
        .from("dashboards")
        .select("id")
        .eq("website_id", profile.active_project_id || "")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (!defaultDashboard) {
        redirect("/project-setup");
        return;
      }

      redirect(`/org/${org.slug}/project/${project.slug}/dashboards/${defaultDashboard.id}`);
    }

    redirectToDashboard();
  }, []);

  return null;
} 