"use client";
import { SessionsPage } from "@/components/sessions/SessionsPage";
import { UnverifiedView } from "@/components/Dashboard/UnverifiedView";
import { generateScript } from "@/utils/helpers";
import { notFound } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import { useSessionsData } from "@/hooks/useSessionsData";
import { SessionsSkeleton } from "@/components/sessions/SessionsSkeleton";
import { useSearchParams } from "next/navigation";

export default function Sessions() {
  const { projectId, isWebsiteVerified } = useAppStore();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  if (!projectId) {
    notFound();
  }

  const { data: sessions, isLoading, error } = useSessionsData(projectId, mode);

  if (!isWebsiteVerified) {
    const script = generateScript(projectId);
    return <UnverifiedView script={script} />;
  }
  console.log("check:", isWebsiteVerified);
  if (isLoading) {
    return <SessionsSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold text-red-500">
          Error loading sessions
        </h2>
        <p className="text-gray-600">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <SessionsPage sessions={sessions!} />
    </div>
  );
}
