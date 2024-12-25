import { SessionTracker } from '../index';
import * as rrweb from 'rrweb';
import { jest } from '@jest/globals';
import type { eventWithTime } from '@rrweb/types';
import { Mirror } from 'rrweb-snapshot';

describe('SessionTracker', () => {
  jest.useFakeTimers();

  const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
  global.fetch = mockFetch;

  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });

  // Mock window location
  const mockLocation = {
    href: 'https://example.com',
  };
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
  });

  // Mock window dimensions
  Object.defineProperty(window, 'innerWidth', { value: 1024 });
  Object.defineProperty(window, 'innerHeight', { value: 768 });

  // Mock navigator
  Object.defineProperty(window, 'navigator', {
    value: {
      userAgent: 'test-user-agent',
    },
  });

  const defaultConfig = {
    websiteId: 'test-website-id',
    collectorUrl: 'https://test-collector.com',
    batchConfig: {
      maxBatchSize: 2,
      flushInterval: 1000,
      maxQueueSize: 3,
    },
  };

  let tracker: SessionTracker;
  let recordEmitCallback: (event: eventWithTime) => void;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
    mockLocalStorage.getItem.mockReset();
    mockLocalStorage.setItem.mockReset();

    // Mock successful location fetch
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        text: () => Promise.resolve('US'),
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        redirected: false,
      } as Response)
    );
    jest.mock('rrweb', () => {
      // Import the actual module with proper typing
      const originalModule = jest.requireActual<typeof import('rrweb')>('rrweb');

      type RecordMock = jest.Mock & {
        addCustomEvent: jest.Mock;
        freezePage: jest.Mock;
        takeFullSnapshot: jest.Mock;
        mirror: typeof originalModule.mirror;
      };

      // Create the mock function
      const mockRecord = jest.fn(() => jest.fn()) as RecordMock;

      // Add the static methods and properties
      mockRecord.addCustomEvent = jest.fn();
      mockRecord.freezePage = jest.fn();
      mockRecord.takeFullSnapshot = jest.fn();
      mockRecord.mirror = originalModule.mirror;

      return {
        ...originalModule,
        record: mockRecord,
      };
    });

    tracker = new SessionTracker(defaultConfig);
  });

  afterEach(() => {
    tracker.stop();
  });

  describe('Event Collection', () => {
    it('should queue events and flush when max queue size is reached', () => {
      recordEmitCallback({
        type: 1,
        timestamp: Date.now(),
        data: {},
      });
      recordEmitCallback({
        type: 1,
        timestamp: Date.now(),
        data: {},
      });
      recordEmitCallback({
        type: 1,
        timestamp: Date.now(),
        data: {},
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle URL changes', async () => {
      const newUrl = 'https://example.com/new-page';
      mockLocation.href = newUrl;
      window.dispatchEvent(new Event('popstate'));

      jest.advanceTimersByTime(1000);

      expect(mockFetch).toHaveBeenCalled();
      const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
      const body = lastCall[1]?.body;
      const payload = body instanceof ReadableStream
        ? await new Response(body).text()
        : typeof body === 'string'
        ? JSON.parse(body)
        : {};
      expect(payload.events).toContainEqual(
        expect.objectContaining({
          type: 4,
          data: expect.objectContaining({
            href: newUrl,
          }),
        })
      );
    });
  });

  
  /*
  describe('Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(rrweb.record).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith('https://cloudflare.com/cdn-cgi/trace');
    });

    it('should use default collector URL if not provided', () => {
      const trackerWithDefaultUrl = new SessionTracker({
        websiteId: 'test-website-id',
      });
      expect(trackerWithDefaultUrl).toBeDefined();
    });
  });
   
    describe('Batch Processing', () => {
      it('should send initial batch with session metadata', async () => {
        jest.advanceTimersByTime(5000);
  
        expect(mockFetch).toHaveBeenCalled();
        const [url, options] = mockFetch.mock.calls[1];
        const body = options?.body;
        const payload = body instanceof ReadableStream
        ? await new Response(body).text()
        : typeof body === 'string'
        ? JSON.parse(body)
        : {};
        expect(payload).toMatchObject({
          id: expect.any(String),
          site_id: defaultConfig.websiteId,
          started_at: expect.any(Number),
          user_agent: 'test-user-agent',
          screen_width: 1024,
          screen_height: 768,
          location: 'US',
        });
      });
  
      it('should handle failed batch sends and retry', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          redirected: false,
        } as Response);
  
        recordEmitCallback({
          type: 1,
          timestamp: Date.now(),
          data: {},
        });
  
        jest.advanceTimersByTime(1000);
        jest.advanceTimersByTime(1000);
  
        expect(mockFetch).toHaveBeenCalledTimes(3);
      });
    });
  
    describe('Error Handling', () => {
      it('should capture console errors', async() => {
        console.error('Test error');
  
        jest.advanceTimersByTime(1000);
  
        const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
        const body = lastCall[1]?.body;
        const payload = body instanceof ReadableStream
        ? await new Response(body).text()
        : typeof body === 'string'
        ? JSON.parse(body)
        : {};      expect(payload.events).toContainEqual(
          expect.objectContaining({
            type: 5,
            data: expect.objectContaining({
              tag: 'console_error',
              payload: ['Test error'],
            }),
          })
        );
      });
  
      it('should capture runtime errors', async() => {
        window.dispatchEvent(
          new ErrorEvent('error', {
            error: new Error('Test error'),
            message: 'Test error',
            filename: 'test.js',
            lineno: 1,
            colno: 1,
          })
        );
  
        jest.advanceTimersByTime(1000);
  
        const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
        const body = lastCall[1]?.body;
        const payload = body instanceof ReadableStream
        ? await new Response(body).text()
        : typeof body === 'string'
        ? JSON.parse(body)
        : {};      expect(payload.events).toContainEqual(
          expect.objectContaining({
            type: 5,
            data: expect.objectContaining({
              tag: 'runtime_error',
            }),
          })
        );
      });
    });
  
    describe('Session Management', () => {
      it('should handle inactivity timeout', () => {
        jest.advanceTimersByTime(31 * 60 * 1000);
  
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            method: 'PATCH',
            body: expect.stringContaining('"end_reason":"inactivity_timeout"'),
          })
        );
      });
  
      it('should store failed events in localStorage', () => {
        mockFetch.mockRejectedValue(new Error('Network error'));
  
        recordEmitCallback({
          type: 1,
          timestamp: Date.now(),
          data: {},
        });
  
        jest.advanceTimersByTime(5000);
  
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
        const [key, value] = mockLocalStorage.setItem.mock.calls[0];
        expect(key).toMatch(/^failed_events_/);
        expect(JSON.parse(value as string)).toHaveLength(1);
      });
    });
  
    describe('Cleanup', () => {
      it('should clean up properly on stop', () => {
        tracker.stop();
  
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"end_reason":"manual_stop"'),
          })
        );
      });
  
      it('should clean up properly on window unload', () => {
        window.dispatchEvent(new Event('unload'));
  
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"end_reason":"manual_stop"'),
          })
        );
      });
    });
    */
});
