import { useEffect } from "react";

interface UseKeyboardControlsProps {
  onJump: (seconds: number) => void;
  onPlayPause: () => void;
}

export function useKeyboardControls({
  onJump,
  onPlayPause,
}: UseKeyboardControlsProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return; // Don't trigger when typing in inputs

      switch (e.key) {
        case "ArrowLeft":
          onJump(-10);
          break;
        case "ArrowRight":
          onJump(10);
          break;
        case " ": // Spacebar
          e.preventDefault();
          onPlayPause();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onJump, onPlayPause]);
} 