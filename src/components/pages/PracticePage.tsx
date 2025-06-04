
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, Clock, Target, Zap, Brain, TrendingUp, Trophy, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { studentService, PracticeSession } from '@/services/studentService';

interface QuickPractice {
  id: string;
  title: string;
  description: string;
  type: 'quick' | 'practice' | 'test' | 'challenge';
  duration: number;
  questions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  estimatedPoints: number;
  courseId?: string;
  lessonId?: string;
}

export const PracticePage = () => {
  const { user } = useAuth();
  const [practiceHistory, setPracticeHistory] = useState<PracticeSession[]>([]);
  const [stats, setStats] = useState({
    totalPoints: 0,
    streakDays: 0,
    completedLessons: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock practice sessions - in production, these would be generated based on course content
  const [quickSessions] = useState<QuickPractice[]>([
    {
      id: 'quick-1',
      title: 'Quick Math Review',
      description: 'Fast-paced review of recent lessons',
      type: 'quick',
      duration: 5,
      questions: 10,
      difficulty: 'easy',
      topic: 'Mixed Review',
      estimatedPoints: 25
    },
    {
      id: 'practice-1',
      title: 'Fractions Practice',
      description: 'Comprehensive practice with fractions',
      type: 'practice',
      duration: 20,
      questions: 15,
      difficulty: 'medium',
      topic: 'Fractions',
      estimatedPoints: 75
    },
    {
      id: 'challenge-1',
      title: 'Daily Math Challenge',
      description: "Today's special challenge problem",
      type: 'challenge',
      duration: 10,
      questions: 3,
      difficulty: 'hard',
      topic: 'Problem Solving',
      estimatedPoints: 100
    }
  ]);

  useEffect(() => {
    if (user?.id) {
      fetchPracticeData();
    }
  }, [user?.id]);

  const fetchPracticeData = async () => {
    try {
      setLoading(true);
      const [historyData, statsData] = await Promise.all([
        studentService.getPracticeHistory(user!.id),
        studentService.getStudentStats(user!.id)
      ]);

      setPracticeHistory(historyData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching practice data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    console.log(`Starting practice session ${sessionId}`);
    // TODO: Navigate to practice session interface
  };

  const weeklyProgress = stats.completedLessons > 0 ? Math.min((stats.completedLessons / 10) * 100, 100) : 0;

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
                  <div className="text-2xl font-bold text-blue-600">{Math.round(weeklyProgress)}%</div>
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
                  <div className="text-2xl font-bold text-orange-600">{stats.streakDays}</div>
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
                  <div className="text-2xl font-bold text-purple-600">{stats.totalPoints}</div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Practice Sessions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Practice Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickSessions.map((session) => (
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

        {/* Practice History */}
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Practice</h2>
          <Card>
            <CardContent className="p-4">
              {practiceHistory.length > 0 ? (
                <div className="space-y-3">
                  {practiceHistory.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{session.lesson_title}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.course_title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <div className="flex items-center space-x-1">
                          <Trophy className="h-3 w-3 text-yellow-500" />
                          <span className="text-sm font-medium">{session.score}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(session.time_spent / 60)}m
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {practiceHistory.length > 5 && (
                    <Button variant="outline" size="sm" className="w-full">
                      View All History
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No practice history yet</p>
                  <p className="text-xs text-muted-foreground">Complete some practice sessions to see your progress!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Summary */}
          {stats.averageScore > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Score:</span>
                    <span className="font-semibold">{stats.averageScore}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sessions Done:</span>
                    <span className="font-semibold">{practiceHistory.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Current Streak:</span>
                    <span className="font-semibold">{stats.streakDays} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
