
import { supabase } from '@/integrations/supabase/client';
import { courseService, Course, CourseModule, CreateCourseRequest, CreateModuleRequest } from './courseService';

// Legacy interfaces for backward compatibility
export interface SageCourse extends Course {}
export interface SageLessonModule extends CourseModule {}

export const sageService = {
  async createCourse(request: CreateCourseRequest, teacherId: string): Promise<SageCourse> {
    return courseService.createCourse(request, teacherId);
  },

  async getCoursesByTeacher(teacherId: string): Promise<SageCourse[]> {
    return courseService.getCoursesByTeacher(teacherId);
  },

  async getCourseById(courseId: string): Promise<SageCourse | null> {
    return courseService.getCourseById(courseId);
  },

  async createModule(request: CreateModuleRequest): Promise<SageLessonModule> {
    return courseService.createModule(request);
  },

  async getModulesByCourse(courseId: string): Promise<SageLessonModule[]> {
    return courseService.getModulesByCourse(courseId);
  },

  async updateModule(moduleId: string, updates: Partial<SageLessonModule>): Promise<void> {
    return courseService.updateModule(moduleId, updates);
  },

  async deleteModule(moduleId: string): Promise<void> {
    return courseService.deleteModule(moduleId);
  },

  async generateModuleContent(moduleId: string, prompt: string): Promise<any> {
    return courseService.generateModuleContent(moduleId, prompt);
  }
};

// Re-export types for backward compatibility
export { CreateCourseRequest, CreateModuleRequest };
