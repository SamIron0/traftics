import { SessionService } from "@/server/services/session.service";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let user_id;

  if (!user) {
    user_id = "22acab5b-c6fd-4eef-b456-29d7fd4753a7"
  }
  else {
    user_id = user.id;
  }
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("org_id")
    .eq("user_id", user_id)
    .single();

  if (!profile?.org_id) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const session = await SessionService.getSession(id);

  return NextResponse.json(session);
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }
    const { id } = await params;
    await SessionService.deleteSession({
      user: {
        id: user.id,
      }
    }, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}