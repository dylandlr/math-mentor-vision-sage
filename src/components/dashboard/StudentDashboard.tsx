
import { useEffect, useState } from 'react';
import { Trophy, Clock, Target, BookOpen, Brain, Zap, MessageCircle, Play, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { studentService, StudentCourse, StudentAchievement } from '@/services/studentService';

export const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [stats, setStats] = useState({
    totalPoints: 0,
    streakDays: 0,
    completedLessons: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [coursesData, achievementsData, statsData] = await Promise.all([
        studentService.getEnrolledCourses(user!.id),
        studentService.getStudentAchievements(user!.id),
        studentService.getStudentStats(user!.id)
      ]);

      setCourses(coursesData);
      setAchievements(achievementsData.slice(0, 3)); // Show only recent 3
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted rounded-xl"></div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-muted rounded-lg"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userName = profile?.full_name?.split(' ')[0] || 'Student';

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
        <p className="text-blue-100 text-lg">Ready to continue your math journey?</p>
        <div className="flex items-center space-x-6 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalPoints}</div>
            <div className="text-sm text-blue-200">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.streakDays}</div>
            <div className="text-sm text-blue-200">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <div className="text-sm text-blue-200">Avg Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.completedLessons}</div>
            <div className="text-sm text-blue-200">Completed</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Courses */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Continue Learning</h2>
          {courses.length > 0 ? (
            courses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{course.title}</h3>
                      <p className="text-muted-foreground">{course.description}</p>
                    </div>
                    <Badge variant="secondary">
                      Grade {course.grade_level}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">
                        {course.completed_lessons}/{course.total_lessons} lessons
                      </span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">{course.progress}% complete</p>
                  </div>
                  <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Play className="mr-2 h-4 w-4" />
                    Continue Learning
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">No courses yet</h3>
                <p className="text-muted-foreground mb-4">Contact your teacher to get enrolled in courses</p>
                <Button variant="outline">
                  Browse Available Courses
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="text-blue-500" size={20} />
                <span>AI Mentor</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Get instant help with your math questions</p>
              <Button variant="outline" className="w-full">
                <MessageCircle size={16} className="mr-2" />
                Ask AI Mentor
              </Button>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {achievement.points} points • {new Date(achievement.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Trophy className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No achievements yet</p>
                  <p className="text-xs text-muted-foreground">Start learning to earn your first achievement!</p>
                </div>
              )}
              <Button variant="outline" className="w-full mt-3">
                <Trophy size={16} className="mr-2" />
                View All
              </Button>
            </CardContent>
          </Card>

          {/* Study Stats */}
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="text-green-500" size={16} />
                <span className="font-medium text-green-700 dark:text-green-300">Your Progress</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Avg Score:</span>
                  <span className="font-semibold">{stats.averageScore}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Lessons Done:</span>
                  <span className="font-semibold">{stats.completedLessons}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current Streak:</span>
                  <span className="font-semibold">{stats.streakDays} days</span>
                </div>
              </div>
              <Button size="sm" className="w-full mt-3 bg-green-500 hover:bg-green-600">
                <Play size={14} className="mr-2" />
                Continue Streak
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
