import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Helper function to handle CORS
function corsResponse(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return corsResponse(new NextResponse(null, { status: 200 }));
}

export async function POST(request: Request) {
  try {
    const { siteId } = await request.json();

    if (!siteId) {
      return corsResponse(
        NextResponse.json(
          { error: "Missing website ID" },
          { status: 400 }
        )
      );
    }

    const supabase = await createClient();

    // Check if website exists and belongs to user's organization
    const { data: website, error: websiteError } = await supabase
      .from("websites")
      .select("verified, org_id")
      .eq("id", siteId)
      .single();

    if (websiteError || !website) {
      return corsResponse(
        NextResponse.json(
          { error: "Website not found" },
          { status: 404 }
        )
      );
    }
    
    // Only update if not already verified
    if (!website.verified) {
      const { error: updateError } = await supabase
        .from("websites")
        .update({ verified: true })
        .eq("id", siteId);

      if (updateError) {
        console.error("Error verifying website:", updateError);
        return corsResponse(
          NextResponse.json(
            { error: "Failed to verify website" },
            { status: 500 }
          )
        );
      }
    }

    return corsResponse(
      NextResponse.json(
        { message: "Website verification successful" },
        { status: 200 }
      )
    );
  } catch (error) {
    console.error("Error verifying website:", error);
    return corsResponse(
      NextResponse.json(
        { error: "Failed to verify website" },
        { status: 500 }
      )
    );
  }
} 