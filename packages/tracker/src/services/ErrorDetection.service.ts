import type { eventWithTime } from "@rrweb/types";
import { ErrorType } from "../types";

const EXCLUDED_ERROR_PATTERNS = [
  /https?:\/\/www\.google-analytics\.com/,
  /https?:\/\/analytics\.google\.com/,
  /https?:\/\/www\.googletagmanager\.com/
];

export type ErrorEvent = {
  type: 'error' | 'unhandled_promise' | 'console_error' | 'network_error' | 'resource_error';
  timestamp: number;
  message: string;
  stack?: string;
  metadata?: {
    lineNumber?: number;
    columnNumber?: number;
    fileName?: string;
    resourceType?: string;
    url?: string;
    status?: number;
  };
};

export class ErrorDetectionService {
  private queueEvent: (event: eventWithTime) => void;

  constructor(queueEvent: (event: eventWithTime) => void) {
    this.queueEvent = queueEvent;
    this.initializeErrorListeners();
  }

  private shouldExcludeError(error: Error | string | Event): boolean {
    const errorString = error instanceof Error ? error.message + error.stack : 
                       error instanceof Event ? (error as any).message || error.type : 
                       String(error);

    return EXCLUDED_ERROR_PATTERNS.some(pattern => pattern.test(errorString));
  }

  private initializeErrorListeners(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      if (this.shouldExcludeError(event)) return;
      
      this.queueEvent({
        type: 5,
        timestamp: Date.now(),
        data: {
          tag: 'error',
          payload: {
            type: 'error' as ErrorType,
            message: event.message || 'Unknown error',
            stack: event.error?.stack,
            lineNumber: event.lineno,
            columnNumber: event.colno,
            fileName: event.filename
          }
        }
      });
    }, true);

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      if (this.shouldExcludeError(event.reason)) return;

      this.queueEvent({
        type: 5,
        timestamp: Date.now(),
        data: {
          tag: 'unhandled_promise',
          payload: {
            type: 'unhandled_promise' as ErrorType,
            message: event.reason?.message || String(event.reason),
            stack: event.reason?.stack
          }
        }
      });
    });

    // Console error interceptor
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorMessage = args.map(arg => String(arg)).join(' ');
      if (!this.shouldExcludeError(errorMessage)) {
        this.queueEvent({
          type: 5,
          timestamp: Date.now(),
          data: {
            tag: 'console_error',
            payload: {
              type: 'console_error' as ErrorType,
              message: errorMessage
            }
          }
        });
      }
      originalConsoleError.apply(console, args);
    };

    // Resource error interceptor
    window.addEventListener('error', (event) => {
      if (event.target instanceof HTMLElement) {
        this.handleResourceError(event);
      }
    }, true);

    // Network error interceptor
    this.interceptNetworkErrors();
  }

  private handleResourceError(event: Event): void {
    const target = event.target as HTMLElement;
    const url = (target as HTMLImageElement | HTMLScriptElement).src || 
                (target as HTMLLinkElement).href;
    this.queueEvent({
      type: 5,
      timestamp: Date.now(),
      data: {
        tag: 'resource_error',
        payload: {
          type: 'resource_error',
          message: `Failed to load ${target.tagName.toLowerCase()}`,
          resourceType: target.tagName.toLowerCase(),
          url,
          fileName: url.split('/').pop() || url,
        },
      },
    });
  }

  private interceptNetworkErrors(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch.apply(window, args);
        if (!response.ok) {
          this.handleNetworkError(response, args[0].toString());
        }
        return response;
      } catch (error) {
        this.handleNetworkError(error, args[0].toString());
        throw error;
      }
    };

    // XMLHttpRequest interceptor
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const self = this;
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null) {
      this.addEventListener('error', () => {
        self.handleNetworkError(new Error('XHR failed'), url.toString());
      });
      return originalXHROpen.apply(this, [method, url, async, username, password]);
    };
  }

  private handleNetworkError(error: any, url: string): void {
    this.queueEvent({
      type: 5,
      timestamp: Date.now(),
      data: {
        tag: 'network_error',
        payload: {
          type: 'network_error',
          message: error instanceof Response ? 
            `HTTP ${error.status}: ${error.statusText}` : 
            'Network request failed',
          url,
          status: error instanceof Response ? error.status : undefined,
          stack: error instanceof Error ? error.stack : undefined,
          fileName: url,
        },
      },
    });
  }
}
