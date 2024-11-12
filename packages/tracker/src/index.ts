import { SessionRecorder } from './recorder';

export function initializeTracker(config: { siteId: string; collectorUrl: string }) {
  const recorder = new SessionRecorder(config);
  recorder.start();
  return recorder;
}

export type { SessionRecorder };