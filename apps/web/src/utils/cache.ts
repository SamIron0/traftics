import { unstable_cache } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';

export const getDashboardDataCached = unstable_cache(
    async (websiteId: string, supabase: SupabaseClient) => {
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

        return {
            metrics: {
                total_sessions: metrics.total_sessions,
                avg_duration: metrics.avg_duration,
                pages_per_session: metrics.pages_per_session,
                bounce_rate: metrics.bounce_rate || 0,
                top_pages: metrics.top_pages || []
            },
            trends
        };
    },
    ['dashboard-data'],
    {
        revalidate: 300, // Cache for 5 minutes
        tags: ['dashboard-metrics']
    }
);

export const getSessionsCached = unstable_cache(
    async (websiteId: string, supabase: SupabaseClient) => {
        const { data: sessions } = await supabase
            .from("sessions")
            .select("*")
            .eq("site_id", websiteId)
            .order("started_at", { ascending: false });

        return sessions || [];
    },
    ['sessions-list'],
    {
        revalidate: 60, // Cache for 30 seconds
        tags: ['sessions']
    }
);

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