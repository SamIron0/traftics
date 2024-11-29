import { NextResponse } from "next/server";
import { processEvents } from "@/server/collector/processor";
import { addToQueue } from "@/server/collector/queue";
import { Session } from "@/types/api";
import { WebsiteService } from "@/server/services/website.service";
import type { eventWithTime } from '@rrweb/types';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

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
        
        // Queue screenshot job instead of processing directly
        await redis.lpush('screenshot-queue', JSON.stringify({
          sessionId: session.id,
          siteId: session.site_id,
          events: session.events
        }));
      } catch (error) {
        console.error(error);
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
