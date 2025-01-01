import { createClient } from "@/utils/supabase/server";

export class NetworkEventService {
  static async storeNetworkEvent(event: {
    session_id: string;
    request_url: string;
    status_code: number;
    method: string;
    response_time: number;
    is_successful: boolean;
    timestamp: string;
  }): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("network_events")
      .insert([event]);

    if (error) throw error;
  }
} 