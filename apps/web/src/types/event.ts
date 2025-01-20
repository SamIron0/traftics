export type Event = {
  id: string;
  timestamp: string;
  event_type:
    | "click"
    | "scroll"
    | "rage_click"
    | "refresh"
    | "selection"
    | "uturn"
    | "window_resize"
    | "input"
    | "error";
  data?: {
    startTime?: number;
    endTime?: number;
    value?: string;
    element?: number;
  };
};
