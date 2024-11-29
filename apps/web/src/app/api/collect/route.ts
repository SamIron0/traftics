import { NextResponse } from "next/server";
import { processEvents } from "@/server/collector/processor";
import { addToQueue } from "@/server/collector/queue";
import { Session } from "@/types/api";
import { WebsiteService } from "@/server/services/website.service";
import type { eventWithTime } from '@rrweb/types';
import { createClient } from '@supabase/supabase-js';

const SCREENSHOT_SERVICE_URL = process.env.SCREENSHOT_SERVICE_URL;

const supabase = createClient(
  process.env.SUPABASE_URL!,
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

    // Check if screenshot is needed
    if (session.events.some((event: eventWithTime) => event.type === 4)) {
      try {
        const isVerified = await WebsiteService.getVerificationStatus(session.site_id);
        
        if (!isVerified) {
          await WebsiteService.verifyWebsite(session.site_id);
        }
        
        // Create pending screenshot record
        const { error: screenshotError } = await supabase
          .from('screenshots')
          .insert({
            session_id: session.id,
            site_id: session.site_id,
            status: 'pending'
          });

        if (screenshotError) {
          console.error('Error creating screenshot record:', screenshotError);
        }
        
        // Send to screenshot service
        const response = await fetch(`${SCREENSHOT_SERVICE_URL}/screenshot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: session.id,
            siteId: session.site_id,
            events: session.events
          })
        });

        if (!response.ok) {
          throw new Error(`Screenshot service error: ${response.statusText}`);
        }
      } catch (error) {
        console.error(error);
        // Update screenshot record with error
        await supabase
          .from('screenshots')
          .update({ status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' })
          .match({ session_id: session.id });
      }
    }

    const processedEvents = await processEvents(session.events);
    await addToQueue({
      ...session,
      events: processedEvents,
    });

    return corsResponse(NextResponse.json({ success: true }));
  } catch (error) {
    console.error("Error processing session:", error);
    return corsResponse(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    );
  }
}
