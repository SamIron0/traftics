"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller } from "./Controller";
import { SessionInfo } from "./SessionInfo";
import {
  X,
  ChevronRight,
  ArrowLeft,
  SkipBack,
  SkipForward,
  ChevronDown,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Session } from "@/types/api";
import {
  EventType,
  eventWithTime,
  IncrementalSource,
  viewportResizeData,
} from "@rrweb/types";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animation-variants";
import { Replayer } from "rrweb";
import { formatPlayerTime, getRelativeTimestamp } from "@/utils/helpers";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Event } from "@/types/event";

const EmptyConsole = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-400">
    <p className="text-sm">No errors to display</p>
    <p className="text-xs">Errors will appear here when they occur</p>
  </div>
);

interface Props {
  session: Session & { events: eventWithTime[] };
  onNextSession?: () => void;
  onPreviousSession?: () => void;
  hasNextSession?: boolean;
  hasPreviousSession?: boolean;
  currentSessionIndex?: number;
  totalSessions?: number;
}

function convertToSliderEvents(events: Event[]): Event[] {
  return events.map((event) => ({
    ...event,
    timestamp: new Date(event.timestamp).toISOString(),
    ...(event.event_type === "input" &&
      event.data?.startTime &&
      event.data?.endTime && {
        data: {
          ...event.data,
          startTime: event.data.startTime,
          endTime: event.data.endTime,
        },
      }),
  }));
}

