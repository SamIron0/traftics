export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          created_at: string | null
          id: string
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dashboards: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          website_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          website_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboards_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      error_events: {
        Row: {
          column_number: number | null
          error_message: string
          error_type: string
          file_name: string | null
          id: string
          line_number: number | null
          session_id: string
          stack_trace: string | null
          timestamp: string
        }
        Insert: {
          column_number?: number | null
          error_message: string
          error_type: string
          file_name?: string | null
          id?: string
          line_number?: number | null
          session_id: string
          stack_trace?: string | null
          timestamp: string
        }
        Update: {
          column_number?: number | null
          error_message?: string
          error_type?: string
          file_name?: string | null
          id?: string
          line_number?: number | null
          session_id?: string
          stack_trace?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "error_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      network_events: {
        Row: {
          id: string
          is_successful: boolean
          method: string
          request_url: string
          response_time: number
          session_id: string
          status_code: number
          timestamp: string
        }
        Insert: {
          id?: string
          is_successful: boolean
          method: string
          request_url: string
          response_time: number
          session_id: string
          status_code: number
          timestamp: string
        }
        Update: {
          id?: string
          is_successful?: boolean
          method?: string
          request_url?: string
          response_time?: number
          session_id?: string
          status_code?: number
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "network_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          size: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          size: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          size?: number
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      page_events: {
        Row: {
          error_count: number | null
          href: string
          id: string
          page_load_time: number | null
          referrer: string | null
          scroll_depth: number | null
          session_id: string | null
          site_id: string | null
          time_spent: number | null
          timestamp: string
        }
        Insert: {
          error_count?: number | null
          href: string
          id?: string
          page_load_time?: number | null
          referrer?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          site_id?: string | null
          time_spent?: number | null
          timestamp: string
        }
        Update: {
          error_count?: number | null
          href?: string
          id?: string
          page_load_time?: number | null
          referrer?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          site_id?: string | null
          time_spent?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_events_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          active: boolean | null
          currency: string | null
          id: string
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          product_id: string | null
          trial_period_days: number | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          id: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      session_events: {
        Row: {
          created_at: string | null
          data: Json | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          session_id: string | null
          timestamp: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          session_id?: string | null
          timestamp: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          session_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          browser: Json | null
          created_at: string | null
          device: Json | null
          duration: number
          end_reason: string | null
          engagement_score: number | null
          frustration_score: number | null
          id: string
          is_active: boolean | null
          location: Json | null
          os: Json | null
          relevance_score: number | null
          screen_height: number | null
          screen_width: number | null
          session_error_count: number | null
          site_id: string
          started_at: string
          total_clicks: number | null
          total_inputs: number | null
          total_scroll_distance: number | null
          updated_at: string | null
          user_agent: string
        }
        Insert: {
          browser?: Json | null
          created_at?: string | null
          device?: Json | null
          duration: number
          end_reason?: string | null
          engagement_score?: number | null
          frustration_score?: number | null
          id?: string
          is_active?: boolean | null
          location?: Json | null
          os?: Json | null
          relevance_score?: number | null
          screen_height?: number | null
          screen_width?: number | null
          session_error_count?: number | null
          site_id: string
          started_at: string
          total_clicks?: number | null
          total_inputs?: number | null
          total_scroll_distance?: number | null
          updated_at?: string | null
          user_agent: string
        }
        Update: {
          browser?: Json | null
          created_at?: string | null
          device?: Json | null
          duration?: number
          end_reason?: string | null
          engagement_score?: number | null
          frustration_score?: number | null
          id?: string
          is_active?: boolean | null
          location?: Json | null
          os?: Json | null
          relevance_score?: number | null
          screen_height?: number | null
          screen_width?: number | null
          session_error_count?: number | null
          site_id?: string
          started_at?: string
          total_clicks?: number | null
          total_inputs?: number | null
          total_scroll_distance?: number | null
          updated_at?: string | null
          user_agent?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string | null
          current_period_end: string | null
          current_period_start: string | null
          ended_at: string | null
          id: string
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          trial_end: string | null
          trial_start: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          ended_at?: string | null
          id: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          active_project_id: string
          city: string
          country: string
          created_at: string | null
          full_name: string
          id: string
          is_onboarded: boolean | null
          org_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          setup_completed: boolean | null
          street: string
          updated_at: string | null
          user_id: string | null
          zip: string
        }
        Insert: {
          active_project_id: string
          city: string
          country: string
          created_at?: string | null
          full_name: string
          id?: string
          is_onboarded?: boolean | null
          org_id?: string | null
          role: Database["public"]["Enums"]["user_role"]
          setup_completed?: boolean | null
          street: string
          updated_at?: string | null
          user_id?: string | null
          zip: string
        }
        Update: {
          active_project_id?: string
          city?: string
          country?: string
          created_at?: string | null
          full_name?: string
          id?: string
          is_onboarded?: boolean | null
          org_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          setup_completed?: boolean | null
          street?: string
          updated_at?: string | null
          user_id?: string | null
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_active_project"
            columns: ["active_project_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_active_project_id_fkey"
            columns: ["active_project_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      websites: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string
          name: string
          org_id: string
          slug: string
          tracking_id: string
          updated_at: string | null
          verified: boolean
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name: string
          org_id: string
          slug: string
          tracking_id?: string
          updated_at?: string | null
          verified?: boolean
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name?: string
          org_id?: string
          slug?: string
          tracking_id?: string
          updated_at?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "websites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      dashboard_metrics: {
        Row: {
          avg_duration: number | null
          bounce_rate: number | null
          pages_per_session: number | null
          site_id: string | null
          top_pages: Json | null
          total_sessions: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_slug: {
        Args: {
          name: string
        }
        Returns: string
      }
    }
    Enums: {
      event_type:
        | "rage_click"
        | "refresh"
        | "selection"
        | "uturn"
        | "window_resize"
        | "click"
        | "input"
        | "page_view"
        | "error"
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
      user_role:
        | "ux_and_design"
        | "product_management"
        | "engineering"
        | "data_and_analysis"
        | "marketing"
        | "account_management"
        | "customer_experience"
        | "customer_support"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
