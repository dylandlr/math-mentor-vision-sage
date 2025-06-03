
import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAIChat } from '@/hooks/useAIChat';

interface AIMentorBubbleProps {
  onOpenMentor: () => void;
  className?: string;
}

export const AIMentorBubble = ({ onOpenMentor, className }: AIMentorBubbleProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  
  const { messages, isTyping, sendMessage } = useAIChat(
    "Hi! I'm here to help with any math questions. Ask me anything or click to open the full chat!"
  );

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 animate-scale-in",
      className
    )}>
      <Card className={cn(
        "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transition-all duration-300",
        isExpanded ? "w-80 h-96" : "w-auto"
      )}>
        {!isExpanded ? (
          <div className="p-3">
            <div className="flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">AI Mentor</p>
                  <p className="text-xs opacity-90">Need help? Just ask!</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  onClick={() => setIsExpanded(true)}
                >
                  <MessageCircle size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  onClick={onOpenMentor}
                >
                  <Send size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  onClick={() => setIsVisible(false)}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle size={12} />
                </div>
                <span className="text-sm font-medium">AI Mentor</span>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-6 w-6 p-0"
                  onClick={onOpenMentor}
                  title="Open full chat"
                >
                  <Send size={12} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-6 w-6 p-0"
                  onClick={() => setIsExpanded(false)}
                >
                  <X size={12} />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-3 space-y-2">
              {messages.slice(-3).map((message) => (
                <div
                  key={message.id}
                  className={`text-xs p-2 rounded ${
                    message.isUser 
                      ? 'bg-white/20 ml-4' 
                      : 'bg-white/10 mr-4'
                  }`}
                >
                  {message.content}
                </div>
              ))}
              {isTyping && (
                <div className="text-xs p-2 rounded bg-white/10 mr-4">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isTyping}
                className="text-xs h-8 bg-white/20 border-white/30 text-white placeholder-white/70"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isTyping || !inputMessage.trim()}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <Send size={12} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
