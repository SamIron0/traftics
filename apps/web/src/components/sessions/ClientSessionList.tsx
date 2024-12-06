import { Session } from "@/types/api";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTime } from "@/utils/format";

interface Props {
  sessions: Session[];
  onSelectSession: (sessionId: string) => void;
}

export function ClientSessionList({ sessions, onSelectSession }: Props) {
  const handleSessionClick = (sessionId: string) => {
    onSelectSession(sessionId);
  };
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Browser</TableHead>
              <TableHead>Screen Resolution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow
                key={session.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSessionClick(session.id)}
              >
                <TableCell>
                  {session.started_at ? formatDistanceToNow(new Date(session.started_at), {
                    addSuffix: true,
                  }) : "N/A"}
                </TableCell>
                <TableCell>{session.duration ? formatTime(session.duration) : "N/A"}</TableCell>
                <TableCell>{session.user_agent ? getBrowserInfo(session.user_agent) : "N/A"}</TableCell>
                <TableCell>
                  {session.screen_width} x{" "}
                  {session.screen_height}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function getBrowserInfo(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes("firefox")) {
    return "Firefox";
  } else if (ua.includes("chrome")) {
    return "Chrome";
  } else if (ua.includes("safari")) {
    return "Safari";
  } else if (ua.includes("edge")) {
    return "Edge";
  } else {
    return "Unknown";
  }
}