
import { supabase } from '@/integrations/supabase/client';

export interface LearningAnalytics {
  userId: string;
  timeframe: string;
  performanceAnalysis: {
    averageScore: number;
    trend: 'improving' | 'declining' | 'stable';
    consistency: 'consistent' | 'variable';
  };
  recommendations: {
    nextTopics: string[];
    remediationAreas: string[];
    difficultyAdjustment: number;
    suggestedActivities: string[];
  };
  learningPath: {
    immediate: string;
    shortTerm: string;
    longTerm: string;
  };
  aiInsights: string;
  generatedAt: string;
  aiSystem: string;
}

export interface AdaptiveRecommendation {
  userId: string;
  performanceAnalysis: {
    averageScore: number;
    trend: 'improving' | 'declining' | 'stable';
    consistency: 'consistent' | 'variable';
  };
  recommendations: {
    nextTopics: string[];
    remediationAreas: string[];
    difficultyAdjustment: number;
    suggestedActivities: string[];
  };
  learningPath: {
    immediate: string;
    shortTerm: string;
    longTerm: string;
  };
  aiInsights: string;
  generatedAt: string;
  aiSystem: string;
}

export const analyticsService = {
  async generateAnalytics(userId: string, timeframe: string = '30d'): Promise<LearningAnalytics> {
    const { data, error } = await supabase.functions.invoke('ai-analytics', {
      body: { userId, timeframe }
    });

    if (error) {
      console.error('Analytics generation failed:', error);
      throw new Error('Failed to generate analytics');
    }

    return data;
  },

  async getAdaptiveRecommendations(userId: string): Promise<AdaptiveRecommendation> {
    const { data, error } = await supabase.functions.invoke('ai-adaptive-learning', {
      body: { userId }
    });

    if (error) {
      console.error('Adaptive learning failed:', error);
      throw new Error('Failed to get adaptive recommendations');
    }

    return data;
  }
};
