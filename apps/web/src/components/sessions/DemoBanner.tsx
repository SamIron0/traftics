import { X } from "lucide-react";
import { useState } from "react";

export default function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-medium text-sm">Try it out!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Visit <a href="https://remeal.xyz" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-800">remeal.xyz</a> in another tab and watch your session appear in real-time in this list. Experience the power of Traftics firsthand.
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}