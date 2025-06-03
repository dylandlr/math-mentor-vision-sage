
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, Clock, Target, Zap, Brain, TrendingUp } from 'lucide-react';

interface PracticeSession {
  id: string;
  title: string;
  description: string;
  type: 'quick' | 'practice' | 'test' | 'challenge';
  duration: number; // in minutes
  questions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  estimatedPoints: number;
}

export const PracticePage = () => {
  // TODO: Fetch practice sessions from database based on user's progress
  // TODO: Implement adaptive difficulty based on user performance
  // TODO: Track practice session results and analytics
  // TODO: Add personalized recommendations based on weak areas

  const [sessions] = useState<PracticeSession[]>([
    {
      id: '1',
      title: 'Quick Algebra Review',
      description: 'Fast-paced review of basic algebraic concepts',
      type: 'quick',
      duration: 5,
      questions: 10,
      difficulty: 'easy',
      topic: 'Algebra',
      estimatedPoints: 25
    },
    {
      id: '2',
      title: 'Linear Equations Practice',
      description: 'Comprehensive practice with linear equations and graphing',
      type: 'practice',
      duration: 20,
      questions: 15,
      difficulty: 'medium',
      topic: 'Linear Equations',
      estimatedPoints: 75
    },
    {
      id: '3',
      title: 'Quadratic Functions Test',
      description: 'Full assessment of quadratic function skills',
      type: 'test',
      duration: 45,
      questions: 25,
      difficulty: 'hard',
      topic: 'Quadratic Functions',
      estimatedPoints: 150
    },
    {
      id: '4',
      title: 'Daily Math Challenge',
      description: "Today's special challenge problem",
      type: 'challenge',
      duration: 10,
      questions: 3,
      difficulty: 'hard',
      topic: 'Mixed Topics',
      estimatedPoints: 100
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quick': return <Zap className="h-5 w-5" />;
      case 'practice': return <Target className="h-5 w-5" />;
      case 'test': return <Brain className="h-5 w-5" />;
      case 'challenge': return <TrendingUp className="h-5 w-5" />;
      default: return <PlayCircle className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quick': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'practice': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'test': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'challenge': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleStartPractice = (sessionId: string) => {
    // TODO: Navigate to practice session interface
    // TODO: Initialize session timer and question tracking
    console.log(`Starting practice session ${sessionId}`);
  };

  // TODO: Fetch these stats from database
  const weeklyProgress = 67;
  const streakDays = 5;
  const totalPoints = 1250;

  return (
    <div className="p-6 max-w-6xl mx-auto bg-background min-h-screen">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
            <Target size={24} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Practice Hub
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{weeklyProgress}%</div>
                  <div className="text-sm text-muted-foreground">Weekly Goal</div>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <Progress value={weeklyProgress} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">{streakDays}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map((session) => (
          <Card key={session.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
                    {getTypeIcon(session.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground">{session.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getTypeColor(session.type)}>
                        {session.type}
                      </Badge>
                      <Badge className={getDifficultyColor(session.difficulty)}>
                        {session.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-muted-foreground mb-4">{session.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Topic:</span>
                  <span className="font-medium text-foreground">{session.topic}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <div className="flex items-center text-foreground">
                    <Clock size={14} className="mr-1" />
                    {session.duration} min
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Questions:</span>
                  <span className="font-medium text-foreground">{session.questions}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Potential Points:</span>
                  <span className="font-medium text-green-600">+{session.estimatedPoints}</span>
                </div>
              </div>

              <Button
                onClick={() => handleStartPractice(session.id)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Practice
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
