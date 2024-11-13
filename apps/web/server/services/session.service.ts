import { createClient } from '@supabase/supabase-js';
import { SessionModel, SessionRecord } from '../models/session.model';
import { RecordedEvent } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const BUCKET_NAME = 'sessions';

export class SessionService {
  static async getSessions(req: any, siteId?: string): Promise<SessionRecord[]> {
    return SessionModel.findAll(req, siteId);
  }

  static async getSession(req: any, id: string): Promise<{
    session: SessionRecord;
    events: RecordedEvent[];
  }> {
    const session = await SessionModel.findOne(req, id);
    if (!session) {
      throw new Error('Session not found');
    }

    // Get events from Supabase Storage
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .download(`${session.site_id}/${session.id}/events.json`);

    if (error) {
      throw new Error('Failed to fetch session events');
    }

    const text = await data.text();
    const events = JSON.parse(text || '[]');

    return {
      session,
      events
    };
  }
}
