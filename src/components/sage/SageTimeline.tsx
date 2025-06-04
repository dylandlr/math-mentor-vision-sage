
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Clock, Settings, Trash2 } from 'lucide-react';
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
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Course Timeline</h2>
        <p className="text-gray-600">Drag and arrange modules to build your course structure</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gray-200 h-full"></div>

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
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-4 border-gray-300 rounded-full z-10"></div>

                {/* Time Indicator */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-8 text-xs text-gray-500 font-medium">
                  {position * 5} min
                </div>

                {module ? (
                  /* Module Card */
                  <Card 
                    className={`relative ml-8 w-80 cursor-pointer transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md'
                    }`}
                    onClick={() => onModuleSelect(module)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <SageModuleIcon type={module.module_type} />
                          <Badge variant="outline" className="capitalize">
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
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-medium text-gray-800 mb-1">{module.title}</h3>
                      {module.description && (
                        <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{module.duration_minutes} min</span>
                        </div>
                        <span>Position {position}</span>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* Add Module Button */
                  <div className="relative ml-8 w-80">
                    {showModuleTypeSelector === position ? (
                      <Card className="p-4">
                        <div className="text-sm font-medium mb-3">Select Module Type:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {moduleTypes.map(({ type, label, color }) => (
                            <Button
                              key={type}
                              variant="outline"
                              size="sm"
                              onClick={() => handleModuleTypeSelect(type, position)}
                              className="justify-start"
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
                          className="w-full mt-2"
                        >
                          Cancel
                        </Button>
                      </Card>
                    ) : (
                      <Button
                        variant="outline"
                        className={`w-full h-16 border-2 border-dashed transition-all duration-200 ${
                          isHovered 
                            ? 'border-purple-400 bg-purple-50 text-purple-600' 
                            : 'border-gray-300 text-gray-500'
                        }`}
                        onClick={() => handleAddClick(position)}
                      >
                        <Plus className="mr-2" size={16} />
                        Add Module
                      </Button>
                    )}
                  </div>
                )}

                {/* Hidden Spoke Indicator */}
                {module && (isHovered || isSelected) && (
                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddClick(position + 1)}
                      className="opacity-75 hover:opacity-100"
                    >
                      <Plus size={14} />
                    </Button>
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
