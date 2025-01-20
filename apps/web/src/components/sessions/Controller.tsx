import React, { useState, useCallback } from "react";
import * as Slider from "@radix-ui/react-slider";
import {
  Play,
  Pause,
  RotateCcw,
  Terminal,
  ArrowUp,
  CornerUpLeft,
  Maximize,
  MousePointerClick,
  RefreshCcw,
  RotateCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerSwitch } from "../ui/player-switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatTime } from "@/utils/helpers";
import { Event } from "@/types/event";
import { Session } from "@/types/api";

interface ControllerProps {
  specialEvents: Event[];
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
  specialEvents,
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
  const [activeEventTooltip, setActiveEventTooltip] = useState<string | null>(
    null
  );
  const getEventPosition = useCallback(
    (event: Event) => {
      return (Number(event.timestamp) / session.duration) * 100;
    },
    [session.duration]
  );
  const getEventColor = (type: Event["event_type"]) => {
    switch (type) {
      case "click":
        return "bg-white";
      case "scroll":
        return "bg-green-500";
      case "rage_click":
        return "bg-yellow-500";
      case "refresh":
        return "bg-purple-500";
      case "selection":
        return "bg-gray-700";
      case "uturn":
        return "bg-indigo-500";
      case "window_resize":
        return "bg-orange-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleEventClick = useCallback(
    (event: Event) => {
      onValueChange?.([new Date(event.timestamp).getTime()]);
    },
    [onValueChange]
  );
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

  const getEventIcon = (type: Event["event_type"]) => {
    switch (type) {
      case "scroll":
        return <ArrowUp className="w-3 h-3 text-white" />;
      case "rage_click":
        return <MousePointerClick className="w-3 h-3 text-white" />;
      case "refresh":
        return <RefreshCcw className="w-3 h-3 text-white" />;
      case "uturn":
        return <CornerUpLeft className="w-3 h-3 text-white" />;
      case "window_resize":
        return <Maximize className="w-3 h-3 text-white" />;
      case "error":
        return <AlertCircle className="w-3 h-3 text-white" />;
      case "selection":
      case "click":
        return null;
      default:
        return null;
    }
  };
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
                {/* Event markers */}
                {specialEvents.map((event) => {
                  if (
                    event.event_type === "input" &&
                    event.data?.startTime &&
                    event.data?.endTime
                  ) {
                    const startPercent =
                      (event.data.startTime / session.duration) * 100;
                    const endPercent =
                      (event.data.endTime / session.duration) * 100;
                    return (
                      <Tooltip key={event.id}>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute top-1/2 -translate-y-1/2 bg-purple-500 h-[3px] hover:h-[5px] transition-all duration-200"
                            style={{
                              left: `${startPercent}%`,
                              width: `${endPercent - startPercent}%`,
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Input: {formatTime(event.data.startTime)} -{" "}
                            {formatTime(event.data.endTime)}
                            {event.data?.value && ` (${event.data.value})`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                  return (
                    <Tooltip key={event.id}>
                      <TooltipTrigger asChild>
                        <button
                          className={`absolute top-1/2 -translate-y-1/2 shadow-md hover:scale-150 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center
                            ${
                              event.event_type === "selection" ||
                              event.event_type === "click"
                                ? "w-1 h-1 rounded-full"
                                : "w-4 h-4 rounded-sm"
                            } ${getEventColor(event.event_type)}`}
                          style={{
                            left: `${getEventPosition(event)}%`,
                          }}
                          onClick={() => handleEventClick(event)}
                          onMouseEnter={() => setActiveEventTooltip(event.id)}
                          onMouseLeave={() => setActiveEventTooltip(null)}
                          aria-label={`${
                            event.event_type
                          } event at ${formatTime(
                            new Date(event.timestamp).getTime()
                          )}`}
                        >
                          {getEventIcon(event.event_type)}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{event.event_type}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}

                {/* Track tooltip */}
                {hoveredTime !== null && activeEventTooltip === null && (
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
                  <p>Skip backward</p>
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
              <PlayerSwitch
                checked={skipInactive}
                onCheckedChange={onSkipInactiveChange}
                className="relative transition-colors duration-200"
                aria-label="Toggle skip inactivity"
              />
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
