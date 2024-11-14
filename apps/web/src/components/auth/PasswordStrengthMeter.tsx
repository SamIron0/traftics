import React from "react";
import { Info } from "lucide-react";

interface Props {
  password: string;
}

export function PasswordStrengthMeter({ password }: Props) {
  const getStrength = () => {
    let score = 0;
    if (!password) return score;

    // Award 25 points for every 2 characters, up to 8 characters (100 points)
    const lengthScore = Math.min(Math.floor(password.length / 2) * 25, 100);
    score = lengthScore;

    return score;
  };

  const strength = getStrength();
  const getLabel = () => {
    if (strength === 0) return "";
    if (strength <= 25) return "Weak";
    if (strength <= 50) return "Fair";
    if (strength <= 75) return "Good";
    return "Strong";
  };

  const getColor = () => {
    if (strength <= 25) return "bg-red-500";
    if (strength <= 50) return "bg-yellow-500";
    if (strength <= 75) return "bg-green-500";
    return "bg-green-500";
  };

  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${strength}%` }}
        />
      </div>
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <span>{getLabel()}</span>
        <span className="flex gap-1 items-center">
          <Info className="h-3 w-3" />
          <span>Password must be at least 8 characters</span>
        </span>
      </div>
    </div>
  );
}
