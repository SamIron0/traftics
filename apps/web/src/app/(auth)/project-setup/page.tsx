"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ClipboardCopy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectSetupPage() {
  const [websiteName, setWebsiteName] = useState("Website project 1");
  const [trackingScript, setTrackingScript] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerateScript = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tracking-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ websiteName }),
      });

      if (!response.ok) throw new Error("Failed to generate tracking code");

      const data = await response.json();
      setTrackingScript(data.script);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(trackingScript);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b px-6 py-4 flex justify-between items-center">
        <div className="flex-1" />
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboards">Skip project setup</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/login">Logout</Link>
          </Button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold">Project setup</h1>

        <div className="space-y-4">
          <Input
            type="text"
            value={websiteName}
            onChange={(e) => setWebsiteName(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={handleGenerateScript} disabled={loading}>
            {loading ? "Generating..." : "Generate tracking code"}
          </Button>
        </div>

        {trackingScript && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Install tracking code for website
            </h2>
            <p>Add script below to the website header in the &lt;head&gt; tags:</p>

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
              After you implement the tracking code, visit your website to test the
              implementation. Once we detect that the tracking code is implemented
              correctly, you will be redirected to the dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
