"use client";

import {
  ChartArea,
  CodeXml,
  ArrowLeft,
  ChevronDown,
  Copy,
  ExternalLink,
  Info,
  MoreVertical,
  Play,
  SkipBack,
  SkipForward,
  Sun,
  Pause,
  ChevronUp,
  Monitor,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animation-variants";
import { useEffect, useRef, useState } from "react";
import { Replayer } from "rrweb";
import { Session } from "@/types/api";
import { eventWithTime } from "@rrweb/types";
import { formatPlayerTime } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

interface Props {
  session: Session & { events: eventWithTime[] };
}

export default function SessionPlayer({ session }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [replayer, setReplayer] = useState<Replayer | null>(null);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState<string>(
    formatPlayerTime(session.duration)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [skipInactive, setSkipInactive] = useState(true);
  const [activeView, setActiveView] = useState<
    "replay" | "devtools" | "analytics"
  >("replay");

  useEffect(() => {
    if (!wrapperRef.current || !session.events.length) return;

    const player = new Replayer(session.events, {
      root: wrapperRef.current,
      skipInactive: skipInactive,
      showWarning: false,
      blockClass: "privacy",
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
    params.delete("mode");
    router.push(`?${params.toString()}`);
  };

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
          <SkipBack className="h-4 w-4" />
          <div className="text-sm">2 / 2 sessions</div>
          <SkipForward className="h-4 w-4" />
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
          <Button
            variant="ghost"
            className={cn(
              "flex items-center gap-2",
              activeView === "analytics" && "bg-secondary"
            )}
            onClick={() => setActiveView("analytics")}
          >
            <ChartArea className="h-4 w-4" />
            Page analytics
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
            className="aspect-video w-full bg-black rounded-lg relative overflow-hidden flex items-center justify-center"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />

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
        <div className="w-96 border-l p-4">
          {/* Feedback Card */}
          <Card className="mb-4 p-4">
            <p className="text-sm">
              We&apos;d love to get your feedback and ideas to make Traftics
              better.
            </p>
            <Button className="mt-4 w-full">Give Feedback</Button>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3  text-sm">
              {/* Header */}
              <div className="flex justify-between items-start">
                <h1 className="text-lg font-bold ">User properties</h1>
                <Button
                  variant="ghost"
                  className="bg-[#f1f5f9] hover:bg-[#e2e8f0]"
                >
                  <ChevronUp className="h-5 w-5" />
                </Button>
              </div>

              {/* User ID and Details */}
              <div className="flex justify-between items-center border-b pb-4">
                <div className="">xdfnqALUKuw--LdVt6LH1</div>
                <Button variant="ghost" className="flex items-center gap-2">
                  Show all user details
                  <User className="h-4 w-4" />
                </Button>
              </div>

              {/* Rest of the User Properties content */}
              <div className="flex justify-between items-center border-b pb-4">
                <div className="">Email</div>
                <Button variant="ghost" className="flex items-center gap-2">
                  How to set up
                  <Info className="h-5 w-5" />
                </Button>
              </div>

              {/* Events and Sessions */}
              <div className="space-y-2    border-b pb-4">
                <div className="flex justify-between items-center">
                  <div className="">Total events</div>
                  <div>42</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="">User&apos;s sessions</div>
                  <div>1 / 2</div>
                </div>
              </div>

              {/* Session Properties section */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h1 className="text-lg font-bold ">Session properties</h1>
                  <Button
                    variant="ghost"
                    className="bg-[#f1f5f9] hover:bg-[#e2e8f0]"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {/* Date, Device, OS, Browser, Dimensions */}
                  <div className="flex justify-between items-center">
                    <div className="">Date</div>
                    <div>November 13, 2024 at 02:04 PM</div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="">Device</div>
                    <div className="flex items-center gap-2">
                      <span>Desktop</span>
                      <Monitor className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="">OS</div>
                    <div className="flex items-center gap-2">
                      <span>Apple Mac - OS X</span>
                      <svg
                        className="h-4 w-4"
                        fill="#000000"
                        viewBox="-52.01 0 560.035 560.035"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M380.844 297.529c.787 84.752 74.349 112.955 75.164 113.314-.622 1.988-11.754 40.191-38.756 79.652-23.343 34.117-47.568 68.107-85.731 68.811-37.499.691-49.557-22.236-92.429-22.236-42.859 0-56.256 21.533-91.753 22.928-36.837 1.395-64.889-36.891-88.424-70.883-48.093-69.53-84.846-196.475-35.496-282.165 24.516-42.554 68.328-69.501 115.882-70.192 36.173-.69 70.315 24.336 92.429 24.336 22.1 0 63.59-30.096 107.208-25.676 18.26.76 69.517 7.376 102.429 55.552-2.652 1.644-61.159 35.704-60.523 106.559M310.369 89.418C329.926 65.745 343.089 32.79 339.498 0 311.308 1.133 277.22 18.785 257 42.445c-18.121 20.952-33.991 54.487-29.709 86.628 31.421 2.431 63.52-15.967 83.078-39.655" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="">Browser</div>
                    <div className="flex items-center gap-2">
                      <span>Chrome</span>
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 1024 1024"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlSpace="preserve"
                      >
                        <path
                          d="M938.67 512.01c0-44.59-6.82-87.6-19.54-128H682.67a212.372 212.372 0 0 1 42.67 128c.06 38.71-10.45 76.7-30.42 109.87l-182.91 316.8c235.65-.01 426.66-191.02 426.66-426.67z"
                          fill="#000000"
                        />
                        <path
                          d="M576.79 401.63a127.92 127.92 0 0 0-63.56-17.6c-22.36-.22-44.39 5.43-63.89 16.38s-35.79 26.82-47.25 46.02a128.005 128.005 0 0 0-2.16 127.44l1.24 2.13a127.906 127.906 0 0 0 46.36 46.61 127.907 127.907 0 0 0 63.38 17.44c22.29.2 44.24-5.43 63.68-16.33a127.94 127.94 0 0 0 47.16-45.79v-.01l1.11-1.92a127.984 127.984 0 0 0 .29-127.46 127.957 127.957 0 0 0-46.36-46.91z"
                          fill="#000000"
                        />
                        <path
                          d="M394.45 333.96A213.336 213.336 0 0 1 512 298.67h369.58A426.503 426.503 0 0 0 512 85.34a425.598 425.598 0 0 0-171.74 35.98 425.644 425.644 0 0 0-142.62 102.22l118.14 204.63a213.397 213.397 0 0 1 78.67-94.21zm117.56 604.72H512zm-97.25-236.73a213.284 213.284 0 0 1-89.54-86.81L142.48 298.6c-36.35 62.81-57.13 135.68-57.13 213.42 0 203.81 142.93 374.22 333.95 416.55h.04l118.19-204.71a213.315 213.315 0 0 1-122.77-21.91z"
                          fill="#000000"
                        />
                      </svg>{" "}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="  ">Dimensions</div>
                    <div className="flex items-center gap-2">
                      <span>1440 x 900</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
