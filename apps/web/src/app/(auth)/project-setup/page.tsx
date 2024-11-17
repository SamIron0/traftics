import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProjectSetup } from "@/components/ProjectSetup";

export default async function ProjectSetupPage() {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("org_id,active_project_id,setup_completed")
    .eq("user_id", user.data.user?.id)
    .single();

  if (profile?.setup_completed) {
    redirect(
      `/org/${profile.org_id}/project/${profile.active_project_id}/dashboards`
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b px-6 py-4 flex justify-between items-center">
        <div className="flex-1" />
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboards">Skip project setup</Link>
          </Button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold">Project setup</h1>

        <ProjectSetup
          orgId={profile?.org_id || null}
          projectId={profile?.active_project_id || null}
        />
      </div>
    </div>
  );
}
