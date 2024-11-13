import React from "react"
import { SessionList } from "@/components/sessions/SessionList"

export default function SessionsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Sessions</h1>
      <SessionList 
        sessions={[]} 
        selectedSessionId={null}
        onSelectSession={() => {}}
      />
    </div>
  )
} 