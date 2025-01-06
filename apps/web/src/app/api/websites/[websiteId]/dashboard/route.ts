import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ websiteId: string }> }
) {
    try {
        const supabase = await createClient();
        const { websiteId } = await params;

        // Get metrics from materialized view
        const { data: metrics, error: metricsError } = await supabase
            .from('dashboard_metrics')
            .select('*')
            .eq('site_id', websiteId)
            .single();

        if (metricsError) throw metricsError;

        // Get trend data
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

        if (trendsError) throw trendsError;

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
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
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