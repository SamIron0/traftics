import { Session } from "@/types/api";
import { createClient } from "@/utils/supabase/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Heatmap } from "types";
import { eventWithTime } from "@rrweb/types";

interface AppState {
  orgId: string | null;
  orgSlug: string | null;
  projectId: string | null;
  projectSlug: string | null;
  isLoading: boolean;
  sessions: Session[];
  heatmaps: Heatmap[];
  isWebsiteVerified: boolean;
  defaultDashboardId: string | null;
  activeHeatmapId: string | null;
  activeHeatmapSlug: string | null;
  setOrg: (orgId: string, orgSlug: string) => void;
  setProject: (projectId: string, projectSlug: string) => void;
  setDefaultDashboard: (dashboardId: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  initializeState: () => Promise<void>;
  setSessions: (sessions: Session[]) => void;
  setHeatmaps: (heatmaps: Heatmap[]) => void;
  setWebsiteVerified: (status: boolean) => void;
  fetchHeatmaps: () => Promise<void>;
  setActiveHeatmap: (
    heatmapId: string | null,
    heatmapSlug: string | null
  ) => void;
  events: Record<string, eventWithTime[]>;
  setEvents: (heatmapId: string, events: eventWithTime[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      orgId: null,
      orgSlug: null,
      projectId: null,
      projectSlug: null,
      defaultDashboardId: null,
      isLoading: true,
      sessions: [],
      heatmaps: [],
      isWebsiteVerified: false,
      activeHeatmapId: null,
      activeHeatmapSlug: null,
      setOrg: (orgId: string, orgSlug: string) => set({ orgId, orgSlug }),
      setProject: (projectId: string, projectSlug: string) =>
        set({ projectId, projectSlug }),
      setDefaultDashboard: (dashboardId: string) =>
        set({ defaultDashboardId: dashboardId }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setSessions: (sessions: Session[]) => set({ sessions }),
      setHeatmaps: (heatmaps: Heatmap[]) => set({ heatmaps }),
      reset: () =>
        set({
          orgId: null,
          orgSlug: null,
          projectId: null,
          projectSlug: null,
          defaultDashboardId: null,
          activeHeatmapId: null,
          activeHeatmapSlug: null,
        }),
      fetchHeatmaps: async () => {
        try {
          const response = await fetch("/api/heatmaps");
          if (!response.ok) throw new Error("Failed to fetch heatmaps");
          const data = await response.json();
          set({ heatmaps: data.heatmaps });
        } catch (error) {
          console.error("Error fetching heatmaps:", error);
        }
      },
      initializeState: async () => {
        const supabase = createClient();
        try {
          set({ isLoading: true });
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            set({ isLoading: false });
            return;
          }

          const { data: profile } = await supabase
            .from("user_profiles")
            .select(
              `
              org_id,
              active_project_id,
              active_heatmap_id,
              organizations!inner(slug),
              websites!fk_active_project(slug),
              heatmaps!fk_active_heatmap(slug)
            `
            )
            .eq("user_id", user.id)
            .single();

          if (profile?.organizations?.slug && profile?.websites?.slug) {
            // Get the default dashboard for the active project
            const { data: defaultDashboard } = await supabase
              .from("dashboards")
              .select("id")
              .eq("website_id", profile.active_project_id || "")
              .order("created_at", { ascending: true })
              .limit(1)
              .single();
            set({
              orgId: profile.org_id,
              orgSlug: profile.organizations.slug,
              projectId: profile.active_project_id,
              projectSlug: profile.websites.slug,
              defaultDashboardId: defaultDashboard?.id || null,
              activeHeatmapId: profile.active_heatmap_id,
              activeHeatmapSlug: profile.heatmaps?.slug || null,
            });
          }

          if (profile?.active_project_id) {
            const { data: website } = await supabase
              .from("websites")
              .select("verified")
              .eq("id", profile.active_project_id)
              .single();

            set({ isWebsiteVerified: website?.verified || false });
          }
        } catch (error) {
          console.error("Error initializing state:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      setWebsiteVerified: (status: boolean) =>
        set({ isWebsiteVerified: status }),
      setActiveHeatmap: (
        heatmapId: string | null,
        heatmapSlug: string | null
      ) => set({ activeHeatmapId: heatmapId, activeHeatmapSlug: heatmapSlug }),
      events: {},
      setEvents: (heatmapId, events) =>
        set((state) => ({
          events: {
            ...state.events,
            [heatmapId]: events,
          },
        })),
    }),
    {
      name: "app-storage",
    }
  )
);
