'use client'

import { AnalyticsCard } from "./AnalyticsCard"
import { formatPlayerTime } from "@/utils/helpers"
import { TopPages } from "./TopPages"
import { DashboardMetrics } from "@/services/metrics"

interface Props {
  metrics: DashboardMetrics
}

export default function Dashboard({ metrics }: Props) {
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
      <TopPages pages={metrics.topPages} />
    </div>
  )
}

