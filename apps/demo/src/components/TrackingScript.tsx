"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { ClipboardCopy } from "lucide-react";

export function TrackingScript({
  trackingScript,
}: {
  trackingScript: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(trackingScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6 space-y-8">

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Install tracking code</h2>
          <p>Add this script to your website&apos;s &lt;head&gt; tag:</p>

          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">{trackingScript}</code>
            </pre>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleCopyScript}
            >
              <ClipboardCopy className="h-4 w-4 mr-2" />
              {copied ? "Copied!" : "Copy script"}
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
            <p>
              After implementing the tracking code, visit your website to test
              the implementation. You&apos;ll be redirected to the dashboard
              once we detect the tracking code is working.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