export default function SessionPlayer({
  session,
  onNextSession,
  onPreviousSession,
  hasNextSession,
  hasPreviousSession,
  currentSessionIndex,
  totalSessions,
}: Props) {
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [expandedErrors, setExpandedErrors] = useState<string[]>([]);
  const [isSessionInfoOpen, setIsSessionInfoOpen] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [replayer, setReplayer] = useState<Replayer | null>(null);
  formatPlayerTime(session.duration || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [skipInactive, setSkipInactive] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const { toast } = useToast();
  const [pages, setPages] = useState<
    Array<{ href: string; timestamp: string }>
  >([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [viewportResize, setViewportResize] = useState<eventWithTime[]>();
  const [specialSessionEvents, setSpecialSessionEvents] = useState<Event[]>([]);
  const [errors, setErrors] = useState<
    Array<{
      id: string;
      error_message: string;
      stack_trace: string | null;
      error_type: string;
      file_name: string | null;
      line_number: number | null;
      column_number: number | null;
      timestamp: string;
    }>
  >([]);

  useEffect(() => {
    if (!wrapperRef.current || !session.events.length) return;

    // Reset player state
    setSliderValue(0);
    setIsPlaying(false);

    // Clear any existing content
    wrapperRef.current.innerHTML = "";

    // Mark session as played immediately
    const markSessionAsPlayed = async () => {
      try {
        await fetch(`/api/sessions/${session.id}/played`, {
          method: "POST",
        });
        // Update the session prop
        session.is_played = true;
      } catch (error) {
        console.error("Failed to mark session as played:", error);
      }
    };
    markSessionAsPlayed();

    // Initialize the replayer
    const replayerInstance = new Replayer(session.events, {
      root: wrapperRef.current,
      skipInactive: skipInactive,
      speed: playbackSpeed,
      showWarning: false,
      loadTimeout: 1,
      UNSAFE_replayCanvas: true,
      blockClass: "rr-block",
      liveMode: false,
      insertStyleRules: [
        ".rr-block { background: #ccc }",
        "iframe { background: #fff }",
      ],
      mouseTail: {
        strokeStyle: "#556FF6",
        lineWidth: 2,
        duration: 500,
      },
    });

    // After initialization, set up the iframe
    if (wrapperRef.current) {
      const iframe = wrapperRef.current.querySelector("iframe");
      if (iframe) {
        iframe.setAttribute("sandbox", "");
      }
    }

    // Add scaling for the replayer wrapper
    const replayerWrapper = wrapperRef.current?.querySelector(
      ".replayer-wrapper"
    ) as HTMLElement;
    if (replayerWrapper) {
      const containerHeight = wrapperRef.current.clientHeight || 0;
      const containerWidth = wrapperRef.current.clientWidth || 0;
      const sessionHeight = session.screen_height || 0;
      const sessionWidth = session.screen_width || 0;

      const heightScale = containerHeight / sessionHeight;
      const widthScale = containerWidth / sessionWidth;
      const scale = Math.min(heightScale, widthScale);

      Object.assign(replayerWrapper.style, {
        position: "absolute",
        height: `${sessionHeight}px`,
        width: `${sessionWidth}px`,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "10px",
      });
    }

    // Store the replayer instance
    setReplayer(replayerInstance);

    // Event listener for replayer state updates
    const timer = setInterval(() => {
      if (!replayerInstance) return;

      const currentTime = replayerInstance.getCurrentTime();
      setSliderValue(currentTime);

      if (currentTime >= (session.duration || 0)) {
        setIsPlaying(false);
        replayerInstance.pause();
      }
    }, 100);

    // Cleanup function
    return () => {
      clearInterval(timer);
      replayerInstance.destroy();
    };
  }, [session.events, skipInactive, playbackSpeed]);

  // Track viewport resize events
  useEffect(() => {
    if (!session.events) return;

    const resizeEvents = session.events.filter(
      (event) =>
        event.type === EventType.IncrementalSnapshot &&
        event.data.source === IncrementalSource.ViewportResize
    );

    setViewportResize(resizeEvents);
  }, [session.events]);

  const updateScale = useCallback(() => {
    if (!wrapperRef.current || !replayer) return;

    const replayerWrapper = wrapperRef.current.querySelector(
      ".replayer-wrapper"
    ) as HTMLElement;
    if (!replayerWrapper) return;

    const containerHeight = wrapperRef.current.clientHeight || 0;
    const containerWidth = wrapperRef.current.clientWidth || 0;

    // Get current dimensions from viewport resize events or fallback to session dimensions
    const currentResizeEvent = viewportResize?.reduce((closest, current) => {
      const eventTime = getRelativeTimestamp(
        current.timestamp,
        session.started_at || 0
      );
      const currentTime = replayer.getCurrentTime();

      if (eventTime > currentTime) return closest;
      if (!closest) return current;

      const closestTime = getRelativeTimestamp(
        closest.timestamp,
        session.started_at || 0
      );
      return currentTime - eventTime < currentTime - closestTime
        ? current
        : closest;
    }, null as eventWithTime | null);

    const width =
      (currentResizeEvent?.data as viewportResizeData)?.width ||
      session.screen_width ||
      0;
    const height =
      (currentResizeEvent?.data as viewportResizeData)?.height ||
      session.screen_height ||
      0;

    const heightScale = containerHeight / height;
    const widthScale = containerWidth / width;
    const scale = Math.min(heightScale, widthScale);

    Object.assign(replayerWrapper.style, {
      height: `${height}px`,
      width: `${width}px`,
      transform: `scale(${scale})`,
      transformOrigin: "center center",
    });
  }, [
    replayer,
    session.screen_height,
    session.screen_width,
    session.started_at,
    viewportResize,
  ]);

  // Add effect to handle sidebar state changes
  useEffect(() => {
    updateScale();
    // Add resize observer to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [isSessionInfoOpen, updateScale]);

  // Update the existing useEffect that handles viewport resize events
  useEffect(() => {
    if (!replayer || !pages.length || !viewportResize) return;

    const updateTime = () => {
      if (!replayer || !wrapperRef.current) return;

      const time = replayer.getCurrentTime();
      setSliderValue(time);

      // Check if we've reached the end of the session
      if (time >= (session.duration || 0)) {
        replayer.pause();
        setIsPlaying(false);
      }

      // Update scale when time changes
      updateScale();

      // Find the last page that was visited before the current time
      const currentPageIndex = pages.reduce((lastIndex, page, index) => {
        const pageTime = getRelativeTimestamp(
          page.timestamp,
          session.started_at || 0
        );
        return pageTime <= time ? index : lastIndex;
      }, 0);

      setSelectedPageIndex(currentPageIndex);
    };

    const timer = setInterval(updateTime, 100);
    return () => clearInterval(timer);
  }, [
    replayer,
    session.duration,
    pages,
    session.started_at,
    viewportResize,
    session.screen_height,
    session.screen_width,
    updateScale,
  ]);

  const handlePlayPause = useCallback(() => {
    if (!replayer) return;
    const currentTime = replayer.getCurrentTime();
    if (isPlaying) {
      replayer.pause();
    } else {
      replayer.play(
        currentTime < 0 || currentTime >= session.duration ? 0 : currentTime
      );
    }
    setIsPlaying(!isPlaying);
  }, [replayer, isPlaying, session.duration]);

  const handleSkipInactive = useCallback(() => {
    if (!replayer) return;

    replayer.setConfig({ skipInactive: !skipInactive });
    setSkipInactive(!skipInactive);
  }, [replayer, skipInactive]);

  const handleSliderChange = (value: number[]) => {
    if (!replayer) return;
    replayer.pause();
    setSliderValue(value[0]);
    replayer.play(value[0]);
    setIsPlaying(true);
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("mode");
    params.delete("sessionId");
    router.push(`?${params.toString()}`);
  };
  
  const handleSpeedChange = (speed: number) => {
    if (!replayer) return;

    // Don't clear the DOM content, just update the config
    replayer.setConfig({ speed });
    setPlaybackSpeed(speed);
  };

  const handleJump = useCallback(
    (seconds: number) => {
      if (!replayer) return;
      const currentTime = replayer.getCurrentTime();
      const newTime = Math.max(
        0,
        Math.min(currentTime + seconds * 1000, session.duration || 0)
      );
      replayer.play(newTime);
      setSliderValue(newTime);
      setIsPlaying(true);
    },
    [replayer, session.duration]
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return; // Don't trigger when typing in inputs

      switch (e.key) {
        case "ArrowLeft":
          handleJump(-10);
          break;
        case "ArrowRight":
          handleJump(10);
          break;
        case " ": // Spacebar
          e.preventDefault();
          handlePlayPause();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleJump, handlePlayPause, replayer]);

  useEffect(() => {
    async function fetchSessionData() {
      try {
        const [pagesRes, eventsRes] = await Promise.all([
          fetch(`/api/sessions/${session.id}/pages`),
          fetch(`/api/sessions/${session.id}/events`),
        ]);

        if (!pagesRes.ok || !eventsRes.ok)
          throw new Error("Failed to fetch session data");

        const [pagesData, eventsData] = await Promise.all([
          pagesRes.json(),
          eventsRes.json(),
        ]);

        setPages(pagesData);

        // Convert timestamps to relative time from session start
        const convertedEvents = eventsData.map((event: Event) => ({
          ...event,
          timestamp:
            new Date(event.timestamp).getTime() -
            (session.started_at ? new Date(session.started_at).getTime() : 0),
        }));

        const processedEvents = convertToSliderEvents(convertedEvents);
        setSpecialSessionEvents(processedEvents);
      } catch (error) {
        console.error("Error fetching session data:", error);
      }
    }

    fetchSessionData();
  }, [session.id, session.started_at]);

  const handleCopyUrl = () => {
    if (pages[selectedPageIndex]) {
      navigator.clipboard.writeText(pages[selectedPageIndex].href);
      toast({
        description: "URL copied to clipboard",
      });
    }
  };

  const handleOpenExternal = () => {
    if (pages[selectedPageIndex]) {
      window.open(pages[selectedPageIndex].href, "_blank");
    }
  };

  const toggleConsole = () => {
    setIsConsoleOpen((prev) => !prev);
  };

  const toggleError = (errorId: string) => {
    setExpandedErrors((prev) =>
      prev.includes(errorId)
        ? prev.filter((id) => id !== errorId)
        : [...prev, errorId]
    );
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    async function fetchErrors() {
      try {
        const res = await fetch(`/api/sessions/${session.id}/errors`);
        if (!res.ok) throw new Error("Failed to fetch errors");
        const errorData = await res.json();
        setErrors(errorData);
      } catch (error) {
        console.error("Error fetching session errors:", error);
      }
    }

    fetchErrors();
  }, [session.id]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="flex items-center border-b px-4 py-2 bg-white">
        <div className="flex items-center gap-4">
          <motion.img
            src="/logo.svg"
            alt="logo"
            className="mx-auto h-10 w-10"
            variants={itemVariants}
          />
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onPreviousSession}
                disabled={!hasPreviousSession}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous session</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNextSession}
                disabled={!hasNextSession}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next session</TooltipContent>
          </Tooltip>
          <div className="text-sm">
            {(currentSessionIndex ?? 0) + 1} / {totalSessions} sessions
          </div>
        </div>
      </header>

      <div
        className={cn(
          "border-b px-4 py-3 transition-all duration-300 bg-gray-50",
          isSessionInfoOpen ? "mr-80" : "mr-10"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">
                {selectedPageIndex + 1}/{pages.length}
              </span>
              <div className="flex w-full items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full max-w-xl justify-between"
                    >
                      {pages[selectedPageIndex]?.href || "No pages recorded"}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                    {pages.map((page, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => {
                          if (!replayer) return;
                          setSelectedPageIndex(index);
                          const relativeTime = getRelativeTimestamp(
                            page.timestamp,
                            session.started_at || 0
                          );
                          replayer.play(relativeTime);
                          setSliderValue(relativeTime);
                          setIsPlaying(true);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {index + 1}.
                          </span>
                          {page.href}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyUrl}
                      disabled={!pages.length}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy URL</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleOpenExternal}
                      disabled={!pages.length}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open in new tab</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isConsoleOpen && (
        <div className="fixed bottom-20 left-0 right-0 bg-[#242424] text-white h-72 overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-2 border-b border-gray-700 px-4 py-2">
            <h2 className="text-sm font-semibold text-gray-300">Console</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleConsole}
              className="text-gray-400 hover:text-white"
              aria-label="Close console"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="font-mono text-[13px] space-y-2 px-4 pb-4">
            {errors.length === 0 ? (
              <EmptyConsole />
            ) : (
              errors.map((error) => (
                <div key={error.id} className="group">
                  <div
                    className="flex items-start gap-2 cursor-pointer"
                    onClick={() => toggleError(error.id)}
                  >
                    <button
                      className="mt-1 p-0.5 hover:bg-gray-700 rounded flex-shrink-0"
                      aria-label={
                        expandedErrors.includes(error.id)
                          ? "Collapse error"
                          : "Expand error"
                      }
                    >
                      <ChevronRight
                        className={`h-3 w-3 transition-transform ${
                          expandedErrors.includes(error.id) ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-red-400 flex items-start gap-1 min-w-0">
                          <span className="flex-shrink-0">×</span>
                          <span className="truncate">
                            {error.error_message}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!replayer) return;
                            const timestamp =
                              new Date(error.timestamp).getTime() -
                              new Date(session.started_at || 0).getTime();
                            replayer.play(timestamp);
                            setSliderValue(timestamp);
                            setIsPlaying(true);
                          }}
                          className="text-gray-500 hover:text-gray-300 whitespace-nowrap text-xs mt-0.5 flex-shrink-0"
                        >
                          {formatTime(
                            new Date(error.timestamp).getTime() -
                              new Date(session.started_at || 0).getTime()
                          )}
                        </button>
                      </div>
                      {error.file_name && (
                        <div className="text-red-400 ml-3 truncate">
                          at {error.file_name}:{error.line_number}:
                          {error.column_number}
                        </div>
                      )}
                      {expandedErrors.includes(error.id) &&
                        error.stack_trace && (
                          <pre className="mt-2 text-[#8B949E] whitespace-pre-wrap ml-3 break-words">
                            {error.stack_trace}
                          </pre>
                        )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <Controller
        onConsoleToggle={toggleConsole}
        onPlayPause={handlePlayPause}
        onSkipForward={() => handleJump(10)}
        onSkipBackward={() => handleJump(-10)}
        onSpeedChange={handleSpeedChange}
        onSkipInactiveChange={handleSkipInactive}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        skipInactive={skipInactive}
        currentTime={sliderValue}
        onValueChange={handleSliderChange}
        session={session}
      />

      <SessionInfo
        isOpen={isSessionInfoOpen}
        onToggle={() => setIsSessionInfoOpen(!isSessionInfoOpen)}
        session={session}
        specialEvents={specialSessionEvents}
      />

      <div
        className={cn(
          "flex-1 transition-all duration-300",
          isSessionInfoOpen ? "mr-80" : "mr-10"
        )}
      >
        <div
          ref={wrapperRef}
          className="aspect-video w-full bg-zinc-200 relative overflow-hidden flex items-center justify-center cursor-pointer"
          onClick={handlePlayPause}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100vh - 185px)",
          }}
        ></div>
      </div>
    </div>
  );
}
