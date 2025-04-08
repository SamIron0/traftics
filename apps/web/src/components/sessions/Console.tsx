import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronRight } from "lucide-react";
import { formatTime } from "@/utils/helpers";

interface Error {
  id: string;
  error_message: string;
  stack_trace: string | null;
  error_type: string;
  file_name: string | null;
  line_number: number | null;
  column_number: number | null;
  timestamp: string;
}

interface ConsoleProps {
  errors: Error[];
  onClose: () => void;
  onTimeUpdate: (timestamp: number) => void;
  sessionStartTime: number;
}

const EmptyConsole = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-400">
    <p className="text-sm">No errors to display</p>
    <p className="text-xs">Errors will appear here when they occur</p>
  </div>
);

export function Console({
  errors,
  onClose,
  onTimeUpdate,
  sessionStartTime,
}: ConsoleProps) {
  const [expandedErrors, setExpandedErrors] = useState<string[]>([]);

  const toggleError = (errorId: string) => {
    setExpandedErrors((prev) =>
      prev.includes(errorId)
        ? prev.filter((id) => id !== errorId)
        : [...prev, errorId]
    );
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 bg-[#242424] text-white h-72 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-2 border-b border-gray-700 px-4 py-2">
        <h2 className="text-sm font-semibold text-gray-300">Console</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
          aria-label="Close console"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="font-mono text-[13px] space-y-2 px-4 pb-4">
        {errors.length === 0 ? (
          <EmptyConsole />
        ) : (
          errors.map((error) => (
            <div key={error.id} className="group">
              <div
                className="flex items-start gap-2 cursor-pointer"
                onClick={() => toggleError(error.id)}
              >
                <button
                  className="mt-1 p-0.5 hover:bg-gray-700 rounded flex-shrink-0"
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
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-red-400 flex items-start gap-1 min-w-0">
                      <span className="flex-shrink-0">×</span>
                      <span className="truncate">{error.error_message}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const timestamp =
                          new Date(error.timestamp).getTime() - sessionStartTime;
                        onTimeUpdate(timestamp);
                      }}
                      className="text-gray-500 hover:text-gray-300 whitespace-nowrap text-xs mt-0.5 flex-shrink-0"
                    >
                      {formatTime(
                        new Date(error.timestamp).getTime() - sessionStartTime
                      )}
                    </button>
                  </div>
                  {error.file_name && (
                    <div className="text-red-400 ml-3 truncate">
                      at {error.file_name}:{error.line_number}:
                      {error.column_number}
                    </div>
                  )}
                  {expandedErrors.includes(error.id) && error.stack_trace && (
                    <pre className="mt-2 text-[#8B949E] whitespace-pre-wrap ml-3 break-words">
                      {error.stack_trace}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 