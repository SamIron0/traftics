import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Badge } from "@/components/ui/badge";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import { createClient } from "@/utils/supabase/client";


export interface HeatmapsListRef {
  refresh: () => void;
}

const HeatmapsList = forwardRef<HeatmapsListRef>((_, ref) => {
  const { heatmaps, setHeatmaps } = useAppStore.getState();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchHeatmaps = async () => {
    if (heatmaps.length > 0) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/heatmaps");
      if (!response.ok) throw new Error("Failed to fetch heatmaps");
      const data = await response.json();
      setHeatmaps(data.heatmaps);
    } catch (error) {
      console.error("Error fetching heatmaps:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: fetchHeatmaps
  }));

  useEffect(() => {
    fetchHeatmaps();
  }, [ ]);

  const handleHeatmapClick = async (heatmapId: string, heatmapSlug: string) => {
    try {
      const supabase = createClient();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      if (!userId) {
        throw new Error("User not found");
      }

      // Update active heatmap through the service
      await fetch(`/api/heatmaps/${heatmapId}/activate`, {
        method: 'POST'
      });

      // Update local state
      useAppStore.getState().setActiveHeatmap(heatmapId, heatmapSlug);

      // Navigate to the heatmap
      const segments = pathname.split('/');
      if (segments[segments.length - 1] === 'heatmaps') {
        router.push(`${pathname}/${heatmapSlug}`);
      } else {
        segments[segments.length - 1] = heatmapSlug;
        router.push(segments.join('/'));
      }
    } catch (error) {
      console.error('Error setting active heatmap:', error);
    }
  };

  return (
    <div className="mb-4">
      <div className="mt-2 space-y-3">
        {isLoading ? (
          <div className="text-sm text-muted-foreground text-center py-2">
            Loading heatmaps...
          </div>
        ) : heatmaps.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-2">
            No heatmaps created yet
          </div>
        ) : (
          heatmaps.map((heatmap) => (
            <div
              key={heatmap.id}
              className="p-2 rounded-lg border hover:bg-accent cursor-pointer"
              onClick={() => handleHeatmapClick(heatmap.id, heatmap.slug)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{heatmap.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {heatmap.precision.toLocaleString()} views
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {heatmap.url_protocol}
                {heatmap.url_domain}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

HeatmapsList.displayName = 'HeatmapsList';

export default HeatmapsList;
