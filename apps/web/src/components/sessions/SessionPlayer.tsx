"use client";

import {
  ArrowLeft,
  ChevronDown,
  Copy,
  ExternalLink,
  MoreVertical,
  Play,
  SkipBack,
  SkipForward,
  Pause,
} from "lucide-react";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animation-variants";
import { useEffect, useRef, useState, useCallback } from "react";
import { Replayer } from "rrweb";
import { Session } from "@/types/api";
import { EventType, eventWithTime, IncrementalSource } from "@rrweb/types";
import { formatPlayerTime, getRelativeTimestamp } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SessionInfo } from "./SessionInfo";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  session: Session & { events: eventWithTime[] };
  onNextSession?: () => void;
  onPreviousSession?: () => void;
  hasNextSession?: boolean;
  hasPreviousSession?: boolean;
  currentSessionIndex?: number;
  totalSessions?: number;
  onDeleteSession?: () => void;
}

export default function SessionPlayer({
  session,
  onNextSession,
  onPreviousSession,
  hasNextSession,
  hasPreviousSession,
  currentSessionIndex,
  totalSessions,
  onDeleteSession,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [replayer, setReplayer] = useState<Replayer | null>(null);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState<string>(
    formatPlayerTime(session.duration || 0)
  );
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

  useEffect(() => {
    const currentWrapper = wrapperRef.current; // Copy ref to variable
    // if session.events contains IncrementalSource.ViewportResize, setViewportResize
    const viewportResizeEvents = session.events.filter(
      (event) =>
        event.type === EventType.IncrementalSnapshot &&
        event.data.source === IncrementalSource.ViewportResize
    );
    setViewportResize(viewportResizeEvents);
    if (!currentWrapper || !session.events.length) return;

    // Only clear content if there's existing content AND we're switching sessions
    const existingWrapper = currentWrapper.querySelector(".replayer-wrapper");
    if (
      existingWrapper &&
      existingWrapper.getAttribute("data-session-id") !== session.id
    ) {
      currentWrapper.innerHTML = "";
    }

    const player = new Replayer(session.events, {
      root: currentWrapper,
      skipInactive: skipInactive,
      showWarning: false,
      blockClass: "privacy",
      liveMode: false,
      speed: playbackSpeed,
    });

    const replayerWrapper = currentWrapper.querySelector(".replayer-wrapper");

    if (replayerWrapper) {
      // Add session ID to wrapper for tracking
      replayerWrapper.setAttribute("data-session-id", session.id);

      const containerHeight = currentWrapper.clientHeight;
      const containerWidth = currentWrapper.clientWidth;
      const sessionHeight = session.screen_height || 0;
      const sessionWidth = session.screen_width || 0;

      const heightScale = containerHeight / sessionHeight;
      const widthScale = containerWidth / sessionWidth;
      const scale = Math.min(heightScale, widthScale);

      Object.assign((replayerWrapper as HTMLElement).style, {
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

    setReplayer(player);
    setDuration(formatPlayerTime(session.duration || 0));
    setCurrentTime("00:00");
    setSliderValue(0);
    setIsPlaying(false);

    return () => {
      player.pause();
      setReplayer(null);
      // Only clear content during cleanup if we're unmounting completely
      if (currentWrapper && !currentWrapper.parentElement) {
        currentWrapper.innerHTML = "";
      }
    };
  }, [
    session.events,
    session.duration,
    skipInactive,
    playbackSpeed,
    session.screen_height,
    session.screen_width,
    session.id,
  ]);

  useEffect(() => {
    if (!replayer || !pages.length || !viewportResize) return;

    const updateTime = () => {
      if (!replayer || !wrapperRef.current) return;

      const time = replayer.getCurrentTime();
      setCurrentTime(formatPlayerTime(time > 0 ? time : 0));
      setSliderValue(time);

      // Check if we've reached the end of the session
      if (time >= (session.duration || 0)) {
        replayer.pause();
        setIsPlaying(false);
      }

      // Check for closest resize events
      const closestResizeEvent = viewportResize?.reduce((closest, current) => {
        const eventTime = getRelativeTimestamp(
          current.timestamp,
          session.started_at || 0
        );

        if (eventTime > time) return closest;
        if (!closest) return current;

        const closestTime = getRelativeTimestamp(
          closest.timestamp,
          session.started_at || 0
        );

        return time - eventTime < time - closestTime ? current : closest;
      }, null as eventWithTime | null);

      if (closestResizeEvent) {
        const { width, height } = closestResizeEvent.data as {
          width: number;
          height: number;
        };
        const containerHeight = wrapperRef.current.clientHeight || 0;
        const containerWidth = wrapperRef.current.clientWidth || 0;
        const scale = Math.min(
          containerWidth / width,
          containerHeight / height
        );

        const replayerWrapper =
          wrapperRef.current.querySelector(".replayer-wrapper");
        if (replayerWrapper) {
          Object.assign((replayerWrapper as HTMLElement).style, {
            height: `${height}px`,
            width: `${width}px`,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          });
        }
      } else {
        const replayerWrapper =
          wrapperRef.current.querySelector(".replayer-wrapper");
        if (replayerWrapper) {
          const containerHeight = wrapperRef.current.clientHeight || 0;
          const containerWidth = wrapperRef.current.clientWidth || 0;
          const sessionHeight = session.screen_height || 0;
          const sessionWidth = session.screen_width || 0;

          const heightScale = containerHeight / sessionHeight;
          const widthScale = containerWidth / sessionWidth;
          const scale = Math.min(heightScale, widthScale);

          Object.assign((replayerWrapper as HTMLElement).style, {
            height: `${sessionHeight}px`,
            width: `${sessionWidth}px`,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          });
        }
      }

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
  }, [replayer, session.duration, pages, session.started_at, viewportResize, session.screen_height, session.screen_width]);

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
    if (wrapperRef.current) {
      wrapperRef.current.innerHTML = "";
    }
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
    if (wrapperRef.current) {
      wrapperRef.current.innerHTML = "";
    }

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

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete session");

      toast({
        title: "Session deleted",
        description: "The session has been successfully deleted",
      });

      // Go back to sessions list
      handleBack();
      onDeleteSession?.();
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

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
    async function fetchPages() {
      try {
        const response = await fetch(`/api/sessions/${session.id}/pages`);
        if (!response.ok) throw new Error("Failed to fetch pages");
        const data = await response.json();
        setPages(data);
      } catch (error) {
        console.error("Error fetching pages:", error);
      }
    }

    fetchPages();
  }, [session.id]);

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

  return (
    <div className="flex h-screen flex-col bg-background" key={session.id}>
      {/* Top Navigation */}
      <header className="flex items-center border-b px-4 py-2">
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

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Content */}
        <div className="flex-1 p-4">
          {/* URL Bar */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">
                  {selectedPageIndex + 1}/{pages.length}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
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
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyUrl}
              disabled={!pages.length}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenExternal}
              disabled={!pages.length}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          {/* Video Area */}
          <div
            ref={wrapperRef}
            className="aspect-video w-full bg-zinc-200 rounded-lg relative overflow-hidden flex items-center justify-center cursor-pointer"
            onClick={handlePlayPause}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "calc(100vh - 300px)",
              maxHeight: "800px",
            }}
          >
            {/* Play/Pause Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity hover:bg-black/40">
                <Play className="h-16 w-16 text-white" />
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="mt-4">
            <div className="flex items-center gap-4">
              <Button size="icon" variant="ghost" onClick={handlePlayPause}>
                {isPlaying ? (
                  <Pause className="h-4 w-4" fill="currentColor" />
                ) : (
                  <Play className="h-4 w-4" fill="currentColor" />
                )}
              </Button>
              <span className="text-sm">
                {currentTime} / {duration}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleJump(-10)}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Jump back 10s (←)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleJump(10)}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Jump forward 10s (→)</TooltipContent>
              </Tooltip>
              <div className="flex-1">
                <Slider
                  value={[sliderValue]}
                  max={session.duration}
                  step={100}
                  onValueChange={handleSliderChange}
                />
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-sm">
                      {playbackSpeed}x
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSpeedChange(0.5)}>
                      0.5x
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSpeedChange(1)}>
                      1x
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSpeedChange(2)}>
                      2x
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Skip inactivity</span>
                  <Switch
                    checked={skipInactive}
                    onCheckedChange={handleSkipInactive}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the session recording and all its data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 border-l p-4">
          {/* Feedback Card */}
          <SessionInfo session={session} />
        </div>
      </div>
    </div>
  );
}
