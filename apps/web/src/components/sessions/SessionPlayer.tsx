"use client"

import { ArrowLeft, ChevronDown, Copy, ExternalLink, Info, Infinity, MoreVertical, Play, SkipBack, SkipForward, Sun, Wand2, Pause } from 'lucide-react'
import { useEffect, useRef, useState } from "react"
import { Replayer } from "rrweb"
import { Session } from "@/types/api"
import { eventWithTime } from "@rrweb/types"
import { formatPlayerTime } from "@/utils/format"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useRouter, useSearchParams } from "next/navigation";
import HeatmapsList from "../Heatmap/HeatmapsList";

interface Props {
  session: Session & { events: eventWithTime[] };
}

export default function SessionPlayer({ session }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [replayer, setReplayer] = useState<Replayer | null>(null);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState<string>(formatPlayerTime(session.duration));
  const [isElementsExpanded, setIsElementsExpanded] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [skipInactive, setSkipInactive] = useState(true);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  useEffect(() => {
    if (!wrapperRef.current || !session.events.length) return;

    const player = new Replayer(session.events, {
      root: wrapperRef.current,
      skipInactive: skipInactive,
      showWarning: false,
      blockClass: 'privacy',
      liveMode: false,
    });

    setReplayer(player);
    setDuration(formatPlayerTime(session.duration));

    return () => {
      player.pause();
      setReplayer(null);
    };
  }, [session.events, session.duration, skipInactive]);

  useEffect(() => {
    if (!replayer) return;

    const updateTime = () => {
      const time = replayer.getCurrentTime();
      setCurrentTime(formatPlayerTime(time));
      setSliderValue(time);
      
      if (time >= session.duration) {
        setIsPlaying(false);
      }
    };

    const timer = setInterval(updateTime, 100);
    return () => clearInterval(timer);
  }, [replayer, session.duration]);



  const handlePlayPause = () => {
    if (!replayer) return;
    if (isPlaying) {
      replayer.pause();
    } else {
      replayer.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (value: number[]) => {
    if (!replayer) return;
    replayer.pause();
    setSliderValue(value[0]);
    replayer.play(value[0]);
    setIsPlaying(false);
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('mode');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Navigation */}
      <header className="flex items-center border-b px-4 py-2">
        <div className="flex items-center gap-4">
          <Infinity className="h-6 w-6" />
          <Button 
            variant="ghost" 
            className="flex items-center gap-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <SkipBack className="h-4 w-4" />
          <div className="text-sm">2 / 2 sessions</div>
          <SkipForward className="h-4 w-4" />
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" className="flex items-center gap-2">
            <Play className="h-4 w-4" fill="currentColor" />
            Session replay
          </Button>
          <Button variant="ghost" className="flex items-center gap-2">
            <code className="text-sm">&lt;/&gt;</code>
            DevTools
          </Button>
          <Button variant="ghost" className="flex items-center gap-2">
            📊 Page analytics
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">BETA</span>
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
              <Input value="www.remeal.xyz" readOnly className="pr-8" />
              <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
            </div>
            <Button variant="ghost" size="icon">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Info className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Sun className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Wand2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="flex items-center gap-2">
              Current URL
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Video Area */}
          <div ref={wrapperRef} className="aspect-video w-full bg-black rounded-lg relative overflow-hidden" />

          {/* Timeline */}
          <div className="mt-4">
            <div className="flex items-center gap-4">
              <Button size="icon" variant="ghost" onClick={handlePlayPause}>
                {isPlaying ? 
                  <Pause className="h-4 w-4" fill="currentColor" /> : 
                  <Play className="h-4 w-4" fill="currentColor" />
                }
              </Button>
              <span className="text-sm">{currentTime} / {duration}</span>
              <SkipBack className="h-4 w-4" />
              <div className="flex-1">
                <Slider 
                  value={[sliderValue]} 
                  max={session.duration} 
                  step={100} 
                  onValueChange={handleSliderChange} 
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">5s</span>
                <span className="text-sm">1x</span>
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
        <div className="w-80 border-l p-4">
          {/* Feedback Card */}
          <Card className="mb-4 p-4">
            <p className="text-sm">
              Page analytics is a new feature. Therefore, we&apos;d love to get your feedback and ideas to make Smartlook better.
            </p>
            <Button className="mt-4 w-full">Give Feedback</Button>
          </Card>

          {/* Heatmaps List */}
          <HeatmapsList />

          {/* Heatmap Details */}
          <div className="mb-4">
            <Button
              variant="ghost"
              className="flex w-full items-center justify-between"
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
            >
              <span className="font-semibold">Heatmap Details</span>
              <ChevronDown className={`h-4 w-4 transform ${isDetailsExpanded ? "rotate-180" : ""}`} />
            </Button>
            {isDetailsExpanded && (
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Time frame</span>
                  <span>Oct 22, 2024 - Nov 20, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span>Device</span>
                  <span>Desktop</span>
                </div>
                <div className="flex justify-between">
                  <span>Total clicks</span>
                  <span>16 🖱️</span>
                </div>
                <div className="flex justify-between">
                  <span>Unique visitors</span>
                  <span>1 👤</span>
                </div>
              </div>
            )}
          </div>

          {/* Elements */}
          <div>
            <Button
              variant="ghost"
              className="flex w-full items-center justify-between"
              onClick={() => setIsElementsExpanded(!isElementsExpanded)}
            >
              <span className="font-semibold">Elements</span>
              <ChevronDown className={`h-4 w-4 transform ${isElementsExpanded ? "rotate-180" : ""}`} />
            </Button>
            {isElementsExpanded && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">1</span>
                    <span className="text-sm">HTML&gt;BODY&gt;MAIN&gt;nth-of-type(1)</span>
                  </div>
                  <span className="text-sm">7 ↓</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">2</span>
                    <span className="text-sm">HTML&gt;BODY&gt;MAIN&gt;nth-of-type(1)</span>
                  </div>
                  <span className="text-sm">5 ↓</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">3</span>
                    <span className="text-sm">HTML&gt;BODY&gt;MAIN&gt;nth-of-type(1)</span>
                  </div>
                  <span className="text-sm">2 ↓</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">4</span>
                    <span className="text-sm">HTML&gt;BODY&gt;FOOTER&gt;nth-of-type(1)</span>
                  </div>
                  <span className="text-sm">1 ↓</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

