import { eventWithTime } from "@rrweb/types";
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const CACHE_TTL = 60 * 60 * 24; // 24 hours

export async function cacheSessionChunk(
  siteId: string,
  sessionId: string,
  chunkNumber: number,
  events: eventWithTime[]
): Promise<void> {
  const key = `session:${siteId}:${sessionId}:chunk:${chunkNumber}`;
  await redis.set(key, JSON.stringify(events), {
    ex: CACHE_TTL,
  });
}

export async function getCachedSessionChunks(
  siteId: string,
  sessionId: string
): Promise<eventWithTime[]> {
  const pattern = `session:${siteId}:${sessionId}:chunk:*`;
  const keys = await redis.keys(pattern);

  if (!keys.length) return [];

  const chunks = await Promise.all(keys.map((key) => redis.get(key)));

  return chunks
    .filter(Boolean)
    .map((chunk) => JSON.parse(chunk as string))
    .flat()
    .sort((a, b) => a.timestamp - b.timestamp);
}
