
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HoverTriggerProps {
  onHoverChange: (isHovered: boolean) => void;
  children: React.ReactNode;
}

export const HoverTrigger = ({ onHoverChange, children }: HoverTriggerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
    onHoverChange(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      onHoverChange(false);
    }, 300); // Delay to prevent flickering
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "absolute left-0 top-0 w-16 h-full z-40 transition-opacity duration-200",
        isHovered ? "opacity-100" : "opacity-0"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};
