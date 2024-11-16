"use client";

import { Button } from "@/components/ui/button";
import { generateTrackingScript } from "@/utils/tracking";
import { ClipboardCopy } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ProjectSetupPage() {
  const [trackingScript, setTrackingScript] = useState("");
  const [websiteId, setWebsiteId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const isVerified = useVerificationStatus(websiteId);
  const router = useRouter();

  useEffect(() => {
    const fetchScript = async () => {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("org_id,active_project_id")
        .single();

      const result = await generateTrackingScript();
      if (result) {
        setTrackingScript(result.script);
        setWebsiteId(result.websiteId);
        if (!result.websiteId && profile?.org_id) {
          router.push(
            `/org/${profile.org_id}/project/${profile.active_project_id}/dashboards`
          );
        }
      }
    };
    fetchScript();
  }, [router]);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(trackingScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b px-6 py-4 flex justify-between items-center">
        <div className="flex-1" />
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboards">Skip project setup</Link>
          </Button>
        </div>
      </nav>

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
              {copied ? "Copied!" : "Copy script"}
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
            <p>
              After implementing the tracking code, visit your website to test
              the implementation.{" "}
              {isVerified ? (
                <span className="font-medium">
                  Verification successful! Redirecting to dashboard...
                </span>
              ) : (
                "We'll automatically redirect you to the dashboard once we detect the tracking code is working."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
