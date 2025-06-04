
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Trash2, Play, Clock, Users } from 'lucide-react';
import { SageTimeline } from './SageTimeline';
import { SageModuleSettings } from './SageModuleSettings';
import { SageStudentSelector } from './SageStudentSelector';
import { sageService, SageCourse, SageLessonModule } from '@/services/sageService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SageVisualBuilderProps {
  course: SageCourse;
  onBack: () => void;
}

export const SageVisualBuilder = ({ course, onBack }: SageVisualBuilderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<SageLessonModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<SageLessonModule | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, [course.id]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const moduleData = await sageService.getModulesByCourse(course.id);
      setModules(moduleData);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      toast({
        title: "Error",
        description: "Failed to load course modules.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async (moduleType: SageLessonModule['module_type'], position: number) => {
    if (!user) return;

    try {
      const newModule = await sageService.createModule({
        course_id: course.id,
        module_type: moduleType,
        title: `New ${moduleType} Module`,
        timeline_position: position,
        duration_minutes: 5
      });

      setModules(prev => [...prev, newModule].sort((a, b) => a.timeline_position - b.timeline_position));
      
      toast({
        title: "Module Created",
        description: `New ${moduleType} module added to timeline.`,
      });
    } catch (error) {
      console.error('Failed to create module:', error);
      toast({
        title: "Error",
        description: "Failed to create module.",
        variant: "destructive",
      });
    }
  };

  const handleModuleSelect = useCallback((module: SageLessonModule) => {
    setSelectedModule(module);
    setShowSettings(true);
  }, []);

  const handleModuleUpdate = async (moduleId: string, updates: Partial<SageLessonModule>) => {
    try {
      await sageService.updateModule(moduleId, updates);
      setModules(prev => prev.map(m => m.id === moduleId ? { ...m, ...updates } : m));
      
      if (selectedModule?.id === moduleId) {
        setSelectedModule(prev => prev ? { ...prev, ...updates } : null);
      }

      toast({
        title: "Module Updated",
        description: "Module settings have been saved.",
      });
    } catch (error) {
      console.error('Failed to update module:', error);
      toast({
        title: "Error",
        description: "Failed to update module.",
        variant: "destructive",
      });
    }
  };

  const handleModuleDelete = async (moduleId: string) => {
    try {
      await sageService.deleteModule(moduleId);
      setModules(prev => prev.filter(m => m.id !== moduleId));
      
      if (selectedModule?.id === moduleId) {
        setSelectedModule(null);
        setShowSettings(false);
      }

      toast({
        title: "Module Deleted",
        description: "Module has been removed from the timeline.",
      });
    } catch (error) {
      console.error('Failed to delete module:', error);
      toast({
        title: "Error",
        description: "Failed to delete module.",
        variant: "destructive",
      });
    }
  };

  const getTotalDuration = () => {
    return modules.reduce((total, module) => total + module.duration_minutes, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading SAGE Builder...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Timeline Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                ← Back to Courses
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {course.title}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="outline">{course.subject}</Badge>
                  <Badge variant="outline">Grade {course.grade_level}</Badge>
                  <Badge variant="outline" className="capitalize">{course.difficulty_level}</Badge>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock size={14} />
                    <span>{getTotalDuration()} min total</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Play size={14} />
                    <span>{modules.length} modules</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowStudentSelector(true)}
              >
                <Users className="mr-2 h-4 w-4" />
                Assign Students
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Module Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="flex-1 p-6">
          <SageTimeline
            modules={modules}
            onModuleSelect={handleModuleSelect}
            onModuleCreate={handleCreateModule}
            onModuleDelete={handleModuleDelete}
            selectedModuleId={selectedModule?.id}
          />
        </div>
      </div>

      {/* Settings Sidebar */}
      {showSettings && selectedModule && (
        <div className="w-96 bg-white border-l shadow-lg">
          <SageModuleSettings
            module={selectedModule}
            onUpdate={handleModuleUpdate}
            onClose={() => setShowSettings(false)}
          />
        </div>
      )}

      {/* Student Selector Modal */}
      {showStudentSelector && (
        <SageStudentSelector
          course={course}
          onClose={() => setShowStudentSelector(false)}
        />
      )}
    </div>
  );
};
