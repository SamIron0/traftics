import { useQuery } from "@tanstack/react-query";
import { DashboardMetrics } from "@/services/metrics";

async function fetchDashboardData(websiteId: string): Promise<DashboardMetrics> {
  const response = await fetch(`/api/dashboard?websiteId=${websiteId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  
  const data = await response.json();
  
  return {
    totalSessions: data.metrics.total_sessions,
    avgSessionDuration: data.metrics.avg_duration,
    pagesPerSession: data.metrics.pages_per_session,
    bounceRate: data.metrics.bounce_rate || 0,
    topPages: data.metrics.top_pages || [],
    trends: data.trends,
  };
}

export function useDashboardData(websiteId: string | null) {
  return useQuery({
    queryKey: ['dashboardMetrics', websiteId],
    queryFn: () => {
      if (!websiteId) {
        throw new Error('Website ID is required');
      }
      return fetchDashboardData(websiteId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!websiteId,
  });
} 