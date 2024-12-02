import { AnalyticsCard } from "./AnalyticsCard"

export default function Dashboard() {
  // Sample data for sparklines
  const sparklineData = {
    sessions: [4, 3, 5, 2, 4, 3, 5, 4, 3],
    duration: [3, 4, 3, 5, 4, 3, 4, 5, 6],
    pages: [2, 3, 4, 3, 2, 3, 2, 3, 2],
    bounce: [58, 65, 60, 63, 58, 65, 61, 60, 62],
  }     

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AnalyticsCard 
        title="Total sessions" 
        value="103" 
        data={sparklineData.sessions} 
      />
      <AnalyticsCard 
        title="Avg. session duration" 
        value="5:03" 
        data={sparklineData.duration} 
      />
      <AnalyticsCard 
        title="Avg. pages / session" 
        value="2.4" 
        data={sparklineData.pages} 
      />
      <AnalyticsCard 
        title="Bounce rate" 
        value="62.1%" 
        data={sparklineData.bounce} 
        showInfo 
      />
    </div>
  )
}

