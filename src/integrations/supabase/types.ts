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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analyst_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string
          id: string
          total_picks: number | null
          twitter_handle: string | null
          updated_at: string | null
          user_id: string
          website: string | null
          win_rate: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name: string
          id?: string
          total_picks?: number | null
          twitter_handle?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
          win_rate?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          total_picks?: number | null
          twitter_handle?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
          win_rate?: number | null
        }
        Relationships: []
      }
      bookmakers: {
        Row: {
          affiliate_link: string | null
          affiliate_params: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          affiliate_link?: string | null
          affiliate_params?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          affiliate_link?: string | null
          affiliate_params?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          away_team_id: string
          created_at: string | null
          end_time: string | null
          event_datetime: string
          external_api_id: string | null
          home_team_id: string
          id: string
          language: string | null
          league_id: string
          site_id: string | null
          sport_id: string
          status: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          away_team_id: string
          created_at?: string | null
          end_time?: string | null
          event_datetime: string
          external_api_id?: string | null
          home_team_id: string
          id?: string
          language?: string | null
          league_id: string
          site_id?: string | null
          sport_id: string
          status?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          away_team_id?: string
          created_at?: string | null
          end_time?: string | null
          event_datetime?: string
          external_api_id?: string | null
          home_team_id?: string
          id?: string
          language?: string | null
          league_id?: string
          site_id?: string | null
          sport_id?: string
          status?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          country: string | null
          created_at: string | null
          id: string
          language: string | null
          logo_url: string | null
          name: string
          site_id: string | null
          slug: string
          sport_id: string
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          logo_url?: string | null
          name: string
          site_id?: string | null
          slug: string
          sport_id: string
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          logo_url?: string | null
          name?: string
          site_id?: string | null
          slug?: string
          sport_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leagues_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leagues_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      market_types: {
        Row: {
          created_at: string | null
          id: string
          language: string | null
          name: string
          slug: string
          sport_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          language?: string | null
          name: string
          slug: string
          sport_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string | null
          name?: string
          slug?: string
          sport_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_types_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      pick_sites: {
        Row: {
          created_at: string | null
          id: string
          pick_id: string
          site_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pick_id: string
          site_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pick_id?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pick_sites_pick_id_fkey"
            columns: ["pick_id"]
            isOneToOne: false
            referencedRelation: "picks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_sites_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      picks: {
        Row: {
          analysis: string | null
          analyst_id: string
          bookmaker_id: string
          category: string | null
          confidence_level: number | null
          created_at: string | null
          event_id: string
          id: string
          is_best_odds: boolean | null
          language: string | null
          market_type_id: string
          odds: number
          odds_format: Database["public"]["Enums"]["odds_format"] | null
          pick_type: Database["public"]["Enums"]["pick_type"] | null
          related_player_id: string | null
          related_team_id: string | null
          result: string | null
          selection: string | null
          site_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          analysis?: string | null
          analyst_id: string
          bookmaker_id: string
          category?: string | null
          confidence_level?: number | null
          created_at?: string | null
          event_id: string
          id?: string
          is_best_odds?: boolean | null
          language?: string | null
          market_type_id: string
          odds: number
          odds_format?: Database["public"]["Enums"]["odds_format"] | null
          pick_type?: Database["public"]["Enums"]["pick_type"] | null
          related_player_id?: string | null
          related_team_id?: string | null
          result?: string | null
          selection?: string | null
          site_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          analysis?: string | null
          analyst_id?: string
          bookmaker_id?: string
          category?: string | null
          confidence_level?: number | null
          created_at?: string | null
          event_id?: string
          id?: string
          is_best_odds?: boolean | null
          language?: string | null
          market_type_id?: string
          odds?: number
          odds_format?: Database["public"]["Enums"]["odds_format"] | null
          pick_type?: Database["public"]["Enums"]["pick_type"] | null
          related_player_id?: string | null
          related_team_id?: string | null
          result?: string | null
          selection?: string | null
          site_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "picks_analyst_id_fkey"
            columns: ["analyst_id"]
            isOneToOne: false
            referencedRelation: "analyst_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_bookmaker_id_fkey"
            columns: ["bookmaker_id"]
            isOneToOne: false
            referencedRelation: "bookmakers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_bookmaker_id_fkey"
            columns: ["bookmaker_id"]
            isOneToOne: false
            referencedRelation: "bookmakers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_market_type_id_fkey"
            columns: ["market_type_id"]
            isOneToOne: false
            referencedRelation: "market_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_related_player_id_fkey"
            columns: ["related_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_related_team_id_fkey"
            columns: ["related_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string | null
          external_api_id: string | null
          id: string
          jersey_number: number | null
          name: string
          photo_url: string | null
          position: string | null
          slug: string
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          external_api_id?: string | null
          id?: string
          jersey_number?: number | null
          name: string
          photo_url?: string | null
          position?: string | null
          slug: string
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          external_api_id?: string | null
          id?: string
          jersey_number?: number | null
          name?: string
          photo_url?: string | null
          position?: string | null
          slug?: string
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          categories: string[] | null
          created_at: string | null
          display_name: string | null
          domain: string | null
          id: string
          is_active: boolean | null
          language: string | null
          logo_url: string | null
          name: string
          primary_color: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          categories?: string[] | null
          created_at?: string | null
          display_name?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          categories?: string[] | null
          created_at?: string | null
          display_name?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sports: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          language: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          language?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          language?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string | null
          external_api_id: string | null
          id: string
          language: string | null
          league_id: string
          logo_url: string | null
          name: string
          season: number | null
          short_name: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          external_api_id?: string | null
          id?: string
          language?: string | null
          league_id: string
          logo_url?: string | null
          name: string
          season?: number | null
          short_name?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          external_api_id?: string | null
          id?: string
          language?: string | null
          league_id?: string
          logo_url?: string | null
          name?: string
          season?: number | null
          short_name?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      bookmakers_public: {
        Row: {
          created_at: string | null
          id: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "analyst" | "user"
      odds_format: "decimal" | "american" | "fractional"
      pick_type: "manual" | "ai" | "computer"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "analyst", "user"],
      odds_format: ["decimal", "american", "fractional"],
      pick_type: ["manual", "ai", "computer"],
    },
  },
} as const
