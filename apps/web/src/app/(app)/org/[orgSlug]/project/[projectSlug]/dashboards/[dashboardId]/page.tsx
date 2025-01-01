"use client";

import Dashboard from "@/components/Dashboard/Dashboard";
import { UnverifiedView } from "@/components/Dashboard/UnverifiedView";
import { generateScript } from "@/utils/helpers";
import { useAppStore } from "@/stores/useAppStore";

export default function DashboardPage() {
  const { isWebsiteVerified, projectId } = useAppStore();
  if (!isWebsiteVerified && projectId) {
    const script = generateScript(projectId );
    return <UnverifiedView script={script} />;
  }

  return <Dashboard websiteId={projectId || ""} />;
}
