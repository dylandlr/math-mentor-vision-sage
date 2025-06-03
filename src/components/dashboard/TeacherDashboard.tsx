
import { Users, BookOpen, TrendingUp, AlertTriangle, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const TeacherDashboard = () => {
  const classStats = [
    { label: "Total Students", value: "156", icon: Users, color: "text-blue-500" },
    { label: "Active Courses", value: "12", icon: BookOpen, color: "text-green-500" },
    { label: "Avg. Performance", value: "87%", icon: TrendingUp, color: "text-purple-500" },
    { label: "Needs Attention", value: "8", icon: AlertTriangle, color: "text-orange-500" },
  ];

  const recentClasses = [
    { name: "Algebra I - Period 1", students: 28, avgScore: 85, lastActivity: "2 hours ago" },
    { name: "Geometry - Period 3", students: 24, avgScore: 92, lastActivity: "4 hours ago" },
    { name: "Pre-Calc - Period 5", students: 22, avgScore: 78, lastActivity: "1 day ago" },
  ];

  const studentsNeedingHelp = [
    { name: "Emma Thompson", issue: "Struggling with quadratic equations", course: "Algebra I" },
    { name: "Marcus Johnson", issue: "Missing assignments", course: "Geometry" },
    { name: "Sophia Chen", issue: "Low engagement in recent lessons", course: "Pre-Calc" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
          <p className="text-gray-600">Manage your classes and track student progress</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus size={16} className="mr-2" />
          Create New Course
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {classStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={stat.color} size={24} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Classes */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Classes</h2>
          {recentClasses.map((classItem, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{classItem.name}</h3>
                    <p className="text-gray-600">{classItem.students} students • Last activity: {classItem.lastActivity}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Class
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Score</span>
                    <span>{classItem.avgScore}%</span>
                  </div>
                  <Progress value={classItem.avgScore} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Students Needing Attention */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="text-orange-500" size={20} />
                <span>Students Needing Attention</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentsNeedingHelp.map((student, index) => (
                <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="font-medium text-sm">{student.name}</p>
                  <p className="text-xs text-gray-600 mb-1">{student.course}</p>
                  <p className="text-sm text-orange-700">{student.issue}</p>
                  <Button size="sm" variant="outline" className="mt-2 text-xs">
                    View Details
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen size={16} className="mr-2" />
                Create Assignment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users size={16} className="mr-2" />
                Send Announcement
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp size={16} className="mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
