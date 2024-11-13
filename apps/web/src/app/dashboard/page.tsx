import React from "react"

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 rounded-lg border bg-card">
          <h2 className="font-medium mb-2">Total Sessions</h2>
          <p className="text-2xl font-bold">1,234</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <h2 className="font-medium mb-2">Active Users</h2>
          <p className="text-2xl font-bold">56</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <h2 className="font-medium mb-2">Avg. Session Duration</h2>
          <p className="text-2xl font-bold">2m 34s</p>
        </div>
      </div>
    </div>
  )
} 