import { RecordedEvent } from "@/types";
import * as rrweb from 'rrweb';
import React, { useState, useEffect, useRef } from "react";

interface PlayerState {
  currentTime: number;
  duration: number;
  events: RecordedEvent[];
  isPlaying: boolean;
}

export function SessionPlayer({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<PlayerState>({
    currentTime: 0,
    duration: 0,
    events: [],
    isPlaying: false,
  });
  
  const playerRef = useRef<HTMLDivElement>(null);
  const replayerRef = useRef<any>(null);

  useEffect(() => {
    const loadSession = async () => {
      const response = await fetch(`/api/sessions/${sessionId}`);
      const { session, events } = await response.json();

      setState((prev) => ({
        ...prev,
        events,
        duration: session.duration,
      }));

      if (playerRef.current && events.length > 0) {
        replayerRef.current = new rrweb.Replayer(events, {
          root: playerRef.current,
          skipInactive: true,
        });
      }
    };

    loadSession();

    return () => {
      if (replayerRef.current) {
        replayerRef.current.destroy();
      }
    };
  }, [sessionId]);

  useEffect(() => {
    if (!replayerRef.current || !state.isPlaying) return;

    replayerRef.current.play();

    return () => {
      if (replayerRef.current) {
        replayerRef.current.pause();
      }
    };
  }, [state.isPlaying]);

  const handleTimeUpdate = (time: number) => {
    setState(prev => ({
      ...prev,
      currentTime: time,
    }));
    if (replayerRef.current) {
      replayerRef.current.goto(time);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative" ref={playerRef} />
      <div className="h-20 border-t p-4">
        <button
          onClick={() =>
            setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
          }
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {state.isPlaying ? "Pause" : "Play"}
        </button>
        <input
          type="range"
          min={0}
          max={state.duration}
          value={state.currentTime}
          onChange={(e) => handleTimeUpdate(Number(e.target.value))}
          className="ml-4 w-96"
        />
      </div>
    </div>
  );
}
