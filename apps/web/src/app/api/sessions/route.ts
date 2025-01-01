import { SessionService } from "@/server/services/session.service";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser(); 
    let user_id;
    let user_email;

    if (!user) {
      user_id = "22acab5b-c6fd-4eef-b456-29d7fd4753a7"
      user_email = "samuelironkwec@gmail.com"
    }
    else {
      user_id = user.id;
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("org_id, active_project_id")
      .eq("user_id", user_id)
      .single();

    if (!profile?.org_id || !profile?.active_project_id) {
      return NextResponse.json(
        { error: "Organization or project not found" },
        { status: 404 }
      );
    }

    const sessions = await SessionService.getAllSessions({
      user: {
        id: user_id,
        email: user_email!,
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