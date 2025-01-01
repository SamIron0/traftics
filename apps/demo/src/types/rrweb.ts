import { EventType, eventWithTime } from '@rrweb/types';

interface MetaEvent {
  type: EventType.Meta;
  data: {
    href: string;
    width: number;
    height: number;
  };
}

export type MetaEventWithTime = MetaEvent & eventWithTime;

export function isMetaEvent(event: eventWithTime): event is MetaEventWithTime {
  return event.type === EventType.Meta;
}

export function getEventUrl(event: eventWithTime): string | null {
  if (isMetaEvent(event)) {
    return event.data.href;
  }
  return null;
}