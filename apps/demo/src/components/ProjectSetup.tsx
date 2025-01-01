"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { TrackingScript } from "./TrackingScript";
import { generateTrackingScript } from "@/utils/helpers";

interface ProjectSetupProps {
  orgId: string | null;
  projectId: string | null;
}

export function ProjectSetup({ orgId, projectId }: ProjectSetupProps) {
  const router = useRouter();
  const [trackingScript, setTrackingScript] = useState("");
  const [websiteId, setWebsiteId] = useState<string | null>(null);
  const isVerified = useVerificationStatus(websiteId);
  useEffect(() => {
    const updateSetupStatus = async () => {
      const script = await generateTrackingScript();
      if (script) {
        setTrackingScript(script.script);
        setWebsiteId(script.websiteId);
      }
    };

    updateSetupStatus();
  }, []);

  if (isVerified && orgId && projectId) {
    router.push(`/org/${orgId}/project/${projectId}/dashboards`);
  }

  return <TrackingScript trackingScript={trackingScript} />;
}
