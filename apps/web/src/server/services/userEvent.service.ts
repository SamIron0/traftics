import { createClient } from "@/utils/supabase/server";
import { incrementalData } from "@rrweb/types";

export class UserEventService {
  static async storeUserEvent(event: {
    session_id: string;
    event_type:  number;
    timestamp: string;
    event_data: incrementalData | null;
  }): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("user_events")
      .insert([event]);

    if (error) throw error;
  }
} 