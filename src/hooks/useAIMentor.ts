
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isOffline?: boolean;
}

export const useAIMentor = (initialMessage?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initial: ChatMessage[] = [];
    if (initialMessage) {
      initial.push({
        id: 'initial',
        content: initialMessage,
        isUser: false,
        timestamp: new Date(),
      });
    }
    return initial;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (content: string) => {
    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-mentor-chat', {
        body: {
          message: content,
          chatHistory: messages.slice(-10) // Send last 10 messages for context
        }
      });

      if (error) throw error;

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        isOffline: data.isOffline || false,
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsOffline(data.isOffline || false);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add fallback message
      const fallbackMessage: ChatMessage = {
        id: `fallback-${Date.now()}`,
        content: "I'm having trouble connecting right now. Please try again in a moment!",
        isUser: false,
        timestamp: new Date(),
        isOffline: true,
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      setIsOffline(true);
      
      toast({
        title: "Connection Issue",
        description: "AI Mentor is temporarily unavailable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  return {
    messages,
    isTyping,
    isOffline,
    sendMessage,
  };
};
