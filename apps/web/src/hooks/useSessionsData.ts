import { useQuery } from "@tanstack/react-query";
import { Session } from "@/types/api";

async function fetchSessionsData(websiteId: string): Promise<Session[]> {
  const response = await fetch(`/api/sessions/?websiteId=${websiteId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch sessions data');
  }
  
  return response.json();
}

export function useSessionsData(websiteId: string | null, mode?: string | null) {
  return useQuery({
    queryKey: ['sessions', websiteId],
    queryFn: () => {
      if (!websiteId) {
        throw new Error('Website ID is required');
      }
      return fetchSessionsData(websiteId);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: mode === 'replay' ? false : 10 * 1000, // Poll every 10 seconds unless in replay mode
    enabled: !!websiteId,
  });
} 