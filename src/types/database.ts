export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SubscriptionPlan = "solo" | "studio" | "studio_pro";
export type SubscriptionStatus = "trial" | "active" | "past_due" | "cancelled" | "paused";
export type BookingStatus =
  | "pending_deposit"
  | "confirmed"
  | "completed"
  | "cancelled_artist"
  | "cancelled_client"
  | "no_show";
export type DepositType = "fixed" | "percentage";
export type NotificationChannel = "email" | "sms";
export type NotificationStatus = "pending" | "sent" | "failed";
export type NotificationType =
  | "booking_created"
  | "deposit_paid_client"
  | "deposit_paid_artist"
  | "prep_reminder_48h"
  | "consent_reminder_24h"
  | "sms_24h"
  | "sms_3h"
  | "aftercare"
  | "healed_photo_request";

export interface Database {
  public: {
    Tables: {
      artists: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          name: string | null;
          bio: string | null;
          instagram_handle: string | null;
          studio_name: string | null;
          style_tags: string[];
          stripe_account_id: string | null;
          stripe_customer_id: string | null;
          subscription_plan: SubscriptionPlan | null;
          subscription_status: SubscriptionStatus;
          trial_ends_at: string;
          timezone: string;
          completed_onboarding_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slug: string;
          name?: string | null;
          bio?: string | null;
          instagram_handle?: string | null;
          studio_name?: string | null;
          style_tags?: string[];
          stripe_account_id?: string | null;
          stripe_customer_id?: string | null;
          subscription_plan?: SubscriptionPlan | null;
          subscription_status?: SubscriptionStatus;
          trial_ends_at?: string;
          timezone?: string;
          completed_onboarding_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["artists"]["Insert"]>;
        Relationships: [];
      };
      working_hours: {
        Row: {
          id: string;
          artist_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available: boolean;
        };
        Insert: {
          id?: string;
          artist_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["working_hours"]["Insert"]>;
        Relationships: [];
      };
      session_types: {
        Row: {
          id: string;
          artist_id: string;
          name: string;
          duration_minutes: number;
          buffer_minutes: number;
          price_from: number | null;
          price_to: number | null;
          deposit_type: DepositType;
          deposit_value: number;
          requires_consultation: boolean;
          requires_reference_image: boolean;
          min_notice_hours: number;
          max_advance_days: number;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          name: string;
          duration_minutes: number;
          buffer_minutes?: number;
          price_from?: number | null;
          price_to?: number | null;
          deposit_type?: DepositType;
          deposit_value?: number;
          requires_consultation?: boolean;
          requires_reference_image?: boolean;
          min_notice_hours?: number;
          max_advance_days?: number;
          description?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["session_types"]["Insert"]>;
        Relationships: [];
      };
      blocked_times: {
        Row: {
          id: string;
          artist_id: string;
          starts_at: string;
          ends_at: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          starts_at: string;
          ends_at: string;
          reason?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["blocked_times"]["Insert"]>;
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          is_no_show_flagged: boolean;
          no_show_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          is_no_show_flagged?: boolean;
          no_show_count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          artist_id: string;
          session_type_id: string;
          client_id: string;
          starts_at: string;
          ends_at: string;
          status: BookingStatus;
          placement: string | null;
          size_estimate: string | null;
          style_description: string | null;
          is_coverup: boolean;
          coverup_description: string | null;
          medical_notes: string | null;
          deposit_amount: number;
          deposit_paid: boolean;
          deposit_payment_intent_id: string | null;
          balance_amount: number | null;
          balance_paid: boolean;
          consent_form_sent_at: string | null;
          consent_form_signed_at: string | null;
          consent_form_pdf_url: string | null;
          artist_notes: string | null;
          aftercare_sent_at: string | null;
          healed_photo_request_sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          session_type_id: string;
          client_id: string;
          starts_at: string;
          ends_at: string;
          status?: BookingStatus;
          placement?: string | null;
          size_estimate?: string | null;
          style_description?: string | null;
          is_coverup?: boolean;
          coverup_description?: string | null;
          medical_notes?: string | null;
          deposit_amount?: number;
          deposit_paid?: boolean;
          deposit_payment_intent_id?: string | null;
          balance_amount?: number | null;
          balance_paid?: boolean;
          consent_form_sent_at?: string | null;
          consent_form_signed_at?: string | null;
          consent_form_pdf_url?: string | null;
          artist_notes?: string | null;
          aftercare_sent_at?: string | null;
          healed_photo_request_sent_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
        Relationships: [];
      };
      reference_images: {
        Row: {
          id: string;
          booking_id: string;
          storage_path: string;
          uploaded_at: string;
        };
        Insert: { id?: string; booking_id: string; storage_path: string };
        Update: Partial<Database["public"]["Tables"]["reference_images"]["Insert"]>;
        Relationships: [];
      };
      healed_photos: {
        Row: {
          id: string;
          booking_id: string;
          storage_path: string;
          submitted_at: string;
        };
        Insert: { id?: string; booking_id: string; storage_path: string };
        Update: Partial<Database["public"]["Tables"]["healed_photos"]["Insert"]>;
        Relationships: [];
      };
      portfolio_images: {
        Row: {
          id: string;
          artist_id: string;
          storage_path: string;
          display_order: number;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          storage_path: string;
          display_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["portfolio_images"]["Insert"]>;
        Relationships: [];
      };
      notification_log: {
        Row: {
          id: string;
          booking_id: string;
          type: NotificationType;
          channel: NotificationChannel;
          scheduled_for: string | null;
          sent_at: string | null;
          status: NotificationStatus;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          type: NotificationType;
          channel: NotificationChannel;
          scheduled_for?: string | null;
          sent_at?: string | null;
          status?: NotificationStatus;
          error_message?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["notification_log"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_artist_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      subscription_plan: SubscriptionPlan;
      subscription_status: SubscriptionStatus;
      booking_status: BookingStatus;
      deposit_type: DepositType;
      notification_channel: NotificationChannel;
      notification_status: NotificationStatus;
      notification_type: NotificationType;
    };
  };
}
