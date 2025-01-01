import { NextResponse } from "next/server";
import { WebsiteService } from "@/server/services/website.service";

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

    try {
      // Check verification status
      const isVerified = await WebsiteService.getVerificationStatus(siteId);
      
      // Only update if not already verified
      if (!isVerified) {
        await WebsiteService.verifyWebsite(siteId);
      }

      return corsResponse(
        NextResponse.json(
          { message: "Website verification successful" },
          { status: 200 }
        )
      );
    } catch (error) {
      if (error instanceof Error && error.message === "Website not found") {
        return corsResponse(
          NextResponse.json(
            { error: "Website not found" },
            { status: 404 }
          )
        );
      }
      throw error;
    }
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