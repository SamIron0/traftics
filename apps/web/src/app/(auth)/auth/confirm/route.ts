import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { setupNewUser } from "@/utils/auth/setup";

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
      const { error: setupError } = await setupNewUser(supabase, user);
      if (setupError) {
        console.error("Error in user setup:", setupError);
      }
      redirect("/login");
    }
  }

  // If there's an error or missing parameters, redirect to login
  redirect("/login");
}
