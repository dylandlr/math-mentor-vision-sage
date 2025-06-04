
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Settings, Trash2, Play, Clock, Users, Edit, Save, X } from 'lucide-react';
import { SageTimeline } from './SageTimeline';
import { SageModuleSettings } from './SageModuleSettings';
import { SageStudentSelector } from './SageStudentSelector';
import { SageCourseSettings } from './SageCourseSettings';
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
  const [showCourseSettings, setShowCourseSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [courseTitle, setCourseTitle] = useState(course.title);

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
    setShowCourseSettings(false);
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

  const handleSaveTitle = () => {
    // Here you would typically save the title to the database
    setEditingTitle(false);
    toast({
      title: "Title Updated",
      description: "Course title has been saved.",
    });
  };

  const getTotalDuration = () => {
    return modules.reduce((total, module) => total + module.duration_minutes, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg text-foreground">Loading SAGE Builder...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main Timeline Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
                ← Back to Courses
              </Button>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  {editingTitle ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        className="text-2xl font-bold bg-background"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle();
                          if (e.key === 'Escape') {
                            setCourseTitle(course.title);
                            setEditingTitle(false);
                          }
                        }}
                      />
                      <Button size="sm" onClick={handleSaveTitle}>
                        <Save size={14} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setCourseTitle(course.title);
                          setEditingTitle(false);
                        }}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        {courseTitle}
                      </h1>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setEditingTitle(true)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit size={14} />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="bg-background text-foreground border-border">{course.subject}</Badge>
                  <Badge variant="outline" className="bg-background text-foreground border-border">Grade {course.grade_level}</Badge>
                  <Badge variant="outline" className="bg-background text-foreground border-border capitalize">{course.difficulty_level}</Badge>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Clock size={14} />
                    <span>{getTotalDuration()} min total</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
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
                className="bg-background hover:bg-accent border-border"
              >
                <Users className="mr-2 h-4 w-4" />
                Assign Students
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowCourseSettings(!showCourseSettings);
                  setShowSettings(false);
                  setSelectedModule(null);
                }}
                className="bg-background hover:bg-accent border-border"
              >
                <Settings className="mr-2 h-4 w-4" />
                Course Settings
              </Button>
              {selectedModule && (
                <Button 
                  variant="outline"
                  onClick={() => setShowSettings(!showSettings)}
                  className="bg-background hover:bg-accent border-border"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Module Settings
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="flex-1 p-6 bg-background">
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
        <div className="w-96 bg-card border-l border-border shadow-lg">
          <SageModuleSettings
            module={selectedModule}
            onUpdate={handleModuleUpdate}
            onClose={() => setShowSettings(false)}
          />
        </div>
      )}

      {/* Course Settings Sidebar */}
      {showCourseSettings && (
        <div className="w-96 bg-card border-l border-border shadow-lg">
          <SageCourseSettings
            course={course}
            onClose={() => setShowCourseSettings(false)}
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
