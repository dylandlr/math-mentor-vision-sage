
import { supabase } from '@/integrations/supabase/client';
import { contentService, ContentGenerationRequest } from './contentService';
import { analyticsService } from './analyticsService';

export interface AISystemStatus {
  sage: 'online' | 'offline' | 'busy';
  mentor: 'online' | 'offline' | 'busy';
  insight: 'online' | 'offline' | 'busy';
  adapt: 'online' | 'offline' | 'busy';
  vision: 'online' | 'offline' | 'busy';
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
    // Check each AI system's health
    try {
      // Test SAGE (Content Generation)
      await supabase.functions.invoke('ai-content-generator', { 
        body: { type: 'test', subject: 'test', gradeLevel: 1, topic: 'test', difficulty: 'beginner' } 
      });
      this.systemStatus.sage = 'online';
    } catch {
      this.systemStatus.sage = 'offline';
    }

    try {
      // Test MENTOR (Chat)
      await supabase.functions.invoke('ai-mentor-chat', { 
        body: { message: 'test', chatHistory: [] } 
      });
      this.systemStatus.mentor = 'online';
    } catch {
      this.systemStatus.mentor = 'offline';
    }

    try {
      // Test INSIGHT (Analytics)
      await supabase.functions.invoke('ai-analytics', { 
        body: { userId: 'test', timeframe: '7d' } 
      });
      this.systemStatus.insight = 'online';
    } catch {
      this.systemStatus.insight = 'offline';
    }

    try {
      // Test ADAPT (Adaptive Learning)
      await supabase.functions.invoke('ai-adaptive-learning', { 
        body: { userId: 'test' } 
      });
      this.systemStatus.adapt = 'online';
    } catch {
      this.systemStatus.adapt = 'offline';
    }

    try {
      // Test VISION (Video Generation)
      await supabase.functions.invoke('ai-video-generator', { 
        body: { prompt: 'test', type: 'explanation' } 
      });
      this.systemStatus.vision = 'online';
    } catch {
      this.systemStatus.vision = 'offline';
    }

    return this.systemStatus;
  }

  async generateContent(request: ContentGenerationRequest): Promise<any> {
    this.systemStatus.sage = 'busy';
    try {
      const result = await contentService.generateContent(request);
      this.systemStatus.sage = 'online';
      return result;
    } catch (error) {
      this.systemStatus.sage = 'offline';
      throw error;
    }
  }

  async getAnalytics(userId: string, timeframe: string = '30d'): Promise<any> {
    this.systemStatus.insight = 'busy';
    try {
      const result = await analyticsService.generateAnalytics(userId, timeframe);
      this.systemStatus.insight = 'online';
      return result;
    } catch (error) {
      this.systemStatus.insight = 'offline';
      throw error;
    }
  }

  async getAdaptiveRecommendations(userId: string): Promise<AdaptiveRecommendation> {
    this.systemStatus.adapt = 'busy';
    try {
      const result = await analyticsService.getAdaptiveRecommendations(userId);
      this.systemStatus.adapt = 'online';
      
      // Transform the response to match the expected interface
      return {
        userId: result.userId,
        recommendedContent: result.recommendations.nextTopics,
        learningGaps: result.recommendations.remediationAreas,
        nextTopics: result.recommendations.nextTopics,
        difficultyAdjustment: result.recommendations.difficultyAdjustment,
      };
    } catch (error) {
      this.systemStatus.adapt = 'offline';
      throw error;
    }
  }

  async generateVideo(prompt: string, type: 'explanation' | 'example' | 'exercise'): Promise<any> {
    this.systemStatus.vision = 'busy';
    try {
      const result = await contentService.generateVideo({ prompt, type });
      this.systemStatus.vision = 'online';
      return result;
    } catch (error) {
      this.systemStatus.vision = 'offline';
      throw error;
    }
  }
}

export const aiOrchestrator = new AIOrchestrator();
