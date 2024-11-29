"use client";
import React, { useEffect, useRef } from "react";
import h337 from "heatmap.js";
import {
  eventWithTime,
  mouseInteractionData,
  MouseInteractions,
  IncrementalSource,
} from "@rrweb/types";

type Props = {
  events: eventWithTime[];
  width: number;
  height: number;
  scale?: number;
};

const Heatmap = ({ events, width, height, scale = 1 }: Props) => {
  const heatmapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heatmapRef.current || !events.length) return;

    // Store ref in a variable to use in cleanup
    const container = heatmapRef.current;

    // Create heatmap instance
    const heatmapInstance = h337.create({
      container: container,
      radius: 20,
      maxOpacity: 0.6,
      minOpacity: 0.1,
      blur: 0.75,
      gradient: {
        '.5': 'blue',
        '.8': 'red',
        '.95': 'white'
      }
    });

    // Filter and transform click events
    const clickEvents = events
      .filter(event => 
        event.type === 3 && // IncrementalSnapshot
        (event.data).source === IncrementalSource.MouseInteraction &&
        (event.data as mouseInteractionData).type === MouseInteractions.Click
      )
      .map(event => {
        const data = event.data as mouseInteractionData;
        if (typeof data.x === 'undefined' || typeof data.y === 'undefined') {
          return null;
        }
        return {
          x: Math.round(data.x / scale),
          y: Math.round(data.y / scale),
          value: 1
        };
      })
      .filter((event): event is { x: number; y: number; value: number } => event !== null);

    // Set heatmap data
    heatmapInstance.setData({
      max: clickEvents.length,
      data: clickEvents
    });

    // Manual cleanup
    return () => {
      const canvas = container.querySelector('canvas');
      if (canvas) {
        canvas.remove();
      }
    };
  }, [events, width, height, scale]);

  return (
    <div
      ref={heatmapRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  );
};

export default Heatmap;
