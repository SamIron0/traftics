"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { eventWithTime, fullSnapshotEvent } from "@rrweb/types";
import Heatmap from "@/components/Heatmap/Heatmap";
import {
  createCache,
  rebuild,
  createMirror,
  serializedNodeWithId,
} from "rrweb-snapshot";

const HeatmapPage = ({
  params,
}: {
  params: Promise<{
    heatmapId: string;
  }>;
}) => {
  const [events, setEvents] = useState<eventWithTime[]>([]);
  const [firstSnapshot, setFirstSnapshot] = useState<fullSnapshotEvent | null>(null);
  const [metaEvent, setMetaEvent] = useState<eventWithTime | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  // Add this useCallback function to calculate scale
  const calculateScale = useCallback(() => {
    if (!containerRef.current || !dimensions.width || !dimensions.height) return;

    const newScale = Math.min(
      containerRef.current.clientWidth / dimensions.width,
      containerRef.current.clientHeight / dimensions.height
    );

    setScale(newScale);
  }, [dimensions.width, dimensions.height]);

  // Add resize observer effect
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      calculateScale();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateScale]);

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

        const meta = data.events.find(
          (e: eventWithTime) => e.type === 4 // EventType.Meta
        );

        const snapshots = data.events.filter(
          (e: eventWithTime) => e.type === 2 // EventType.FullSnapshot
        );
        const secondSnapshot = snapshots[0];

        if (!meta || !secondSnapshot) {
          throw new Error("Missing required events");
        }

        setEvents(data.events);
        setMetaEvent(meta);
        setFirstSnapshot(secondSnapshot);
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

  // Modified effect to create screenshot
  useEffect(() => {
    if (!firstSnapshot) return;

    // Create a hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position: absolute; width: 0; height: 0; border: none;";
    document.body.appendChild(iframe);

    if (!iframe.contentWindow || !iframe.contentDocument) {
      console.error('Unable to access iframe document');
      return;
    }

    // Rebuild the content in the hidden iframe
    rebuild(firstSnapshot.data.node as serializedNodeWithId, {
      doc: iframe.contentDocument,
      mirror: createMirror(),
      hackCss: true,
      cache: createCache(),
    });

    // Wait for content to load and capture screenshot
    const captureScreenshot = async () => {
      if (!iframe.contentDocument) {
        console.error('Unable to access iframe document');
        return;
      }

      try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(iframe.contentDocument.documentElement, {
          useCORS: true,
          allowTaint: true,
          scale: 1,
        });

        // Create an image from the canvas
        const image = new Image();
        image.src = canvas.toDataURL('image/png');
        image.style.width = '100%';
        image.style.height = 'auto';

        // Clear container and append image
        containerRef.current!.innerHTML = '';
        containerRef.current!.appendChild(image);

        // Update dimensions based on the captured content
        setDimensions({
          width: canvas.width,
          height: canvas.height
        });
        setScreenshotUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Error capturing screenshot:', err);
      }
    };

    // Add load listener for iframe content
    iframe.addEventListener('load', captureScreenshot);

    return () => {
      iframe.removeEventListener('load', captureScreenshot);
    };
  }, [firstSnapshot]);

  if (isLoading) {
    return <div>Loading heatmap data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <div
      className="relative bg-white mx-auto max-w-3xl"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        maxWidth: "100%",
        overflow: "visible"
      }}
    >
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          pointerEvents: "auto",
          zIndex: 1,
        }}
      />
      <div
        style={{
          width: dimensions.width,
          height: screenshotUrl ? screenshotUrl.split(',')[1] : dimensions.height,
          position: "relative",
        }}
      >
        <Heatmap
          events={events}
          width={dimensions.width}
          height={screenshotUrl ? screenshotUrl.split(',')[1] : dimensions.height}
          scale={scale}
        />
      </div>
    </div>
  );
};

export default HeatmapPage;
