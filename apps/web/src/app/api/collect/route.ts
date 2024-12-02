import { NextResponse } from "next/server";
import { processEvents } from "@/server/collector/processor";
import { addToQueue } from "@/server/collector/queue";
import { Session } from "@/types/api";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { gunzip } from 'zlib';
import { promisify } from 'util';

const gunzipAsync = promisify(gunzip);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Cache CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Content-Encoding',
};

export async function POST(request: Request) {
  try {
    // Handle compressed data
    const contentEncoding = request.headers.get('content-encoding');
    let sessionData: Session;

    if (contentEncoding === 'gzip') {
      const buffer = await request.arrayBuffer();
      const decompressed = await gunzipAsync(Buffer.from(buffer));
      sessionData = JSON.parse(decompressed.toString());
    } else {
      sessionData = await request.json();
    }

    if (!sessionData.site_id || !sessionData.id || !sessionData.events) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }), 
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Process events and session in parallel
    const [processedEvents, screenshotResult] = await Promise.all([
      processEvents(sessionData.events),
      handleScreenshot(sessionData)
    ]);

    // Add to queue with processed events
    await addToQueue({
      ...sessionData,
      events: processedEvents,
      ...screenshotResult
    });

    return new NextResponse(
      JSON.stringify({ success: true }), 
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error processing session:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }), 
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

async function handleScreenshot(session: Session) {
  if (!session.screenshot) return {
    has_screenshot: false,
    screen_width: session.screen_width,
    screen_height: session.screen_height
  };

  try {
    const base64Data = session.screenshot.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const [metadata, uploadResult] = await Promise.all([
      sharp(buffer).metadata(),
      supabase.storage
        .from("screenshots")
        .upload(`${session.site_id}/${session.id}/screenshot.jpg`, buffer, {
          contentType: "image/jpeg",
          upsert: true,
        })
    ]);

    if (uploadResult.error) throw uploadResult.error;

    return {
      has_screenshot: true,
      screen_width: metadata.width || session.screen_width,
      screen_height: metadata.height || session.screen_height
    };
  } catch (error) {
    console.error("Error handling screenshot:", error);
    return {
      has_screenshot: false,
      screen_width: session.screen_width,
      screen_height: session.screen_height
    };
  }
}
