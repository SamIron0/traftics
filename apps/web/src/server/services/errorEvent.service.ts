import { createClient } from "@/utils/supabase/server";
import { ErrorType } from "@/types/error";
import { SessionEventService } from "./sessionEvent.service";

interface ErrorEvent {
  session_id: string;
  error_type: ErrorType;
  message: string;
  stack?: string;
  metadata?: {
    lineNumber?: number;
    columnNumber?: number;
    fileName?: string;
    resourceType?: string;
    url?: string;
    status?: number;
  };
  timestamp: string;
}

export class ErrorEventService {
  static async storeErrorEvent(event: ErrorEvent): Promise<void> {
    const supabase = await createClient();
    
    // Store in error_events table
    const { error: errorEventsError } = await supabase
      .from("error_events")
      .insert([{
        session_id: event.session_id,
        error_message: event.message,
        stack_trace: event.stack,
        error_type: event.error_type,
        file_name: event.metadata?.fileName,
        line_number: event.metadata?.lineNumber,
        column_number: event.metadata?.columnNumber,
        timestamp: event.timestamp
      }]);

    if (errorEventsError) throw errorEventsError;

    // Store in session_events table
    await SessionEventService.storeEvent({
      session_id: event.session_id,
      event_type: "error",
      timestamp: event.timestamp,
      data: {
        error_type: event.error_type,
        message: event.message,
        stack: event.stack,
        metadata: event.metadata
      }
    });
  }
} 