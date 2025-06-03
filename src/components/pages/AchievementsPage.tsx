
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Award, Target, CheckCircle, Lock } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'practice' | 'streak' | 'special';
  points: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export const AchievementsPage = () => {
  // TODO: Fetch user's achievements from database
  // TODO: Implement achievement progress tracking
  // TODO: Add achievement unlock notifications
  // TODO: Integrate with points/rewards system

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: '🎓',
      category: 'learning',
      points: 50,
      isUnlocked: true,
      unlockedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Problem Solver',
      description: 'Solve 50 practice problems',
      icon: '🧩',
      category: 'practice',
      points: 100,
      isUnlocked: false,
      progress: 23,
      maxProgress: 50
    },
    {
      id: '3',
      title: 'Streak Master',
      description: 'Study for 7 days in a row',
      icon: '🔥',
      category: 'streak',
      points: 150,
      isUnlocked: false,
      progress: 3,
      maxProgress: 7
    },
    {
      id: '4',
      title: 'Math Wizard',
      description: 'Complete an entire course',
      icon: '🧙‍♂️',
      category: 'learning',
      points: 200,
      isUnlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: '5',
      title: 'Perfect Score',
      description: 'Get 100% on a practice test',
      icon: '💯',
      category: 'practice',
      points: 75,
      isUnlocked: true,
      unlockedAt: new Date('2024-01-20')
    },
    {
      id: '6',
      title: 'Early Bird',
      description: 'Study before 8 AM',
      icon: '🌅',
      category: 'special',
      points: 25,
      isUnlocked: false
    }
  ]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'learning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'practice': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'streak': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'special': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const totalPoints = achievements
    .filter(a => a.isUnlocked)
    .reduce((sum, a) => sum + a.points, 0);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

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
              <div className="text-sm text-muted-foreground">Total Points</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{unlockedCount}</div>
              <div className="text-sm text-muted-foreground">Unlocked</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{achievements.length}</div>
              <div className="text-sm text-muted-foreground">Total Available</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
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
                {achievement.unlockedAt && (
                  <span className="text-xs text-muted-foreground">
                    Unlocked {achievement.unlockedAt.toLocaleDateString()}
                  </span>
                )}
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
