"use client";

import { useEffect, useRef, useState } from "react";
import type { eventWithTime, fullSnapshotEvent } from "@rrweb/types";
import { createCache, createMirror, rebuild, serializedNodeWithId } from 'rrweb-snapshot';
import Heatmap from "@/components/Heatmap/Heatmap";

const HeatmapPage = ({
  params,
}: {
  params: Promise<{
    heatmapId: string;
  }>;
}) => {
  const [events, setEvents] = useState<eventWithTime[]>([]);
  const [firstSnapshot, setFirstSnapshot] = useState<fullSnapshotEvent | null>(
    null
  );
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { heatmapId } = await params;
        const response = await fetch(`/api/heatmaps/${heatmapId}/events`);
        if (!response.ok) {
          throw new Error("Failed to fetch heatmap events");
        }
        const data = await response.json();

        if (!data.events?.length) {
          throw new Error("No events found for this heatmap");
        }

        // Find meta event and second snapshot
        const meta = data.events.find(
          (e: eventWithTime) => e.type === 4 // EventType.Meta
        );

        const snapshots = data.events.filter(
          (e: eventWithTime) => e.type === 2 // EventType.FullSnapshot
        );
        const firstSnapshot = snapshots[0]; // Get the first snapshot

        if (!meta || !firstSnapshot) {
          throw new Error("Missing required events");
        }

        setEvents(data.events);
        setFirstSnapshot(firstSnapshot);
        setDimensions({
          width: meta.data.width,
          height: meta.data.height,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [params]);

  useEffect(() => {
    if (!firstSnapshot?.data.node || !containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Rebuild the DOM from the snapshot
    const mirror = rebuild(firstSnapshot.data.node as serializedNodeWithId, {
      doc: document,
      mirror: createMirror(),
      hackCss: true,
      cache: createCache(),
    });
    
    if (mirror && containerRef.current) {
      containerRef.current.appendChild(mirror);
    }
  }, [firstSnapshot]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }}
      />
      <Heatmap events={events} width={dimensions.width} height={dimensions.height} />
    </div>
  );
};

export default HeatmapPage;
