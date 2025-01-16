"use client";

import React, { useState } from "react";
import { CustomSlider } from "./CustomSlider";
import { X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const sampleEvents = [
  { id: "1", timestamp: 1000, type: "click" as const },
  { id: "2", timestamp: 3000, type: "refresh" as const },
  { id: "3", startTime: 5000, endTime: 6000, type: "input" as const },
  { id: "4", timestamp: 7000, type: "rageClick" as const },
  { id: "5", timestamp: 9000, type: "refresh" as const },
  { id: "6", timestamp: 11000, type: "selection" as const },
  { id: "7", timestamp: 13000, type: "uturn" as const },
  { id: "8", timestamp: 14000, type: "windowResize" as const },
  { id: "9", timestamp: 15000, type: "scroll" as const },
];

const sampleErrors = [
  {
    id: 1,
    timestamp: 4500,
    message: "GET https://ipinfo.io/json?token=0d420c2f8c5887",
    subMessage: "net::ERR_BLOCKED_BY_CLIENT",
    stack: `Failed to fetch location: TypeError: Failed to fetch
    at t.PerformanceService.<anonymous> (tracker.js:2:10845)
    at Generator.next (<anonymous>)
    at tracker.js:2:7798
    at new Promise (<anonymous>)
    at r (tracker.js:2:7543)
    at window.fetch (tracker.js:2:10633)
    at d.<anonymous> (tracker.js:2:6194)
    at Generator.next (<anonymous>)
    at tracker.js:2:1228
    at new Promise (<anonymous>)`,
  },
  {
    id: 2,
    timestamp: 10500,
    message:
      "Uncaught TypeError: Cannot read properties of undefined (reading 'length')",
    stack: `TypeError: Cannot read properties of undefined (reading 'length')
    at getArrayLength (app.js:10:20)
    at processArray (app.js:15:22)
    at handleUserInput (app.js:25:10)
    at HTMLButtonElement.onclick (index.html:30:75)`,
  },
];

const EmptyConsole = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-400">
    <p className="text-sm">No errors to display</p>
    <p className="text-xs">Errors will appear here when they occur</p>
  </div>
);

export default function Home() {
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [expandedErrors, setExpandedErrors] = useState<number[]>([]);

  const toggleConsole = () => {
    setIsConsoleOpen((prev) => !prev);
  };

  const toggleError = (errorId: number) => {
    setExpandedErrors((prev) =>
      prev.includes(errorId)
        ? prev.filter((id) => id !== errorId)
        : [...prev, errorId]
    );
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-grow p-4">
        <h1 className="text-2xl font-bold mb-4">Custom Slider Demo</h1>
        <p>Interact with the slider at the bottom of the page.</p>
      </div>

      {isConsoleOpen && (
        <div className="fixed bottom-20 left-0 right-0 bg-[#242424] text-white h-72 overflow-y-auto">
          <div className="flex justify-between items-center mb-2 border-b border-gray-700 px-4 py-2">
            <h2 className="text-sm font-semibold text-gray-300">Console</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleConsole}
              className="text-gray-400 hover:text-white"
              aria-label="Close console"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="font-mono text-[13px] space-y-2 px-4 pb-4">
            {sampleErrors.length === 0 ? (
              <EmptyConsole />
            ) : (
              sampleErrors.map((error) => (
                <div key={error.id} className="group">
                  <div
                    className="flex items-start gap-2 cursor-pointer"
                    onClick={() => toggleError(error.id)}
                  >
                    <button
                      className="mt-1 p-0.5 hover:bg-gray-700 rounded"
                      aria-label={
                        expandedErrors.includes(error.id)
                          ? "Collapse error"
                          : "Expand error"
                      }
                    >
                      <ChevronRight
                        className={`h-3 w-3 transition-transform ${
                          expandedErrors.includes(error.id) ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    <div className="flex-grow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-red-400 flex items-start gap-1">
                          <span>×</span>
                          <span>{error.message}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const event = new CustomEvent("jumpToTime", {
                              detail: error.timestamp,
                            });
                            window.dispatchEvent(event);
                          }}
                          className="text-gray-500 hover:text-gray-300 whitespace-nowrap text-xs mt-0.5"
                        >
                          {formatTime(error.timestamp)}
                        </button>
                      </div>
                      {error.subMessage && (
                        <div className="text-red-400 ml-3">
                          {error.subMessage}
                        </div>
                      )}
                      {expandedErrors.includes(error.id) && (
                        <pre className="mt-2 text-[#8B949E] whitespace-pre-wrap ml-3">
                          {error.stack}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <CustomSlider
        totalDuration={15000}
        events={sampleEvents}
        errors={sampleErrors}
        onConsoleToggle={toggleConsole}
      />
    </div>
  );
}
