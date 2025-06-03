
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface GeneratedLesson {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  content: any;
  subject: string;
  grade_level: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  learning_style?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  estimated_duration?: number;
  points_value: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LessonAssignment {
  id: string;
  lesson_id: string;
  student_id: string;
  assigned_by: string;
  assigned_at: string;
  due_date?: string;
  is_completed: boolean;
  completed_at?: string;
  score?: number;
  time_spent?: number;
}

export interface CreateLessonRequest {
  title: string;
  description?: string;
  content: any;
  subject: string;
  grade_level: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  learning_style?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  estimated_duration?: number;
  points_value: number;
}

export interface AssignLessonRequest {
  lesson_id: string;
  student_ids: string[];
  due_date?: string;
}

export const lessonService = {
  async createLesson(request: CreateLessonRequest): Promise<GeneratedLesson> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create the lesson object with teacher_id
    const lessonData = {
      ...request,
      teacher_id: user.id
    };

    const { data, error } = await supabase
      .from('generated_lessons')
      .insert(lessonData)
      .select()
      .single();

    if (error) {
      console.error('Failed to create lesson:', error);
      throw new Error('Failed to create lesson');
    }

    return data;
  },

  async publishLesson(lessonId: string): Promise<void> {
    const { error } = await supabase
      .from('generated_lessons')
      .update({ is_published: true })
      .eq('id', lessonId);

    if (error) {
      console.error('Failed to publish lesson:', error);
      throw new Error('Failed to publish lesson');
    }
  },

  async getTeacherLessons(teacherId: string): Promise<GeneratedLesson[]> {
    const { data, error } = await supabase
      .from('generated_lessons')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch lessons:', error);
      throw new Error('Failed to fetch lessons');
    }

    return data || [];
  },

  async assignLesson(request: AssignLessonRequest): Promise<void> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const assignments = request.student_ids.map(student_id => ({
      lesson_id: request.lesson_id,
      student_id,
      assigned_by: user.id,
      due_date: request.due_date,
    }));

    const { error } = await supabase
      .from('lesson_assignments')
      .insert(assignments);

    if (error) {
      console.error('Failed to assign lesson:', error);
      throw new Error('Failed to assign lesson');
    }
  },

  async getStudentsByGrade(gradeLevel: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, grade_level')
      .eq('role', 'student')
      .eq('grade_level', gradeLevel);

    if (error) {
      console.error('Failed to fetch students:', error);
      throw new Error('Failed to fetch students');
    }

    return data || [];
  },

  async getLessonAssignments(lessonId: string): Promise<LessonAssignment[]> {
    const { data, error } = await supabase
      .from('lesson_assignments')
      .select(`
        *,
        profiles!lesson_assignments_student_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('lesson_id', lessonId);

    if (error) {
      console.error('Failed to fetch assignments:', error);
      throw new Error('Failed to fetch assignments');
    }

    return data || [];
  }
};
