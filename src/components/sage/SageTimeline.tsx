
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Settings, Trash2 } from 'lucide-react';
import { SageModuleIcon } from './SageModuleIcon';
import { SageLessonModule } from '@/services/sageService';

interface SageTimelineProps {
  modules: SageLessonModule[];
  onModuleSelect: (module: SageLessonModule) => void;
  onModuleCreate: (moduleType: SageLessonModule['module_type'], position: number) => void;
  onModuleDelete: (moduleId: string) => void;
  selectedModuleId?: string;
}

export const SageTimeline = ({ 
  modules, 
  onModuleSelect, 
  onModuleCreate, 
  onModuleDelete,
  selectedModuleId 
}: SageTimelineProps) => {
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);
  const [showModuleTypeSelector, setShowModuleTypeSelector] = useState<number | null>(null);

  const moduleTypes = [
    { type: 'content' as const, label: 'Content', color: 'bg-blue-500' },
    { type: 'quiz' as const, label: 'Quiz', color: 'bg-green-500' },
    { type: 'game' as const, label: 'Game', color: 'bg-purple-500' },
    { type: 'video' as const, label: 'Video', color: 'bg-red-500' },
    { type: 'image' as const, label: 'Image', color: 'bg-yellow-500' },
    { type: 'assessment' as const, label: 'Assessment', color: 'bg-orange-500' }
  ];

  const getTimelinePositions = () => {
    const positions = modules.map(m => m.timeline_position);
    const maxPosition = Math.max(...positions, 0);
    return Array.from({ length: maxPosition + 2 }, (_, i) => i);
  };

  const getModuleAtPosition = (position: number) => {
    return modules.find(m => m.timeline_position === position);
  };

  const handleAddClick = (position: number) => {
    setShowModuleTypeSelector(position);
  };

  const handleModuleTypeSelect = (moduleType: SageLessonModule['module_type'], position: number) => {
    onModuleCreate(moduleType, position);
    setShowModuleTypeSelector(null);
  };

  return (
    <div className="relative">
      {/* Timeline Header */}
      <div className="mb-8 text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">Course Timeline</h2>
        <p className="text-muted-foreground">Drag and arrange modules to build your course structure</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-border h-full"></div>

        {/* Timeline Positions */}
        <div className="space-y-8">
          {getTimelinePositions().map((position) => {
            const module = getModuleAtPosition(position);
            const isHovered = hoveredPosition === position;
            const isSelected = selectedModuleId === module?.id;

            return (
              <div 
                key={position}
                className="relative flex items-center justify-center"
                onMouseEnter={() => setHoveredPosition(position)}
                onMouseLeave={() => setHoveredPosition(null)}
              >
                {/* Position Marker */}
                <div className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 border-4 rounded-full z-10 ${
                  module ? 'bg-primary border-primary' : 'bg-background border-border'
                }`}></div>

                {/* Time Indicator */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-8 text-xs text-muted-foreground font-medium bg-background px-2 py-1 rounded border border-border">
                  {position * 5} min
                </div>

                {module ? (
                  /* Module Card */
                  <Card 
                    className={`relative ml-8 w-80 cursor-pointer transition-all duration-200 bg-card border-border ${
                      isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md hover:border-primary/50'
                    }`}
                    onClick={() => onModuleSelect(module)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <SageModuleIcon type={module.module_type} />
                          <Badge variant="outline" className="capitalize bg-background text-foreground border-border">
                            {module.module_type}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onModuleSelect(module);
                            }}
                            className="hover:bg-accent"
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
                            className="hover:bg-destructive/20 hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-medium text-foreground mb-1">{module.title}</h3>
                      {module.description && (
                        <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{module.duration_minutes} min</span>
                        </div>
                        <span>Position {position}</span>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* Add Module Button - Only show if no module exists at this position */
                  <div className="relative ml-8 w-80">
                    {showModuleTypeSelector === position ? (
                      <Card className="p-4 bg-card border-border">
                        <div className="text-sm font-medium mb-3 text-foreground">Select Module Type:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {moduleTypes.map(({ type, label, color }) => (
                            <Button
                              key={type}
                              variant="outline"
                              size="sm"
                              onClick={() => handleModuleTypeSelect(type, position)}
                              className="justify-start bg-background hover:bg-accent border-border"
                            >
                              <div className={`w-3 h-3 rounded-full ${color} mr-2`} />
                              {label}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowModuleTypeSelector(null)}
                          className="w-full mt-2 hover:bg-accent"
                        >
                          Cancel
                        </Button>
                      </Card>
                    ) : (
                      <Button
                        variant="outline"
                        className={`w-full h-16 border-2 border-dashed transition-all duration-200 bg-background ${
                          isHovered 
                            ? 'border-primary/60 bg-primary/5 text-primary' 
                            : 'border-border text-muted-foreground hover:border-primary/40'
                        }`}
                        onClick={() => handleAddClick(position)}
                      >
                        <Plus className="mr-2" size={16} />
                        Add Module
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
