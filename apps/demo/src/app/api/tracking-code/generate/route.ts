import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { generateScript } from "@/utils/helpers";
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Get user's organization and setup status
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("org_id, setup_completed")
      .eq("user_id", user.id)
      .single();

    if (!profile?.org_id) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Create a new website record with auto-generated name
    const websiteId = uuidv4();
    const { error: websiteError } = await supabase.from("websites").insert({
      id: websiteId,
      name: `Project ${websiteId.slice(0, 8)}`,
      org_id: profile.org_id,
      tracking_id: uuidv4(),
    });

    if (websiteError) {
      console.log("websiteError", websiteError);
      return NextResponse.json(
        { error: "Failed to create website" },
        { status: 500 }
      );
    }
    //update user profile
    await supabase
      .from("user_profiles")
      .update({ setup_completed: true, active_project_id: websiteId })
      .eq("user_id", user.id);
    // Generate and return the tracking script
    const script = generateScript(websiteId);
    return NextResponse.json({
      message: "Website created successfully",
      script,
      websiteId,
    });
  } catch (error) {
    console.error("Error creating website:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the website" },
      { status: 500 }
    );
  }
}
