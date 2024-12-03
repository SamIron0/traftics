import { Session } from "@/types/api";
import { createClient } from "@/utils/supabase/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Heatmap } from "types";
interface AppState {
  orgId: string | null;
  orgSlug: string | null;
  projectId: string | null;
  projectSlug: string | null;
  defaultDashboardId: string | null;
  isLoading: boolean;
  sessions: Session[];
  heatmaps: Heatmap[];
  setOrg: (orgId: string, orgSlug: string) => void;
  setProject: (projectId: string, projectSlug: string) => void;
  setDefaultDashboard: (dashboardId: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  initializeState: () => Promise<void>;
  setSessions: (sessions: Session[]) => void;
  setHeatmaps: (heatmaps: Heatmap[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      orgId: null,
      orgSlug: null,
      projectId: null,
      projectSlug: null,
      defaultDashboardId: null,
      isLoading: true,
      sessions: [],
      heatmaps: [],
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
        }),
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
              organizations!inner(slug),
              websites!fk_active_project(slug)
            `
            )
            .eq("user_id", user.id)
            .single();

          if (profile?.organizations?.slug && profile?.websites?.slug) {
            // Get the default dashboard for the active project
            const { data: defaultDashboard, error } = await supabase
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
            });
          }
        } catch (error) {
          console.error("Error initializing state:", error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "app-storage",
    }
  )
);
