// apps/web/src/types/performance.ts
export interface PerformanceMetrics {
    // Web Vitals
    fcp: number;  // First Contentful Paint
    lcp: number;  // Largest Contentful Paint
    fid: number;  // First Input Delay
    cls: number;  // Cumulative Layout Shift
    ttfb: number; // Time to First Byte
    
    // Resource Metrics
    resourceLoading: {
      url: string;
      duration: number;
      size: number;
      type: string;
    }[];
    
    // JavaScript Metrics
    jsErrors: {
      message: string;
      stack: string;
      
      timestamp: number;
    }[];
    
    // Network Metrics
    apiCalls: {
      url: string;
      method: string;
      duration: number;
      status: number;
      timestamp: number;
    }[];
    
  }