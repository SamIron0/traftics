import { Session } from "@/types";
import { createClient } from "@/utils/supabase/server";


export async function addToQueue(session: Session): Promise<void> {
  try {
    console.log('Adding to queue:', session);
    await processQueue(session);
  } catch (error) {
    console.error('Error adding to queue:', error);
    throw error;
  }
}

async function processQueue(session: Session): Promise<void> {
  const supabase = await createClient();
  
  try {
    // 1. Store session metadata in database
    await supabase.from('sessions').insert({
      id: session.id,
      site_id: session.siteId,
      started_at: new Date(session.startedAt).toISOString(),
      duration: session.duration,
      user_agent: session.userAgent,
      screen_width: session.screenResolution.width,
      screen_height: session.screenResolution.height
    });

    // 2. Store full event data in storage bucket
    const filePath = `${session.siteId}/${session.id}/events.json`;
    await supabase.storage
      .from('sessions')
      .upload(filePath, JSON.stringify(session.events), {
        contentType: 'application/json',
        upsert: true
      });
      
  } catch (error) {
    console.error('Error processing session:', error);
    throw error;
  }
}

setInterval(processQueue, 60000);
