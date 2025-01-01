"use client";
import { redirect } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";

export default function DashboardsPage() {
  const { orgSlug, projectSlug, defaultDashboardId } = useAppStore.getState();
  if (defaultDashboardId) {
    redirect(
      `/org/${orgSlug}/project/${projectSlug}/dashboards/${defaultDashboardId}`
    );
  }
}
