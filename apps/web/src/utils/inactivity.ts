import { EventType, eventWithTime, IncrementalSource } from "@rrweb/types";

export interface InactiveRange {
  start: number;
  end: number;
}

function isUserInteraction(event: eventWithTime): boolean {
  if (event.type !== EventType.IncrementalSnapshot) {
    return false;
  }
  return (
    event.data.source > IncrementalSource.Mutation &&
    event.data.source <= IncrementalSource.Input
  );
}

const SKIP_TIME_THRESHOLD = 10 * 1000;

export function getInactivePeriods(events: eventWithTime[]) {
  const inactivePeriods = [];
  let lastActiveTime = 0;
  for (const event of events) {
    if (!isUserInteraction(event)) continue;
    if (event.timestamp - lastActiveTime > SKIP_TIME_THRESHOLD) {
      inactivePeriods.push([lastActiveTime, event.timestamp]);
    }
    lastActiveTime = event.timestamp;
  }
  return inactivePeriods;
}
