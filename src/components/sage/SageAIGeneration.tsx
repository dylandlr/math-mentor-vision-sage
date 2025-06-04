
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Brain, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAISystems } from '@/hooks/useAISystems';
import { SageCourse } from '@/services/sageService';

interface SageAIGenerationProps {
  course: SageCourse;
  onGenerationComplete: () => void;
}

export const SageAIGeneration = ({ course, onGenerationComplete }: SageAIGenerationProps) => {
  const { toast } = useToast();
  const { generateContent, loading } = useAISystems();
  const [prompt, setPrompt] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [moduleCount, setModuleCount] = useState('6');
  const [duration, setDuration] = useState('30');
  const [includeQuizzes, setIncludeQuizzes] = useState(true);
  const [includeGames, setIncludeGames] = useState(true);
  const [includeVideos, setIncludeVideos] = useState(false);

  const addTopic = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const removeTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please provide a description for the course content.",
        variant: "destructive",
      });
      return;
    }

    try {
      const generationRequest = {
        type: 'course' as const,
        subject: course.subject,
        gradeLevel: course.grade_level,
        topic: prompt,
        difficulty: course.difficulty_level,
        duration: parseInt(duration),
        moduleCount: parseInt(moduleCount),
        topics,
        preferences: {
          includeQuizzes,
          includeGames,
          includeVideos,
        }
      };

      await generateContent(generationRequest);
      
      toast({
        title: "Course Generated Successfully",
        description: `Generated ${moduleCount} modules for "${course.title}".`,
      });

      onGenerationComplete();
    } catch (error) {
      console.error('Failed to generate course:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate course content. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <CardTitle className="text-sm text-foreground flex items-center space-x-2">
          <Brain className="h-4 w-4 text-purple-500" />
          <span>AI Course Generation</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Generate entire course content with modules using AI
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Course Description */}
        <div>
          <Label htmlFor="course-prompt" className="text-foreground">Course Description</Label>
          <Textarea
            id="course-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to teach in this course..."
            rows={3}
            className="bg-background border-border text-foreground"
          />
        </div>

        {/* Topics */}
        <div>
          <Label className="text-foreground">Specific Topics (Optional)</Label>
          <div className="flex space-x-2 mb-2">
            <Input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Add a topic..."
              className="bg-background border-border text-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTopic();
                }
              }}
            />
            <Button size="sm" onClick={addTopic} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <Badge
                  key={topic}
                  variant="secondary"
                  className="bg-accent text-accent-foreground"
                >
                  {topic}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeTopic(topic)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Generation Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="module-count" className="text-foreground">Number of Modules</Label>
            <Select value={moduleCount} onValueChange={setModuleCount}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="3">3 modules</SelectItem>
                <SelectItem value="5">5 modules</SelectItem>
                <SelectItem value="6">6 modules</SelectItem>
                <SelectItem value="8">8 modules</SelectItem>
                <SelectItem value="10">10 modules</SelectItem>
                <SelectItem value="12">12 modules</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="duration" className="text-foreground">Total Duration (minutes)</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Module Type Preferences */}
        <div>
          <Label className="text-foreground">Include Module Types</Label>
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-quizzes"
                checked={includeQuizzes}
                onChange={(e) => setIncludeQuizzes(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="include-quizzes" className="text-sm text-foreground">Quiz modules</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-games"
                checked={includeGames}
                onChange={(e) => setIncludeGames(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="include-games" className="text-sm text-foreground">Game modules</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-videos"
                checked={includeVideos}
                onChange={(e) => setIncludeVideos(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="include-videos" className="text-sm text-foreground">Video modules</Label>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Course...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Course with AI
            </>
          )}
        </Button>

        {loading && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              This may take a few minutes. Please wait while SAGE generates your course content.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
