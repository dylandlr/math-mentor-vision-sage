
import { Trophy, Clock, Target, BookOpen, Brain, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export const StudentDashboard = () => {
  const currentCourses = [
    {
      id: 1,
      title: "Algebra Fundamentals",
      progress: 75,
      nextLesson: "Quadratic Equations",
      difficulty: "Intermediate"
    },
    {
      id: 2,
      title: "Geometry Basics",
      progress: 45,
      nextLesson: "Triangle Properties",
      difficulty: "Beginner"
    },
    {
      id: 3,
      title: "Pre-Calculus",
      progress: 30,
      nextLesson: "Functions & Graphs",
      difficulty: "Advanced"
    }
  ];

  const achievements = [
    { icon: Trophy, title: "Problem Solver", description: "Solved 50 problems", color: "text-yellow-500" },
    { icon: Target, title: "Streak Master", description: "7 day learning streak", color: "text-blue-500" },
    { icon: Zap, title: "Quick Learner", description: "Completed lesson in 5 mins", color: "text-purple-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Alex! 👋</h1>
        <p className="text-blue-100 text-lg">Ready to continue your math journey?</p>
        <div className="flex items-center space-x-6 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">127</div>
            <div className="text-sm text-blue-200">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">7</div>
            <div className="text-sm text-blue-200">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">89%</div>
            <div className="text-sm text-blue-200">Success Rate</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Courses */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Continue Learning</h2>
          {currentCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    <p className="text-gray-600">Next: {course.nextLesson}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    course.difficulty === "Beginner" && "bg-green-100 text-green-700",
                    course.difficulty === "Intermediate" && "bg-yellow-100 text-yellow-700",
                    course.difficulty === "Advanced" && "bg-red-100 text-red-700"
                  )}>
                    {course.difficulty}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
                <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Continue Learning
                </Button>
              </CardContent>
            </Card>
          ))}
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
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <achievement.icon className={achievement.color} size={20} />
                  <div>
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                  </div>
                </div>
              ))}
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
              <p className="text-sm text-orange-600">You haven't studied today. Keep your streak going!</p>
              <Button size="sm" className="w-full mt-3 bg-orange-500 hover:bg-orange-600">
                Start Learning
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
