"use client";

import { useEffect } from "react";
import { TrackingScript } from "../TrackingScript";
import { useVerificationStatus } from "../../hooks/useVerificationStatus";
import { useRouter } from "next/navigation";
export function UnverifiedDashboard({
  websiteId,
  orgId,
  projectId,
  dashboardId,
  script,
}: {
  websiteId: string;
  orgId: string;
  projectId: string;
  dashboardId: string;
  script: string;
}) {
  const isVerified = useVerificationStatus(websiteId);
  const router = useRouter();
  useEffect(() => {
    if (isVerified) {
      router.push(
        `/org/${orgId}/project/${projectId}/dashboards/${dashboardId}`
      );
    }
  }, [isVerified, router, orgId, projectId, dashboardId]);
  return <TrackingScript trackingScript={script} />;
}
