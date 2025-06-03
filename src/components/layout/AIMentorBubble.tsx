
import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AIMentorBubbleProps {
  onOpenMentor: () => void;
  className?: string;
}

export const AIMentorBubble = ({ onOpenMentor, className }: AIMentorBubbleProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 animate-scale-in",
      className
    )}>
      <Card className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
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
              onClick={onOpenMentor}
            >
              <MessageCircle size={14} />
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
      </Card>
    </div>
  );
};
