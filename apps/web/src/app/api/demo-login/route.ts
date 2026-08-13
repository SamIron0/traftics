import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

const DEMO_USER_EMAIL =
  process.env.DEMO_USER_EMAIL ?? "samuelironkwec@gmail.com";

export async function GET(request: Request) {
  try {
    // Admin client (no cookie handling) to mint a one-time login token for
    // the demo account. generateLink does NOT send an email.
    const admin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: DEMO_USER_EMAIL,
    });

    if (linkError || !data?.properties?.hashed_token) {
      console.error("Demo login: failed to generate link", linkError);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Cookie-bound client: verifying the token here signs the visitor in
    // and sets the session cookies on the response.
    const supabase = await createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: data.properties.hashed_token,
    });

    if (verifyError) {
      console.error("Demo login: failed to verify token", verifyError);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // The home page forwards authenticated users to their dashboard.
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Demo login: unexpected error", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
