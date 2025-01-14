import { onCLS, onFID, onLCP, onFCP } from "web-vitals";
import type { PerformanceMetrics } from "../types";

export class PerformanceService {
  private currentPageMetrics: PerformanceMetrics;
  private pageMetricsHistory: Map<string, PerformanceMetrics>;

  constructor() {
    this.pageMetricsHistory = new Map();
    this.currentPageMetrics = this.createEmptyMetrics();
  }

  private createEmptyMetrics(): PerformanceMetrics {
    return {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
      resourceLoading: [],
      jsErrors: [],
      apiCalls: [],
      url: window.location.href,
      timestamp: Date.now(),
    };
  }

  setupMonitoring(): void {
    this.collectWebVitals();
    this.observeResourceTiming();
    this.setupErrorListener();
    this.setupNetworkMonitoring();
    this.setupNavigationMonitoring();
  }

  private setupNavigationMonitoring(): void {
    // Monitor single-page navigation
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "navigation") {
          this.handleNavigation(entry as PerformanceNavigationTiming);
        }
      }
    });

    observer.observe({ entryTypes: ["navigation"] });

    // Handle SPA route changes
    window.addEventListener("popstate", () => this.handleRouteChange());

    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handleRouteChange();
    };
  }

  private handleRouteChange(): void {
    // Store current page metrics
    this.pageMetricsHistory.set(this.currentPageMetrics.url, {
      ...this.currentPageMetrics,
    });

    // Start fresh metrics for new page
    this.currentPageMetrics = this.createEmptyMetrics();

    // Collect new navigation timing
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.currentPageMetrics.ttfb =
        navigation.responseStart - navigation.requestStart;
    }
  }

  private collectWebVitals(): void {
    onFCP((metric) => {
      this.currentPageMetrics.fcp = metric.value;
    });

    onLCP((metric) => {
      this.currentPageMetrics.lcp = metric.value;
    });

    onFID((metric) => {
      this.currentPageMetrics.fid = metric.value;
    });

    onCLS((metric) => {
      this.currentPageMetrics.cls = metric.value;
    });

    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.currentPageMetrics.ttfb =
        navigation.responseStart - navigation.requestStart;
    }
  }

  private observeResourceTiming(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === "resource") {
          const resourceEntry = entry as PerformanceResourceTiming;
          this.currentPageMetrics.resourceLoading.push({
            url: resourceEntry.name,
            duration: resourceEntry.duration,
            size: resourceEntry.transferSize,
            type: resourceEntry.initiatorType,
          });
        }
      });
    });

    observer.observe({ entryTypes: ["resource"] });
  }

  private setupErrorListener(): void {
    window.addEventListener("error", (event) => {
      this.currentPageMetrics.jsErrors.push({
        message: event.error?.message || "Unknown error",
        stack: event.error?.stack || "",
        timestamp: Date.now(),
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.currentPageMetrics.jsErrors.push({
        message: event.reason?.message || "Unhandled Promise Rejection",
        stack: event.reason?.stack || "",
        timestamp: Date.now(),
      });
    });
  }

  private setupNetworkMonitoring(): void {
    const originalFetch = window.fetch;
    window.fetch = async (
      input: URL | RequestInfo,
      init?: RequestInit
    ): Promise<Response> => {
      const url =
        input instanceof URL
          ? input.href
          : typeof input === "string"
          ? input
          : input instanceof Request
          ? input.url
          : "";

      // Skip tracking calls
      if (url.includes("/api/collect")) {
        return originalFetch.call(window, input, init);
      }

      const startTime = Date.now();
      try {
        const response = await originalFetch.call(window, input, init);
        const duration = Date.now() - startTime;

        this.currentPageMetrics.apiCalls.push({
          url,
          method: init?.method || "GET",
          duration,
          status: response.status,
          timestamp: startTime,
        });

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        const url =
          input instanceof URL
            ? input.href
            : typeof input === "string"
            ? input
            : input instanceof Request
            ? input.url
            : "";

        this.currentPageMetrics.apiCalls.push({
          url,
          method: init?.method || "GET",
          duration,
          status: 0,
          timestamp: startTime,
        });
        throw error;
      }
    };
  }

  private handleNavigation(entry: PerformanceNavigationTiming): void {
    this.currentPageMetrics.ttfb = entry.responseStart - entry.requestStart;
    // Reset web vitals for new navigation
    this.currentPageMetrics.fcp = 0;
    this.currentPageMetrics.lcp = 0;
    this.currentPageMetrics.fid = 0;
    this.currentPageMetrics.cls = 0;
  }

  getPerformanceData(): PerformanceMetrics[] {
    // Return all collected metrics
    return [
      this.currentPageMetrics,
      ...Array.from(this.pageMetricsHistory.values()),
    ];
  }
}
