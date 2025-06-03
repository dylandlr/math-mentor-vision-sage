
import { supabase } from '@/integrations/supabase/client';

export interface AISystemStatus {
  sage: 'online' | 'offline' | 'busy';
  mentor: 'online' | 'offline' | 'busy';
  insight: 'online' | 'offline' | 'busy';
  adapt: 'online' | 'offline' | 'busy';
  vision: 'online' | 'offline' | 'busy';
}

export interface ContentGenerationRequest {
  type: 'lesson' | 'quiz' | 'practice' | 'project';
  subject: string;
  gradeLevel: number;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  duration?: number;
}

export interface AdaptiveRecommendation {
  userId: string;
  recommendedContent: string[];
  learningGaps: string[];
  nextTopics: string[];
  difficultyAdjustment: number;
}

export class AIOrchestrator {
  private systemStatus: AISystemStatus = {
    sage: 'online',
    mentor: 'online',
    insight: 'online',
    adapt: 'online',
    vision: 'online'
  };

  async getSystemStatus(): Promise<AISystemStatus> {
    return this.systemStatus;
  }

  async generateContent(request: ContentGenerationRequest): Promise<any> {
    try {
      this.systemStatus.sage = 'busy';
      
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: request
      });

      if (error) throw error;
      
      this.systemStatus.sage = 'online';
      return data;
    } catch (error) {
      this.systemStatus.sage = 'offline';
      console.error('Content generation failed:', error);
      throw error;
    }
  }

  async getAnalytics(userId: string, timeframe: string = '30d'): Promise<any> {
    try {
      this.systemStatus.insight = 'busy';
      
      const { data, error } = await supabase.functions.invoke('ai-analytics', {
        body: { userId, timeframe }
      });

      if (error) throw error;
      
      this.systemStatus.insight = 'online';
      return data;
    } catch (error) {
      this.systemStatus.insight = 'offline';
      console.error('Analytics generation failed:', error);
      throw error;
    }
  }

  async getAdaptiveRecommendations(userId: string): Promise<AdaptiveRecommendation> {
    try {
      this.systemStatus.adapt = 'busy';
      
      const { data, error } = await supabase.functions.invoke('ai-adaptive-learning', {
        body: { userId }
      });

      if (error) throw error;
      
      this.systemStatus.adapt = 'online';
      return data;
    } catch (error) {
      this.systemStatus.adapt = 'offline';
      console.error('Adaptive learning failed:', error);
      throw error;
    }
  }

  async generateVideo(prompt: string, type: 'explanation' | 'example' | 'exercise'): Promise<any> {
    try {
      this.systemStatus.vision = 'busy';
      
      const { data, error } = await supabase.functions.invoke('ai-video-generator', {
        body: { prompt, type }
      });

      if (error) throw error;
      
      this.systemStatus.vision = 'online';
      return data;
    } catch (error) {
      this.systemStatus.vision = 'offline';
      console.error('Video generation failed:', error);
      throw error;
    }
  }
}

export const aiOrchestrator = new AIOrchestrator();
