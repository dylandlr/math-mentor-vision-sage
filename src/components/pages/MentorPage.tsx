
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Send, User, Bot, Wifi, WifiOff } from 'lucide-react';
import { useAIChat } from '@/hooks/useAIChat';

export const MentorPage = () => {
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { messages, isTyping, isOffline, sendMessage } = useAIChat(
    "Hello! I'm your AI Math Mentor. I'm here to help you understand math concepts, solve problems, and guide you through your learning journey. What would you like to work on today?"
  );

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    sendMessage(inputMessage);
    setInputMessage('');
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className={cn(
            "text-white p-2 rounded-lg bg-gradient-to-r",
            isOffline ? "from-orange-600 to-red-600" : "from-blue-600 to-purple-600"
          )}>
            <Brain size={24} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Math Mentor
              </h1>
              {isOffline && (
                <div className="flex items-center space-x-1 text-orange-600">
                  <WifiOff size={16} />
                  <span className="text-sm font-medium">Reconnecting...</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="text-gray-600">
          Get personalized help with math concepts, homework, and problem-solving
          {isOffline && " (Limited offline mode active)"}
        </p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center space-x-2">
            {isOffline ? <WifiOff size={20} className="text-orange-600" /> : <Bot size={20} />}
            <span>Chat with your AI Mentor</span>
            {isOffline && (
              <span className="text-sm text-orange-600 font-normal">(Offline Mode)</span>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[480px] p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={cn(
                      "max-w-[80%] p-3 rounded-lg",
                      message.isUser
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : message.isOffline
                          ? 'bg-orange-50 text-gray-900 border border-orange-200'
                          : 'bg-gray-100 text-gray-900'
                    )}
                  >
                    <div className="flex items-start space-x-2">
                      {!message.isUser && (
                        message.isOffline ? 
                          <WifiOff size={16} className="mt-1 text-orange-500" /> :
                          <Bot size={16} className="mt-1 text-gray-500" />
                      )}
                      {message.isUser && <User size={16} className="mt-1 text-white" />}
                      <div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs ${
                            message.isUser ? 'text-blue-100' : 
                            message.isOffline ? 'text-orange-600' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.isOffline && (
                            <span className="text-xs text-orange-600">• Offline</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className={cn(
                    "p-3 rounded-lg",
                    isOffline ? "bg-orange-50 border border-orange-200" : "bg-gray-100"
                  )}>
                    <div className="flex items-center space-x-2">
                      {isOffline ? 
                        <WifiOff size={16} className="text-orange-500" /> :
                        <Bot size={16} className="text-gray-500" />
                      }
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isOffline ? "AI reconnecting... Messages still work!" : "Ask me anything about math..."}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                disabled={isTyping}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isTyping || !inputMessage.trim()}
                className={cn(
                  "transition-colors",
                  isOffline 
                    ? "bg-orange-600 hover:bg-orange-700" 
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                )}
              >
                <Send size={18} />
              </Button>
            </div>
            {isOffline && (
              <p className="text-xs text-orange-600 mt-2 text-center">
                AI service temporarily unavailable - fallback responses active
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
