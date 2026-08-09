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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          path: string
          target_id: string | null
          target_label: string
          target_type: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          path?: string
          target_id?: string | null
          target_label?: string
          target_type?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          path?: string
          target_id?: string | null
          target_label?: string
          target_type?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string
          end_date: string | null
          id: string
          place: string
          published: boolean
          slug: string
          sort_order: number
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          place?: string
          published?: boolean
          slug: string
          sort_order?: number
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          place?: string
          published?: boolean
          slug?: string
          sort_order?: number
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      guides: {
        Row: {
          bio: string
          certificate_url: string | null
          created_at: string
          email: string
          experience: string
          full_name: string
          id: string
          languages: string[]
          phone: string
          photo_url: string | null
          price_note: string
          published: boolean
          rating: number
          service_area: string
          sort_order: number
          updated_at: string
          zalo: string
        }
        Insert: {
          bio?: string
          certificate_url?: string | null
          created_at?: string
          email?: string
          experience?: string
          full_name: string
          id?: string
          languages?: string[]
          phone?: string
          photo_url?: string | null
          price_note?: string
          published?: boolean
          rating?: number
          service_area?: string
          sort_order?: number
          updated_at?: string
          zalo?: string
        }
        Update: {
          bio?: string
          certificate_url?: string | null
          created_at?: string
          email?: string
          experience?: string
          full_name?: string
          id?: string
          languages?: string[]
          phone?: string
          photo_url?: string | null
          price_note?: string
          published?: boolean
          rating?: number
          service_area?: string
          sort_order?: number
          updated_at?: string
          zalo?: string
        }
        Relationships: []
      }
      location_images: {
        Row: {
          caption: string
          created_at: string
          id: string
          location_id: string
          sort_order: number
          url: string
        }
        Insert: {
          caption?: string
          created_at?: string
          id?: string
          location_id: string
          sort_order?: number
          url: string
        }
        Update: {
          caption?: string
          created_at?: string
          id?: string
          location_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_images_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          activities: string
          address: string
          audio_en_url: string | null
          audio_vi_url: string | null
          contact: string
          cover_image_url: string | null
          created_at: string
          culture_history: string
          description: string
          highlights: string[]
          id: string
          latitude: number | null
          longitude: number | null
          map_embed_url: string | null
          name: string
          notes: string
          published: boolean
          region_id: string
          short_description: string
          slug: string
          sort_order: number
          suggestions: string
          ticket_price: string
          updated_at: string
          video_url: string | null
          visit_time: string
        }
        Insert: {
          activities?: string
          address?: string
          audio_en_url?: string | null
          audio_vi_url?: string | null
          contact?: string
          cover_image_url?: string | null
          created_at?: string
          culture_history?: string
          description?: string
          highlights?: string[]
          id?: string
          latitude?: number | null
          longitude?: number | null
          map_embed_url?: string | null
          name: string
          notes?: string
          published?: boolean
          region_id: string
          short_description?: string
          slug: string
          sort_order?: number
          suggestions?: string
          ticket_price?: string
          updated_at?: string
          video_url?: string | null
          visit_time?: string
        }
        Update: {
          activities?: string
          address?: string
          audio_en_url?: string | null
          audio_vi_url?: string | null
          contact?: string
          cover_image_url?: string | null
          created_at?: string
          culture_history?: string
          description?: string
          highlights?: string[]
          id?: string
          latitude?: number | null
          longitude?: number | null
          map_embed_url?: string | null
          name?: string
          notes?: string
          published?: boolean
          region_id?: string
          short_description?: string
          slug?: string
          sort_order?: number
          suggestions?: string
          ticket_price?: string
          updated_at?: string
          video_url?: string | null
          visit_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string
          id: string
          name: string
          published: boolean
          slug: string
          sort_order: number
          tagline: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string
          id?: string
          name: string
          published?: boolean
          slug: string
          sort_order?: number
          tagline?: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string
          id?: string
          name?: string
          published?: boolean
          slug?: string
          sort_order?: number
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean
          author_name: string
          comment: string
          created_at: string
          id: string
          rating: number
          target_id: string
          target_type: string
        }
        Insert: {
          approved?: boolean
          author_name?: string
          comment?: string
          created_at?: string
          id?: string
          rating?: number
          target_id: string
          target_type: string
        }
        Update: {
          approved?: boolean
          author_name?: string
          comment?: string
          created_at?: string
          id?: string
          rating?: number
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      service_bookings: {
        Row: {
          created_at: string
          email: string
          full_name: string
          guests: number
          guide_id: string | null
          id: string
          note: string
          partner_id: string | null
          phone: string
          pickup: string
          service_type: string
          status: string
          tour_id: string | null
          travel_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          full_name: string
          guests?: number
          guide_id?: string | null
          id?: string
          note?: string
          partner_id?: string | null
          phone: string
          pickup?: string
          service_type?: string
          status?: string
          tour_id?: string | null
          travel_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          guests?: number
          guide_id?: string | null
          id?: string
          note?: string
          partner_id?: string | null
          phone?: string
          pickup?: string
          service_type?: string
          status?: string
          tour_id?: string | null
          travel_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "vehicle_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_images: {
        Row: {
          caption: string
          created_at: string
          id: string
          sort_order: number
          tour_id: string
          url: string
        }
        Insert: {
          caption?: string
          created_at?: string
          id?: string
          sort_order?: number
          tour_id: string
          url: string
        }
        Update: {
          caption?: string
          created_at?: string
          id?: string
          sort_order?: number
          tour_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_images_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tours: {
        Row: {
          audio_en_url: string | null
          audio_vi_url: string | null
          cover_image_url: string | null
          created_at: string
          distance_km: number
          duration_label: string
          duration_minutes: number
          id: string
          itinerary: string
          location_id: string | null
          map_embed_url: string | null
          name: string
          price_note: string
          published: boolean
          slug: string
          sort_order: number
          summary: string
          transport: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          audio_en_url?: string | null
          audio_vi_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          distance_km?: number
          duration_label?: string
          duration_minutes?: number
          id?: string
          itinerary?: string
          location_id?: string | null
          map_embed_url?: string | null
          name: string
          price_note?: string
          published?: boolean
          slug: string
          sort_order?: number
          summary?: string
          transport?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          audio_en_url?: string | null
          audio_vi_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          distance_km?: number
          duration_label?: string
          duration_minutes?: number
          id?: string
          itinerary?: string
          location_id?: string | null
          map_embed_url?: string | null
          name?: string
          price_note?: string
          published?: boolean
          slug?: string
          sort_order?: number
          summary?: string
          transport?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tours_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
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
      vehicle_partners: {
        Row: {
          created_at: string
          description: string
          email: string
          facebook: string
          id: string
          license_url: string | null
          logo_url: string | null
          name: string
          phone: string
          price_list_url: string | null
          price_note: string
          published: boolean
          service_area: string
          sort_order: number
          updated_at: string
          vehicle_image_url: string | null
          vehicle_types: string[]
          website: string
          zalo: string
        }
        Insert: {
          created_at?: string
          description?: string
          email?: string
          facebook?: string
          id?: string
          license_url?: string | null
          logo_url?: string | null
          name: string
          phone?: string
          price_list_url?: string | null
          price_note?: string
          published?: boolean
          service_area?: string
          sort_order?: number
          updated_at?: string
          vehicle_image_url?: string | null
          vehicle_types?: string[]
          website?: string
          zalo?: string
        }
        Update: {
          created_at?: string
          description?: string
          email?: string
          facebook?: string
          id?: string
          license_url?: string | null
          logo_url?: string | null
          name?: string
          phone?: string
          price_list_url?: string | null
          price_note?: string
          published?: boolean
          service_area?: string
          sort_order?: number
          updated_at?: string
          vehicle_image_url?: string | null
          vehicle_types?: string[]
          website?: string
          zalo?: string
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
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
