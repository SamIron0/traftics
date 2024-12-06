import { createClient } from "@/utils/supabase/server";

export interface DashboardMetrics {
  totalSessions: number;
  avgSessionDuration: number;
  pagesPerSession: number;
  bounceRate: number;
  topPages: Array<{
    page: string;
    count: number;
  }>;
  trends: {
    sessions: number[];
    duration: number[];
    pages: number[];
    bounce: number[];
  };
}

export async function getDashboardMetrics(websiteId: string): Promise<DashboardMetrics> {
  const supabase = await createClient();
  
  // Get current metrics
  const { data: metrics } = await supabase
    .from('dashboard_metrics')
    .select('*')
    .eq('site_id', websiteId)
    .single();

  // Get trend data (last 7 days)
  const { data: trends } = await supabase
    .from('sessions')
    .select('duration, started_at, events')
    .eq('site_id', websiteId)
    .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('started_at', { ascending: true });

  return {
    totalSessions: metrics?.total_sessions || 0,
    avgSessionDuration: metrics?.avg_duration || 0,
    pagesPerSession: metrics?.pages_per_session || 0,
    bounceRate: metrics?.bounce_rate || 0,
    topPages: metrics?.top_pages || [],
    trends: calculateTrends(trends || [])
  };
}

interface SessionTrend {
  started_at: number;
  duration: number;
  events: Array<{
    data?: {
      href?: string;
    };
  }>;
}

interface DailyMetric {
  sessions: number;
  duration: number;
  pages: number;
  bounce: number;
}

function calculateTrends(sessions: SessionTrend[]) {
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
    acc[day].pages += new Set(session.events?.map(e => e.data?.href)).size;
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