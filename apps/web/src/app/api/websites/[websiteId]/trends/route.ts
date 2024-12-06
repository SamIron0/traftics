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
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const supabase = await createClient();
    const { websiteId } = await params;
    // Get last 7 days of session data
    const { data: sessions, error } = await supabase
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

    if (error) {
      throw error;
    }

    const trends = calculateTrends(sessions     || []);
    return NextResponse.json(trends);

  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    );
  }
} 