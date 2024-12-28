'use client'
import { AnalyticsCard } from "./AnalyticsCard"
import { useEffect, useState } from "react"
import { formatPlayerTime } from "@/utils/helpers"
import { TopPages } from "./TopPages"
import { DashboardMetrics } from "@/services/metrics"
import { DashboardSkeleton } from "./DashboardSkeleton"

interface Props {
  websiteId: string
}

export default function Dashboard({ websiteId }: Props) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`/api/websites/${websiteId}/metrics`)
        const data = await response.json()
        
        // Transform the data to match our DashboardMetrics interface
        const transformedMetrics: DashboardMetrics = {
          totalSessions: data.total_sessions,
          avgSessionDuration: data.avg_duration,
          pagesPerSession: data.pages_per_session,
          bounceRate: data.bounce_rate || 0,
          topPages: data.top_pages || [],
          trends: {
            sessions: [],
            duration: [],
            pages: [],
            bounce: []
          }
        }

        // Fetch trend data for the last 7 days
        const trendResponse = await fetch(`/api/websites/${websiteId}/trends`)
        const trendData = await trendResponse.json()
        transformedMetrics.trends = trendData
        setMetrics(transformedMetrics)
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      }
      
    }

    fetchMetrics()
  }, [websiteId])

  if (!metrics) return <DashboardSkeleton />

  return (
    <div className="space-y-8 p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard 
          title="Total Sessions" 
          value={metrics.totalSessions.toString()}
          data={metrics.trends.sessions}
        />
        <AnalyticsCard 
          title="Avg. Session Duration" 
          value={formatPlayerTime(metrics.avgSessionDuration)}
          data={metrics.trends.duration}
        />
        <AnalyticsCard 
          title="Pages / Session" 
          value={metrics.pagesPerSession.toFixed(1)}
          data={metrics.trends.pages}
        />
        <AnalyticsCard 
          title="Bounce Rate" 
          value={`${metrics.bounceRate.toFixed(1)}%`}
          data={metrics.trends.bounce}
          showInfo
        />
      </div>
      <TopPages 
        pages={metrics.topPages} 
      />
    </div>
  )
}

