
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Trophy, CheckCircle, Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { lessonPlayerService, LessonContent, LessonProgress } from '@/services/lessonPlayerService';
import { useToast } from '@/hooks/use-toast';

export const LessonPlayer = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId && user) {
      fetchLessonData();
    }
  }, [lessonId, user]);

  useEffect(() => {
    // Track time spent
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchLessonData = async () => {
    if (!lessonId || !user) return;

    try {
      setLoading(true);
      const [lessonData, progressData] = await Promise.all([
        lessonPlayerService.getLessonById(lessonId),
        lessonPlayerService.getLessonProgress(lessonId, user.id)
      ]);

      setLesson(lessonData);
      setProgress(progressData);
      
      if (progressData?.time_spent) {
        setTimeSpent(progressData.time_spent);
      }
    } catch (error) {
      console.error('Error fetching lesson data:', error);
      toast({
        title: "Error",
        description: "Failed to load lesson.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSectionComplete = async (sectionIndex: number) => {
    if (!lesson || !user) return;

    const sections = Object.keys(lesson.content?.sections || {});
    const totalSections = sections.length;
    const progressPercentage = Math.round(((sectionIndex + 1) / totalSections) * 100);

    try {
      await lessonPlayerService.updateLessonProgress(lesson.id, user.id, {
        time_spent: timeSpent,
        completed: progressPercentage === 100
      });

      if (progressPercentage === 100) {
        await lessonPlayerService.markLessonComplete(lesson.id, user.id, 85); // Default score
        toast({
          title: "Lesson Complete!",
          description: `You've earned ${lesson.points_value || 100} points!`,
        });
      }

      // Move to next section
      if (sectionIndex + 1 < totalSections) {
        setCurrentSection(sectionIndex + 1);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Lesson Not Found</h1>
          <Button onClick={() => navigate('/lessons')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lessons
          </Button>
        </div>
      </div>
    );
  }

  const sections = Object.entries(lesson.content?.sections || {});
  const currentSectionData = sections[currentSection];
  const progressPercentage = Math.round(((currentSection + 1) / sections.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate('/lessons')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lessons
            </Button>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock size={16} />
                <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
              </div>
              {lesson.points_value && (
                <div className="flex items-center space-x-1">
                  <Trophy size={16} />
                  <span>{lesson.points_value} pts</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{lesson.title}</h1>
              <p className="text-muted-foreground mt-2">{lesson.description}</p>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className={getDifficultyColor(lesson.difficulty_level)}>
                {lesson.difficulty_level}
              </Badge>
              <Badge variant="outline">
                Section {currentSection + 1} of {sections.length}
              </Badge>
              {progress?.completed && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {currentSectionData && (
          <Card>
            <CardHeader>
              <CardTitle className="capitalize">
                {currentSectionData[0].replace('_', ' ')}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="whitespace-pre-wrap text-foreground">
                {typeof currentSectionData[1] === 'string' 
                  ? currentSectionData[1] 
                  : JSON.stringify(currentSectionData[1], null, 2)
                }
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
          >
            Previous
          </Button>

          {currentSection < sections.length - 1 ? (
            <Button onClick={() => handleSectionComplete(currentSection)}>
              <Play className="mr-2 h-4 w-4" />
              Next Section
            </Button>
          ) : (
            <Button 
              onClick={() => handleSectionComplete(currentSection)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Lesson
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
