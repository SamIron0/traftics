import { ServiceRequest, Session } from "@/types/api";
import { Json, Tables, TablesInsert } from "supabase/types";
import { HeatmapModel } from "../models/heatmap.model";
import { createClient } from "@/utils/supabase/server";
import { eventWithTime } from "@rrweb/types";

const BUCKET_NAME = "sessions";

interface DateRange {
  from: number;
  to: number;
}

interface HeatmapFilters {
  dateRange?: DateRange;
  deviceType?: 'all' | 'mobile' | 'desktop';
  city?: FilterGroup[];
  state?: FilterGroup[];
  country?: FilterGroup[];
}

interface FilterGroup {
  id: number;
  rows: FilterRow[];
}

interface FilterRow {
  id: number;
  condition?: string;
  value?: string;
}

interface HeatmapFilterParams {
  filters: Json | null;
  url_domain: string;
  url_protocol: string;
  url_match_type: string;
  use_history_data: boolean;
}

export class HeatmapService {
  static async createHeatmap(
    req: ServiceRequest,
    data: TablesInsert<"heatmaps">
  ): Promise<Tables<"heatmaps">> {
    // Validate required fields
    if (!data.name || !data.website_id || !data.url_domain) {
      throw new Error("Name, website ID, and URL domain are required");
    }

    // Validate URL format
    if (!this.isValidDomain(data.url_domain)) {
      throw new Error("Invalid domain format");
    }

    const supabase = await createClient();
    
    // Fetch all sessions for this website
    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("*")
      .eq("site_id", data.website_id);

    if (sessionsError) {
      throw new Error("Failed to fetch sessions");
    }

    if (!sessions?.length) {
      throw new Error("No sessions found");
    }

    if (!data.filters) {
      throw new Error("No filters found");
    }
    // Filter sessions based on heatmap criteria
    const filteredSessions = this.filterSessionsByHeatmap(sessions, {
      filters: data.filters,
      url_domain: data.url_domain,
      url_protocol: data.url_protocol,
      url_match_type: data.url_match_type,
      use_history_data: data.use_history_data || false
    });

    // Extract session IDs
    const selectedSessionIds = filteredSessions.map(session => session.id);

    if (!selectedSessionIds.length) {
      throw new Error("No matching sessions found for the specified filters");
    }

    // Create heatmap with selected session IDs
    return HeatmapModel.create(req, {
      ...data,
      selected_session_ids: selectedSessionIds
    });
  }

  static async getHeatmaps(req: ServiceRequest): Promise<Tables<"heatmaps">[]> {
    return HeatmapModel.findAll(req);
  }

  static async getHeatmap(
    req: ServiceRequest,
    id: string
  ): Promise<Tables<"heatmaps">> {
    const heatmap = await HeatmapModel.findOne(req, id);
    if (!heatmap) {
      throw new Error("Heatmap not found");
    }
    return heatmap;
  }

  static async deleteHeatmap(req: ServiceRequest, id: string): Promise<void> {
    const success = await HeatmapModel.delete(req, id);
    if (!success) {
      throw new Error("Failed to delete heatmap");
    }
  }

  static async getHeatmapEvents(req: ServiceRequest): Promise<eventWithTime[]> {
    const supabase = await createClient();
    
    if (!req.params?.heatmapId) {
      throw new Error("Heatmap ID is required");
    }
    
    const heatmap = await this.getHeatmap(req, req.params.heatmapId);
    
    // Fetch events only for selected sessions
    const allEvents: eventWithTime[] = [];
    
    for (const sessionId of heatmap.selected_session_ids || []) {
      try {
        const prefix = `${req.params.projectId}/${sessionId}/chunks/`;
        
        const { data: chunks, error: listError } = await supabase.storage
          .from(BUCKET_NAME)
          .list(prefix);

        if (listError) throw listError;

        const sessionEvents = await Promise.all(
          chunks.map(async (chunk) => {
            const { data, error } = await supabase.storage
              .from(BUCKET_NAME)
              .download(`${prefix}${chunk.name}`);

            if (error) throw error;
            return JSON.parse(await data.text()) as eventWithTime[];
          })
        ).then((chunkArrays) =>
          chunkArrays.flat().sort((a, b) => a.timestamp - b.timestamp)
        );

        allEvents.push(...sessionEvents);
      } catch (error) {
        console.error(`Error fetching events for session ${sessionId}:`, error);
        continue;
      }
    }

    return allEvents;
  }

  private static isValidDomain(domain: string): boolean {
    const pattern =
      /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return pattern.test(domain);
  }

  private static filterSessionsByHeatmap(
    sessions: Session[],
    filterParams: HeatmapFilterParams
  ): Session[] {
    return sessions.filter((session) => {
      // Apply filters based on filterParams.filters
      if (filterParams.filters) {
        const filters = filterParams.filters as HeatmapFilters;

        // Filter by date range
        if (filters.dateRange) {
          const sessionDate = new Date(session.started_at).getTime();
          if (
            sessionDate < filters.dateRange.from ||
            sessionDate > filters.dateRange.to
          ) {
            return false;
          }
        }

        // Filter by device type
        if (filters.deviceType && filters.deviceType !== "all") {
          const userAgent = session.user_agent.toLowerCase();
          if (
            filters.deviceType === "mobile" &&
            !userAgent.match(/mobile|android|iphone|ipad/i)
          ) {
            return false;
          }
          if (
            filters.deviceType === "desktop" &&
            userAgent.match(/mobile|android|iphone|ipad/i)
          ) {
            return false;
          }
        }

        // Filter by location data
        if (filters.city?.length) {
          // Implement city filtering logic
          // This would require city data in your sessions table
          // Add appropriate checks based on your data structure
        }

        if (filters.state?.length) {
          // Implement state filtering logic
        }

        if (filters.country?.length) {
          // Implement country filtering logic
        }
      }

      // URL matching
      if (filterParams.url_match_type === "simple") {
        // Simple match - exact domain match
        return true; // Implement your URL matching logic
      } else {
        // Advanced match - pattern matching
        // Implement pattern matching logic
      }

      return true;
    });
  }
}
