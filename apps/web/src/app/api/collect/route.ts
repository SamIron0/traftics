import { NextResponse } from "next/server";
import { Session } from "@/types/api";
import { calculateSessionMetrics, parseUserAgent } from "@/utils/helpers";
import { EventType, IncrementalSource } from "@rrweb/types";
import { SessionService } from "@/server/services/session.service";
import { WebsiteService } from "@/server/services/website.service";
import { UsageService } from "@/server/services/usage.service";
import { FrustrationService } from "@/server/services/frustration.service";
import { calculateEngagement } from "./engagement";
import { RelevanceService } from "@/server/services/relevance.service";
import { calculatePageMetrics, isCustomEvent } from "@/utils/helpers";
import { UserEventService } from "@/server/services/userEvent.service";
import { NetworkEventService } from "@/server/services/networkEvent.service";

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

export async function POST(request: Request) {
  try {
    console.log("POST request received");
    const session: Session = await request.json();
    const metrics = calculateSessionMetrics(session.events || []);
    console.log("session Metrics calculated:", metrics);
    const pageMetrics = calculatePageMetrics(session.events || []);
    console.log("Page metrics calculated:", pageMetrics);
    if (!session.site_id || !session.id || !session.events) {
      console.log("Missing required fields in session");
      return corsResponse(
        NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      );
    }
    // Check usage quota
    const hasQuota = await UsageService.checkQuota(session.site_id);
    console.log("Usage quota check:", hasQuota);
    if (!hasQuota) {
      return corsResponse(
        NextResponse.json({ error: 'Usage limit exceeded', code: 'USAGE_LIMIT_EXCEEDED' }, { status: 429 })
      );
    }
    // Only check verification if we haven't seen this site before
    if (!verifiedSites.has(session.site_id)) {
      try {
        const verified = await WebsiteService.getVerificationStatus(session.site_id);
        console.log("Verification status for site:", verified);
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
          console.log("Website verified:", session.site_id);
        }
        verifiedSites.add(session.site_id);
      } catch (error) {
        console.error("Error verifying website:", error);
      }
    }


    // Only create/update session if metadata is present
    if (session.started_at) {
      const userAgentInfo = parseUserAgent(session.user_agent || '');
      await SessionService.createSession({
        id: session.id,
        site_id: session.site_id,
        started_at: session.started_at,
        duration: session.duration,
        user_agent: session.user_agent,
        screen_width: session.screen_width,
        screen_height: session.screen_height,
        location: session.location,
        device: userAgentInfo.device,
        os: userAgentInfo.os,
        browser: userAgentInfo.browser,
        total_clicks: metrics.totalClicks,
        total_scroll_distance: metrics.totalScrollDistance,
        total_inputs: metrics.totalInputs,
        session_error_count: metrics.errorCount,
        is_active: true
      });
      console.log("Session created:", session.id);
    } else {
      const existingSession = await SessionService.getSession(session.id);
      if (existingSession) {
        await SessionService.updateSession(session.id, {
          duration: session.duration,
          total_clicks: existingSession.total_clicks + metrics.totalClicks,
          total_scroll_distance: existingSession.total_scroll_distance + metrics.totalScrollDistance,
          total_inputs: existingSession.total_inputs + metrics.totalInputs,
          session_error_count: existingSession.session_error_count + metrics.errorCount
        });
      }
    }

    for (const event of session.events) {
      console.log("Processing event:", event);
      if (event.type === EventType.IncrementalSnapshot &&
        USEFUL_INCREMENTAL_DATA_TYPES.has(event.data.source)) {
        await UserEventService.storeUserEvent({
          session_id: session.id,
          event_type: event.type,
          timestamp: new Date(event.timestamp).toISOString(),
          event_data: event.data || null,
        });
        console.log("User event stored:", event);
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
          console.log("Network error event stored:", networkErrorEvent);
        }
      }
    }

    await SessionService.storeEvents(session.id, session.site_id, session.events);
    if (session.events.filter(e => e.type === 4).length > 0) { // store page event if meta event is present
      await SessionService.storePageEvents(session.id, session.site_id, pageMetrics);
      console.log("Page events stored for session:", session.id);
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
      SessionService.updateSession(session.id, { frustration_score: frustrationScore, engagement_score: engagementScore.totalScore, relevance_score: relevanceScore }),
    ]);

    console.log("Scores updated for session:", session.id);
    return corsResponse(NextResponse.json({ success: true }));
  } catch (error) {
    console.error("Error in POST request:", error);
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
