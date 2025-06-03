
import { useState } from 'react';
import { aiOrchestrator, ContentGenerationRequest, AISystemStatus } from '@/services/aiOrchestrator';
import { useToast } from '@/hooks/use-toast';

export const useAISystems = () => {
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<AISystemStatus | null>(null);
  const { toast } = useToast();

  const generateContent = async (request: ContentGenerationRequest) => {
    setLoading(true);
    try {
      const content = await aiOrchestrator.generateContent(request);
      toast({
        title: "Content Generated",
        description: `${request.type} content for ${request.topic} has been created successfully.`,
      });
      return content;
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate content. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAnalytics = async (userId: string, timeframe: string = '30d') => {
    setLoading(true);
    try {
      const analytics = await aiOrchestrator.getAnalytics(userId, timeframe);
      return analytics;
    } catch (error) {
      toast({
        title: "Analytics Failed",
        description: "Unable to generate analytics. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAdaptiveRecommendations = async (userId: string) => {
    setLoading(true);
    try {
      const recommendations = await aiOrchestrator.getAdaptiveRecommendations(userId);
      return recommendations;
    } catch (error) {
      toast({
        title: "Recommendations Failed",
        description: "Unable to get adaptive recommendations. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateVideo = async (prompt: string, type: 'explanation' | 'example' | 'exercise') => {
    setLoading(true);
    try {
      const video = await aiOrchestrator.generateVideo(prompt, type);
      toast({
        title: "Video Generation Started",
        description: "Your educational video is being generated. This may take a few minutes.",
      });
      return video;
    } catch (error) {
      toast({
        title: "Video Generation Failed",
        description: "Unable to generate video. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkSystemStatus = async () => {
    try {
      const status = await aiOrchestrator.getSystemStatus();
      setSystemStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to check system status:', error);
      return null;
    }
  };

  return {
    loading,
    systemStatus,
    generateContent,
    getAnalytics,
    getAdaptiveRecommendations,
    generateVideo,
    checkSystemStatus,
  };
};
