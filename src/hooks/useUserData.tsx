
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useUserData = () => {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      fetchUserData();
    }
  }, [user, profile]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      if (profile.role === 'student') {
        // Fetch enrolled courses
        const { data: enrollments } = await supabase
          .from('student_enrollments')
          .select(`
            *,
            courses (*)
          `)
          .eq('student_id', user.id)
          .eq('is_active', true);

        setCourses(enrollments?.map(e => e.courses) || []);

        // Fetch progress
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select(`
            *,
            lessons (
              *,
              courses (*)
            )
          `)
          .eq('student_id', user.id);

        setProgress(progressData || []);

        // Fetch achievements
        const { data: studentAchievements } = await supabase
          .from('student_achievements')
          .select(`
            *,
            achievements (*)
          `)
          .eq('student_id', user.id);

        setAchievements(studentAchievements?.map(sa => sa.achievements) || []);

        // Fetch points
        const { data: pointsData } = await supabase
          .from('student_points')
          .select('*')
          .eq('student_id', user.id)
          .single();

        setPoints(pointsData);

      } else if (profile.role === 'teacher') {
        // Fetch teacher's courses
        const { data: teacherCourses } = await supabase
          .from('courses')
          .select('*')
          .eq('teacher_id', user.id);

        setCourses(teacherCourses || []);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    courses,
    progress,
    achievements,
    points,
    loading,
    refetch: fetchUserData
  };
};
