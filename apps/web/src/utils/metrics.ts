import { Session } from "@/types/api";
import { formatPlayerTime } from "./format";

export function calculateAverageSessionDuration(sessions: Session[]): string {
  if (!sessions.length) return "0:00";
  
  const totalDuration = sessions.reduce((acc, session) => {
    return acc + (session.duration || 0);
  }, 0); 
  
  const averageDuration = Math.floor(totalDuration / sessions.length);
  return formatPlayerTime(averageDuration);
} 