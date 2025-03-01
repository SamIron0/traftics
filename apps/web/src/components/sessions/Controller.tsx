import React, { useState, useCallback } from "react";
import * as Slider from "@radix-ui/react-slider";
import { Play, Pause, RotateCcw, Terminal, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerSwitch } from "../ui/player-switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatTime } from "@/utils/helpers";
import { Session } from "@/types/api";

interface ControllerProps {
  onValueChange?: (value: number[]) => void;
  onConsoleToggle: () => void;
  onPlayPause: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onSpeedChange: (speed: number) => void;
  onSkipInactiveChange: (skip: boolean) => void;
  isPlaying: boolean;
  playbackSpeed: number;
  skipInactive: boolean;
  currentTime: number;
  session: Session;
}

export function Controller({
  onValueChange,
  onConsoleToggle,
  onPlayPause,
  onSkipForward,
  onSkipBackward,
  onSpeedChange,
  onSkipInactiveChange,
  isPlaying,
  playbackSpeed,
  skipInactive,
  currentTime,
  session,
}: ControllerProps) {
  const progressPercent = (currentTime / session.duration) * 100;
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const handleTrackHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const position = (e.clientX - rect.left) / rect.width;
      setHoveredTime(position * session.duration);
    },
    [session.duration]
  );

  const handleTrackLeave = useCallback(() => {
    setHoveredTime(null);
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg pt-3 z-50">
        <div className="mx-auto px-4 py-2">
          <div className="relative w-full">
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-[8px]"
              value={[currentTime]}
              max={session.duration}
              step={1}
              onValueChange={(newValue) => onValueChange?.(newValue)}
            >
              <Slider.Track
                className="relative grow cursor-pointer"
                onMouseMove={handleTrackHover}
                onMouseLeave={handleTrackLeave}
              >
                {/* Background segments */}
                <div className="absolute top-1/2 -translate-y-1/2 bg-slate-200 rounded-full h-[8px] w-full" />

                {/* Progress segments */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 bg-blue-500 h-[8px]"
                  style={{ width: `${progressPercent}%` }}
                />
                {/* Track tooltip */}
                {hoveredTime !== null && (
                  <div
                    className="absolute top-[-30px] px-2 py-1 bg-gray-800 text-white text-xs rounded pointer-events-none"
                    style={{
                      left: `${(hoveredTime / session.duration) * 100}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    {formatTime(hoveredTime)}
                  </div>
                )}
              </Slider.Track>
              <Slider.Thumb
                className="block cursor-pointer w-4 h-4 bg-blue-500 shadow-lg rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
                aria-label="Slider thumb"
              />
            </Slider.Root>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onPlayPause}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPlaying ? "Pause" : "Play"}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSkipForward}
                    aria-label="Skip forward"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Skip forward</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSkipBackward}
                    aria-label="Skip backward"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Skip backward</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nextSpeed =
                        playbackSpeed === 2 ? 1 : playbackSpeed + 0.5;
                      onSpeedChange(nextSpeed);
                    }}
                    className="text-xs font-medium"
                  >
                    {playbackSpeed}x
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle playback speed</p>
                </TooltipContent>
              </Tooltip>
              <span className="text-sm font-medium px-3">
                {formatTime(currentTime)} / {formatTime(session.duration)}
              </span>
              <Tooltip>
                <div>
                  <PlayerSwitch
                    checked={skipInactive}
                    onCheckedChange={onSkipInactiveChange}
                    className="relative transition-colors duration-200"
                    aria-label="Toggle skip inactivity"
                  />
                </div>
                <TooltipContent>
                  <p>Skip inactive periods</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onConsoleToggle}
                    aria-label="Toggle console"
                    className="flex items-center gap-1"
                  >
                    <Terminal className="h-4 w-4" />
                    <span className="text-xs font-medium">Console</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show console</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
