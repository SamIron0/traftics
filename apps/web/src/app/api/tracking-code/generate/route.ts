import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
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

    // Generate and return the tracking script
    const script = generateTrackingScript(websiteId);
    return NextResponse.json({
      message: "Website created successfully",
      script,
    });
  } catch (error) {
    console.error("Error creating website:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the website" },
      { status: 500 }
    );
  }
}

function generateTrackingScript(websiteId: string) {
  return `<script>
  (function(d, w) {
    w._recorder = w._recorder || {
      q: [],
      websiteId: "${websiteId}",
      push: function(args) { this.q.push(args); }
    };
    var s = d.createElement('script');
    s.async = true;
    s.src = 'https://efb088fa.session-recorder-tracker.pages.dev/tracker.js';
    d.head.appendChild(s);
  })(document, window);
</script>`;
}
