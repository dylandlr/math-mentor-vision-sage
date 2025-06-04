
import { supabase } from '@/integrations/supabase/client';

export interface StudentCourse {
  id: string;
  title: string;
  description: string;
  grade_level: number;
  teacher_id: string;
  is_active: boolean;
  created_at: string;
  enrollment_date: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
}

export interface StudentLesson {
  id: string;
  title: string;
  description: string;
  course_id: string;
  course_title: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  order_index: number;
  is_published: boolean;
  content: any;
  progress: number;
  is_completed: boolean;
  time_spent: number;
  score: number;
}

export interface StudentAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  earned_at: string;
  category: string;
}

export interface PracticeSession {
  id: string;
  lesson_id: string;
  student_id: string;
  score: number;
  time_spent: number;
  completed_at: string;
  lesson_title: string;
  course_title: string;
}

export const studentService = {
  async getEnrolledCourses(studentId: string): Promise<StudentCourse[]> {
    const { data, error } = await supabase
      .from('student_enrollments')
      .select(`
        enrolled_at,
        courses (
          id,
          title,
          description,
          grade_level,
          teacher_id,
          is_active,
          created_at
        )
      `)
      .eq('student_id', studentId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching enrolled courses:', error);
      return [];
    }

    const coursesWithProgress = await Promise.all(
      (data || []).map(async (enrollment) => {
        const course = enrollment.courses;
        if (!course) return null;

        // Get lesson progress for this course
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('id')
          .eq('course_id', course.id)
          .eq('is_published', true);

        const totalLessons = lessonsData?.length || 0;

        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('student_id', studentId)
          .in('lesson_id', lessonsData?.map(l => l.id) || []);

        const completedLessons = progressData?.filter(p => p.completed).length || 0;
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        return {
          ...course,
          enrollment_date: enrollment.enrolled_at,
          progress,
          completed_lessons: completedLessons,
          total_lessons: totalLessons
        };
      })
    );

    return coursesWithProgress.filter(Boolean) as StudentCourse[];
  },

  async getStudentLessons(studentId: string): Promise<StudentLesson[]> {
    // Get enrolled courses first
    const { data: enrollments } = await supabase
      .from('student_enrollments')
      .select('course_id')
      .eq('student_id', studentId)
      .eq('is_active', true);

    if (!enrollments?.length) return [];

    const courseIds = enrollments.map(e => e.course_id);

    // Get lessons from enrolled courses
    const { data: lessonsData, error } = await supabase
      .from('lessons')
      .select(`
        *,
        courses!inner (
          title,
          id
        )
      `)
      .in('course_id', courseIds)
      .eq('is_published', true)
      .order('order_index');

    if (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }

    // Get progress for each lesson
    const lessonIds = lessonsData?.map(l => l.id) || [];
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', studentId)
      .in('lesson_id', lessonIds);

    return (lessonsData || []).map(lesson => {
      const progress = progressData?.find(p => p.lesson_id === lesson.id);
      return {
        ...lesson,
        course_title: lesson.courses.title,
        progress: progress ? (progress.completed ? 100 : 50) : 0,
        is_completed: progress?.completed || false,
        time_spent: progress?.time_spent || 0,
        score: progress?.score || 0
      };
    });
  },

  async getStudentAchievements(studentId: string): Promise<StudentAchievement[]> {
    const { data, error } = await supabase
      .from('student_achievements')
      .select(`
        earned_at,
        achievements (
          id,
          title,
          description,
          icon,
          points
        )
      `)
      .eq('student_id', studentId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }

    return (data || []).map(item => ({
      ...item.achievements,
      earned_at: item.earned_at,
      category: 'learning' // Default category - could be enhanced
    }));
  },

  async getPracticeHistory(studentId: string): Promise<PracticeSession[]> {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select(`
        *,
        lessons!inner (
          title,
          courses!inner (
            title
          )
        )
      `)
      .eq('student_id', studentId)
      .not('score', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching practice history:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      lesson_id: item.lesson_id,
      student_id: item.student_id,
      score: item.score || 0,
      time_spent: item.time_spent || 0,
      completed_at: item.completed_at || item.created_at,
      lesson_title: item.lessons.title,
      course_title: item.lessons.courses.title
    }));
  },

  async getStudentStats(studentId: string) {
    // Get total points
    const { data: pointsData } = await supabase
      .from('student_points')
      .select('points, streak_days')
      .eq('student_id', studentId)
      .single();

    // Get completed lessons count
    const { data: completedLessons } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('student_id', studentId)
      .eq('completed', true);

    // Get average score
    const { data: scoresData } = await supabase
      .from('lesson_progress')
      .select('score')
      .eq('student_id', studentId)
      .not('score', 'is', null);

    const averageScore = scoresData?.length 
      ? Math.round(scoresData.reduce((sum, item) => sum + (item.score || 0), 0) / scoresData.length)
      : 0;

    return {
      totalPoints: pointsData?.points || 0,
      streakDays: pointsData?.streak_days || 0,
      completedLessons: completedLessons?.length || 0,
      averageScore
    };
  }
};
