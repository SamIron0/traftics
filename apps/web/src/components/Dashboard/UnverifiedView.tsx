"use client";

import { useEffect} from "react";
import { TrackingScript } from "../TrackingScript";
import { useVerificationStatus } from "../../hooks/useVerificationStatus";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";

export function UnverifiedView({ script }: { script: string }) {
  const { projectSlug, projectId} =
    useAppStore.getState();
  const isVerified = useVerificationStatus(projectId);
  const router = useRouter();

  useEffect(() => {
    if (isVerified) {
      router.push(
        `/project/${projectSlug}/dashboard`
      );
    }
  }, [isVerified, router,projectSlug]);
  return <TrackingScript trackingScript={script} />;
}
