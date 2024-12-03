"use client";

import { useEffect } from 'react';
import { useAppStore } from "@/stores/useAppStore";
import { HeatmapsSkeleton } from "./HeatmapsSkeleton";
import Heatmap from "./Heatmap";

interface HeatmapDataLoaderProps {
  initialHeatmap: {
    id: string;
    name: string;
    snapshotUrl: string;
    dimensions: {
      width: number;
      height: number;
    };
  };
}

export default function HeatmapDataLoader({ initialHeatmap }: HeatmapDataLoaderProps) {
  const { events, setEvents } = useAppStore();

  useEffect(() => {
    async function loadEvents() {
      if (events[initialHeatmap.id]) return;
      
      try {
        const response = await fetch(`/api/heatmaps/${initialHeatmap.id}/events`);
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        setEvents(initialHeatmap.id, data.events);
      } catch (error) {
        console.error('Error loading heatmap events:', error);
      }
    }

    loadEvents();
  }, [initialHeatmap.id]);

  if (!events[initialHeatmap.id]) {
    return <HeatmapsSkeleton />;
  }

  return (
    <Heatmap
      name={initialHeatmap.name}
      events={events[initialHeatmap.id]}
      width={initialHeatmap.dimensions.width}
      height={initialHeatmap.dimensions.height}
      url={initialHeatmap.snapshotUrl}
    />
  );
} 