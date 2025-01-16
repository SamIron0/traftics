import { createClient } from "@/utils/supabase/server";
import { ErrorType } from "@/types/error";

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
    const { error } = await supabase
      .from("console_errors")
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

    if (error) throw error;
  }
} 