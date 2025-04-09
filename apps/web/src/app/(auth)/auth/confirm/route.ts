import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error && user) {
      // Create a new organization
      const orgId = uuidv4();
      const { error: orgError } = await supabase.from("organizations").insert({
        id: orgId,
        name: `${user.email?.split("@")[0]}'s Organization`, // Create default org name from email
        size: 1,
      });

      if (orgError) {
        console.error("Error creating organization:", orgError);
        redirect("/login");
      }

      const websiteId = uuidv4();
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          is_onboarded: true,
          org_id: orgId,
        })
        .eq("user_id", user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        redirect("/login");
      }

      const { error: websiteError } = await supabase.from("websites").insert({
        id: websiteId,
        tracking_id: uuidv4(),
        verified: false,
        org_id: orgId,
        slug: "project-" + websiteId.slice(0, 8),
      });

      if (websiteError) {
        console.error("Error creating website:", websiteError);
        redirect("/login");
      }

      const { error: activeProjectError } = await supabase
        .from("user_profiles")
        .update({
          active_project_id: websiteId,
        })
        .eq("user_id", user.id);

      if (activeProjectError) {
        console.error("Error updating active project:", websiteError);
      }
      redirect("/login");
    }
  }

  // If there's an error or missing parameters, redirect to login
  redirect("/login");
}
