import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await request.json();
    // if id, return tracking script for that id
    if (id) {
      return NextResponse.json({ script: generateScript(id) });
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

    // If setup is already completed, return the most recent website's tracking script
    if (profile.setup_completed) {
      const { data: website } = await supabase
        .from("websites")
        .select("id")
        .eq("org_id", profile.org_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (website) {
        const script = generateScript(website.id);
        return NextResponse.json({
          message: "Retrieved existing tracking script",
          script,
        });
      }
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

    // Mark setup as completed and set active project
    const { error: setupError } = await supabase
      .from("user_profiles")
      .update({ 
        setup_completed: true,
        active_project_id: websiteId 
      })
      .eq("user_id", user.id);

    if (setupError) {
      console.error("Setup completion error:", setupError);
      // Continue anyway since the website was created successfully
    }

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

function generateScript(websiteId: string) {
  return `<script>
(function(d, w) {
  w._r = w._r || {
    websiteId: "${websiteId}"
  };
  var s = d.createElement('script');
  s.async = true;
  s.src = 'https://493117db.session-recorder-tracker.pages.dev/tracker.js';
  d.head.appendChild(s);
})(document, window);
</script>`;
}
