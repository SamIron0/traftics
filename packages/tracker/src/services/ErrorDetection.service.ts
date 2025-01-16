import { eventWithTime } from "@rrweb/types";

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

  private initializeErrorListeners(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      if (event.error instanceof Error) {
        this.handleJavaScriptError(event.error, event);
      } else if (event.target instanceof HTMLElement) {
        this.handleResourceError(event);
      }
    }, true);

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event);
    });

    // Console error interceptor
    this.interceptConsoleErrors();

    // Network error interceptor
    this.interceptNetworkErrors();
  }

  private handleJavaScriptError(error: Error, event: Event): void {
    const errorEvent = event as unknown as globalThis.ErrorEvent;
    this.queueEvent({
      type: 5,
      timestamp: Date.now(),
      data: {
        tag: 'error',
        payload: {
          type: 'error',
          message: error.message,
          stack: error.stack,
          lineNumber: errorEvent.lineno,
          columnNumber: errorEvent.colno,
          fileName: errorEvent.filename,
          url: window.location.href,
        },
      },
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const error = event.reason;
    this.queueEvent({
      type: 5,
      timestamp: Date.now(),
      data: {
        tag: 'unhandled_promise',
        payload: {
          type: 'unhandled_promise',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
    });
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

  private interceptConsoleErrors(): void {
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      this.queueEvent({
        type: 5,
        timestamp: Date.now(),
        data: {
          tag: 'console_error',
          payload: {
            type: 'console_error',
            message: args.map(arg => 
              arg instanceof Error ? arg.message : String(arg)
            ).join(' '),
            stack: args.find(arg => arg instanceof Error)?.stack,
          },
        },
      });
      originalConsoleError.apply(console, args);
    };
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
