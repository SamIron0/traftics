"use client";

import { useEffect} from "react";
import { TrackingScript } from "../TrackingScript";
import { useVerificationStatus } from "../../hooks/useVerificationStatus";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";

export function UnverifiedDashboard({ script }: { script: string }) {
  const { orgSlug, projectSlug, projectId, defaultDashboardId } =
    useAppStore.getState();
  const isVerified = useVerificationStatus(projectId);
  const router = useRouter();

  useEffect(() => {
    if (isVerified) {
      router.push(
        `/org/${orgSlug}/project/${projectSlug}/dashboards/${defaultDashboardId}`
      );
    }
  }, [isVerified, router, orgSlug, projectSlug, defaultDashboardId]);
  return <TrackingScript trackingScript={script} />;
}
