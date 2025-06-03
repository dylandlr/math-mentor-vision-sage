
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const useAIChat = (initialMessage?: string) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const defaultMessage = {
      id: '1',
      content: initialMessage || "Hello! I'm your AI Math Mentor. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    };
    return [defaultMessage];
  });
  
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-mentor-chat', {
        body: {
          message: messageContent,
          chatHistory: messages.slice(-10)
        }
      });

      if (error) throw error;

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I'm sorry, I couldn't process your request right now.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please try again.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    messages,
    isTyping,
    sendMessage,
    setMessages
  };
};
