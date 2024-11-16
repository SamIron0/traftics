import { RecordedEvent } from "@/types";
import React, { useState, useEffect } from "react";

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

  useEffect(() => {
    // Load session data
    const loadSession = async () => {
      const response = await fetch(`/api/sessions/${sessionId}`);
      const { session, events } = await response.json();

      setState((prev) => ({
        ...prev,
        events,
        duration: session.duration,
      }));
    };

    loadSession();
  }, [sessionId]);

  // Implement playback logic
  useEffect(() => {
    if (!state.isPlaying) return;

    const interval = setInterval(() => {
      setState((prev) => {
        const newTime = prev.currentTime + 100;
        return {
          ...prev,
          currentTime: Math.min(newTime, prev.duration),
          isPlaying: newTime < prev.duration,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [state.isPlaying]);


  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <iframe
          className="w-full h-full"
          src={""}
          sandbox="allow-same-origin"
        />
      </div>
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
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              currentTime: Number(e.target.value),
            }))
          }
          className="ml-4 w-96"
        />
      </div>
    </div>
  );
}
