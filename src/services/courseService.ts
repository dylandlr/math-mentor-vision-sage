
import { supabase } from '@/integrations/supabase/client';

export interface Course {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  grade_level: number;
  subject: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration?: number;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  parent_module_id?: string;
  module_type: 'content' | 'quiz' | 'game' | 'video' | 'image' | 'assessment';
  title: string;
  description?: string;
  order_index: number;
  timeline_position: number;
  duration_minutes: number;
  content: any;
  ai_generated_content: any;
  is_hidden: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  grade_level: number;
  subject: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration?: number;
}

export interface CreateModuleRequest {
  course_id: string;
  parent_module_id?: string;
  module_type: 'content' | 'quiz' | 'game' | 'video' | 'image' | 'assessment';
  title: string;
  description?: string;
  timeline_position: number;
  duration_minutes?: number;
  content?: any;
}

export const courseService = {
  async createCourse(request: CreateCourseRequest, teacherId: string): Promise<Course> {
    const courseData = {
      ...request,
      teacher_id: teacherId,
      is_active: true,
      is_published: false
    };

    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      throw new Error('Failed to create course');
    }

    return data;
  },

  async getCoursesByTeacher(teacherId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }

    return data || [];
  },

  async getCourseById(courseId: string): Promise<Course | null> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) {
      console.error('Error fetching course:', error);
      return null;
    }

    return data;
  },

  async updateCourse(courseId: string, updates: Partial<Course>): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId);

    if (error) {
      console.error('Error updating course:', error);
      throw new Error('Failed to update course');
    }
  },

  async deleteCourse(courseId: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      console.error('Error deleting course:', error);
      throw new Error('Failed to delete course');
    }
  },

  async createModule(request: CreateModuleRequest): Promise<CourseModule> {
    const { data, error } = await supabase
      .from('course_modules')
      .insert([{
        ...request,
        order_index: request.timeline_position,
        duration_minutes: request.duration_minutes || 5,
        content: request.content || {},
        ai_generated_content: {},
        is_hidden: false,
        is_published: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating module:', error);
      throw new Error('Failed to create module');
    }

    return data as CourseModule;
  },

  async getModulesByCourse(courseId: string): Promise<CourseModule[]> {
    const { data, error } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('timeline_position', { ascending: true });

    if (error) {
      console.error('Error fetching modules:', error);
      throw new Error('Failed to fetch modules');
    }

    return (data || []).map(item => ({
      ...item,
      module_type: item.module_type as CourseModule['module_type']
    }));
  },

  async updateModule(moduleId: string, updates: Partial<CourseModule>): Promise<void> {
    const { error } = await supabase
      .from('course_modules')
      .update(updates)
      .eq('id', moduleId);

    if (error) {
      console.error('Error updating module:', error);
      throw new Error('Failed to update module');
    }
  },

  async deleteModule(moduleId: string): Promise<void> {
    const { error } = await supabase
      .from('course_modules')
      .delete()
      .eq('id', moduleId);

    if (error) {
      console.error('Error deleting module:', error);
      throw new Error('Failed to delete module');
    }
  },

  async generateModuleContent(moduleId: string, prompt: string): Promise<any> {
    // This will integrate with the existing SAGE AI content generator
    try {
      const response = await fetch('/api/ai-content-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'module_content',
          prompt,
          moduleId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }
};
