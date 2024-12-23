"use client"

interface StepIndicatorProps {
  score?: number
  type: 'frustration' | 'engagement';
}

export default function StepIndicator({ score = 0, type }: StepIndicatorProps) {
  const getColors = () => {
    const activeColor = type === 'frustration' ? "bg-red-500" : "bg-blue-500";
    const inactiveColor = type === 'frustration' ? "bg-pink-200" : "bg-blue-200";

    return (
      <div className="flex gap-1">
        <div
          className={`h-4 w-1.5 rounded-full transition-colors ${
            score >= 1 ? activeColor : inactiveColor
          }`}
        />
        <div
          className={`h-4 w-1.5 rounded-full transition-colors ${
            score >= 2 ? activeColor : inactiveColor
          }`}
        />
        <div
          className={`h-4 w-1.5 rounded-full transition-colors ${
            score >= 3 ? activeColor : inactiveColor
          }`}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2 w-full">
        <div className="flex gap-1">
          {getColors()}
        </div>
        <span className="text-sm font-medium">{score}</span>
      </div>
    </div>
  )
} 