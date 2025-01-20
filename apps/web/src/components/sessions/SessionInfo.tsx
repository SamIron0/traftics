"use client";

import {
  X,
  ChevronLeft,
  MousePointer2,
  MousePointerClick,
  TextCursorInput,
  RefreshCcw,
  CornerUpLeft,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import getCountryFlag from "country-flag-icons/unicode";
import { Session } from "@/types/api";
import { Event } from "@/types/event";
interface SessionInfoProps {
  isOpen: boolean;
  onToggle: () => void;
  session: Session;
  specialEvents: Event[];
}

interface ActionCount {
  icon: React.ReactNode;
  label: string;
  count: number;
}

const getIconBackground = (label: string) => {
  switch (label) {
    case "Clicks":
      return "bg-gray-300";
    case "Text input":
      return "bg-green-300";
    case "Rage clicks":
      return "bg-yellow-300";
    case "U-turns":
      return "bg-indigo-300";
    case "Refresh":
      return "bg-purple-300";
    case "Errors":
      return "bg-red-300";
    default:
      return "bg-gray-300";
  }
};

export function SessionInfo({
  isOpen,
  onToggle,
  session,
  specialEvents,
}: SessionInfoProps) {
  const actions: ActionCount[] = [
    {
      icon: <MousePointer2 className="w-4 h-4" />,
      label: "Clicks",
      count: specialEvents.filter((event) => event.event_type === "click")
        .length,
    },
    {
      icon: <TextCursorInput className="w-4 h-4" />,
      label: "Text input",
      count: specialEvents.filter((event) => event.event_type === "input")
        .length,
    },
    {
      icon: <MousePointerClick className="w-4 h-4" />,
      label: "Rage clicks",
      count: specialEvents.filter((event) => event.event_type === "rage_click")
        .length,
    },
    {
      icon: <CornerUpLeft className="w-4 h-4" />,
      label: "U-turns",
      count: specialEvents.filter((event) => event.event_type === "uturn")
        .length,
    },
    {
      icon: <RefreshCcw className="w-4 h-4" />,
      label: "Refresh",
      count: specialEvents.filter((event) => event.event_type === "refresh")
        .length,
    },
    {
      icon: <AlertCircle className="w-4 h-4" />,
      label: "Errors",
      count: specialEvents.filter((event) => event.event_type === "error")
        .length,
    },
  ];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${formatDistanceToNow(date, {
      addSuffix: true,
    })} - ${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })}`;
  };

  return (
    <div
      className={cn(
        "fixed right-0 top-[57px] bg-white border-l border-gray-200 transition-all duration-300 z-30",
        isOpen ? "w-80" : "w-10",
        "bottom-20"
      )}
    >
      {isOpen ? (
        <div className="h-full flex flex-col">
          <div className="flex-1">
            <Tabs defaultValue="info" className="w-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={onToggle}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <TabsContent value="actions" className="-mx-4 px-4">
                <div className="grid grid-cols-2 gap-4 p-4">
                  {actions.map((action) => (
                    <div
                      key={action.label}
                      className="flex flex-col p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-row justify-between">
                        <div
                          className={`mb-2 p-2 rounded-md ${getIconBackground(
                            action.label
                          )}`}
                        >
                          <div className={"text-black"}>{action.icon}</div>
                        </div>
                        <div className="text-lg font-semibold">
                          {action.count}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {action.label}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="info" className="-mx-4 px-4">
                <div className="p-4 space-y-4 text-sm">
                  <div>
                    <div className="text-sm text-gray-500">Session ID</div>
                    <div className="font-mono">{session.id.slice(0, 8)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {session.location?.country
                          ? getCountryFlag(
                              session.location.country.toUpperCase()
                            )
                          : "🏳️"}
                      </span>
                      {session.location?.country || "Unknown"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Time</div>
                    <div>
                      {session.started_at
                        ? formatDate(session.started_at)
                        : "Unknown"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Device</div>
                    <div>
                      {session.device?.type ||
                        session.device?.vendor ||
                        "Unknown"}{" "}
                      ({session.screen_width} × {session.screen_height})
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Browser</div>
                    <div>
                      {session.browser?.name}{" "}
                      {session.browser?.version || "Unknown"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">OS</div>
                    <div>
                      {session.os?.name} {session.os?.version || "Unknown"}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-10 rounded-none"
          onClick={onToggle}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
