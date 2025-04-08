import { useCallback, useEffect, useState } from "react";
import { Replayer } from "rrweb";
import { EventType, IncrementalSource, eventWithTime, viewportResizeData } from "@rrweb/types";
import { Session } from "@/types/api";
import { getRelativeTimestamp } from "@/utils/helpers";

interface UseViewportScalingProps {
  session: Session & { events: eventWithTime[] };
  wrapperRef: React.RefObject<HTMLDivElement>;
  replayer: Replayer | null;
  isSessionInfoOpen: boolean;
}

export function useViewportScaling({
  session,
  wrapperRef,
  replayer,
  isSessionInfoOpen,
}: UseViewportScalingProps) {
  const [viewportResize, setViewportResize] = useState<eventWithTime[]>([]);

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
    const currentResizeEvent = viewportResize?.reduce((closest: eventWithTime | null, current: eventWithTime) => {
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
    wrapperRef,
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

  return {
    updateScale,
    viewportResize,
  };
} 