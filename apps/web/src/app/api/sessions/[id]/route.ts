import { SessionService } from "@/server/services/session.service";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("params", request);
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.org_id) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const session = await SessionService.getSession({
    user: {
      id: user.id,
      email: user.email!,
      orgId: profile.org_id
    }
  }, id);

  return NextResponse.json(session);
}
