
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDragDrop } from './DragDropContext';
import { cn } from '@/lib/utils';

interface TimelineDropZoneProps {
  position: number;
  onModuleCreate: (moduleType: any, position: number) => void;
  hasModule: boolean;
}

export const TimelineDropZone = ({ position, onModuleCreate, hasModule }: TimelineDropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { dragItem, isDragging, setDraggedOverPosition } = useDragDrop();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging) return;
    setIsDragOver(true);
    setDraggedOverPosition(position);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
    setDraggedOverPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDraggedOverPosition(null);
    
    if (dragItem?.type === 'new-module' && dragItem.moduleType) {
      onModuleCreate(dragItem.moduleType, position);
    }
  };

  if (hasModule && !isDragging) {
    return null;
  }

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out",
        isDragging ? "opacity-100 scale-100" : "opacity-60 scale-95"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Button
        variant="outline"
        className={cn(
          "w-full h-20 border-2 border-dashed transition-all duration-300 bg-background/30 backdrop-blur-sm",
          isDragOver 
            ? "border-primary bg-primary/10 text-primary shadow-lg scale-105 animate-pulse" 
            : "border-border/50 text-muted-foreground hover:border-primary/40 hover:bg-primary/5",
          isDragging && !isDragOver && "opacity-50 scale-95",
          hasModule && "hidden"
        )}
        onClick={() => {
          // Could open module type selector here
        }}
      >
        <div className={cn(
          "flex flex-col items-center transition-all duration-300",
          isDragOver && "scale-110"
        )}>
          <Plus className={cn(
            "mb-1 transition-all duration-300",
            isDragOver ? "scale-125" : "scale-100"
          )} size={18} />
          <span className="font-medium text-sm">
            {isDragOver ? "Drop here" : "Add Module"}
          </span>
        </div>
      </Button>
    </div>
  );
};
