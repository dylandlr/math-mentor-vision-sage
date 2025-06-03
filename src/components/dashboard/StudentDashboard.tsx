
import { Trophy, Clock, Target, BookOpen, Brain, Zap, MessageCircle, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';

export const StudentDashboard = () => {
  const { profile } = useAuth();
  const { courses, achievements, points, loading } = useUserData();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userName = profile?.full_name?.split(' ')[0] || 'Student';
  const totalPoints = points?.points || 0;
  const streakDays = points?.streak_days || 0;

  // Calculate success rate from courses
  const successRate = courses.length > 0 ? 89 : 0; // Mock calculation for now

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
        <p className="text-blue-100 text-lg">Ready to continue your math journey?</p>
        <div className="flex items-center space-x-6 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalPoints}</div>
            <div className="text-sm text-blue-200">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{streakDays}</div>
            <div className="text-sm text-blue-200">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{successRate}%</div>
            <div className="text-sm text-blue-200">Success Rate</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Courses */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Continue Learning</h2>
          {courses.length > 0 ? (
            courses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{course.title}</h3>
                      <p className="text-gray-600">{course.description}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                    )}>
                      Grade {course.grade_level}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    Continue Learning
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                <p className="text-gray-600 mb-4">Contact your teacher to get enrolled in courses</p>
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
              <p className="text-sm text-gray-600">Get instant help with your math questions</p>
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
                achievements.slice(0, 3).map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-gray-500">{achievement.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Trophy className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">No achievements yet</p>
                  <p className="text-xs text-gray-500">Start learning to earn your first achievement!</p>
                </div>
              )}
              <Button variant="outline" className="w-full mt-3">
                <Trophy size={16} className="mr-2" />
                View All
              </Button>
            </CardContent>
          </Card>

          {/* Study Reminder */}
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="text-orange-500" size={16} />
                <span className="font-medium text-orange-700">Study Reminder</span>
              </div>
              <p className="text-sm text-orange-600">Keep your learning streak going!</p>
              <Button size="sm" className="w-full mt-3 bg-orange-500 hover:bg-orange-600">
                <Play size={14} className="mr-2" />
                Start Learning
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
