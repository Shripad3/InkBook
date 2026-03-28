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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      artists: {
        Row: {
          bio: string | null
          completed_onboarding_at: string | null
          created_at: string
          id: string
          instagram_handle: string | null
          name: string | null
          slug: string
          stripe_account_id: string | null
          stripe_customer_id: string | null
          studio_name: string | null
          style_tags: string[] | null
          subscription_ends_at: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          timezone: string
          trial_ends_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          completed_onboarding_at?: string | null
          created_at?: string
          id?: string
          instagram_handle?: string | null
          name?: string | null
          slug: string
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          studio_name?: string | null
          style_tags?: string[] | null
          subscription_ends_at?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          timezone?: string
          trial_ends_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          completed_onboarding_at?: string | null
          created_at?: string
          id?: string
          instagram_handle?: string | null
          name?: string | null
          slug?: string
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          studio_name?: string | null
          style_tags?: string[] | null
          subscription_ends_at?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          timezone?: string
          trial_ends_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blocked_times: {
        Row: {
          artist_id: string
          created_at: string
          ends_at: string
          id: string
          reason: string | null
          starts_at: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          ends_at: string
          id?: string
          reason?: string | null
          starts_at: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          ends_at?: string
          id?: string
          reason?: string | null
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_times_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          aftercare_sent_at: string | null
          artist_id: string
          artist_notes: string | null
          balance_amount: number | null
          balance_paid: boolean
          client_id: string
          consent_form_pdf_url: string | null
          consent_form_sent_at: string | null
          consent_form_signed_at: string | null
          coverup_description: string | null
          created_at: string
          deposit_amount: number
          deposit_paid: boolean
          deposit_payment_intent_id: string | null
          ends_at: string
          healed_photo_request_sent_at: string | null
          id: string
          is_coverup: boolean
          medical_notes: string | null
          placement: string | null
          session_type_id: string
          size_estimate: string | null
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          style_description: string | null
        }
        Insert: {
          aftercare_sent_at?: string | null
          artist_id: string
          artist_notes?: string | null
          balance_amount?: number | null
          balance_paid?: boolean
          client_id: string
          consent_form_pdf_url?: string | null
          consent_form_sent_at?: string | null
          consent_form_signed_at?: string | null
          coverup_description?: string | null
          created_at?: string
          deposit_amount?: number
          deposit_paid?: boolean
          deposit_payment_intent_id?: string | null
          ends_at: string
          healed_photo_request_sent_at?: string | null
          id?: string
          is_coverup?: boolean
          medical_notes?: string | null
          placement?: string | null
          session_type_id: string
          size_estimate?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          style_description?: string | null
        }
        Update: {
          aftercare_sent_at?: string | null
          artist_id?: string
          artist_notes?: string | null
          balance_amount?: number | null
          balance_paid?: boolean
          client_id?: string
          consent_form_pdf_url?: string | null
          consent_form_sent_at?: string | null
          consent_form_signed_at?: string | null
          coverup_description?: string | null
          created_at?: string
          deposit_amount?: number
          deposit_paid?: boolean
          deposit_payment_intent_id?: string | null
          ends_at?: string
          healed_photo_request_sent_at?: string | null
          id?: string
          is_coverup?: boolean
          medical_notes?: string | null
          placement?: string | null
          session_type_id?: string
          size_estimate?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          style_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_session_type_id_fkey"
            columns: ["session_type_id"]
            isOneToOne: false
            referencedRelation: "session_types"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          is_no_show_flagged: boolean
          last_name: string
          no_show_count: number
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          is_no_show_flagged?: boolean
          last_name: string
          no_show_count?: number
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_no_show_flagged?: boolean
          last_name?: string
          no_show_count?: number
          phone?: string | null
        }
        Relationships: []
      }
      healed_photos: {
        Row: {
          booking_id: string
          id: string
          storage_path: string
          submitted_at: string
        }
        Insert: {
          booking_id: string
          id?: string
          storage_path: string
          submitted_at?: string
        }
        Update: {
          booking_id?: string
          id?: string
          storage_path?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "healed_photos_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          booking_id: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          error_message: string | null
          id: string
          scheduled_for: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          booking_id: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          error_message?: string | null
          id?: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          booking_id?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          error_message?: string | null
          id?: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_images: {
        Row: {
          artist_id: string
          display_order: number
          id: string
          storage_path: string
          uploaded_at: string
        }
        Insert: {
          artist_id: string
          display_order?: number
          id?: string
          storage_path: string
          uploaded_at?: string
        }
        Update: {
          artist_id?: string
          display_order?: number
          id?: string
          storage_path?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_images_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_images: {
        Row: {
          booking_id: string
          id: string
          storage_path: string
          uploaded_at: string
        }
        Insert: {
          booking_id: string
          id?: string
          storage_path: string
          uploaded_at?: string
        }
        Update: {
          booking_id?: string
          id?: string
          storage_path?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reference_images_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      session_types: {
        Row: {
          artist_id: string
          buffer_minutes: number
          created_at: string
          deposit_type: Database["public"]["Enums"]["deposit_type"]
          deposit_value: number
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          max_advance_days: number
          min_notice_hours: number
          name: string
          price_from: number | null
          price_to: number | null
          requires_consultation: boolean
          requires_reference_image: boolean
        }
        Insert: {
          artist_id: string
          buffer_minutes?: number
          created_at?: string
          deposit_type?: Database["public"]["Enums"]["deposit_type"]
          deposit_value?: number
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean
          max_advance_days?: number
          min_notice_hours?: number
          name: string
          price_from?: number | null
          price_to?: number | null
          requires_consultation?: boolean
          requires_reference_image?: boolean
        }
        Update: {
          artist_id?: string
          buffer_minutes?: number
          created_at?: string
          deposit_type?: Database["public"]["Enums"]["deposit_type"]
          deposit_value?: number
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          max_advance_days?: number
          min_notice_hours?: number
          name?: string
          price_from?: number | null
          price_to?: number | null
          requires_consultation?: boolean
          requires_reference_image?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "session_types_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      working_hours: {
        Row: {
          artist_id: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          start_time: string
        }
        Insert: {
          artist_id: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
        }
        Update: {
          artist_id?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "working_hours_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_artist_id: { Args: never; Returns: string }
    }
    Enums: {
      booking_status:
        | "pending_deposit"
        | "confirmed"
        | "completed"
        | "cancelled_artist"
        | "cancelled_client"
        | "no_show"
      deposit_type: "fixed" | "percentage"
      notification_channel: "email" | "sms"
      notification_status: "pending" | "sent" | "failed"
      notification_type:
        | "booking_created"
        | "deposit_paid_client"
        | "deposit_paid_artist"
        | "prep_reminder_48h"
        | "consent_reminder_24h"
        | "sms_24h"
        | "sms_3h"
        | "aftercare"
        | "healed_photo_request"
      subscription_plan: "solo" | "studio" | "studio_pro"
      subscription_status:
        | "trial"
        | "active"
        | "past_due"
        | "cancelled"
        | "paused"
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
      booking_status: [
        "pending_deposit",
        "confirmed",
        "completed",
        "cancelled_artist",
        "cancelled_client",
        "no_show",
      ],
      deposit_type: ["fixed", "percentage"],
      notification_channel: ["email", "sms"],
      notification_status: ["pending", "sent", "failed"],
      notification_type: [
        "booking_created",
        "deposit_paid_client",
        "deposit_paid_artist",
        "prep_reminder_48h",
        "consent_reminder_24h",
        "sms_24h",
        "sms_3h",
        "aftercare",
        "healed_photo_request",
      ],
      subscription_plan: ["solo", "studio", "studio_pro"],
      subscription_status: [
        "trial",
        "active",
        "past_due",
        "cancelled",
        "paused",
      ],
    },
  },
} as const

export type BookingStatus = Database["public"]["Enums"]["booking_status"]
export type NotificationType = Database["public"]["Enums"]["notification_type"]
export type SubscriptionPlan = Database["public"]["Enums"]["subscription_plan"]
export type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"]
