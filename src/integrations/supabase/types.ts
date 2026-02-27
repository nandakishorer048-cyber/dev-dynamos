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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          points_required: number | null
          streak_required: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          points_required?: number | null
          streak_required?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          points_required?: number | null
          streak_required?: number | null
        }
        Relationships: []
      }
      daily_check_ins: {
        Row: {
          check_in_date: string
          created_at: string
          id: string
          points_earned: number
          user_id: string
        }
        Insert: {
          check_in_date?: string
          created_at?: string
          id?: string
          points_earned?: number
          user_id: string
        }
        Update: {
          check_in_date?: string
          created_at?: string
          id?: string
          points_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      health_goals: {
        Row: {
          created_at: string
          current_value: number
          end_date: string
          goal_type: string
          id: string
          is_completed: boolean
          points_reward: number
          start_date: string
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number
          end_date: string
          goal_type: string
          id?: string
          is_completed?: boolean
          points_reward?: number
          start_date?: string
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number
          end_date?: string
          goal_type?: string
          id?: string
          is_completed?: boolean
          points_reward?: number
          start_date?: string
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medical_reports: {
        Row: {
          ai_analysis: string | null
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          key_findings: Json | null
          report_date: string | null
          report_type: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          key_findings?: Json | null
          report_date?: string | null
          report_type?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          key_findings?: Json | null
          report_date?: string | null
          report_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medication_logs: {
        Row: {
          id: string
          logged_at: string
          medication_id: string
          reminder_id: string | null
          scheduled_time: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          logged_at?: string
          medication_id: string
          reminder_id?: string | null
          scheduled_time: string
          status: string
          user_id: string
        }
        Update: {
          id?: string
          logged_at?: string
          medication_id?: string
          reminder_id?: string | null
          scheduled_time?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "medication_reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_reminders: {
        Row: {
          created_at: string
          days_of_week: number[] | null
          id: string
          is_enabled: boolean
          medication_id: string
          reminder_time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_of_week?: number[] | null
          id?: string
          is_enabled?: boolean
          medication_id: string
          reminder_time: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[] | null
          id?: string
          is_enabled?: boolean
          medication_id?: string
          reminder_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_reminders_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          ai_explanation: string | null
          created_at: string
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          is_active: boolean
          name: string
          precautions: string | null
          purpose: string | null
          side_effects: string | null
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_explanation?: string | null
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean
          name: string
          precautions?: string | null
          purpose?: string | null
          side_effects?: string | null
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_explanation?: string | null
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean
          name?: string
          precautions?: string | null
          purpose?: string | null
          side_effects?: string | null
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medicine_catalog: {
        Row: {
          category: string | null
          commission_percent: number
          created_at: string
          description: string | null
          dosage_form: string | null
          facility_id: string
          generic_name: string | null
          id: string
          image_url: string | null
          in_stock: boolean
          manufacturer: string | null
          name: string
          price: number
          requires_prescription: boolean
          strength: string | null
        }
        Insert: {
          category?: string | null
          commission_percent?: number
          created_at?: string
          description?: string | null
          dosage_form?: string | null
          facility_id: string
          generic_name?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          manufacturer?: string | null
          name: string
          price: number
          requires_prescription?: boolean
          strength?: string | null
        }
        Update: {
          category?: string | null
          commission_percent?: number
          created_at?: string
          description?: string | null
          dosage_form?: string | null
          facility_id?: string
          generic_name?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          manufacturer?: string | null
          name?: string
          price?: number
          requires_prescription?: boolean
          strength?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medicine_catalog_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "partner_facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_order_items: {
        Row: {
          id: string
          medicine_id: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          id?: string
          medicine_id: string
          order_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          id?: string
          medicine_id?: string
          order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "medicine_order_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicine_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "medicine_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_orders: {
        Row: {
          ai_recommendation: string | null
          commission_amount: number
          created_at: string
          delivery_address: string | null
          delivery_fee: number | null
          delivery_type: string
          facility_id: string
          id: string
          notes: string | null
          payment_status: string
          status: string
          stripe_payment_id: string | null
          symptoms_context: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_recommendation?: string | null
          commission_amount: number
          created_at?: string
          delivery_address?: string | null
          delivery_fee?: number | null
          delivery_type?: string
          facility_id: string
          id?: string
          notes?: string | null
          payment_status?: string
          status?: string
          stripe_payment_id?: string | null
          symptoms_context?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_recommendation?: string | null
          commission_amount?: number
          created_at?: string
          delivery_address?: string | null
          delivery_fee?: number | null
          delivery_type?: string
          facility_id?: string
          id?: string
          notes?: string | null
          payment_status?: string
          status?: string
          stripe_payment_id?: string | null
          symptoms_context?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_orders_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "partner_facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_facilities: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          facility_type: string
          id: string
          is_active: boolean
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          offers_home_collection: boolean
          offers_home_delivery: boolean
          operating_hours: Json | null
          phone: string | null
          rating: number | null
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          facility_type: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          offers_home_collection?: boolean
          offers_home_delivery?: boolean
          operating_hours?: Json | null
          phone?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          facility_type?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          offers_home_collection?: boolean
          offers_home_delivery?: boolean
          operating_hours?: Json | null
          phone?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          points: number
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          points: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      symptom_analyses: {
        Row: {
          ai_response: Json
          created_at: string
          id: string
          recommended_medicines: string[] | null
          recommended_tests: string[] | null
          symptoms: string
          user_id: string
        }
        Insert: {
          ai_response: Json
          created_at?: string
          id?: string
          recommended_medicines?: string[] | null
          recommended_tests?: string[] | null
          symptoms: string
          user_id: string
        }
        Update: {
          ai_response?: Json
          created_at?: string
          id?: string
          recommended_medicines?: string[] | null
          recommended_tests?: string[] | null
          symptoms?: string
          user_id?: string
        }
        Relationships: []
      }
      test_bookings: {
        Row: {
          ai_recommendation: string | null
          amount: number
          booking_date: string
          booking_time: string | null
          collection_address: string | null
          commission_amount: number
          created_at: string
          facility_id: string
          id: string
          is_home_collection: boolean
          notes: string | null
          payment_status: string
          result_url: string | null
          status: string
          stripe_payment_id: string | null
          symptoms_context: string | null
          test_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_recommendation?: string | null
          amount: number
          booking_date: string
          booking_time?: string | null
          collection_address?: string | null
          commission_amount: number
          created_at?: string
          facility_id: string
          id?: string
          is_home_collection?: boolean
          notes?: string | null
          payment_status?: string
          result_url?: string | null
          status?: string
          stripe_payment_id?: string | null
          symptoms_context?: string | null
          test_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_recommendation?: string | null
          amount?: number
          booking_date?: string
          booking_time?: string | null
          collection_address?: string | null
          commission_amount?: number
          created_at?: string
          facility_id?: string
          id?: string
          is_home_collection?: boolean
          notes?: string | null
          payment_status?: string
          result_url?: string | null
          status?: string
          stripe_payment_id?: string | null
          symptoms_context?: string | null
          test_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_bookings_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "partner_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_bookings_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      test_catalog: {
        Row: {
          category: string | null
          commission_percent: number
          created_at: string
          description: string | null
          facility_id: string
          id: string
          is_available: boolean
          name: string
          preparation_instructions: string | null
          price: number
          sample_type: string | null
          turnaround_hours: number | null
        }
        Insert: {
          category?: string | null
          commission_percent?: number
          created_at?: string
          description?: string | null
          facility_id: string
          id?: string
          is_available?: boolean
          name: string
          preparation_instructions?: string | null
          price: number
          sample_type?: string | null
          turnaround_hours?: number | null
        }
        Update: {
          category?: string | null
          commission_percent?: number
          created_at?: string
          description?: string | null
          facility_id?: string
          id?: string
          is_available?: boolean
          name?: string
          preparation_instructions?: string | null
          price?: number
          sample_type?: string | null
          turnaround_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "test_catalog_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "partner_facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_check_in: string | null
          longest_streak: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_check_in?: string | null
          longest_streak?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_check_in?: string | null
          longest_streak?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vital_readings: {
        Row: {
          blood_sugar: number | null
          created_at: string
          diastolic_bp: number | null
          id: string
          notes: string | null
          oxygen_level: number | null
          pulse_rate: number | null
          reading_date: string
          systolic_bp: number | null
          user_id: string
        }
        Insert: {
          blood_sugar?: number | null
          created_at?: string
          diastolic_bp?: number | null
          id?: string
          notes?: string | null
          oxygen_level?: number | null
          pulse_rate?: number | null
          reading_date?: string
          systolic_bp?: number | null
          user_id: string
        }
        Update: {
          blood_sugar?: number | null
          created_at?: string
          diastolic_bp?: number | null
          id?: string
          notes?: string | null
          oxygen_level?: number | null
          pulse_rate?: number | null
          reading_date?: string
          systolic_bp?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
