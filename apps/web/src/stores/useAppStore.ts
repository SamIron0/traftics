import { Session } from "@/types/api";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tables } from "supabase/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  full_name: string;
  projectId: string | null;
  projectSlug: string | null;
  isLoading: boolean;
  sessions: Session[];
  isWebsiteVerified: boolean;
  subscriptionStatus: Tables<"subscriptions">["status"] | null;
  cancelAtPeriodEnd: Tables<"subscriptions">["cancel_at_period_end"] | false;
  setProject: (projectId: string, projectSlug: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  initializeState: (user: User) => Promise<void>;
  setSessions: (sessions: Session[]) => void;
  setWebsiteVerified: (status: boolean) => void;
  setSubscriptionStatus: (status: Tables<"subscriptions">["status"]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      full_name: "",
      projectId: null,
      projectSlug: null,
      isLoading: true,
      sessions: [],
      isWebsiteVerified: false,
      subscriptionStatus: null,
      cancelAtPeriodEnd: false,
      setProject: (projectId: string, projectSlug: string) =>
        set({ projectId, projectSlug }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setSessions: (sessions: Session[]) => set({ sessions }),
      reset: () =>
        set({
          projectId: null,
          projectSlug: null,
        }),

      initializeState: async (user: User) => {
        const supabase = createClient();
        try {
          const user_id = user?.id;

          const { data: profile } = await supabase
            .from("user_profiles")
            .select(
              `
              full_name,
              active_project_id,
              websites!fk_active_project(slug)
              `
            )
            .eq("user_id", user_id)
            .single();

          set({
            projectId: profile?.active_project_id,
            full_name: profile?.full_name || "",
          });

          if (profile?.active_project_id) {
            const { data: website } = await supabase
              .from("websites")
              .select("verified")
              .eq("id", profile.active_project_id)
              .single();
            // Handle subscription status separately
            const { data: subscription } = await supabase
              .from("subscriptions")
              .select("status,cancel_at_period_end")
              .eq("user_id", user_id)
              .single();

            set({
              isWebsiteVerified: website?.verified || false,
              subscriptionStatus: subscription?.status || null,
              cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
            });
          }
          set({ isLoading: false });
        } catch (error) {
          console.error("Error initializing state:", error);
          set({ isLoading: false });
        }
      },
      setWebsiteVerified: (status: boolean) =>
        set({ isWebsiteVerified: status }),
      setSubscriptionStatus: (status: Tables<"subscriptions">["status"]) =>
        set({ subscriptionStatus: status }),
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
