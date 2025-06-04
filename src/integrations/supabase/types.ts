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
      achievements: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          points: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          points?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          points?: number | null
          title?: string
        }
        Relationships: []
      }
      ai_chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string | null
          messages: Json | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          messages?: Json | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          messages?: Json | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_sessions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          ai_generated_content: Json | null
          content: Json | null
          course_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_hidden: boolean | null
          is_published: boolean | null
          module_type: string
          order_index: number
          parent_module_id: string | null
          timeline_position: number
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_generated_content?: Json | null
          content?: Json | null
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_hidden?: boolean | null
          is_published?: boolean | null
          module_type: string
          order_index?: number
          parent_module_id?: string | null
          timeline_position?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_generated_content?: Json | null
          content?: Json | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_hidden?: boolean | null
          is_published?: boolean | null
          module_type?: string
          order_index?: number
          parent_module_id?: string | null
          timeline_position?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_modules_parent_module_id_fkey"
            columns: ["parent_module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty_level: Database["public"]["Enums"]["difficulty_level"]
          estimated_duration: number | null
          grade_level: number
          id: string
          is_active: boolean | null
          is_published: boolean | null
          subject: string
          teacher_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: Database["public"]["Enums"]["difficulty_level"]
          estimated_duration?: number | null
          grade_level: number
          id?: string
          is_active?: boolean | null
          is_published?: boolean | null
          subject?: string
          teacher_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: Database["public"]["Enums"]["difficulty_level"]
          estimated_duration?: number | null
          grade_level?: number
          id?: string
          is_active?: boolean | null
          is_published?: boolean | null
          subject?: string
          teacher_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_assets: {
        Row: {
          ai_system: string | null
          asset_data: Json | null
          asset_type: string
          asset_url: string | null
          created_at: string | null
          generation_prompt: string | null
          id: string
          module_id: string
        }
        Insert: {
          ai_system?: string | null
          asset_data?: Json | null
          asset_type: string
          asset_url?: string | null
          created_at?: string | null
          generation_prompt?: string | null
          id?: string
          module_id: string
        }
        Update: {
          ai_system?: string | null
          asset_data?: Json | null
          asset_type?: string
          asset_url?: string | null
          created_at?: string | null
          generation_prompt?: string | null
          id?: string
          module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_assets_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_lessons: {
        Row: {
          content: Json
          created_at: string
          description: string | null
          difficulty_level: Database["public"]["Enums"]["difficulty_level"]
          estimated_duration: number | null
          grade_level: number
          id: string
          is_published: boolean | null
          learning_style: Database["public"]["Enums"]["learning_style"] | null
          points_value: number | null
          subject: string
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          description?: string | null
          difficulty_level: Database["public"]["Enums"]["difficulty_level"]
          estimated_duration?: number | null
          grade_level: number
          id?: string
          is_published?: boolean | null
          learning_style?: Database["public"]["Enums"]["learning_style"] | null
          points_value?: number | null
          subject: string
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          description?: string | null
          difficulty_level?: Database["public"]["Enums"]["difficulty_level"]
          estimated_duration?: number | null
          grade_level?: number
          id?: string
          is_published?: boolean | null
          learning_style?: Database["public"]["Enums"]["learning_style"] | null
          points_value?: number | null
          subject?: string
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          completed_at: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          lesson_id: string
          score: number | null
          student_id: string
          time_spent: number | null
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          completed_at?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          lesson_id: string
          score?: number | null
          student_id: string
          time_spent?: number | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          completed_at?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          lesson_id?: string
          score?: number | null
          student_id?: string
          time_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string | null
          score: number | null
          student_id: string | null
          time_spent: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          score?: number | null
          student_id?: string | null
          time_spent?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          score?: number | null
          student_id?: string | null
          time_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: Json | null
          course_id: string
          created_at: string | null
          description: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          generated_from_id: string | null
          id: string
          is_published: boolean | null
          lesson_type: string | null
          multimedia_assets: Json | null
          order_index: number
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          course_id: string
          created_at?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          generated_from_id?: string | null
          id?: string
          is_published?: boolean | null
          lesson_type?: string | null
          multimedia_assets?: Json | null
          order_index: number
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          generated_from_id?: string | null
          id?: string
          is_published?: boolean | null
          lesson_type?: string | null
          multimedia_assets?: Json | null
          order_index?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_generated_from_id_fkey"
            columns: ["generated_from_id"]
            isOneToOne: false
            referencedRelation: "generated_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      module_settings: {
        Row: {
          created_at: string | null
          id: string
          module_id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          module_id: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          module_id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_settings_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          grade_level: number | null
          id: string
          learning_style: Database["public"]["Enums"]["learning_style"] | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          grade_level?: number | null
          id: string
          learning_style?: Database["public"]["Enums"]["learning_style"] | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          grade_level?: number | null
          id?: string
          learning_style?: Database["public"]["Enums"]["learning_style"] | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      sage_course_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          completed_at: string | null
          course_id: string
          due_date: string | null
          id: string
          is_completed: boolean | null
          progress: Json | null
          student_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          completed_at?: string | null
          course_id: string
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: Json | null
          student_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          completed_at?: string | null
          course_id?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: Json | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sage_course_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "sage_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      sage_courses: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty_level: Database["public"]["Enums"]["difficulty_level"]
          estimated_duration: number | null
          grade_level: number
          id: string
          is_published: boolean | null
          subject: string
          teacher_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: Database["public"]["Enums"]["difficulty_level"]
          estimated_duration?: number | null
          grade_level: number
          id?: string
          is_published?: boolean | null
          subject: string
          teacher_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: Database["public"]["Enums"]["difficulty_level"]
          estimated_duration?: number | null
          grade_level?: number
          id?: string
          is_published?: boolean | null
          subject?: string
          teacher_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sage_generated_assets: {
        Row: {
          ai_system: string | null
          asset_data: Json | null
          asset_type: string
          asset_url: string | null
          created_at: string | null
          generation_prompt: string | null
          id: string
          module_id: string
        }
        Insert: {
          ai_system?: string | null
          asset_data?: Json | null
          asset_type: string
          asset_url?: string | null
          created_at?: string | null
          generation_prompt?: string | null
          id?: string
          module_id: string
        }
        Update: {
          ai_system?: string | null
          asset_data?: Json | null
          asset_type?: string
          asset_url?: string | null
          created_at?: string | null
          generation_prompt?: string | null
          id?: string
          module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sage_generated_assets_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "sage_lesson_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      sage_lesson_modules: {
        Row: {
          ai_generated_content: Json | null
          content: Json | null
          course_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_hidden: boolean | null
          module_type: Database["public"]["Enums"]["module_type"]
          order_index: number
          parent_module_id: string | null
          timeline_position: number
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_generated_content?: Json | null
          content?: Json | null
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_hidden?: boolean | null
          module_type: Database["public"]["Enums"]["module_type"]
          order_index: number
          parent_module_id?: string | null
          timeline_position: number
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_generated_content?: Json | null
          content?: Json | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_hidden?: boolean | null
          module_type?: Database["public"]["Enums"]["module_type"]
          order_index?: number
          parent_module_id?: string | null
          timeline_position?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sage_lesson_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "sage_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sage_lesson_modules_parent_module_id_fkey"
            columns: ["parent_module_id"]
            isOneToOne: false
            referencedRelation: "sage_lesson_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      sage_module_settings: {
        Row: {
          created_at: string | null
          id: string
          module_id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          module_id: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          module_id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sage_module_settings_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "sage_lesson_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      student_achievements: {
        Row: {
          achievement_id: string | null
          earned_at: string | null
          id: string
          student_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          earned_at?: string | null
          id?: string
          student_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          earned_at?: string | null
          id?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_enrollments: {
        Row: {
          course_id: string | null
          enrolled_at: string | null
          id: string
          is_active: boolean | null
          student_id: string | null
        }
        Insert: {
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          is_active?: boolean | null
          student_id?: string | null
        }
        Update: {
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          is_active?: boolean | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_points: {
        Row: {
          id: string
          last_activity: string | null
          points: number | null
          streak_days: number | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          last_activity?: string | null
          points?: number | null
          streak_days?: number | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          last_activity?: string | null
          points?: number | null
          streak_days?: number | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_points_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          achievement_notifications: boolean | null
          allow_analytics: boolean | null
          autoplay: boolean | null
          country: string | null
          created_at: string
          difficulty_setting: string | null
          email_notifications: boolean | null
          font_size: string | null
          id: string
          language: string | null
          lesson_reminders: boolean | null
          profile_visibility: string | null
          push_notifications: boolean | null
          show_progress: boolean | null
          sound_effects: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_notifications?: boolean | null
          allow_analytics?: boolean | null
          autoplay?: boolean | null
          country?: string | null
          created_at?: string
          difficulty_setting?: string | null
          email_notifications?: boolean | null
          font_size?: string | null
          id?: string
          language?: string | null
          lesson_reminders?: boolean | null
          profile_visibility?: string | null
          push_notifications?: boolean | null
          show_progress?: boolean | null
          sound_effects?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_notifications?: boolean | null
          allow_analytics?: boolean | null
          autoplay?: boolean | null
          country?: string | null
          created_at?: string
          difficulty_setting?: string | null
          email_notifications?: boolean | null
          font_size?: string | null
          id?: string
          language?: string | null
          lesson_reminders?: boolean | null
          profile_visibility?: string | null
          push_notifications?: boolean | null
          show_progress?: boolean | null
          sound_effects?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_enrolled: {
        Args: { user_id: string; course_id: string }
        Returns: boolean
      }
      is_teacher: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      content_type: "lesson" | "quiz" | "project" | "video"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      learning_style: "visual" | "auditory" | "reading" | "kinesthetic"
      lesson_structure_type: "course" | "lesson" | "module"
      module_type:
        | "content"
        | "quiz"
        | "game"
        | "video"
        | "image"
        | "assessment"
      user_role: "student" | "teacher" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      content_type: ["lesson", "quiz", "project", "video"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      learning_style: ["visual", "auditory", "reading", "kinesthetic"],
      lesson_structure_type: ["course", "lesson", "module"],
      module_type: ["content", "quiz", "game", "video", "image", "assessment"],
      user_role: ["student", "teacher", "admin"],
    },
  },
} as const
