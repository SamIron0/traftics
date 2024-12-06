"use client";

import {
  CodeXml,
  ArrowLeft,
  ChevronDown,
  Copy,
  ExternalLink,
  MoreVertical,
  Play,
  SkipBack,
  SkipForward,
  Sun,
  Pause,
} from "lucide-react";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animation-variants";
import { useEffect, useRef, useState, useCallback } from "react";
import { Replayer } from "rrweb";
import { Session } from "@/types/api";
import { eventWithTime } from "@rrweb/types";
import { formatPlayerTime } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Card} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SessionInfo } from "./SessionInfo";
interface Props {
  session: Session & { events: eventWithTime[] };
}

export default function SessionPlayer({ session }: Props) {
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
  const [activeView, setActiveView] = useState<
    "replay" | "devtools" | "analytics"
  >("replay");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    if (!wrapperRef.current || !session.events.length) return;

    const player = new Replayer(session.events, {
      root: wrapperRef.current,
      skipInactive: skipInactive,
      showWarning: false,
      blockClass: "privacy",
      liveMode: false,
      speed: playbackSpeed,
    });

    setReplayer(player);
    setDuration(formatPlayerTime(session.duration || 0));

    return () => {
      player.pause();
      setReplayer(null);
    };
  }, [session.events, session.duration, skipInactive, playbackSpeed]);

  useEffect(() => {
    if (!replayer) return;

    const updateTime = () => {
      const time = replayer.getCurrentTime();
      setCurrentTime(formatPlayerTime(time));
      setSliderValue(time);

      if (time >= (session.duration || 0)) {
        setIsPlaying(false);
      }
    };

    const timer = setInterval(updateTime, 100);
    return () => clearInterval(timer);
  }, [replayer, session.duration]);

  const handlePlayPause = useCallback(() => {
    if (!replayer) return;
    if (isPlaying) {
      replayer.pause();
    } else {
      replayer.play();
    }
    setIsPlaying(!isPlaying);
  }, [replayer, isPlaying]);

  const handleSliderChange = (value: number[]) => {
    if (!replayer) return;
    replayer.pause();
    setSliderValue(value[0]);
    replayer.play(value[0]);
    setIsPlaying(false);
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("mode");
    router.push(`?${params.toString()}`);
  };

  const handleSpeedChange = (speed: number) => {
    if (!replayer) return;
    replayer.setConfig({ speed });
    setPlaybackSpeed(speed);
  };

  const handleJump = useCallback((seconds: number) => {
    if (!replayer) return;
    const currentTime = replayer.getCurrentTime();
    const newTime = Math.max(0, Math.min(currentTime + seconds * 1000, session.duration || 0));
    replayer.play(newTime);
    setSliderValue(newTime);
    setIsPlaying(true);
  }, [replayer, session.duration]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return; // Don't trigger when typing in inputs
      
      switch(e.key) {
        case 'ArrowLeft':
          handleJump(-10);
          break;
        case 'ArrowRight':
          handleJump(10);
          break;
        case ' ': // Spacebar
          e.preventDefault();
          handlePlayPause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleJump, handlePlayPause, replayer]);

  return (
    <div className="flex h-screen flex-col bg-background">
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
                onClick={() => handleJump(-10)}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Jump back 10s (←)
            </TooltipContent>
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
            <TooltipContent>
              Jump forward 10s (→)
            </TooltipContent>
          </Tooltip>
          <div className="text-sm">2 / 2 sessions</div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button
            variant="ghost"
            className={cn(
              "flex items-center gap-2",
              activeView === "replay" && "bg-secondary"
            )}
            onClick={() => setActiveView("replay")}
          >
            <Play className="h-4 w-4" fill="currentColor" />
            Session replay
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "flex items-center gap-2",
              activeView === "devtools" && "bg-secondary"
            )}
            onClick={() => setActiveView("devtools")}
          >
            <CodeXml className="h-4 w-4" />
            DevTools
          </Button>
         
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Content */}
        <div className="flex-1 p-4">
          {/* URL Bar */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Input value="1/2  www.remeal.xyz" readOnly className="pr-8" />
              <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
            </div>
            <Button variant="ghost" size="icon">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Sun className="h-4 w-4" />
            </Button>
          </div>

          {/* Video Area */}
          <div
            ref={wrapperRef}
            className="aspect-video w-full bg-black rounded-lg relative overflow-hidden flex items-center justify-center cursor-pointer"
            onClick={handlePlayPause}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
                <TooltipContent>
                  Jump back 10s (←)
                </TooltipContent>
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
                <TooltipContent>
                  Jump forward 10s (→)
                </TooltipContent>
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
                    onCheckedChange={setSkipInactive}
                  />
                </div>
                <Button variant="ghost" className="text-blue-600">
                  Add notes and share
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Export</DropdownMenuItem>
                    <DropdownMenuItem>Share</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 border-l p-4">
          {/* Feedback Card */}
          <Card className="mb-4 p-4">
            <p className="text-sm">
              We&apos;d love to get your feedback and ideas to make Traftics
              better.
            </p>
            <Button className="mt-4 w-full">Give Feedback</Button>
          </Card>
          <SessionInfo session={session} />
        </div>
      </div>
    </div>
  );
}
