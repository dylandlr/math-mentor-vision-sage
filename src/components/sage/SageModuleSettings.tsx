
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { X, Wand2, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { SageModuleIcon } from './SageModuleIcon';
import { CourseModule, courseService } from '@/services/courseService';
import { useToast } from '@/hooks/use-toast';

interface SageModuleSettingsProps {
  module: CourseModule;
  onUpdate: (moduleId: string, updates: Partial<CourseModule>) => void;
  onClose: () => void;
}

export const SageModuleSettings = ({ module, onUpdate, onClose }: SageModuleSettingsProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description || '');
  const [duration, setDuration] = useState(module.duration_minutes);
  const [moduleType, setModuleType] = useState(module.module_type);
  const [isHidden, setIsHidden] = useState(module.is_hidden);
  const [isPublished, setIsPublished] = useState(module.is_published);
  const [timelinePosition, setTimelinePosition] = useState(module.timeline_position);
  const [orderIndex, setOrderIndex] = useState(module.order_index);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Advanced settings
  const [difficultyLevel, setDifficultyLevel] = useState(
    (module.content?.difficulty_level as string) || 'intermediate'
  );
  const [interactionLevel, setInteractionLevel] = useState(
    (module.content?.interaction_level as number) || 3
  );
  const [requiresCompletion, setRequiresCompletion] = useState(
    (module.content?.requires_completion as boolean) || false
  );
  const [allowSkip, setAllowSkip] = useState(
    (module.content?.allow_skip as boolean) || true
  );
  const [maxAttempts, setMaxAttempts] = useState(
    (module.content?.max_attempts as number) || 3
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = {
        title,
        description,
        duration_minutes: duration,
        module_type: moduleType,
        is_hidden: isHidden,
        is_published: isPublished,
        timeline_position: timelinePosition,
        order_index: orderIndex,
        content: {
          ...module.content,
          difficulty_level: difficultyLevel,
          interaction_level: interactionLevel,
          requires_completion: requiresCompletion,
          allow_skip: allowSkip,
          max_attempts: maxAttempts,
        },
        updated_at: new Date().toISOString()
      };
      
      await courseService.updateModule(module.id, updates);
      await onUpdate(module.id, updates);
      
      toast({
        title: "Module Updated",
        description: "Module settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Failed to save module:', error);
      toast({
        title: "Error",
        description: "Failed to save module settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!generationPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for content generation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const generatedContent = await courseService.generateModuleContent(module.id, generationPrompt);
      
      // Update module with generated content
      const updates = {
        ai_generated_content: generatedContent,
        content: { ...module.content, generated: generatedContent }
      };
      await onUpdate(module.id, updates);

      toast({
        title: "Content Generated",
        description: "SAGE has generated new content for this module.",
      });
      
      setGenerationPrompt('');
    } catch (error) {
      console.error('Failed to generate content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <SageModuleIcon type={moduleType} size={20} />
          <h2 className="text-lg font-semibold text-foreground">Module Settings</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-accent">
          <X size={16} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Settings */}
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle className="text-sm text-foreground">Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="module-title" className="text-foreground">Title</Label>
              <Input
                id="module-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Module title..."
                className="bg-background border-border text-foreground"
              />
            </div>

            <div>
              <Label htmlFor="module-description" className="text-foreground">Description</Label>
              <Textarea
                id="module-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Module description..."
                rows={3}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="module-type" className="text-foreground">Type</Label>
                <Select value={moduleType} onValueChange={(value: any) => setModuleType(value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="game">Game</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="module-duration" className="text-foreground">Duration (min)</Label>
                <Input
                  id="module-duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 5)}
                  min={1}
                  max={120}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeline-position" className="text-foreground">Timeline Position</Label>
                <Input
                  id="timeline-position"
                  type="number"
                  value={timelinePosition}
                  onChange={(e) => setTimelinePosition(parseInt(e.target.value) || 0)}
                  min={0}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="order-index" className="text-foreground">Order Index</Label>
                <Input
                  id="order-index"
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
                  min={0}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle className="text-sm text-foreground">Advanced Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="difficulty-level" className="text-foreground">Difficulty Level</Label>
              <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
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

            <div>
              <Label className="text-foreground">Interaction Level: {interactionLevel}</Label>
              <Slider
                value={[interactionLevel]}
                onValueChange={(value) => setInteractionLevel(value[0])}
                max={5}
                min={1}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            <div>
              <Label htmlFor="max-attempts" className="text-foreground">Max Attempts</Label>
              <Input
                id="max-attempts"
                type="number"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                min={1}
                max={10}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Requires Completion</Label>
                  <p className="text-xs text-muted-foreground">Students must complete this module to proceed</p>
                </div>
                <Switch checked={requiresCompletion} onCheckedChange={setRequiresCompletion} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Allow Skip</Label>
                  <p className="text-xs text-muted-foreground">Students can skip this module</p>
                </div>
                <Switch checked={allowSkip} onCheckedChange={setAllowSkip} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visibility Settings */}
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle className="text-sm text-foreground">Visibility & Publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                <div>
                  <Label className="text-foreground">Hidden</Label>
                  <p className="text-xs text-muted-foreground">Hide this module from students</p>
                </div>
              </div>
              <Switch checked={isHidden} onCheckedChange={setIsHidden} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Published</Label>
                <p className="text-xs text-muted-foreground">Make this module available to students</p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </CardContent>
        </Card>

        {/* AI Content Generation */}
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2 text-foreground">
              <Wand2 size={16} />
              <span>SAGE AI Content Generation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="generation-prompt" className="text-foreground">Content Generation Prompt</Label>
              <Textarea
                id="generation-prompt"
                value={generationPrompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
                placeholder="Describe what content you want SAGE to generate for this module..."
                rows={3}
                className="bg-background border-border text-foreground"
              />
            </div>

            <Button 
              onClick={handleGenerateContent}
              disabled={isGenerating || !generationPrompt.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating with SAGE...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>

            {/* Generated Content Preview */}
            {module.ai_generated_content && Object.keys(module.ai_generated_content).length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg border border-border">
                <div className="text-xs font-medium text-muted-foreground mb-2">Generated Content:</div>
                <Badge variant="outline" className="mb-2 bg-background text-foreground border-border">AI Generated</Badge>
                <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto">
                  {JSON.stringify(module.ai_generated_content, null, 2)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Module Content */}
        {module.content && Object.keys(module.content).length > 0 && (
          <Card className="bg-background border-border">
            <CardHeader>
              <CardTitle className="text-sm text-foreground">Current Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto bg-muted p-3 rounded border border-border">
                {JSON.stringify(module.content, null, 2)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
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
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
