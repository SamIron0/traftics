import { NextResponse } from "next/server";
import { processEvents } from "@/server/collector/processor";
import { addToQueue } from "@/server/collector/queue";
import { Session } from "types/api";
import { createClient } from "@/utils/supabase/server";
import type { eventWithTime } from '@rrweb/types';

function corsResponse(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

// Add OPTIONS handler for CORS preflight
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

    const supabase = await createClient();

    // Only check and update verification if this is the first event
    if (session.events.some((event: eventWithTime) => event.type === 4)) {
      const { data: website, error: websiteError } = await supabase
        .from("websites")
        .select("verified")
        .eq("id", session.site_id)
        .single();

      if (websiteError) {
        return NextResponse.json(
          { error: "Invalid website ID" },
          { status: 400 }
        );
      }

      // Only update if not already verified
      if (!website.verified) {
        const { error: updateError } = await supabase
          .from("websites")
          .update({ verified: true })
          .eq("id", session.site_id);

        if (updateError) {
          console.error("Error verifying website:", updateError);
        }
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
