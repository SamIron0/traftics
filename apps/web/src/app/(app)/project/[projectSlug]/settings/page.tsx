"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardCopy, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAppStore } from "@/stores/useAppStore";
import { generateScript } from "@/utils/helpers";

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const [domain, setDomain] = useState<string | null>(null);
  const { projectId, isWebsiteVerified } = useAppStore();
  const trackingScript = projectId ? generateScript(projectId) : "";

  useEffect(() => {
    async function fetchWebsiteDetails() {
      if (!projectId) return;
      
      const supabase = createClient();
      const { data: website } = await supabase
        .from("websites")
        .select("domain")
        .eq("id", projectId)
        .single();
      
      if (website) {
        setDomain(website.domain);
      }
    }
    
    fetchWebsiteDetails();
  }, [projectId]);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(trackingScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Project Settings</h1>
      <div className="max-w-2xl">
        <div className="rounded-lg border bg-card divide-y">
          {/* Verification Status */}
          <div className="p-4">
            <h2 className="font-medium mb-1">Verification Status</h2>
            <div className="flex items-center gap-2 mt-2">
              {isWebsiteVerified ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600">Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-600">Not Verified</span>
                </>
              )}
            </div>
          </div>

          {/* Domain */}
          <div className="p-4">
            <h2 className="font-medium mb-1">Domain</h2>
            <p className="text-sm text-muted-foreground">
              {domain || "No domain set"}
            </p>
          </div>

          {/* Tracking Code */}
          <div className="p-4">
            <h2 className="font-medium mb-1">Tracking Code</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Add this script to your website&apos;s &lt;head&gt; tag
            </p>
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
          </div>
        </div>
      </div>
    </div>
  );
}