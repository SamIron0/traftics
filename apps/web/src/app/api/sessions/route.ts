import { SessionService } from "@/server/services/session.service";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("org_id, active_project_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.org_id || !profile?.active_project_id) {
      return NextResponse.json(
        { error: "Organization or project not found" },
        { status: 404 }
      );
    }

    const sessions = await SessionService.getSessions({
      user: {
        id: user.id,
        email: user.email!,
        orgId: profile.org_id,
      },
      params: {
        projectId: profile.active_project_id,
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
} 