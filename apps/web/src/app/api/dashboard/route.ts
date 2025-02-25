import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

interface DailyMetric {
  sessions: number;
  duration: number;
  pages: number;
  bounce: number;
}

function calculateTrends(sessions: Array<{
  started_at: string;
  duration: number;
  page_events: Array<{ href: string }>;
}>) {
  const dailyMetrics = sessions.reduce((acc, session) => {
    const day = new Date(session.started_at).toISOString().split('T')[0];
    if (!acc[day]) {
      acc[day] = {
        sessions: 0,
        duration: 0,
        pages: 0,
        bounce: 0
      };
    }
    acc[day].sessions++;
    acc[day].duration += session.duration;
    acc[day].pages += new Set(session.page_events?.map(e => e.href)).size;
    acc[day].bounce += (session.duration < 10000) ? 1 : 0;
    return acc;
  }, {} as Record<string, DailyMetric>);

  return {
    sessions: Object.values(dailyMetrics).map(d => d.sessions),
    duration: Object.values(dailyMetrics).map(d => d.duration),
    pages: Object.values(dailyMetrics).map(d => d.pages),
    bounce: Object.values(dailyMetrics).map(d => d.bounce)
  };
}

export async function GET(
  request: Request,
) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');

    if (!websiteId) {
      return NextResponse.json(
        { error: "Website ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get metrics from dashboard_metrics view
    const { data: metrics, error: metricsError } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .eq('site_id', websiteId)
      .single();

    if (metricsError) {
      console.error("Error fetching metrics:", metricsError);
      return NextResponse.json(
        { error: "Failed to fetch dashboard metrics" },
        { status: 500 }
      );
    }

    // Get trend data for the last 7 days
    const { data: sessions, error: trendsError } = await supabase
      .from('sessions')
      .select(`
        id,
        duration,
        started_at,
        page_events (
          href
        )
      `)
      .eq('site_id', websiteId)
      .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('started_at', { ascending: true });

    if (trendsError) {
      console.error("Error fetching trends:", trendsError);
      return NextResponse.json(
        { error: "Failed to fetch trend data" },
        { status: 500 }
      );
    }

    const trends = calculateTrends(sessions || []);

    return NextResponse.json({
      metrics: {
        total_sessions: metrics.total_sessions,
        avg_duration: metrics.avg_duration,
        pages_per_session: metrics.pages_per_session,
        bounce_rate: metrics.bounce_rate || 0,
        top_pages: metrics.top_pages || []
      },
      trends
    });
  } catch (error) {
    console.error("Error in dashboard API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
