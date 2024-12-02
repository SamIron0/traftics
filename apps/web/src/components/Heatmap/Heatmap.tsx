"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  eventWithTime,
  EventType,
  IncrementalSource,
  MouseInteractions,
  mouseInteractionData,
  scrollData,
} from "@rrweb/types";
import h337 from "heatmap.js";
import { ChevronDown, Eye, Flame } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  name: string;
};

interface SliderPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
}

const SliderPopover = ({ open, onOpenChange, value, onChange, icon }: SliderPopoverProps) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer  border px-3 py-1.5 rounded-lg">
          {icon}
          <span>{value}%</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Adjust percentage</span>
            <span className="text-sm text-muted-foreground">{value}%</span> 
          </div>
          <Slider
            value={[value]}
            onValueChange={(values) => onChange(values[0])}
            max={100}
            step={1}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Heatmap = ({ events, width, height, url, name }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heatmapRef = useRef<HeatmapInstance | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [flamePercent, setFlamePercent] = useState(25);
  const [eyePercent, setEyePercent] = useState(80);
  const [isFlameSliderOpen, setIsFlameSliderOpen] = useState(false);
  const [isEyeSliderOpen, setIsEyeSliderOpen] = useState(false);
  const [activeInteraction, setActiveInteraction] = useState<'click' | 'move' | 'scroll'>('click');

  // Track scroll position at each click
  const clickEvents = events.filter((event) => {
    return (
      event.type === EventType.IncrementalSnapshot &&
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

    // Create a map to count clicks at similar positions
    const clickCounts = new Map<string, number>();

    // First pass: count clicks at similar positions
    clickEvents.forEach((event) => {
      if ((event.data as any).source === IncrementalSource.Scroll) {
        currentScrollY = (event.data as scrollData).y;
        return;
      }

      const data = event.data as mouseInteractionData;
      const scaleX = img.width / width;
      const scaleY = img.height / height;
      const scaledX = Math.round(data.x! * scaleX);
      const scaledY = Math.round((data.y! + currentScrollY) * scaleY);

      // Group clicks within a 10px radius
      const key = `${Math.floor(scaledX / 10)},${Math.floor(scaledY / 10)}`;
      clickCounts.set(key, (clickCounts.get(key) || 0) + 1);
    });

    // Get the maximum click count for normalization
    const maxCount = Math.max(...Array.from(clickCounts.values()));

    // Reset scroll position for second pass
    currentScrollY = 0;

    // Format click data for heatmap, accounting for scroll and frequency
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

      const key = `${Math.floor(scaledX / 10)},${Math.floor(scaledY / 10)}`;
      const count = clickCounts.get(key) || 1;

      acc.push({
        x: scaledX,
        y: scaledY,
        // Normalize value between 0.3 and 1 based on click frequency
        value: 0.3 + (0.7 * count) / maxCount,
      });
      return acc;
    }, []);

    // Set data with adjusted maximum value
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
    <div className="relative items-center justify-center flex flex-col px-2">
      <div className="text-3xl font-medium py-4 w-full text-left  ">
        {name}
      </div>
      <div className="rounded-xl z-10 border flex flex-col">
        <div className="rounded-xl ">
          <div>
            <div className="w-full mx-auto space-y-6">
              <div className="grid ">
                <div className="bg-blue-50/50 rounded-t-lg p-4 w-full">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="bg-white rounded-lg p-1 flex gap-1">
                      {[
                        { value: 'click', label: 'Click' },
                        { value: 'move', label: 'Move' },
                        { value: 'scroll', label: 'Scroll' }
                      ].map((item) => (
                        <button
                          key={item.value}
                          onClick={() => setActiveInteraction(item.value as 'click' | 'move' | 'scroll')}
                          className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                            activeInteraction === item.value
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-600 hover:text-gray-900"
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Select users" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All users</SelectItem>
                          <SelectItem value="active">Active users</SelectItem>
                          <SelectItem value="inactive">
                            Inactive users
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-4">
                        <SliderPopover
                          open={isFlameSliderOpen}
                          onOpenChange={setIsFlameSliderOpen}
                          value={flamePercent}
                          onChange={setFlamePercent}
                          icon={<Flame className="h-5 w-5 text-blue-600" />}
                        />
                        <SliderPopover
                          open={isEyeSliderOpen}
                          onOpenChange={setIsEyeSliderOpen}
                          value={eyePercent}
                          onChange={setEyePercent}
                          icon={<Eye className="h-5 w-5 text-blue-600" />}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="flex items-center justify-between flex-wrap gap-4 p-4">
                  <div className="flex items-center gap-8">
                    <div className="space-y-1">
                      <span className="text-xl font-semibold ">
                        1
                      </span>
                      <p className="text-sm text-zinc-500">VIEWS</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xl font-semibold ">
                        15
                      </span>
                      <p className="text-sm text-zinc-500">CLICKS</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href="https://www.remeal.xyz/"
                        className="text-blue-600 hover:underline"
                      >
                        https://www.remeal.xyz/
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div ref={containerRef} className="overflow-hidden">
          <img
            src={url}
            ref={imageRef}
            alt="Heatmap background"
            style={{ display: "block" }}
            onLoad={updateHeatmap}
          />
        </div>
      </div>
    </div>
  );
};
export default Heatmap;
