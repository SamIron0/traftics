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
      heatmaps: {
        Row: {
          created_at: string | null
          created_by: string | null
          filters: Json | null
          id: string
          name: string
          precision: number
          selected_session_ids: string[] | null
          snapshot_url: string | null
          updated_at: string | null
          url_domain: string
          url_match_type: string
          url_protocol: string
          use_history_data: boolean
          website_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          filters?: Json | null
          id?: string
          name: string
          precision: number
          selected_session_ids?: string[] | null
          snapshot_url?: string | null
          updated_at?: string | null
          url_domain: string
          url_match_type: string
          url_protocol: string
          use_history_data?: boolean
          website_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          filters?: Json | null
          id?: string
          name?: string
          precision?: number
          selected_session_ids?: string[] | null
          snapshot_url?: string | null
          updated_at?: string | null
          url_domain?: string
          url_match_type?: string
          url_protocol?: string
          use_history_data?: boolean
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "heatmaps_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
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
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          size: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          size?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string | null
          duration: number
          has_screenshot: boolean | null
          id: string
          screen_height: number
          screen_width: number
          site_id: string
          started_at: string
          updated_at: string | null
          user_agent: string
        }
        Insert: {
          created_at?: string | null
          duration: number
          has_screenshot?: boolean | null
          id?: string
          screen_height: number
          screen_width: number
          site_id: string
          started_at: string
          updated_at?: string | null
          user_agent: string
        }
        Update: {
          created_at?: string | null
          duration?: number
          has_screenshot?: boolean | null
          id?: string
          screen_height?: number
          screen_width?: number
          site_id?: string
          started_at?: string
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
      user_profiles: {
        Row: {
          active_project_id: string | null
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
          active_project_id?: string | null
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
          active_project_id?: string | null
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
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
