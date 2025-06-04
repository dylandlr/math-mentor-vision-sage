import { supabase } from '@/integrations/supabase/client';

export interface ContentGenerationRequest {
  type: 'lesson' | 'quiz' | 'practice' | 'project' | 'course';
  subject: string;
  gradeLevel: number;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  duration?: number;
  // Additional properties for course generation
  moduleCount?: number;
  topics?: string[];
  preferences?: {
    includeQuizzes?: boolean;
    includeGames?: boolean;
    includeVideos?: boolean;
  };
}

export interface GeneratedContent {
  type: string;
  subject: string;
  gradeLevel: number;
  topic: string;
  difficulty: string;
  learningStyle?: string;
  duration?: number;
  sections: Record<string, string>;
  metadata: {
    generatedAt: string;
    estimatedDuration: number;
    aiSystem: string;
  };
}

export interface VideoGenerationRequest {
  prompt: string;
  type: 'explanation' | 'example' | 'exercise';
}

export interface GeneratedVideo {
  prompt: string;
  type: string;
  script: string;
  metadata: {
    id: string;
    title: string;
    duration: number;
    format: string;
    resolution: string;
    status: string;
    thumbnailUrl: string;
    videoUrl: string | null;
  };
  estimatedCompletionTime: string;
  storyboard: Array<{
    time: string;
    scene: string;
  }>;
  generatedAt: string;
  aiSystem: string;
}

export const contentService = {
  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const { data, error } = await supabase.functions.invoke('ai-content-generator', {
      body: request
    });

    if (error) {
      console.error('Content generation failed:', error);
      throw new Error('Failed to generate content');
    }

    return data;
  },

  async generateVideo(request: VideoGenerationRequest): Promise<GeneratedVideo> {
    const { data, error } = await supabase.functions.invoke('ai-video-generator', {
      body: request
    });

    if (error) {
      console.error('Video generation failed:', error);
      throw new Error('Failed to generate video');
    }

    return data;
  }
};
