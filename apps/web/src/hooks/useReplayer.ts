import { useCallback, useEffect, useState } from "react";
import { Replayer } from "rrweb";
import { eventWithTime } from "@rrweb/types";
import { Session } from "@/types/api";

interface UseReplayerProps {
  session: Session & { events: eventWithTime[] };
  wrapperRef: React.RefObject<HTMLDivElement>;
  skipInactive: boolean;
  playbackSpeed: number;
  onTimeUpdate?: (time: number) => void;
}

export function useReplayer({
  session,
  wrapperRef,
  skipInactive,
  playbackSpeed,
  onTimeUpdate,
}: UseReplayerProps) {
  const [replayer, setReplayer] = useState<Replayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!wrapperRef.current || !session.events.length) return;

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

    // Store the replayer instance
    setReplayer(replayerInstance);

    // Event listener for replayer state updates
    const timer = setInterval(() => {
      if (!replayerInstance) return;

      const currentTime = replayerInstance.getCurrentTime();
      onTimeUpdate?.(currentTime);

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

  const handleJump = useCallback(
    (seconds: number) => {
      if (!replayer) return;
      const currentTime = replayer.getCurrentTime();
      const newTime = Math.max(
        0,
        Math.min(currentTime + seconds * 1000, session.duration || 0)
      );
      replayer.play(newTime);
      onTimeUpdate?.(newTime);
      setIsPlaying(true);
    },
    [replayer, session.duration, onTimeUpdate]
  );

  const seekTo = useCallback(
    (time: number) => {
      if (!replayer) return;
      replayer.pause();
      replayer.play(time);
      onTimeUpdate?.(time);
      setIsPlaying(true);
    },
    [replayer, onTimeUpdate]
  );

  return {
    replayer,
    isPlaying,
    handlePlayPause,
    handleJump,
    seekTo,
  };
} 