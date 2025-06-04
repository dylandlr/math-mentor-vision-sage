
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
    <div className="relative max-w-4xl mx-auto">
      {/* Timeline Header */}
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-3">Course Timeline</h2>
        <p className="text-muted-foreground text-lg">Drag and arrange modules to build your course structure</p>
      </div>

      {/* Timeline Container */}
      <div className="relative px-8">
        {/* Central Timeline Line */}
        <div className="absolute left-1/2 transform -translate-x-0.5 w-1 bg-gradient-to-b from-primary/30 via-primary to-primary/30 h-full z-0"></div>

        {/* Timeline Items */}
        <div className="space-y-16">
          {getTimelinePositions().map((position) => {
            const module = getModuleAtPosition(position);
            const isHovered = hoveredPosition === position;
            const isSelected = selectedModuleId === module?.id;

            return (
              <div 
                key={position}
                className="relative flex items-center"
                onMouseEnter={() => setHoveredPosition(position)}
                onMouseLeave={() => setHoveredPosition(null)}
              >
                {/* Timeline Position Marker */}
                <div className={`absolute left-1/2 transform -translate-x-1/2 w-6 h-6 border-4 rounded-full z-20 transition-all duration-300 ${
                  module 
                    ? 'bg-primary border-primary shadow-lg shadow-primary/30' 
                    : 'bg-background border-border hover:border-primary/50'
                }`}>
                  {module && (
                    <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></div>
                  )}
                </div>

                {/* Time Badge */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 z-10">
                  <Badge 
                    variant="secondary" 
                    className="bg-background/80 backdrop-blur-sm border border-border text-foreground text-xs font-medium px-3 py-1"
                  >
                    <Clock size={12} className="mr-1" />
                    {position * 5}min
                  </Badge>
                </div>

                {/* Module Content */}
                <div className={`w-full flex ${position % 2 === 0 ? 'justify-start pr-1/2' : 'justify-end pl-1/2'}`}>
                  <div className={`w-80 ${position % 2 === 0 ? 'mr-8' : 'ml-8'}`}>
                    {module ? (
                      /* Module Card */
                      <Card 
                        className={`cursor-pointer transition-all duration-300 hover:shadow-xl bg-card/80 backdrop-blur-sm border-border group ${
                          isSelected 
                            ? 'ring-2 ring-primary shadow-xl shadow-primary/20 scale-105' 
                            : 'hover:shadow-lg hover:border-primary/50 hover:scale-102'
                        }`}
                        onClick={() => onModuleSelect(module)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <SageModuleIcon type={module.module_type} size={18} />
                              </div>
                              <Badge 
                                variant="outline" 
                                className="capitalize bg-background/50 text-foreground border-border font-medium"
                              >
                                {module.module_type}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            <span className="bg-muted px-2 py-1 rounded text-xs">Pos {position}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      /* Add Module Section */
                      <div className="relative">
                        {showModuleTypeSelector === position ? (
                          <Card className="p-5 bg-card/90 backdrop-blur-sm border-border shadow-lg">
                            <div className="text-sm font-semibold mb-4 text-foreground">Select Module Type:</div>
                            <div className="grid grid-cols-2 gap-3">
                              {moduleTypes.map(({ type, label, color }) => (
                                <Button
                                  key={type}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleModuleTypeSelect(type, position)}
                                  className="justify-start bg-background/50 hover:bg-accent border-border h-10"
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
                              className="w-full mt-3 hover:bg-accent"
                            >
                              Cancel
                            </Button>
                          </Card>
                        ) : (
                          <Button
                            variant="outline"
                            className={`w-full h-20 border-2 border-dashed transition-all duration-300 bg-background/30 backdrop-blur-sm ${
                              isHovered 
                                ? 'border-primary/60 bg-primary/5 text-primary shadow-md scale-105' 
                                : 'border-border/50 text-muted-foreground hover:border-primary/40 hover:bg-primary/5'
                            }`}
                            onClick={() => handleAddClick(position)}
                          >
                            <Plus className="mr-2" size={18} />
                            <span className="font-medium">Add Module</span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
