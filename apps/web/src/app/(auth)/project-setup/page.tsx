"use client";

import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";

export default function ProjectSetupPage() {
  const [trackingScript, setTrackingScript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { user, loading } = useAuthStatus();

  useEffect(() => {
    if (!loading) {
      checkSetupStatus();
    }
  });

  const checkSetupStatus = async () => {
    try {
      if (!user) {
        router.push("/login");
        return;
      }

      // Check if user has already completed setup
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("setup_completed")
        .eq("user_id", user.id)
        .single();

      if (profile?.setup_completed) {
        router.push("/dashboards");
        return;
      }

      // If not completed, generate script
      generateScript();
    } catch (error) {
      console.error("Error checking setup status:", error);
      setError("Failed to check setup status");
    }
  };

  const generateScript = async () => {
    try {
      if (!user) {
        router.push("/login");
        return;
      }
      const response = await fetch("/api/tracking-code/generate", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to generate tracking code");

      const data = await response.json();
      setTrackingScript(data.script);

      // Mark setup as completed
      await supabase
        .from("user_profiles")
        .update({ setup_completed: true })
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to generate tracking code");
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(trackingScript);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

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
              Copy script
            </Button>
          </div>

          <p className="text-muted-foreground">
            After implementing the tracking code, visit your website to test the
            implementation. You'll be redirected to the dashboard once we detect
            the tracking code is working.
          </p>
        </div>
      </div>
    </div>
  );
}
