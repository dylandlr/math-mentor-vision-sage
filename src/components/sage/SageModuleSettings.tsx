
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Wand2, Save, Loader2 } from 'lucide-react';
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
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = {
        title,
        description,
        duration_minutes: duration,
        module_type: moduleType
      };
      await onUpdate(module.id, updates);
    } catch (error) {
      console.error('Failed to save module:', error);
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
