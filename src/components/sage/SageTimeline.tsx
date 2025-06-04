
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { SageLessonModule } from '@/services/sageService';
import { DraggableModuleCard } from './DraggableModuleCard';
import { TimelineDropZone } from './TimelineDropZone';
import { useDragDrop } from './DragDropContext';
import { cn } from '@/lib/utils';

interface SageTimelineProps {
  modules: SageLessonModule[];
  onModuleSelect: (module: SageLessonModule) => void;
  onModuleCreate: (moduleType: SageLessonModule['module_type'], position: number) => void;
  onModuleDelete: (moduleId: string) => void;
  onModuleReorder: (moduleId: string, newPosition: number) => void;
  selectedModuleId?: string;
}

export const SageTimeline = ({ 
  modules, 
  onModuleSelect, 
  onModuleCreate, 
  onModuleDelete,
  onModuleReorder,
  selectedModuleId 
}: SageTimelineProps) => {
  const { isDragging, draggedOverPosition } = useDragDrop();

  const getTimelinePositions = () => {
    const positions = modules.map(m => m.timeline_position);
    const maxPosition = Math.max(...positions, -1);
    return Array.from({ length: maxPosition + 3 }, (_, i) => i);
  };

  const getModuleAtPosition = (position: number) => {
    return modules.find(m => m.timeline_position === position);
  };

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Timeline Header */}
      <div className="mb-16 text-center animate-fade-in">
        <h2 className="text-3xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Course Timeline
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Design your learning journey by arranging modules in the perfect sequence
        </p>
      </div>

      {/* Timeline Container */}
      <div className="relative px-12">
        {/* Central Timeline Line with enhanced styling */}
        <div className="absolute left-1/2 transform -translate-x-0.5 w-1 bg-gradient-to-b from-primary/20 via-primary to-primary/20 h-full z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/30 to-transparent animate-pulse"></div>
        </div>

        {/* Timeline Items */}
        <div className="space-y-20">
          {getTimelinePositions().map((position) => {
            const module = getModuleAtPosition(position);
            const isSelected = selectedModuleId === module?.id;
            const isDropTarget = draggedOverPosition === position;

            return (
              <div 
                key={position}
                className={cn(
                  "relative flex items-center transition-all duration-500 ease-out",
                  isDragging && "transform-gpu",
                  isDropTarget && "scale-105"
                )}
              >
                {/* Enhanced Timeline Position Marker */}
                <div className={cn(
                  "absolute left-1/2 transform -translate-x-1/2 w-8 h-8 border-4 rounded-full z-20 transition-all duration-500",
                  module 
                    ? "bg-primary border-primary shadow-xl shadow-primary/40 scale-110" 
                    : "bg-background border-border hover:border-primary/50 hover:scale-110",
                  isDropTarget && "border-primary/80 bg-primary/20 scale-125 animate-pulse"
                )}>
                  {module && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30"></div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/60 to-primary animate-pulse"></div>
                    </>
                  )}
                </div>

                {/* Enhanced Time Badge */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -top-12 z-10">
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "bg-background/90 backdrop-blur-md border border-border text-foreground text-sm font-semibold px-4 py-2 shadow-lg transition-all duration-300",
                      isDropTarget && "bg-primary/20 border-primary scale-110"
                    )}
                  >
                    <Clock size={14} className="mr-2" />
                    {position * 5}min
                  </Badge>
                </div>

                {/* Module Content with enhanced positioning */}
                <div className={cn(
                  "w-full flex transition-all duration-300",
                  position % 2 === 0 ? "justify-start pr-1/2" : "justify-end pl-1/2"
                )}>
                  <div className={cn(
                    "w-96 transition-all duration-300",
                    position % 2 === 0 ? "mr-12" : "ml-12"
                  )}>
                    {module ? (
                      <DraggableModuleCard
                        module={module}
                        onModuleSelect={onModuleSelect}
                        onModuleDelete={onModuleDelete}
                        onModuleReorder={onModuleReorder}
                        isSelected={isSelected}
                      />
                    ) : (
                      <TimelineDropZone
                        position={position}
                        onModuleCreate={onModuleCreate}
                        hasModule={!!module}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced timeline end indicator */}
        <div className="flex justify-center mt-16 mb-8">
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
