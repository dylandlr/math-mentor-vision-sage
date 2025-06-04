
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SageModuleIcon } from './SageModuleIcon';
import { SageLessonModule } from '@/services/sageService';
import { useDragDrop } from './DragDropContext';

const moduleTypes = [
  { type: 'content' as const, label: 'Content', color: 'bg-blue-500', description: 'Text, images, and rich content' },
  { type: 'quiz' as const, label: 'Quiz', color: 'bg-green-500', description: 'Interactive questions and assessments' },
  { type: 'game' as const, label: 'Game', color: 'bg-purple-500', description: 'Gamified learning activities' },
  { type: 'video' as const, label: 'Video', color: 'bg-red-500', description: 'Educational videos and media' },
  { type: 'image' as const, label: 'Image', color: 'bg-yellow-500', description: 'Visual content and diagrams' },
  { type: 'assessment' as const, label: 'Assessment', color: 'bg-orange-500', description: 'Graded evaluations' }
];

export const ModulePalette = () => {
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
    <Card className="w-80 bg-card/95 backdrop-blur-sm border-border shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
          <span>Module Library</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Drag modules to add them to your timeline</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {moduleTypes.map(({ type, label, color, description }) => (
          <div
            key={type}
            draggable
            onDragStart={() => handleDragStart(type)}
            onDragEnd={handleDragEnd}
            className="group cursor-grab active:cursor-grabbing transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <Card className="p-4 bg-background/50 border-border hover:border-primary/50 transition-all duration-300 hover:bg-accent/20">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${color}/20 group-hover:${color}/30 transition-colors`}>
                  <SageModuleIcon type={type} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-foreground">{label}</span>
                    <Badge variant="outline" className="text-xs bg-background/50">
                      {type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
