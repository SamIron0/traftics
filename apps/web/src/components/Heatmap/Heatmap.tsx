"use client";
import React, { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    if (!containerRef.current || !imageRef.current) return;

    const updateHeatmap = () => {
      const img = imageRef.current;
      if (!img) return;

      // Get the natural dimensions of the image
      const imgWidth = img.width;
      const imgHeight = img.height;

      if (imgWidth === 0 || imgHeight === 0) return;

      // Set container dimensions to match image
      containerRef.current!.style.width = `${imgWidth}px`;
      containerRef.current!.style.height = `${imgHeight}px`;
      containerRef.current!.style.position = "relative";

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
        container: containerRef.current!,
        radius: Math.min(imgWidth, imgHeight) * 0.02, // Adjust radius based on image size
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
          // Update scroll position
          currentScrollY = (event.data as scrollData).y;
          return acc;
        }

        // Handle click events
        const data = event.data as mouseInteractionData;

        // Calculate scale factors based on image vs original dimensions
        const scaleX = imgWidth / width;
        const scaleY = imgHeight / height;
        // Scale the coordinates and add scroll offset
        const scaledX = Math.round(data.x! * scaleX);
        const scaledY = Math.round((data.y! + currentScrollY) * scaleY);

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
    };
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
  }, [clickEvents]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <img
        src={url}
        ref={imageRef}
        alt="Heatmap background"
        style={{ display: "block" }}
      />
    </div>
  );
};
export default Heatmap;
