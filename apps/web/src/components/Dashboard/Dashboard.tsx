"use client";

import { Button } from "@/components/ui/button";
import { generateTrackingScript } from "@/utils/tracking";
import { ClipboardCopy } from "lucide-react";
import { useState, useEffect } from "react";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";

interface UnverifiedDashboardProps {
  websiteId: string;
  websiteVerified: boolean;
}

export default function Dashboard({
  websiteId,
  websiteVerified,
}: UnverifiedDashboardProps) {
  const [trackingScript, setTrackingScript] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!websiteVerified) {
    useVerificationStatus(websiteId);
  }

  useEffect(() => {
    const fetchScript = async () => {
      const script = await generateTrackingScript();
      if (script) {
        setTrackingScript(script.script);
      }
    };
    fetchScript();
  }, [websiteId]);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(trackingScript);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return !websiteVerified ? (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold">Project setup</h1>

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
              Copy script
            </Button>
          </div>

          <p className="text-muted-foreground">
            After implementing the tracking code, visit your website to test the
            implementation. You&apos;ll be redirected to the dashboard once we
            detect the tracking code is working.
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div>Dashboard</div>
  );
}
