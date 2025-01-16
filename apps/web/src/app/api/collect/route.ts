import { NextResponse } from "next/server";
import { Session } from "@/types/api";
import { calculateSessionMetrics, parseUserAgent } from "@/utils/helpers";
import { SessionService } from "@/server/services/session.service";
import { WebsiteService } from "@/server/services/website.service";
import { UsageService } from "@/server/services/usage.service";
import { FrustrationService } from "@/server/services/frustration.service";
import { calculateEngagement } from "./engagement";
import { RelevanceService } from "@/server/services/relevance.service";
import { PageEventService } from "@/server/services/pageEvent.service";
import { processAndStoreEvents } from "@/utils/eventProcessing";

// Cache verification check results in memory
const verifiedSites = new Set<string>();

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
    const session: Session = await request.json();
    const metrics = calculateSessionMetrics(session.events || []);

    if (!session.site_id || !session.id || !session.events) {
      return corsResponse(
        NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      );
    }

    // Check usage quota
    const hasQuota = await UsageService.checkQuota(session.site_id);
    if (!hasQuota) {
      return corsResponse(
        NextResponse.json(
          { error: "Usage limit exceeded", code: "USAGE_LIMIT_EXCEEDED" },
          { status: 429 }
        )
      );
    }

    // Check and verify the site
    if (!verifiedSites.has(session.site_id)) {
      try {
        const verified = await WebsiteService.getVerificationStatus(
          session.site_id
        );
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
        console.error("Error verifying website:", error);
      }
    }
    let allEvents = session.events;
    let updatedMetrics = metrics;
    if (!session.user_agent) {// if not first batch of events
      const existingSession = await SessionService.getSession(session.id);
      // Combine existing metrics with new metrics
      updatedMetrics = {
        totalClicks:
          existingSession.total_clicks + metrics.totalClicks,
        totalScrollDistance:
          existingSession.total_scroll_distance +
          metrics.totalScrollDistance,
        totalInputs: existingSession.total_inputs + metrics.totalInputs,
        errorCount:
          existingSession.session_error_count + metrics.errorCount,
      };

      allEvents = [
        ...(await SessionService.getSession(session.id)).events,
        ...session.events,
      ];

    } else {
      const userAgentInfo = parseUserAgent(session.user_agent || "");
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
        is_active: true,
      });
    }

    // Calculate page metrics with DB handling
    const pageMetrics = await PageEventService.calculatePageMetrics(
      session.id,
      session.site_id,
      session.events || []
    );

    const frustrationScore = await FrustrationService.calculateFrustrationScore(
      allEvents,
      allEvents.filter((e) => e.type === 4).map((e) => ({
        href: e.data.href,
        timestamp: new Date(e.timestamp).toISOString(),
      }))
    );
    const engagementScore = calculateEngagement({
      ...session,
      events: allEvents,
    });
    const relevanceScore = RelevanceService.calculateRelevanceScore(
      frustrationScore,
      engagementScore.normalizedScore,
      updatedMetrics.errorCount
    );

    await SessionService.updateSession(session.id, {
      duration: session.duration,
      total_clicks: updatedMetrics.totalClicks,
      total_scroll_distance: updatedMetrics.totalScrollDistance,
      total_inputs: updatedMetrics.totalInputs,
      session_error_count: updatedMetrics.errorCount,
      frustration_score: frustrationScore,
      engagement_score: engagementScore.normalizedScore,
      relevance_score: relevanceScore,
    });

    // Store all events
    await Promise.all([
      SessionService.storeEvents(session.id, session.site_id, session.events),
      processAndStoreEvents(session.id, session.events)
    ]);

    return corsResponse(NextResponse.json({ success: true, pageMetrics }));
  } catch (error) {
    console.error("Error in POST request:", error);
    return corsResponse(
      NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
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
