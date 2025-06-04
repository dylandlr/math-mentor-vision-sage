
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Save, Loader2, Settings, Brain } from 'lucide-react';
import { SageCourse } from '@/services/sageService';
import { useToast } from '@/hooks/use-toast';
import { SageAIGeneration } from './SageAIGeneration';

interface SageCourseSettingsProps {
  course: SageCourse;
  onClose: () => void;
  onCourseUpdate?: () => void;
}

export const SageCourseSettings = ({ course, onClose, onCourseUpdate }: SageCourseSettingsProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description || '');
  const [subject, setSubject] = useState(course.subject);
  const [gradeLevel, setGradeLevel] = useState(course.grade_level);
  const [difficulty, setDifficulty] = useState(course.difficulty_level);
  const [isPublished, setIsPublished] = useState(course.is_published || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here you would typically save to the database
      toast({
        title: "Settings Saved",
        description: "Course settings have been updated successfully.",
      });
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Failed to save course settings:', error);
      toast({
        title: "Error",
        description: "Failed to save course settings.",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  const handleGenerationComplete = () => {
    if (onCourseUpdate) {
      onCourseUpdate();
    }
    toast({
      title: "Course Updated",
      description: "New modules have been added to your course.",
    });
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Course Settings</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-accent">
          <X size={16} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
            <TabsTrigger value="ai-generation" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>AI Generation</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6 mt-6">
            {/* Basic Information */}
            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-sm text-foreground">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="course-title" className="text-foreground">Course Title</Label>
                  <Input
                    id="course-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Course title..."
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="course-description" className="text-foreground">Description</Label>
                  <Textarea
                    id="course-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Course description..."
                    rows={3}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course-subject" className="text-foreground">Subject</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="Math">Math</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Art">Art</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="course-grade" className="text-foreground">Grade Level</Label>
                    <Select value={gradeLevel.toString()} onValueChange={(value) => setGradeLevel(parseInt(value))}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="course-difficulty" className="text-foreground">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Publishing Settings */}
            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-sm text-foreground">Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="publish-toggle" className="text-foreground">Publish Course</Label>
                    <p className="text-xs text-muted-foreground">Make this course available to students</p>
                  </div>
                  <Switch
                    id="publish-toggle"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-sm text-foreground">Course Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="text-foreground">{new Date(course.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="text-foreground">{new Date(course.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-foreground">{isPublished ? 'Published' : 'Draft'}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-generation" className="mt-6">
            <SageAIGeneration 
              course={course} 
              onGenerationComplete={handleGenerationComplete}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer - Only show save button on settings tab */}
      <div className="p-4 border-t border-border">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
