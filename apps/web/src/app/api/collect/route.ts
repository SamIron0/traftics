import { NextResponse } from "next/server";
import { processEvents } from "@/server/collector/processor";
import { addToQueue } from "@/server/collector/queue";
import { Session } from "@/types/api";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

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

    // Handle screenshot if present
    if (session.screenshot) {
      try {
        // Convert base64 to buffer
        const base64Data = session.screenshot.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");

        // Get image dimensions
        const metadata = await sharp(buffer).metadata();
        const imageWidth = metadata.width;
        const imageHeight = metadata.height;
        // Upload to Supabase Storage
        const filePath = `${session.site_id}/${session.id}/screenshot.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("screenshots")
          .upload(filePath, buffer, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Update session record with screenshot status and dimensions
        const { error: updateError } = await supabase
          .from("sessions")
          .update({
            has_screenshot: true,
            screen_width: imageWidth,
            screen_height: imageHeight,
          })
          .eq("id", session.id);

        if (updateError) {
          console.error("Error updating session record:", updateError);
          throw updateError;
        }
      } catch (error) {
        console.error("Error handling screenshot:", error);
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
