import { NextResponse } from "next/server";
import { WebsiteService } from "../../../server/services/website.service";
import { createClient } from "@/utils/supabase/server";
interface ApiError {
  message: string;
  code?: string;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    const websites = await WebsiteService.getWebsites({
      user: {
        id: user.id,
        email: user.email!,
        orgId: profile.org_id,
      },
    });

    return NextResponse.json(websites);
  } catch (error) {
    const apiError = error as ApiError;
    return NextResponse.json({ error: apiError.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    const body = await request.json();
    const website = await WebsiteService.createWebsite(
      {
        user: {
          id: user.id,
          email: user.email!,
          orgId: profile.org_id,
        },
      },
      body
    );
    return NextResponse.json(website, { status: 201 });
  } catch (error) {
    const apiError = error as ApiError;
    return NextResponse.json({ error: apiError.message }, { status: 400 });
  }
}
