import type { eventWithTime } from "@rrweb/types";

export class CustomEventManager {
  constructor(private readonly handleEvent: (event: eventWithTime) => void) {}

  setupCustomEventListeners(): void {
    this.setupPageLoadListener();
  }

  private setupPageLoadListener(): void {
    window.addEventListener('load', () => {
      const performanceData = window.performance.timing;
      const loadTime = performanceData.loadEventEnd - performanceData.navigationStart;
      const domContentLoadedTime = performanceData.domContentLoadedEventEnd - performanceData.navigationStart;

      const pageLoadData = {
        loadTime,
        domContentLoadedTime,
        navigationStart: performanceData.navigationStart,
        responseStart: performanceData.responseStart,
        domComplete: performanceData.domComplete,
      };

      this.handleEvent({
        type: 5,
        timestamp: Date.now(),
        data: {
          tag: 'page_load',
          payload: pageLoadData,
        },
      });
    });
  }
} 