import { onCLS, onFID, onLCP, onFCP } from 'web-vitals';
import type { PerformanceMetrics } from '../types';

export class PerformanceService {
  private performanceData: PerformanceMetrics;

  constructor() {
    this.performanceData = {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
      resourceLoading: [],
      jsErrors: [],
      apiCalls: [],
    };
  }

  setupMonitoring(): void {
    this.collectWebVitals();
    this.observeResourceTiming();
    this.setupErrorListener();
    this.setupNetworkMonitoring();
  }

  private collectWebVitals(): void {
    onFCP(metric => {
      this.performanceData.fcp = metric.value;
    });
    
    onLCP(metric => {
      this.performanceData.lcp = metric.value;
    });
    
    onFID(metric => {
      this.performanceData.fid = metric.value;
    });
    
    onCLS(metric => {
      this.performanceData.cls = metric.value;
    });
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.performanceData.ttfb = navigation.responseStart - navigation.requestStart;
    }
  }

  private observeResourceTiming(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          this.performanceData.resourceLoading.push({
            url: resourceEntry.name,
            duration: resourceEntry.duration,
            size: resourceEntry.transferSize,
            type: resourceEntry.initiatorType
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private setupErrorListener(): void {
    window.addEventListener('error', (event) => {
      this.performanceData.jsErrors.push({
        message: event.error?.message || 'Unknown error',
        stack: event.error?.stack || '',
        timestamp: Date.now()
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.performanceData.jsErrors.push({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack || '',
        timestamp: Date.now()
      });
    });
  }

  private setupNetworkMonitoring(): void {
    const originalFetch = window.fetch;
    window.fetch = (async (
      input: URL | RequestInfo,
      init?: RequestInit
    ): Promise<Response> => {
      const startTime = Date.now();
      try {
        const response = await originalFetch.call(window, input, init);
        const duration = Date.now() - startTime;
        
        const url = input instanceof URL ? input.href : 
                    typeof input === 'string' ? input : 
                    input instanceof Request ? input.url : '';
        
        this.performanceData.apiCalls.push({
          url,
          method: init?.method || 'GET',
          duration,
          status: response.status,
          timestamp: startTime
        });
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        const url = input instanceof URL ? input.href : 
                    typeof input === 'string' ? input : 
                    input instanceof Request ? input.url : '';
                    
        this.performanceData.apiCalls.push({
          url,
          method: init?.method || 'GET',
          duration,
          status: 0,
          timestamp: startTime
        });
        throw error;
      }
    });
  }

  getPerformanceData(): PerformanceMetrics {
    return this.performanceData;
  }
} 