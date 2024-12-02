"use client";
import React, { useEffect, useRef, useCallback } from "react";
import {
  eventWithTime,
  EventType,
  IncrementalSource,
  MouseInteractions,
  mouseInteractionData,
  scrollData,
} from "@rrweb/types";
import h337 from "heatmap.js";

interface HeatmapData {
  x: number;
  y: number;
  value: number;
}

interface HeatmapInstance {
  setData: (data: { max: number; data: HeatmapData[] }) => void;
  addData: (data: HeatmapData[]) => void;
  getData: () => HeatmapData[];
  destroy: () => void;
}

type Props = {
  events: eventWithTime[];
  width: number;
  height: number;
  url: string;
};

const Heatmap = ({ events, width, height, url }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heatmapRef = useRef<HeatmapInstance | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Track scroll position at each click
  const clickEvents = events.filter((event) => {
    return (
      event.type === EventType.IncrementalSnapshot &&
      // Keep both click and scroll events
      ((event.data.source === IncrementalSource.MouseInteraction &&
        event.data.type === MouseInteractions.Click) ||
        event.data.source === IncrementalSource.Scroll)
    );
  });

  const updateHeatmap = useCallback(() => {
    if (!containerRef.current || !imageRef.current) return;

    const img = imageRef.current;
    if (!img || img.width === 0 || img.height === 0) return;

    // Set container dimensions to match image
    containerRef.current.style.width = `${img.width}px`;
    containerRef.current.style.height = `${img.height}px`;
    containerRef.current.style.position = "relative";

    // Set image dimensions
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.position = "absolute";
    img.style.top = "0";
    img.style.left = "0";

    // Create heatmap instance
    if (heatmapRef.current) {
      // Remove existing heatmap
      const canvas = containerRef.current?.querySelector("canvas");
      if (canvas) {
        containerRef.current?.removeChild(canvas);
      }
      heatmapRef.current = null;
    }

    const heatmapInstance = h337.create({
      container: containerRef.current,
      radius: Math.min(img.width, img.height) * 0.02,
      maxOpacity: 0.6,
      minOpacity: 0,
      blur: 0.8,
    });

    // Store instance in ref
    heatmapRef.current = heatmapInstance as unknown as HeatmapInstance;

    // Track scroll position
    let currentScrollY = 0;

    // Format click data for heatmap, accounting for scroll
    const points = clickEvents.reduce<HeatmapData[]>((acc, event) => {
      if ((event.data as any).source === IncrementalSource.Scroll) {
        currentScrollY = (event.data as scrollData).y;
        return acc;
      }

      const data = event.data as mouseInteractionData;
      const scaleX = img.width / width;
        const scaleY = img.height / height;
      const scaledX = Math.round(data.x! * scaleX);
      const scaledY = Math.round((data.y! + currentScrollY) * scaleY);
      console.log('original', data.x);
      console.log('imgwidth', img.width, 'width', width);
      acc.push({
        x: scaledX,
        y: scaledY,
        value: 1,
      });
      return acc;
    }, []);
    // Set data
    heatmapInstance.setData({
      max: 1,
      data: points,
    });
  }, [clickEvents, width, height]);

  useEffect(() => {
    updateHeatmap();
    return () => {
      if (heatmapRef.current) {
        const canvas = containerRef.current?.querySelector("canvas");
        if (canvas) {
          containerRef.current?.removeChild(canvas);
        }
        heatmapRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <img
        src={url}
        ref={imageRef}
        alt="Heatmap background"
        style={{ display: "block" }}
        onLoad={updateHeatmap}
      />
    </div>
  );
};
export default Heatmap;
