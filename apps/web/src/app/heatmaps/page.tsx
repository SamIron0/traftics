import React from "react"

export default function HeatmapsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Heatmaps</h1>
      <div className="rounded-lg border bg-card p-4">
        <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
          Heatmap Visualization
        </div>
        <div className="mt-4 flex gap-2">
          <select className="rounded-md border px-2 py-1">
            <option>Click Map</option>
            <option>Move Map</option>
            <option>Scroll Map</option>
          </select>
          <select className="rounded-md border px-2 py-1">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>All time</option>
          </select>
        </div>
      </div>
    </div>
  )
} 