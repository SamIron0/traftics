import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteName } = await request.json();
    
    // Create a new website record
    const websiteId = uuidv4();
    const { error: websiteError } = await supabase
      .from("websites")
      .insert({
        id: websiteId,
        name: websiteName,
        user_id: user.id,
        tracking_id: uuidv4() // Unique tracking ID for the website
      });

    if (websiteError) throw websiteError;

    // Return the tracking code
    return NextResponse.json({
      websiteId,
      script: generateTrackingScript(websiteId)
    });
  } catch (error) {
    console.error("Error generating tracking code:", error);
    return NextResponse.json(
      { error: "Failed to generate tracking code" },
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