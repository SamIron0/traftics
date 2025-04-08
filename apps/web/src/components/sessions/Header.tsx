import { Button } from "@/components/ui/button";
import { ArrowLeft, SkipBack, SkipForward } from "lucide-react";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animation-variants";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HeaderProps {
  onBack: () => void;
  onPreviousSession?: () => void;
  onNextSession?: () => void;
  hasPreviousSession?: boolean;
  hasNextSession?: boolean;
  currentSessionIndex?: number;
  totalSessions?: number;
}

export function Header({
  onBack,
  onPreviousSession,
  onNextSession,
  hasPreviousSession,
  hasNextSession,
  currentSessionIndex,
  totalSessions,
}: HeaderProps) {
  return (
    <header className="flex items-center border-b px-4 py-2 bg-white">
      <div className="flex items-center gap-4">
        <motion.img
          src="/logo.svg"
          alt="logo"
          className="mx-auto h-10 w-10"
          variants={itemVariants}
        />
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPreviousSession}
              disabled={!hasPreviousSession}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Previous session</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNextSession}
              disabled={!hasNextSession}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Next session</TooltipContent>
        </Tooltip>
        <div className="text-sm">
          {(currentSessionIndex ?? 0) + 1} / {totalSessions} sessions
        </div>
      </div>
    </header>
  );
} 