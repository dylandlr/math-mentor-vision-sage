
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Settings, Trash2 } from 'lucide-react';
import { SageModuleIcon } from './SageModuleIcon';
import { SageLessonModule } from '@/services/sageService';
import { useDragDrop } from './DragDropContext';
import { cn } from '@/lib/utils';

interface DraggableModuleCardProps {
  module: SageLessonModule;
  onModuleSelect: (module: SageLessonModule) => void;
  onModuleDelete: (moduleId: string) => void;
  onModuleReorder: (moduleId: string, newPosition: number) => void;
  isSelected?: boolean;
}

export const DraggableModuleCard = ({
  module,
  onModuleSelect,
  onModuleDelete,
  onModuleReorder,
  isSelected
}: DraggableModuleCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const { setDragItem, setIsDragging: setGlobalDragging, draggedOverPosition } = useDragDrop();

  const handleDragStart = (e: React.DragEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setIsDragging(true);
    setGlobalDragging(true);
    setDragItem({ type: 'existing-module', module });
    
    // Create a custom drag image
    const dragImage = cardRef.current.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(5deg) scale(1.05)';
    dragImage.style.opacity = '0.9';
    dragImage.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, dragOffset.x, dragOffset.y);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setGlobalDragging(false);
    setDragItem(null);
    
    if (draggedOverPosition !== null && draggedOverPosition !== module.timeline_position) {
      onModuleReorder(module.id, draggedOverPosition);
    }
  };

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "transform transition-all duration-300 cursor-grab active:cursor-grabbing",
        isDragging && "scale-105 rotate-2 shadow-2xl z-50 opacity-75",
        !isDragging && "hover:scale-102 hover:shadow-lg",
        isSelected && "ring-2 ring-primary shadow-xl shadow-primary/20"
      )}
      style={{
        transformStyle: 'preserve-3d',
        transformOrigin: 'center center'
      }}
    >
      <Card 
        className={cn(
          "transition-all duration-300 bg-card/80 backdrop-blur-sm border-border group",
          isDragging && "bg-card/90 border-primary/50",
          !isDragging && "hover:border-primary/50 hover:bg-accent/20",
          isSelected && "border-primary shadow-xl"
        )}
        onClick={() => onModuleSelect(module)}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "p-2 rounded-lg bg-primary/10 transition-all duration-300",
                isDragging && "bg-primary/20 scale-110"
              )}>
                <SageModuleIcon type={module.module_type} size={18} />
              </div>
              <Badge 
                variant="outline" 
                className="capitalize bg-background/50 text-foreground border-border font-medium"
              >
                {module.module_type}
              </Badge>
            </div>
            <div className={cn(
              "flex items-center space-x-1 transition-opacity duration-300",
              isDragging ? "opacity-50" : "opacity-0 group-hover:opacity-100"
            )}>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onModuleSelect(module);
                }}
                className="hover:bg-accent h-8 w-8 p-0"
              >
                <Settings size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onModuleDelete(module.id);
                }}
                className="hover:bg-destructive/20 hover:text-destructive h-8 w-8 p-0"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
          
          <h3 className="font-semibold text-foreground mb-2 text-lg">{module.title}</h3>
          
          {module.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{module.description}</p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center space-x-1">
              <Clock size={12} />
              <span className="font-medium">{module.duration_minutes} min</span>
            </div>
            <span className="bg-muted px-2 py-1 rounded text-xs">
              Pos {module.timeline_position}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
