
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
import { ModulePaletteHover } from './ModulePaletteHover';
import { HoverTrigger } from './HoverTrigger';
import { sageService, SageCourse, SageLessonModule } from '@/services/sageService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { DragDropProvider } from './DragDropContext';

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
  const [showModulePalette, setShowModulePalette] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [courseTitle, setCourseTitle] = useState(course.title);
  const [savingTitle, setSavingTitle] = useState(false);

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

  const handleSaveTitle = async () => {
    if (courseTitle.trim() === '' || courseTitle === course.title) {
      setEditingTitle(false);
      setCourseTitle(course.title);
      return;
    }

    setSavingTitle(true);
    try {
      await sageService.updateCourseTitle(course.id, courseTitle.trim());
      setEditingTitle(false);
      toast({
        title: "Title Updated",
        description: "Course title has been saved successfully.",
      });
    } catch (error) {
      console.error('Failed to save title:', error);
      toast({
        title: "Error",
        description: "Failed to save course title.",
        variant: "destructive",
      });
      setCourseTitle(course.title);
    } finally {
      setSavingTitle(false);
    }
  };

  const handleModuleReorder = async (moduleId: string, newPosition: number) => {
    try {
      await sageService.updateModule(moduleId, { timeline_position: newPosition });
      
      setModules(prev => 
        prev.map(m => 
          m.id === moduleId 
            ? { ...m, timeline_position: newPosition }
            : m
        ).sort((a, b) => a.timeline_position - b.timeline_position)
      );
      
      toast({
        title: "Module Reordered",
        description: "Module position has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to reorder module:', error);
      toast({
        title: "Error",
        description: "Failed to reorder module.",
        variant: "destructive",
      });
    }
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
    <DragDropProvider>
      <div className="flex min-h-screen bg-background relative">
        {/* Hover Trigger for Module Palette */}
        <HoverTrigger onHoverChange={setShowModulePalette}>
          <div className="w-full h-full bg-primary/5 border-r-2 border-primary/20 flex items-center justify-center">
            <div className="text-primary/60 text-sm font-medium rotate-90 whitespace-nowrap">
              Hover to select modules
            </div>
          </div>
        </HoverTrigger>

        {/* Hoverable Module Palette */}
        <ModulePaletteHover isVisible={showModulePalette} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col ml-0">
          {/* Header with improved spacing */}
          <div className="bg-card/95 backdrop-blur-sm border-b border-border px-8 py-6 shadow-sm">
            <div className="flex items-center justify-between max-w-full">
              <div className="flex items-center space-x-6 min-w-0 flex-1">
                <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground shrink-0">
                  ← Back to Courses
                </Button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {editingTitle ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={courseTitle}
                          onChange={(e) => setCourseTitle(e.target.value)}
                          className="text-2xl font-bold bg-background border-border h-12 min-w-96"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTitle();
                            if (e.key === 'Escape') {
                              setCourseTitle(course.title);
                              setEditingTitle(false);
                            }
                          }}
                          disabled={savingTitle}
                          autoFocus
                        />
                        <Button 
                          size="sm" 
                          onClick={handleSaveTitle}
                          disabled={savingTitle || courseTitle.trim() === ''}
                          className="h-8"
                        >
                          {savingTitle ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <Save size={14} />
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setCourseTitle(course.title);
                            setEditingTitle(false);
                          }}
                          disabled={savingTitle}
                          className="h-8"
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
                          className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                        >
                          <Edit size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-6 flex-wrap gap-y-2">
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
              <div className="flex items-center space-x-3 shrink-0">
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

          {/* Timeline Container with improved spacing */}
          <div className="flex-1 px-8 py-12 bg-gradient-to-br from-background via-background to-muted/20 overflow-y-auto">
            <SageTimeline
              modules={modules}
              onModuleSelect={handleModuleSelect}
              onModuleCreate={handleCreateModule}
              onModuleDelete={handleModuleDelete}
              onModuleReorder={handleModuleReorder}
              selectedModuleId={selectedModule?.id}
            />
          </div>
        </div>

        {/* Settings Sidebar with improved spacing */}
        {showSettings && selectedModule && (
          <div className="w-96 bg-card/95 backdrop-blur-sm border-l border-border shadow-xl">
            <SageModuleSettings
              module={selectedModule}
              onUpdate={handleModuleUpdate}
              onClose={() => setShowSettings(false)}
            />
          </div>
        )}

        {/* Course Settings Sidebar with improved spacing */}
        {showCourseSettings && (
          <div className="w-96 bg-card/95 backdrop-blur-sm border-l border-border shadow-xl">
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
    </DragDropProvider>
  );
};
