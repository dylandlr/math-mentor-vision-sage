
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Star, PlayCircle, CheckCircle, Lock } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
  isLocked: boolean;
  progress: number; // 0-100
  topics: string[];
}

export const LessonsPage = () => {
  // TODO: Fetch lessons from database based on user's enrolled courses
  // TODO: Implement lesson progress tracking and persistence
  // TODO: Add filtering by course, difficulty, or completion status
  // TODO: Integrate with user's learning path and prerequisites

  const [lessons] = useState<Lesson[]>([
    {
      id: '1',
      title: 'Introduction to Algebra',
      description: 'Learn the basics of algebraic expressions and equations',
      duration: 30,
      difficulty: 'beginner',
      isCompleted: true,
      isLocked: false,
      progress: 100,
      topics: ['Variables', 'Expressions', 'Basic Equations']
    },
    {
      id: '2',
      title: 'Linear Equations',
      description: 'Solve and graph linear equations in one and two variables',
      duration: 45,
      difficulty: 'beginner',
      isCompleted: false,
      isLocked: false,
      progress: 60,
      topics: ['Slope', 'Y-intercept', 'Graphing']
    },
    {
      id: '3',
      title: 'Quadratic Functions',
      description: 'Explore parabolas, factoring, and the quadratic formula',
      duration: 60,
      difficulty: 'intermediate',
      isCompleted: false,
      isLocked: false,
      progress: 0,
      topics: ['Parabolas', 'Factoring', 'Quadratic Formula']
    },
    {
      id: '4',
      title: 'Advanced Polynomials',
      description: 'Work with higher-degree polynomials and complex operations',
      duration: 75,
      difficulty: 'advanced',
      isCompleted: false,
      isLocked: true,
      progress: 0,
      topics: ['Polynomial Division', 'Roots', 'Graphing']
    }
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartLesson = (lessonId: string) => {
    // TODO: Navigate to lesson content/player
    // TODO: Track lesson start time and analytics
    console.log(`Starting lesson ${lessonId}`);
  };

  const overallProgress = Math.round(
    lessons.reduce((acc, lesson) => acc + lesson.progress, 0) / lessons.length
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
            <BookOpen size={24} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Lessons
          </h1>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Overall Progress</h3>
              <span className="text-2xl font-bold text-blue-600">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <p className="text-sm text-gray-600 mt-2">
              {lessons.filter(l => l.isCompleted).length} of {lessons.length} lessons completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className={`relative ${lesson.isLocked ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{lesson.title}</CardTitle>
                {lesson.isCompleted && (
                  <CheckCircle className="text-green-500 h-6 w-6" />
                )}
                {lesson.isLocked && (
                  <Lock className="text-gray-400 h-6 w-6" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getDifficultyColor(lesson.difficulty)}>
                  {lesson.difficulty}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock size={14} className="mr-1" />
                  {lesson.duration} min
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 mb-4">{lesson.description}</p>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {lesson.topics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {!lesson.isLocked && !lesson.isCompleted && lesson.progress > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium">{lesson.progress}%</span>
                  </div>
                  <Progress value={lesson.progress} className="h-2" />
                </div>
              )}

              <Button
                onClick={() => handleStartLesson(lesson.id)}
                disabled={lesson.isLocked}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {lesson.isCompleted ? (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    Review
                  </>
                ) : lesson.progress > 0 ? (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Continue
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Start Lesson
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
