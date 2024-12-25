/**
 * @jest-environment node
 */

import { POST } from '@/app/api/collect/route';
import { NextResponse } from 'next/server';
import { EventType, IncrementalSource } from '@rrweb/types';
import { SessionService } from '@/server/services/session.service';
import { WebsiteService } from '@/server/services/website.service';
import { UsageService } from '@/server/services/usage.service';

// Mock the services
jest.mock('../../../server/services/session.service');
jest.mock('../../../server/services/website.service');
jest.mock('../../../server/services/usage.service');
jest.mock('../../../server/services/frustration.service');
jest.mock('../../../server/services/userEvent.service');
jest.mock('../../../server/services/networkEvent.service');

describe('Collect API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    (WebsiteService.getVerificationStatus as jest.Mock).mockResolvedValue(true);
    (UsageService.checkQuota as jest.Mock).mockResolvedValue(true);
    (SessionService.createSession as jest.Mock).mockResolvedValue(true);
    (SessionService.storeEvents as jest.Mock).mockResolvedValue(true);
  });

  describe('POST endpoint', () => {
    it('should successfully process a valid session', async () => {
      const mockSession = {
        id: 'test-session-123',
        site_id: 'test-site-123',
        started_at: new Date().toISOString(),
        duration: 1000,
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        screen_width: 1920,
        screen_height: 1080,
        location: '/test-page',
        events: [
          {
            type: EventType.DomContentLoaded,
            timestamp: Date.now(),
            data: {}
          },
          {
            type: EventType.IncrementalSnapshot,
            timestamp: Date.now(),
            data: {
              source: IncrementalSource.MouseInteraction,
              type: 2 // Click
            }
          }
        ]
      };

      const request = new Request('http://localhost:3000/api/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockSession),
      });

      const response = await POST(request);
      if (!(response instanceof NextResponse)) {
        fail('Expected NextResponse');
      }
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      
      const responseData = await response.json();
      expect(responseData).toEqual({ success: true });

      expect(WebsiteService.getVerificationStatus).toHaveBeenCalledWith(mockSession.id);
      expect(UsageService.checkQuota).toHaveBeenCalledWith(mockSession.site_id);
      expect(SessionService.createSession).toHaveBeenCalled();
      expect(SessionService.storeEvents).toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', async () => {
      const invalidSession = {
        events: []
      };

      const request = new Request('http://localhost:3000/api/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidSession),
      });

      const response = await POST(request);
      if (!(response instanceof NextResponse)) {
        fail('Expected NextResponse');
      }
      expect(response.status).toBe(400);
      
      const responseData = await response.json();
      expect(responseData).toEqual({ error: 'Missing required fields' });
    });

    it('should return 429 when usage quota is exceeded', async () => {
      (UsageService.checkQuota as jest.Mock).mockResolvedValue(false);

      const mockSession = {
        id: 'test-session-123',
        site_id: 'test-site-123',
        events: []
      };

      const request = new Request('http://localhost:3000/api/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockSession),
      });

      const response = await POST(request);
      if (!(response instanceof NextResponse)) {
        throw new Error('Expected NextResponse');
    }
      expect(response.status).toBe(429);
      
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: 'Usage limit exceeded',
        code: 'USAGE_LIMIT_EXCEEDED'
      });
    });
  });
});