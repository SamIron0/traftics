import { S3 } from 'aws-sdk';
import { SessionModel, SessionRecord } from '../models/session.model';
import { AuthRequest } from '../middleware/auth';
import { RecordedEvent } from '../../../../packages/types/src/events';

const s3 = new S3();
const BUCKET_NAME = process.env.SESSION_BUCKET || 'sessions';

export class SessionService {
  static async getSessions(req: AuthRequest, siteId?: string): Promise<SessionRecord[]> {
    return SessionModel.findAll(req, siteId);
  }

  static async getSession(req: AuthRequest, id: string): Promise<{
    session: SessionRecord;
    events: RecordedEvent[];
  }> {
    const session = await SessionModel.findOne(req, id);
    if (!session) {
      throw new Error('Session not found');
    }

    // Get events from S3
    const { Body } = await s3.getObject({
      Bucket: BUCKET_NAME,
      Key: `${session.site_id}/${session.id}/events.json`
    }).promise();

    const events = JSON.parse(Body?.toString() || '[]');

    return {
      session,
      events
    };
  }
}
