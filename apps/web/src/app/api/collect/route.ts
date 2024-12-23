import { NextResponse } from "next/server";
import { Session } from "@/types/api";
import { parseUserAgent } from "@/utils/helpers";
import { EventType, eventWithTime, IncrementalSource, MouseInteractions } from "@rrweb/types";
import { SessionService } from "@/server/services/session.service";
import { WebsiteService } from "@/server/services/website.service";
import { UsageService } from "@/server/services/usage.service";
import { FrustrationService } from "@/server/services/frustration.service";
import { calculateEngagement } from "./engagement";
import { RelevanceService } from "@/server/services/relevance.service";
import { ErrorType } from "@/types/error";
import { calculatePageMetrics, isCustomEvent } from "@/utils/helpers";
import { UserEventService } from "@/server/services/userEvent.service";
import { NetworkEventService } from "@/server/services/networkEvent.service";

interface ScrollData {
  source: IncrementalSource.Scroll;
  y: number;
}

interface NetworkErrorPayload {
  url: string;
  method: string;
  status: number;
  statusText: string;
  duration: number;
}

// Cache verification check results in memory
const verifiedSites = new Set<string>();

// Define a set of useful incremental data types
const USEFUL_INCREMENTAL_DATA_TYPES = new Set([
  IncrementalSource.MouseInteraction,
  IncrementalSource.Scroll,
  IncrementalSource.Input,
  IncrementalSource.MediaInteraction,
  IncrementalSource.CanvasMutation,
  IncrementalSource.StyleSheetRule,
  IncrementalSource.CustomElement,
]);

function corsResponse(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  return corsResponse(new NextResponse(null, { status: 200 }));
}

// Helper to calculate metrics from events
function calculateSessionMetrics(events: eventWithTime[]) {
  let totalClicks = 0;
  let totalScrollDistance = 0;
  let totalInputs = 0;
  let errorCount = 0;
  let successCount = 0;

  events.forEach(event => {
    if (event.type === EventType.IncrementalSnapshot) {
      if (event.data.source === IncrementalSource.MouseInteraction) {
        if (event.data.type === MouseInteractions.Click) {
          totalClicks++;
        }
      } else if (event.data.source === IncrementalSource.Scroll) {
        const scrollData = event.data as ScrollData;
        totalScrollDistance += Math.abs(scrollData.y);
      } else if (event.data.source === IncrementalSource.Input) {
        totalInputs++;
      }
    } else if (isCustomEvent(event)) {
      if (event.data.tag === 'network_success') {
        successCount++;
      } else {
        const errorTag = event.data.tag as ErrorType;
        if (['error', 'console_error', 'network_error'].includes(errorTag)) {
          errorCount++;
        }
      }
    }
  });

  return {
    totalClicks,
    totalScrollDistance,
    totalInputs,
    errorCount,
    successCount
  };
}


export async function POST(request: Request) {
  try {
    const session: Session = await request.json();

    const userAgentInfo = parseUserAgent(session.user_agent || '');
    const metrics = calculateSessionMetrics(session.events || []);
    const pageMetrics = calculatePageMetrics(session.events || []);

    if (!session.site_id || !session.id || !session.events) {
      return corsResponse(
        NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      );
    }

    for (const event of session.events) {
      if (event.type === EventType.IncrementalSnapshot &&
        USEFUL_INCREMENTAL_DATA_TYPES.has(event.data.source)) {
        await UserEventService.storeUserEvent({
          session_id: session.id,
          event_type: event.type,
          timestamp: new Date(event.timestamp).toISOString(),
          event_data: event.data || null,
        });
      }
      else {
        if (isCustomEvent(event) && event.data.tag === 'network_error') {
          const payload = event.data.payload as NetworkErrorPayload;
          const networkErrorEvent = {
            session_id: session.id,
            request_url: payload.url || '',
            status_code: payload.status || 0,
            status_text: payload.statusText || '',
            method: payload.method || 'GET',
            response_time: payload.duration || 0,
            is_successful: false,
            timestamp: new Date(event.timestamp).toISOString(),
          };
          await NetworkEventService.storeNetworkEvent(networkErrorEvent);
        }
      }

      // Only check verification if we haven't seen this site before
      if (!verifiedSites.has(session.site_id)) {
        try {
          const verified = await WebsiteService.getVerificationStatus(session.id);
          if (!verified) {
            const origin = request.headers.get("origin");
            let domain: string | undefined;
            let urlString: string | undefined;
            if (origin) {
              try {
                domain = new URL(origin).hostname;
                urlString = `https://${domain}`;
              } catch (error) {
                console.error("Invalid URL format:", error);
                domain = undefined;
              }
            }

            await WebsiteService.verifyWebsite(session.site_id, urlString);
          }
          verifiedSites.add(session.site_id);
        } catch (error) {
          console.error(error);
        }
      }

      // Check usage quota
      const hasQuota = await UsageService.checkQuota(session.site_id);
      if (!hasQuota) {
        return corsResponse(
          NextResponse.json({ error: 'Usage limit exceeded', code: 'USAGE_LIMIT_EXCEEDED' }, { status: 429 })
        );
      }

      // Only create/update session if metadata is present
      if (session.started_at) {
        await SessionService.createSession({
          id: session.id,
          site_id: session.site_id,
          started_at: session.started_at,
          duration: session.duration,
          user_agent: session.user_agent,
          screen_width: session.screen_width,
          screen_height: session.screen_height,
          location: session.location,
          device_type: userAgentInfo.device.type || '',
          os: userAgentInfo.os,
          browser: userAgentInfo.browser,
          total_clicks: metrics.totalClicks,
          total_scroll_distance: metrics.totalScrollDistance,
          total_inputs: metrics.totalInputs,
          session_error_count: metrics.errorCount,
          is_active: true
        });
      } else {
        if (session.duration) {
          await SessionService.updateSession(session.id, {
            duration: session.duration
          });
        }
      }

      await Promise.all([
        SessionService.storeEvents(session.id, session.site_id, session.events),
      ]);

      if (session.events.filter(e => e.type === 4).length > 0) {
        await SessionService.storePageEvents(session.id, session.site_id, pageMetrics);
      }

      const frustrationScore = await FrustrationService.calculateFrustrationScore(
        session.events,
        session.events.filter(e => e.type === 4)
          .map(e => ({
            href: e.data.href,
            timestamp: new Date(e.timestamp).toISOString()
          }))
      );
      const engagementScore = calculateEngagement(session);
      const relevanceScore = RelevanceService.calculateRelevanceScore(
        frustrationScore,
        engagementScore.normalizedScore,
        metrics.errorCount
      );

      await Promise.all([
        SessionService.updateSession(session.id, { frustration_score: frustrationScore }),
        SessionService.updateSession(session.id, { engagement_score: engagementScore.totalScore }),
        SessionService.updateSession(session.id, { relevance_score: relevanceScore })
      ]);

      return corsResponse(NextResponse.json({ success: true }));
    }
  } catch (error) {
    console.error(error);
    return corsResponse(
      NextResponse.json({ error: "Internal server error" }, { status: 500 })
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { sessionId, status } = await request.json();

    if (!sessionId || !status) {
      return corsResponse(
        NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      );
    }

    await SessionService.updateSession(sessionId, {
      is_active: status.is_active,
      end_reason: status.end_reason,
    });

    return corsResponse(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('Error updating session:', error);
    return corsResponse(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    );
  }
}
