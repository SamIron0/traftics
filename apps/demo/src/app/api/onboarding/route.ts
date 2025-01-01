import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Database } from "../../../../supabase/types";
import { createClient } from "@/utils/supabase/server";
interface OnboardingData {
  fullName: string;
  role: Database["public"]["Enums"]["user_role"];
  companyName: string;
  orgSize: string;
  country: string;
  city: string;
  street: string;
  zip: string;
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

    const data: OnboardingData = await request.json();

    // Create organization
    const orgId = uuidv4();
    const { error: orgError } = await supabase.from("organizations").insert({
      id: orgId,
      name: data.companyName,
      size: parseInt(data.orgSize),
    });

    if (orgError) throw orgError;

    // Create user profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        user_id: user.id,
        full_name: data.fullName,
        role: data.role,
        org_id: orgId,
        country: data.country,
        city: data.city,
        street: data.street,
        zip: data.zip,
        is_onboarded: true,
      });

    if (profileError) throw profileError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in onboarding:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
