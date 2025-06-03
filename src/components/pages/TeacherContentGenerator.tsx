import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Wand2, BarChart3, Video, BookOpen, Loader2 } from 'lucide-react';
import { useAISystems } from '@/hooks/useAISystems';
import { ContentGenerationRequest } from '@/services/contentService';

export const TeacherContentGenerator = () => {
  const [contentType, setContentType] = useState<'lesson' | 'quiz' | 'practice' | 'project'>('lesson');
  const [subject, setSubject] = useState('Mathematics');
  const [gradeLevel, setGradeLevel] = useState(5);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [learningStyle, setLearningStyle] = useState<'visual' | 'auditory' | 'reading' | 'kinesthetic'>('visual');
  const [duration, setDuration] = useState(30);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoType, setVideoType] = useState<'explanation' | 'example' | 'exercise'>('explanation');

  const { loading, generateContent, generateVideo, checkSystemStatus, systemStatus } = useAISystems();

  const handleGenerateContent = async () => {
    if (!topic.trim()) return;

    const request: ContentGenerationRequest = {
      type: contentType,
      subject,
      gradeLevel,
      topic,
      difficulty,
      learningStyle,
      duration,
    };

    try {
      const content = await generateContent(request);
      setGeneratedContent(content);
    } catch (error) {
      console.error('Content generation failed:', error);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return;

    try {
      const video = await generateVideo(videoPrompt, videoType);
      console.log('Generated video:', video);
    } catch (error) {
      console.error('Video generation failed:', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg">
            <Brain size={24} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Content Generator
          </h1>
        </div>
        <p className="text-gray-600">
          Generate personalized lessons, quizzes, and educational content using our AI systems
        </p>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="flex items-center space-x-2">
            <BookOpen size={16} />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center space-x-2">
            <Video size={16} />
            <span>Videos</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 size={16} />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center space-x-2">
            <Brain size={16} />
            <span>AI Status</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wand2 size={20} />
                <span>SAGE Content Generator</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Content Type</label>
                  <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lesson">Lesson</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Grade Level</label>
                  <Select value={gradeLevel.toString()} onValueChange={(value) => setGradeLevel(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                        <SelectItem key={grade} value={grade.toString()}>Grade {grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Learning Style</label>
                  <Select value={learningStyle} onValueChange={(value: any) => setLearningStyle(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="auditory">Auditory</SelectItem>
                      <SelectItem value="reading">Reading/Writing</SelectItem>
                      <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    min={15}
                    max={120}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Topic</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Fractions, Linear Equations, Geometry Basics"
                />
              </div>

              <Button 
                onClick={handleGenerateContent}
                disabled={loading || !topic.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {generatedContent && (
            <Card>
              <CardHeader>
                <CardTitle>Generated {generatedContent.type} Content</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge>{generatedContent.difficulty}</Badge>
                  <Badge variant="outline">{generatedContent.learningStyle}</Badge>
                  <Badge variant="outline">Grade {generatedContent.gradeLevel}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(generatedContent.sections || {}).map(([section, content]: [string, any]) => (
                    <div key={section} className="border rounded-lg p-4">
                      <h3 className="font-semibold capitalize mb-2">{section.replace('_', ' ')}</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video size={20} />
                <span>VISION Video Generator</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Video Prompt</label>
                <Textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Describe the math concept you want to create a video for..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Video Type</label>
                <Select value={videoType} onValueChange={(value: any) => setVideoType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="explanation">Concept Explanation</SelectItem>
                    <SelectItem value="example">Worked Example</SelectItem>
                    <SelectItem value="exercise">Practice Exercise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateVideo}
                disabled={loading || !videoPrompt.trim()}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Generate Video
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>INSIGHT Analytics Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Advanced analytics and insights will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={checkSystemStatus} className="mb-4">
                Check Status
              </Button>
              {systemStatus && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(systemStatus).map(([system, status]) => (
                    <div key={system} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium capitalize">{system}</span>
                      <Badge variant={status === 'online' ? 'default' : status === 'busy' ? 'secondary' : 'destructive'}>
                        {status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
