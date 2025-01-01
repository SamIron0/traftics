import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        redirect("/login");
      }
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_onboarded")
        .eq("user_id", user.user?.id)
        .single();

      // Redirect to onboarding if not completed, otherwise to dashboard
      if (!profile?.is_onboarded) {
        redirect("/onboarding");
      }
    }
  }

  // redirect the user to an error page with some instructions
  redirect("/login");
}
