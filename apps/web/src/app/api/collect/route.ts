import { NextResponse } from "next/server";
import { processEvents } from "@/server/collector/processor";
import { addToQueue } from "@/server/collector/queue";
import { Session } from "@/types/api";
import { WebsiteService } from "@/server/services/website.service";
import type { eventWithTime } from "@rrweb/types";
import { createClient } from "@supabase/supabase-js";

const SCREENSHOT_SERVICE_URL = process.env.SCREENSHOT_SERVICE_URL;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

function corsResponse(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  return corsResponse(new NextResponse(null, { status: 200 }));
}

export async function POST(request: Request) {
  try {
    const session: Session = await request.json();

    if (!session.site_id || !session.id || !session.events) {
      return corsResponse(
        NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      );
    }

    // Process events and create session first
    const processedEvents = await processEvents(session.events);
    await addToQueue({
      ...session,
      events: processedEvents,
    });
    console.log("Session added to queue");

    if (session.events.some((event: eventWithTime) => event.type === 4)) {
      try {
        const isVerified = await WebsiteService.getVerificationStatus(
          session.site_id
        );

        if (!isVerified) {
          await WebsiteService.verifyWebsite(session.site_id);
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (session.events.some((event: eventWithTime) => event.type === 2)) {
      try {
        // Check if session already has a screenshot
        const { data: existingSession } = await supabase
          .from("sessions")
          .select("has_screenshot")
          .eq("id", session.id)
          .single();

        if (existingSession?.has_screenshot) {
          return;
        }

        // Find the first snapshot event
        const firstSnapshot = session.events.find(
          (event: eventWithTime) => event.type === 2
        );

        if (!firstSnapshot) {
          throw new Error("No snapshot event found");
        }

        // Send to screenshot service first
        const response = await fetch(`${SCREENSHOT_SERVICE_URL}/screenshot`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: session.id,
            siteId: session.site_id,
            events: [firstSnapshot],
          }),
        });

        if (!response.ok) {
          throw new Error(`Screenshot service error: ${response.statusText}`);
        }

        // Create screenshot record and update session
        const { error: screenshotError } = await supabase
          .from("screenshots")
          .insert({
            session_id: session.id,
            site_id: session.site_id,
            status: "pending",
          });

        if (screenshotError) {
          console.error("Error creating screenshot record:", screenshotError);
        }

        // Mark session as having a screenshot
        await supabase
          .from("sessions")
          .update({ has_screenshot: true })
          .eq("id", session.id);

      } catch (error) {
        console.error("Error creating screenshot record:", error);
        // Update screenshot record with error if it exists
        await supabase
          .from("screenshots")
          .update({
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
          })
          .match({ session_id: session.id });
      }
    }

    return corsResponse(NextResponse.json({ success: true }));
  } catch (error) {
    console.error("Error processing session:", error);
    return corsResponse(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    );
  }
}
