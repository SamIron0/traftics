"use client";

import React, { useRef, useState } from "react";
import { Controller } from "./Controller";
import { SessionInfo } from "./SessionInfo";
import { Session } from "@/types/api";
import { eventWithTime } from "@rrweb/types";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { URLBar } from "./URLBar";
import { Console } from "./Console";
import { useReplayer } from "@/hooks/useReplayer";
import { useViewportScaling } from "@/hooks/useViewportScaling";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import { useSessionData } from "@/hooks/useSessionData";
import { getRelativeTimestamp } from "@/utils/helpers";

interface Props {
  session: Session & { events: eventWithTime[] };
  onNextSession?: () => void;
  onPreviousSession?: () => void;
  hasNextSession?: boolean;
  hasPreviousSession?: boolean;
  currentSessionIndex?: number;
  totalSessions?: number;
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
  const [isSessionInfoOpen, setIsSessionInfoOpen] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [sliderValue, setSliderValue] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [skipInactive, setSkipInactive] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const {
    pages,
    selectedPageIndex,
    setSelectedPageIndex,
    specialEvents,
    errors,
    updateSelectedPage,
  } = useSessionData({ session });

  const { replayer, isPlaying, handlePlayPause, handleJump, seekTo } = useReplayer({
    session,
    wrapperRef,
    skipInactive,
    playbackSpeed,
    onTimeUpdate: (time) => {
      setSliderValue(time);
      updateSelectedPage(time);
    },
  });

  useViewportScaling({
    session,
    wrapperRef,
    replayer,
    isSessionInfoOpen,
  });

  useKeyboardControls({
    onJump: handleJump,
    onPlayPause: handlePlayPause,
  });

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("mode");
    params.delete("sessionId");
    router.push(`?${params.toString()}`);
  };

  const handleSkipInactive = () => {
    if (!replayer) return;
    replayer.setConfig({ skipInactive: !skipInactive });
    setSkipInactive(!skipInactive);
  };

  const handleSpeedChange = (speed: number) => {
    if (!replayer) return;
    replayer.setConfig({ speed });
    setPlaybackSpeed(speed);
  };

  const handleSliderChange = (value: number[]) => {
    seekTo(value[0]);
  };

  const handlePageSelect = (index: number) => {
    setSelectedPageIndex(index);
  };

  const handleTimeUpdate = (timestamp: string) => {
    const relativeTime = getRelativeTimestamp(timestamp, session.started_at || 0);
    seekTo(relativeTime);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header
        onBack={handleBack}
        onPreviousSession={onPreviousSession}
        onNextSession={onNextSession}
        hasPreviousSession={hasPreviousSession}
        hasNextSession={hasNextSession}
        currentSessionIndex={currentSessionIndex}
        totalSessions={totalSessions}
      />

      <URLBar
        pages={pages}
        selectedPageIndex={selectedPageIndex}
        onPageSelect={handlePageSelect}
        onTimeUpdate={handleTimeUpdate}
      />

      {isConsoleOpen && (
        <Console
          errors={errors}
          onClose={() => setIsConsoleOpen(false)}
          onTimeUpdate={seekTo}
          sessionStartTime={new Date(session.started_at || 0).getTime()}
        />
      )}

      <Controller
        onConsoleToggle={() => setIsConsoleOpen(!isConsoleOpen)}
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
        specialEvents={specialEvents}
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
