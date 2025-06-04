
import { Card } from '@/components/ui/card';
import { SageModuleIcon } from './SageModuleIcon';
import { SageLessonModule } from '@/services/sageService';
import { useDragDrop } from './DragDropContext';
import { cn } from '@/lib/utils';

const moduleTypes = [
  { type: 'content' as const, label: 'Content', color: 'bg-blue-500' },
  { type: 'quiz' as const, label: 'Quiz', color: 'bg-green-500' },
  { type: 'game' as const, label: 'Game', color: 'bg-purple-500' },
  { type: 'video' as const, label: 'Video', color: 'bg-red-500' },
  { type: 'image' as const, label: 'Image', color: 'bg-yellow-500' },
  { type: 'assessment' as const, label: 'Assessment', color: 'bg-orange-500' }
];

interface ModulePaletteHoverProps {
  isVisible: boolean;
}

export const ModulePaletteHover = ({ isVisible }: ModulePaletteHoverProps) => {
  const { setDragItem, setIsDragging } = useDragDrop();

  const handleDragStart = (moduleType: SageLessonModule['module_type']) => {
    setDragItem({ type: 'new-module', moduleType });
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setDragItem(null);
    setIsDragging(false);
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-1/2 transform -translate-y-1/2 z-50 transition-all duration-300 ease-out",
        isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
      )}
    >
      <Card className="bg-card/95 backdrop-blur-sm border-border shadow-xl border-r-0 rounded-r-none">
        <div className="p-3 space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-3 text-center">
            Modules
          </div>
          {moduleTypes.map(({ type, label, color }) => (
            <div
              key={type}
              draggable
              onDragStart={() => handleDragStart(type)}
              onDragEnd={handleDragEnd}
              className={cn(
                "group cursor-grab active:cursor-grabbing p-3 rounded-lg transition-all duration-200",
                "hover:scale-110 hover:shadow-lg bg-background/50 border border-border",
                "hover:border-primary/50 relative overflow-hidden"
              )}
              title={label}
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-md transition-colors",
                `${color}/20 group-hover:${color}/30`
              )}>
                <SageModuleIcon type={type} size={18} />
              </div>
              
              {/* Tooltip on hover */}
              <div className={cn(
                "absolute left-full ml-2 top-1/2 transform -translate-y-1/2",
                "bg-popover text-popover-foreground px-2 py-1 rounded text-xs font-medium",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                "pointer-events-none whitespace-nowrap shadow-lg border border-border"
              )}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
