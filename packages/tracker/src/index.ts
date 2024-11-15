import { SessionRecorder } from './recorder';

if (typeof window !== 'undefined' && window._r?.websiteId) {
  const recorder = new SessionRecorder({
    siteId: window._r.websiteId,
    collectorUrl: 'https://gaha.vercel.app/api/collect'
  });
  recorder.start();
}

export { SessionRecorder };