
import { supabase } from '@/integrations/supabase/client';

export interface LessonContent {
  id: string;
  title: string;
  description: string;
  content: any;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  lesson_type: string;
  multimedia_assets: any[];
  estimated_duration?: number;
  points_value?: number;
}

export interface LessonProgress {
  id: string;
  lesson_id: string;
  student_id: string;
  completed: boolean;
  score: number | null;
  time_spent: number;
  completed_at: string | null;
  created_at: string;
}

export const lessonPlayerService = {
  async getLessonById(lessonId: string): Promise<LessonContent | null> {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        generated_lessons!lessons_generated_from_id_fkey (
          estimated_duration,
          points_value
        )
      `)
      .eq('id', lessonId)
      .single();

    if (error) {
      console.error('Error fetching lesson:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      content: data.content,
      difficulty_level: data.difficulty_level || 'beginner',
      lesson_type: data.lesson_type || 'standard',
      multimedia_assets: Array.isArray(data.multimedia_assets) ? data.multimedia_assets : [],
      estimated_duration: data.generated_lessons?.estimated_duration,
      points_value: data.generated_lessons?.points_value
    };
  },

  async getLessonProgress(lessonId: string, studentId: string): Promise<LessonProgress | null> {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching lesson progress:', error);
      return null;
    }

    return data;
  },

  async updateLessonProgress(
    lessonId: string, 
    studentId: string, 
    progressData: Partial<LessonProgress>
  ): Promise<void> {
    const { error } = await supabase
      .from('lesson_progress')
      .upsert({
        lesson_id: lessonId,
        student_id: studentId,
        ...progressData
      });

    if (error) {
      console.error('Error updating lesson progress:', error);
      throw new Error('Failed to update lesson progress');
    }
  },

  async markLessonComplete(lessonId: string, studentId: string, score: number): Promise<void> {
    const { error } = await supabase
      .from('lesson_progress')
      .upsert({
        lesson_id: lessonId,
        student_id: studentId,
        completed: true,
        score,
        completed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error marking lesson complete:', error);
      throw new Error('Failed to mark lesson complete');
    }

    // Award points if applicable
    const lesson = await this.getLessonById(lessonId);
    if (lesson?.points_value) {
      await this.awardPoints(studentId, lesson.points_value);
    }
  },

  async awardPoints(studentId: string, points: number): Promise<void> {
    // Update student points directly since the RPC function doesn't exist
    const { error } = await supabase
      .from('student_points')
      .upsert({
        student_id: studentId,
        points: points,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'student_id'
      });

    if (error) {
      console.error('Error awarding points:', error);
    }
  }
};
