import { NextResponse } from "next/server";
import { processEvents } from "@/server/collector/processor";
import { Session } from "@/types/api";
import { SessionService } from "@/server/services/session.service";
import { WebsiteService } from "@/server/services/website.service";
import { createClient } from "@/utils/supabase/server";
import { UsageService } from "@/server/services/usage.service";

// Cache verification check results in memory (this will reset on server restart)
const verifiedSites = new Set<string>();

function corsResponse(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  console.log("[DEBUG] OPTIONS request received");
  return corsResponse(new NextResponse(null, { status: 200 }));
}

export async function POST(request: Request) {
  console.log("[DEBUG] POST request received");
  
  try {
    const session: Session = await request.json();
    console.log("[DEBUG] Received session data:", {
      id: session.id,
      site_id: session.site_id,
      events_count: session.events?.length
    });

    if (!session.site_id || !session.id || !session.events) {
      console.log("[DEBUG] Missing required fields:", {
        has_site_id: !!session.site_id,
        has_id: !!session.id,
        has_events: !!session.events
      });
      return corsResponse(
        NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      );
    }

    // Only check verification if we haven't seen this site before
    if (!verifiedSites.has(session.site_id)) {
      try {
        console.log("[DEBUG] Checking website verification status...");
        const supabase = await createClient();
        const { data: website } = await supabase
          .from("websites")
          .select("verified")
          .eq("id", session.site_id)
          .single();

        if (!website?.verified) {
          await WebsiteService.verifyWebsite(session.site_id);
        }
        // Add to verified sites set
        verifiedSites.add(session.site_id);
      } catch (error) {
        console.error("[DEBUG] Error verifying website:", error);
        // Continue processing even if verification fails
      }
    }

    // Check usage quota
    const hasQuota = await UsageService.checkQuota(session.site_id);
    if (!hasQuota) {
      return corsResponse(
        NextResponse.json({ error: 'Usage limit exceeded', code: 'USAGE_LIMIT_EXCEEDED' }, { status: 429 })
      );
    }

    // Process events
    const processedEvents = await processEvents(session.events);
    console.log("[DEBUG] Events processed:", processedEvents.length);

    // Only create/update session if metadata is present
    if (session.started_at) {
      console.log("[DEBUG] Creating new session");
      await SessionService.createSession({
        id: session.id,
        site_id: session.site_id,
        started_at: session.started_at,
        duration: session.duration,
        user_agent: session.user_agent,
        screen_width: session.screen_width,
        screen_height: session.screen_height,
        location: session.location,
      });
    } else {
      console.log("[DEBUG] Updating session duration");
      if (session.duration) {
        await SessionService.updateDuration(session.id, session.duration);
      }
    }

    // Store events in both storage and page_events table
    console.log("[DEBUG] Storing events");
    await Promise.all([
      SessionService.storeEvents(session.id, session.site_id, processedEvents),
      SessionService.storePageEvents(session.id, session.site_id, processedEvents)
    ]);

    console.log("[DEBUG] Request completed successfully");
    return corsResponse(NextResponse.json({ success: true }));
  } catch (error) {
    console.error("[DEBUG] Error processing session:", error);
    return corsResponse(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    );
  }
}
