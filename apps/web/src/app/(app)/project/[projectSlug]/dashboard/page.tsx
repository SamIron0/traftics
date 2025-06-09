'use client'

import Dashboard from "@/components/Dashboard/Dashboard";
import { UnverifiedView } from "@/components/Dashboard/UnverifiedView";
import { DashboardSkeleton } from "@/components/Dashboard/DashboardSkeleton";
import { generateScript } from "@/utils/helpers";
import { notFound } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function DashboardPage() {
  const { projectId, isWebsiteVerified } = useAppStore();

  if (!projectId) {
    notFound();
  }

  const { data: metrics, isLoading, error } = useDashboardData(projectId);

  if (!isWebsiteVerified) {
    const script = generateScript(projectId);
    return <UnverifiedView script={script} />;
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold text-red-500">Error loading dashboard</h2>
        <p className="text-gray-600">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  return <Dashboard metrics={metrics!} />;
}
