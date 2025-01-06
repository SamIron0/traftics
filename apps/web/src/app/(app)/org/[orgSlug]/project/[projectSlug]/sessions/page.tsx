import { SessionsPage } from "@/components/sessions/SessionsPage";
import { UnverifiedView } from "@/components/Dashboard/UnverifiedView";
import { generateScript } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { getSessionsCached } from "@/utils/cache";

export default async function Sessions({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const supabase = await createClient();
  const { projectSlug } = await params;
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

  // Use cached sessions data
  const sessions = await getSessionsCached(website.id, supabase);

  return (
    <div className="flex flex-col">
      <SessionsPage sessions={sessions} />
    </div>
  );
}
