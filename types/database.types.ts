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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      flashcard: {
        Row: {
          context_sentence: string | null
          created_at: string | null
          example: string | null
          id: string
          journal_entry_id: string | null
          meaning: string
          set_id: string
          source: string | null
          updated_at: string | null
          word: string
        }
        Insert: {
          context_sentence?: string | null
          created_at?: string | null
          example?: string | null
          id?: string
          journal_entry_id?: string | null
          meaning: string
          set_id: string
          source?: string | null
          updated_at?: string | null
          word: string
        }
        Update: {
          context_sentence?: string | null
          created_at?: string | null
          example?: string | null
          id?: string
          journal_entry_id?: string | null
          meaning?: string
          set_id?: string
          source?: string | null
          updated_at?: string | null
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_set"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_set: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          profile_id: string | null
          source_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          profile_id?: string | null
          source_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          profile_id?: string | null
          source_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_set_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_status: {
        Row: {
          difficulty: number | null
          ease_factor: number
          elapsed_days: number | null
          flashcard_id: string
          id: string
          interval: number
          lapses: number | null
          last_review_at: string | null
          learning_steps: number | null
          next_review_at: string | null
          repetitions: number
          scheduled_days: number | null
          stability: number | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          difficulty?: number | null
          ease_factor?: number
          elapsed_days?: number | null
          flashcard_id: string
          id?: string
          interval?: number
          lapses?: number | null
          last_review_at?: string | null
          learning_steps?: number | null
          next_review_at?: string | null
          repetitions?: number
          scheduled_days?: number | null
          stability?: number | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          difficulty?: number | null
          ease_factor?: number
          elapsed_days?: number | null
          flashcard_id?: string
          id?: string
          interval?: number
          lapses?: number | null
          last_review_at?: string | null
          learning_steps?: number | null
          next_review_at?: string | null
          repetitions?: number
          scheduled_days?: number | null
          stability?: number | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_status_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcard"
            referencedColumns: ["id"]
          },
        ]
      }
      fsrs_review_logs: {
        Row: {
          card_id: string | null
          created_at: string | null
          difficulty_before: number | null
          elapsed_days: number | null
          id: string
          rating: string | null
          review_date: string | null
          scheduled_days: number | null
          stability_before: number | null
          state: string | null
          user_id: string | null
        }
        Insert: {
          card_id?: string | null
          created_at?: string | null
          difficulty_before?: number | null
          elapsed_days?: number | null
          id?: string
          rating?: string | null
          review_date?: string | null
          scheduled_days?: number | null
          stability_before?: number | null
          state?: string | null
          user_id?: string | null
        }
        Update: {
          card_id?: string | null
          created_at?: string | null
          difficulty_before?: number | null
          elapsed_days?: number | null
          id?: string
          rating?: string | null
          review_date?: string | null
          scheduled_days?: number | null
          stability_before?: number | null
          state?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fsrs_review_logs_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "flashcard_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fsrs_review_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journals: {
        Row: {
          content: string
          id: string
          journal_date: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          id?: string
          journal_date?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          id?: string
          journal_date?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          english_level: string | null
          goals: string[] | null
          id: string
          name: string | null
          onboarding_completed: boolean | null
          pinned_template_ids: string[] | null
          updated_at: string | null
          writing_types: string[] | null
        }
        Insert: {
          english_level?: string | null
          goals?: string[] | null
          id: string
          name?: string | null
          onboarding_completed?: boolean | null
          pinned_template_ids?: string[] | null
          updated_at?: string | null
          writing_types?: string[] | null
        }
        Update: {
          english_level?: string | null
          goals?: string[] | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean | null
          pinned_template_ids?: string[] | null
          updated_at?: string | null
          writing_types?: string[] | null
        }
        Relationships: []
      }
      roleplays: {
        Row: {
          context: string
          created_at: string | null
          task: string | null
          id: string
          level: string | null
          name: string
          ai_role: string | null
          starter_message: string
          topic: string | null
        }
        Insert: {
          context: string
          created_at?: string | null
          task?: string | null
          id?: string
          level?: string | null
          name: string
          ai_role?: string | null
          starter_message: string
          topic?: string | null
        }
        Update: {
          context?: string
          created_at?: string | null
          task?: string | null
          id?: string
          level?: string | null
          name?: string
          ai_role?: string | null
          starter_message?: string
          topic?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_flashcard_sets: {
        Args: { profile: string }
        Returns: {
          flashcards_due: number
          set_id: string
          set_title: string
          total_flashcards: number
        }[]
      }
      get_journal_stats: {
        Args: { user_uuid: string }
        Returns: {
          current_streak: number
          total_entries: number
        }[]
      }
      get_journals: {
        Args: { _user_id: string }
        Returns: {
          content: string
          id: string
          journal_date: string
          title: string
        }[]
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
