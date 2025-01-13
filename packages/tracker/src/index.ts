import type { SessionConfig } from "./types";
import { SessionManager } from "./core/SessionManager";

export class SessionTracker {
  private readonly sessionManager: SessionManager;

  constructor(config: SessionConfig) {
    this.sessionManager = new SessionManager(config);
  }

  public stop(): void {
    this.sessionManager.stop('manual_stop');
  }
}

// Auto-initialization code
if (typeof window !== "undefined" && window._r) {
  const tracker = new SessionTracker({
    websiteId: window._r.websiteId,
    collectorUrl: window._r.collectorUrl,
  });

  window.addEventListener("unload", () => {
    tracker.stop();
  });
}
