import { Session } from "@/types/api";
import { createClient } from "@/utils/supabase/client";
import { Tables } from "supabase/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  full_name: string;
  orgId: string | null;
  orgSlug: string | null;
  projectId: string | null;
  projectSlug: string | null;
  allProjects: Partial<Tables<'websites'>>[];
  isLoading: boolean;
  sessions: Session[];
  isWebsiteVerified: boolean;
  defaultDashboardId: string | null;
  subscriptionStatus: Tables<'subscriptions'>['status'] | null;
  setOrg: (orgId: string, orgSlug: string) => void;
  setProject: (projectId: string, projectSlug: string) => void;
  setDefaultDashboard: (dashboardId: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  initializeState: () => Promise<void>;
  setSessions: (sessions: Session[]) => void;
  setWebsiteVerified: (status: boolean) => void;
  setSubscriptionStatus: (status: Tables<'subscriptions'>['status']) => void;
  checkSubscriptionStatus: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      full_name: "",
      orgId: null,
      orgSlug: null,
      projectId: null,
      projectSlug: null,
      allProjects: [],
      defaultDashboardId: null,
      isLoading: true,
      sessions: [],
      isWebsiteVerified: false,
      subscriptionStatus: null,
      setOrg: (orgId: string, orgSlug: string) => set({ orgId, orgSlug }),
      setProject: (projectId: string, projectSlug: string) =>
        set({ projectId, projectSlug }),
      setDefaultDashboard: (dashboardId: string) =>
        set({ defaultDashboardId: dashboardId }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setSessions: (sessions: Session[]) => set({ sessions }),
      reset: () =>
        set({
          orgId: null,
          orgSlug: null,
          projectId: null,
          projectSlug: null,
          defaultDashboardId: null,
          allProjects: [],
        }),

      initializeState: async () => {
        const supabase = createClient();
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          const user_id = user?.id || "22acab5b-c6fd-4eef-b456-29d7fd4753a7";

          const { data: profile } = await supabase
            .from("user_profiles")
            .select(
              `
              full_name,
              org_id,
              active_project_id,
              organizations!inner(slug),
              websites!fk_active_project(slug)
              `
            )
            .eq("user_id", user_id)
            .single();

          if (profile?.organizations?.slug && profile?.websites?.slug && profile?.org_id) {
            // Get all projects first
            const { data: allProjects } = await supabase
              .from("websites")
              .select("id, name")
              .eq("org_id", profile.org_id)
              .order("created_at", { ascending: true });

            // Set projects and projectId immediately
            set({
              allProjects: allProjects || [],
              projectId: profile.active_project_id,
            });

            // Set isLoading to false before continuing with other state updates
            set({ isLoading: false });

            // Get the default dashboard for the active project
            const { data: defaultDashboard } = await supabase
              .from("dashboards")
              .select("id")
              .eq("website_id", profile.active_project_id || "")
              .order("created_at", { ascending: true })
              .limit(1)
              .single();

            // Set remaining state values
            set({
              orgId: profile.org_id,
              orgSlug: profile.organizations.slug,
              projectSlug: profile.websites.slug,
              defaultDashboardId: defaultDashboard?.id || null,
              full_name: profile?.full_name || "",
            });

            if (profile?.active_project_id) {
              const { data: website } = await supabase
                .from("websites")
                .select("verified")
                .eq("id", profile.active_project_id)
                .single();

              set({ isWebsiteVerified: website?.verified || false });
            }
          } else {
            set({ isLoading: false });
          }

          // Handle subscription status separately
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', user_id)
            .single();

          set({ subscriptionStatus: subscription?.status || null });

        } catch (error) {
          console.error("Error initializing state:", error);
          set({ isLoading: false });
        }
      },
      setWebsiteVerified: (status: boolean) =>
        set({ isWebsiteVerified: status }),
      setSubscriptionStatus: (status: Tables<'subscriptions'>['status']) =>
        set({ subscriptionStatus: status }),
      checkSubscriptionStatus: async () => {
        const supabase = createClient();
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            set({ subscriptionStatus: null });
            return;
          }

          const { data: subscription } = await supabase
            .from("subscriptions")
            .select("status")
            .eq("user_id", user.id)
            .single();

          set({ subscriptionStatus: subscription?.status || null });
        } catch (error) {
          console.error("Error checking subscription status:", error);
        }
      },
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        ...state,
        events: {},
        sessions: [],
      }),
    }
  )
);
