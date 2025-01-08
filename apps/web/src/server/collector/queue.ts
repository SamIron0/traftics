import { Session } from "@/types/api";
import { SessionService } from "../services/session.service";
import { revalidateTag } from 'next/cache';

export async function addToQueue(session: Session): Promise<void> {
  try {
    await processQueue(session);
    // Revalidate both caches after processing new session
    revalidateTag('sessions');
    revalidateTag('dashboard-metrics');
  } catch (error) {
    console.error('Error adding to queue:', error);
    throw error;
  }
}
 
async function processQueue(session: Session): Promise<void> {
  try {
    await SessionService.createSession(session);
  } catch (error) {
    console.error('Error processing session:', error);
    throw error;
  }
}