import { SessionsPage } from "@/components/sessions/SessionsPage";
import { UnverifiedView } from "@/components/Dashboard/UnverifiedView";
import { generateScript } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function Sessions({
  params,
}: {
  params: { projectSlug: string };
}) {
  const supabase = await createClient();
  const {projectSlug} = await params;
  const { data: website } = await supabase
    .from("websites")
    .select("id,verified")
    .eq("slug", projectSlug)
    .single();

  if (!website) {
    notFound();
  }

  if (!website.verified) {
    const script = generateScript(website.id);
    return <UnverifiedView script={script} />;
  }

  // Fetch sessions data server-side
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("site_id", website.id)
    .order("started_at", { ascending: false });

  return (
    <div className="flex flex-col">
      <SessionsPage sessions={sessions || []} />
    </div>
  );
}