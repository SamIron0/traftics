import React from "react"

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <div className="max-w-2xl">
        <div className="rounded-lg border bg-card divide-y">
          <div className="p-4">
            <h2 className="font-medium mb-1">Recording Settings</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Configure what data should be recorded during sessions
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span>Record mouse movements</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span>Record clicks</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span>Record scroll positions</span>
              </label>
            </div>
          </div>
          
          <div className="p-4">
            <h2 className="font-medium mb-1">Data Retention</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Control how long session data is kept
            </p>
            <select className="w-full rounded-md border px-2 py-1">
              <option>30 days</option>
              <option>60 days</option>
              <option>90 days</option>
              <option>1 year</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
} 