
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Award, Target, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { studentService, StudentAchievement } from '@/services/studentService';

interface PotentialAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'practice' | 'streak' | 'special';
  points: number;
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
  requirement: string;
}

export const AchievementsPage = () => {
  const { user } = useAuth();
  const [unlockedAchievements, setUnlockedAchievements] = useState<StudentAchievement[]>([]);
  const [potentialAchievements, setPotentialAchievements] = useState<PotentialAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPoints: 0,
    completedLessons: 0,
    streakDays: 0
  });

  useEffect(() => {
    if (user?.id) {
      fetchAchievements();
    }
  }, [user?.id]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const [achievementsData, statsData] = await Promise.all([
        studentService.getStudentAchievements(user!.id),
        studentService.getStudentStats(user!.id)
      ]);

      setUnlockedAchievements(achievementsData);
      setStats(statsData);
      generatePotentialAchievements(statsData, achievementsData);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePotentialAchievements = (stats: any, unlocked: StudentAchievement[]) => {
    const unlockedIds = new Set(unlocked.map(a => a.title)); // Using title as ID for now
    
    const potential: PotentialAchievement[] = [
      {
        id: 'first-lesson',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎓',
        category: 'learning',
        points: 50,
        isUnlocked: unlockedIds.has('First Steps'),
        progress: Math.min(stats.completedLessons, 1),
        maxProgress: 1,
        requirement: 'Complete 1 lesson'
      },
      {
        id: 'ten-lessons',
        title: 'Knowledge Seeker',
        description: 'Complete 10 lessons',
        icon: '📚',
        category: 'learning',
        points: 200,
        isUnlocked: unlockedIds.has('Knowledge Seeker'),
        progress: Math.min(stats.completedLessons, 10),
        maxProgress: 10,
        requirement: 'Complete 10 lessons'
      },
      {
        id: 'streak-7',
        title: 'Streak Master',
        description: 'Study for 7 days in a row',
        icon: '🔥',
        category: 'streak',
        points: 150,
        isUnlocked: unlockedIds.has('Streak Master'),
        progress: Math.min(stats.streakDays, 7),
        maxProgress: 7,
        requirement: 'Maintain 7-day study streak'
      },
      {
        id: 'points-1000',
        title: 'Point Collector',
        description: 'Earn 1000 total points',
        icon: '💎',
        category: 'practice',
        points: 100,
        isUnlocked: unlockedIds.has('Point Collector'),
        progress: Math.min(stats.totalPoints, 1000),
        maxProgress: 1000,
        requirement: 'Earn 1000 points'
      },
      {
        id: 'early-bird',
        title: 'Early Bird',
        description: 'Study before 8 AM',
        icon: '🌅',
        category: 'special',
        points: 25,
        isUnlocked: unlockedIds.has('Early Bird'),
        requirement: 'Complete lesson before 8 AM'
      },
      {
        id: 'perfectionist',
        title: 'Perfectionist',
        description: 'Get 100% on 5 lessons',
        icon: '💯',
        category: 'practice',
        points: 300,
        isUnlocked: unlockedIds.has('Perfectionist'),
        requirement: 'Score 100% on 5 lessons'
      }
    ];

    setPotentialAchievements(potential);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'learning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'practice': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'streak': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'special': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
            <Trophy size={24} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Achievements
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Points from Achievements</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{unlockedAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Unlocked</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{potentialAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Total Available</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {potentialAchievements.map((achievement) => (
          <Card 
            key={achievement.id} 
            className={`relative transition-all duration-200 ${
              achievement.isUnlocked 
                ? 'ring-2 ring-yellow-400 shadow-lg' 
                : 'opacity-75 hover:opacity-90'
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <CardTitle className="text-lg text-foreground">{achievement.title}</CardTitle>
                    <Badge className={getCategoryColor(achievement.category)}>
                      {achievement.category}
                    </Badge>
                  </div>
                </div>
                {achievement.isUnlocked ? (
                  <CheckCircle className="text-green-500 h-6 w-6" />
                ) : (
                  <Lock className="text-muted-foreground h-6 w-6" />
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-muted-foreground mb-4">{achievement.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-foreground">{achievement.points} points</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mb-3">
                {achievement.requirement}
              </div>

              {!achievement.isUnlocked && achievement.progress !== undefined && achievement.maxProgress && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium text-foreground">
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.maxProgress) * 100} 
                    className="h-2" 
                  />
                </div>
              )}

              {achievement.isUnlocked && (
                <div className="text-xs text-green-600 font-medium">
                  Unlocked! +{achievement.points} points earned
                </div>
              )}
            </CardContent>
            
            {achievement.isUnlocked && (
              <div className="absolute -top-2 -right-2">
                <div className="bg-yellow-400 rounded-full p-2">
                  <Award className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
