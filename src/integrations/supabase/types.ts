export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      audit: {
        Row: {
          action: string
          actor_id: string | null
          created_at: number
          deleted_at: number | null
          id: string
          revision: number
          server_updated_at: string
          summary: string
          target_id: string | null
          target_table: string
          updated_at: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: number
          deleted_at?: number | null
          id?: string
          revision?: number
          server_updated_at?: string
          summary?: string
          target_id?: string | null
          target_table: string
          updated_at?: number
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: number
          deleted_at?: number | null
          id?: string
          revision?: number
          server_updated_at?: string
          summary?: string
          target_id?: string | null
          target_table?: string
          updated_at?: number
        }
        Relationships: []
      }
      flashes: {
        Row: {
          accuracy_meters: number | null
          area_label: string | null
          author_id: string
          body: string
          category: string | null
          created_at: number
          deleted_at: number | null
          expires_at: number | null
          id: string
          kind: string | null
          latitude: number | null
          longitude: number | null
          media_ids: string[]
          revision: number
          server_updated_at: string
          status: string
          time_slot: string | null
          title: string
          updated_at: number
        }
        Insert: {
          accuracy_meters?: number | null
          area_label?: string | null
          author_id: string
          body?: string
          category?: string | null
          created_at?: number
          deleted_at?: number | null
          expires_at?: number | null
          id?: string
          kind?: string | null
          latitude?: number | null
          longitude?: number | null
          media_ids?: string[]
          revision?: number
          server_updated_at?: string
          status?: string
          time_slot?: string | null
          title?: string
          updated_at?: number
        }
        Update: {
          accuracy_meters?: number | null
          area_label?: string | null
          author_id?: string
          body?: string
          category?: string | null
          created_at?: number
          deleted_at?: number | null
          expires_at?: number | null
          id?: string
          kind?: string | null
          latitude?: number | null
          longitude?: number | null
          media_ids?: string[]
          revision?: number
          server_updated_at?: string
          status?: string
          time_slot?: string | null
          title?: string
          updated_at?: number
        }
        Relationships: []
      }
      media: {
        Row: {
          byte_size: number
          created_at: number
          deleted_at: number | null
          height: number | null
          id: string
          kind: string
          mime_type: string
          owner_id: string
          remote_path: string | null
          revision: number
          server_updated_at: string
          state: string
          updated_at: number
          width: number | null
        }
        Insert: {
          byte_size?: number
          created_at?: number
          deleted_at?: number | null
          height?: number | null
          id?: string
          kind?: string
          mime_type?: string
          owner_id: string
          remote_path?: string | null
          revision?: number
          server_updated_at?: string
          state?: string
          updated_at?: number
          width?: number | null
        }
        Update: {
          byte_size?: number
          created_at?: number
          deleted_at?: number | null
          height?: number | null
          id?: string
          kind?: string
          mime_type?: string
          owner_id?: string
          remote_path?: string | null
          revision?: number
          server_updated_at?: string
          state?: string
          updated_at?: number
          width?: number | null
        }
        Relationships: []
      }
      missions: {
        Row: {
          assignee_id: string | null
          author_id: string
          brief: string
          created_at: number
          deleted_at: number | null
          due_at: number | null
          id: string
          revision: number
          reward_amount: number
          reward_currency: string
          server_updated_at: string
          status: string
          title: string
          updated_at: number
        }
        Insert: {
          assignee_id?: string | null
          author_id: string
          brief?: string
          created_at?: number
          deleted_at?: number | null
          due_at?: number | null
          id?: string
          revision?: number
          reward_amount?: number
          reward_currency?: string
          server_updated_at?: string
          status?: string
          title?: string
          updated_at?: number
        }
        Update: {
          assignee_id?: string | null
          author_id?: string
          brief?: string
          created_at?: number
          deleted_at?: number | null
          due_at?: number | null
          id?: string
          revision?: number
          reward_amount?: number
          reward_currency?: string
          server_updated_at?: string
          status?: string
          title?: string
          updated_at?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body_key: string
          channel: string
          created_at: number
          deleted_at: number | null
          id: string
          params: Json
          read_at: number | null
          recipient_id: string
          revision: number
          server_updated_at: string
          title_key: string
          updated_at: number
        }
        Insert: {
          body_key?: string
          channel?: string
          created_at?: number
          deleted_at?: number | null
          id?: string
          params?: Json
          read_at?: number | null
          recipient_id: string
          revision?: number
          server_updated_at?: string
          title_key?: string
          updated_at?: number
        }
        Update: {
          body_key?: string
          channel?: string
          created_at?: number
          deleted_at?: number | null
          id?: string
          params?: Json
          read_at?: number | null
          recipient_id?: string
          revision?: number
          server_updated_at?: string
          title_key?: string
          updated_at?: number
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string
          body: string
          created_at: number
          deleted_at: number | null
          id: string
          media_ids: string[]
          reaction_count: number
          reply_count: number
          revision: number
          server_updated_at: string
          updated_at: number
          visibility: string
        }
        Insert: {
          author_id: string
          body?: string
          created_at?: number
          deleted_at?: number | null
          id?: string
          media_ids?: string[]
          reaction_count?: number
          reply_count?: number
          revision?: number
          server_updated_at?: string
          updated_at?: number
          visibility?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: number
          deleted_at?: number | null
          id?: string
          media_ids?: string[]
          reaction_count?: number
          reply_count?: number
          revision?: number
          server_updated_at?: string
          updated_at?: number
          visibility?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_media_id: string | null
          created_at: number
          deleted_at: number | null
          display_name: string
          handle: string | null
          id: string
          locale: string
          revision: number
          server_updated_at: string
          status: string
          trust_score: number
          updated_at: number
        }
        Insert: {
          avatar_media_id?: string | null
          created_at?: number
          deleted_at?: number | null
          display_name?: string
          handle?: string | null
          id: string
          locale?: string
          revision?: number
          server_updated_at?: string
          status?: string
          trust_score?: number
          updated_at?: number
        }
        Update: {
          avatar_media_id?: string | null
          created_at?: number
          deleted_at?: number | null
          display_name?: string
          handle?: string | null
          id?: string
          locale?: string
          revision?: number
          server_updated_at?: string
          status?: string
          trust_score?: number
          updated_at?: number
        }
        Relationships: []
      }
      udi: {
        Row: {
          attributes: Json
          created_at: number
          deleted_at: number | null
          id: string
          level: string
          revision: number
          server_updated_at: string
          updated_at: number
          user_id: string
          verified_at: number | null
        }
        Insert: {
          attributes?: Json
          created_at?: number
          deleted_at?: number | null
          id?: string
          level?: string
          revision?: number
          server_updated_at?: string
          updated_at?: number
          user_id: string
          verified_at?: number | null
        }
        Update: {
          attributes?: Json
          created_at?: number
          deleted_at?: number | null
          id?: string
          level?: string
          revision?: number
          server_updated_at?: string
          updated_at?: number
          user_id?: string
          verified_at?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      list_public_flashes: {
        Args: { p_limit?: number }
        Returns: {
          area_label: string
          category: string
          created_at: number
          expires_at: number
          id: string
          kind: string
          time_slot: string
          title: string
        }[]
      }
      scan_public_flashes: {
        Args: {
          p_category?: string
          p_latitude?: number
          p_limit?: number
          p_longitude?: number
          p_radius_km?: number
          p_text?: string
        }
        Returns: {
          area_label: string
          category: string
          created_at: number
          distance_km: number
          expires_at: number
          id: string
          kind: string
          time_slot: string
          title: string
        }[]
      }
      set_flash_location: {
        Args: {
          p_accuracy_meters: number
          p_flash_id: string
          p_latitude: number
          p_longitude: number
        }
        Returns: boolean
      }
      transition_flash: {
        Args: { p_flash_id: string; p_status: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "member" | "moderator" | "admin" | "owner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["member", "moderator", "admin", "owner"],
    },
  },
} as const
