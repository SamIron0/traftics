import { S3 } from 'aws-sdk';
import { RecordedEvent } from '@session-recorder/types';

const s3 = new S3();
const BUCKET_NAME = process.env.SESSION_BUCKET || 'sessions';

export async function storeSession(
  siteId: string, 
  sessionId: string, 
  events: RecordedEvent[]
): Promise<void> {
  const key = `${siteId}/${sessionId}/${Date.now()}.json`;
  
  await s3.putObject({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: JSON.stringify(events),
    ContentType: 'application/json'
  }).promise();
}
