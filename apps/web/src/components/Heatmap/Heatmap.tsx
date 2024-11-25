"use client";
import React, { useEffect, useRef } from "react";
import h337 from "heatmap.js";
import {
  eventWithTime,
  mouseInteractionData,
  MouseInteractions,
  IncrementalSource,
  scrollPosition,
} from "@rrweb/types";

type Props = {
  events: eventWithTime[];
  width: number;
  height: number;
  className?: string;
  scale?: number;
};

const Heatmap = ({
  events,
  width,
  height,
  className = "",
  scale = 1,
}: Props) => {
  const heatmapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!heatmapRef.current) return;

    // Initialize heatmap instance with transparent background using gradient
    const heatmapInstance = h337.create({
      container: heatmapRef.current,
      radius: 20 * scale,
      maxOpacity: 0.6,
      minOpacity: 0,
      blur: 0.75,
    });

    // Process events to extract data points
    const dataPoints: { x: number; y: number; value: number }[] = [];
    const clickCounts = new Map<string, number>();
    let currentScrollY = 0;
    events.forEach((event) => {
      if (event.type === 3) {
        // IncrementalSnapshot type
        const data = event.data;
        if (data.source === IncrementalSource.MouseInteraction) {
          const { type, x, y } = data as mouseInteractionData;
          if (typeof x === "undefined" || typeof y === "undefined") return;

          if (type === MouseInteractions.Click) {

            const key = `${Math.round(x)},${Math.round(y)}`;
            const count = (clickCounts.get(key) || 0) + 1;
            clickCounts.set(key, count);

            dataPoints.push({
              x: Math.round(x),
              y: Math.round(y) + currentScrollY,
              value: count,
            });
          }
        }
        if (data.source === IncrementalSource.Scroll) {
          const scrollData = data as scrollPosition;
          currentScrollY = scrollData.y;
        }
      }
    });

    // Set the data
    heatmapInstance.setData({
      max: Math.max(...Array.from(clickCounts.values()), 1),
      data: dataPoints,
    });

    // No need for cleanup as heatmap.js doesn't provide a cleanup method
  }, [events, width, height, scale]);
  console.log(width, height);
  return (
    <div className={`absolute inset-0 ${className}`}>
      <div
        ref={heatmapRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 10,
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
        }}
      />
    </div>
  );
};

export default Heatmap;
