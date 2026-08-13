"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useAppStore } from "@/stores/useAppStore";
import { isDemoUser } from "@/utils/demo";

const DEMO_SITE_URL =
  process.env.NEXT_PUBLIC_DEMO_SITE_URL ?? "https://remeal.ironkwe.site";
// Session-scoped so a returning visitor in the same tab isn't nagged,
// but the next recruiter on a fresh visit still sees the banner.
const DISMISSED_KEY = "traftics-demo-banner-dismissed";

export function DemoBanner() {
  const projectSlug = useAppStore((state) => state.projectSlug);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (isDemoUser(user)) {
        setVisible(true);
      }
    });
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="relative z-50 border-b bg-gradient-to-r from-blue-50 via-slate-50 to-purple-50">
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:items-center">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary sm:mt-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">You&apos;re exploring a live demo.</span>{" "}
            Want to see yourself on camera? Open{" "}
            <span className="font-medium">Remeal</span> (a real site with
            Traftics installed), click around for a bit, then come back. Your
            own session recording appears here within a minute.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pl-7 sm:pl-0">
          <Button asChild size="sm" variant="outline" className="h-8 bg-background">
            <a href={DEMO_SITE_URL} target="_blank" rel="noopener noreferrer">
              Visit Remeal
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
          {projectSlug && (
            <Button asChild size="sm" className="h-8">
              <Link href={`/project/${projectSlug}/sessions`}>
                View recordings
              </Link>
            </Button>
          )}
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss demo banner"
            className="ml-1 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
