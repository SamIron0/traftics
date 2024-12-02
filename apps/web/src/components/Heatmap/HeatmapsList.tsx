import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Badge } from "@/components/ui/badge";
import { useRouter, usePathname } from "next/navigation";

interface Heatmap {
  id: string;
  name: string;
  url_domain: string;
  url_protocol: string;
  url_match_type: string;
  precision: number;
  created_at: string;
  slug: string;
}

export interface HeatmapsListRef {
  refresh: () => void;
}

const HeatmapsList = forwardRef<HeatmapsListRef>((_, ref) => {
  const [heatmaps, setHeatmaps] = useState<Heatmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchHeatmaps = async () => {
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
  }, []);

  const handleHeatmapClick = (heatmapSlug: string) => {
    // Get the current pathname segments
    const segments = pathname.split('/');
    
    if (segments[segments.length - 1] === 'heatmaps') {
      // Case 1: On main heatmaps page
      router.push(`${pathname}/${heatmapSlug}`);
    } else {
      // Case 2: Already on a specific heatmap page
      // Replace the last segment (current heatmap slug) with the new one
      segments[segments.length - 1] = heatmapSlug;
      router.push(segments.join('/'));
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
              onClick={() => handleHeatmapClick(heatmap.slug)}
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
