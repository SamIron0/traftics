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
      // Create a new website record with auto-generated name
      const websiteId = uuidv4();
      const { error: websiteError } = await supabase.from("websites").insert({
        id: websiteId,
        tracking_id: uuidv4(),
        verified: false,
      });

      if (!websiteError) {
        // Update user profile with the new active project
        await supabase
          .from("user_profiles")
          .update({
            is_onboarded: true,
            active_project_id: websiteId,
          })
          .eq("user_id", user.id);
      }

      redirect("/login");
    }
  }

  // If there's an error or missing parameters, redirect to login
  redirect("/login");
}
