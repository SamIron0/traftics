import { Session } from "@/types/api";
import { formatDistanceToNow, format} from "date-fns";
import { Monitor, Globe, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPlayerTime } from "@/utils/helpers";
import { eventWithTime } from "@rrweb/types";

interface Props {
  session: Session;
}

export function SessionInfo({session }: Props) {
  
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Session Info</h2>
          <span className="text-sm text-muted-foreground">
            {session.started_at ? formatDistanceToNow(new Date(session.started_at), { addSuffix: true }) : "N/A"}
          </span>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Location</p>
              <p className="text-sm text-muted-foreground">
                {session.location?.country || 'Unknown'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">System</p>
              <p className="text-sm text-muted-foreground">
                {session.os?.name} {session.os?.version} / {session.browser?.name} {session.browser?.version}
              </p>
              <p className="text-sm text-muted-foreground">
                {session.screen_width}x{session.screen_height}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Timing</p>
              <p className="text-sm text-muted-foreground">
                Started: {session.started_at ? format(new Date(session.started_at), 'PPpp') : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">
                Duration: {formatPlayerTime(session.duration || 0)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 