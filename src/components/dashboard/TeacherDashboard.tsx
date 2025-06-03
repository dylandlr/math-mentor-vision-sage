
import { useState, useEffect } from 'react';
import { Users, BookOpen, TrendingUp, AlertTriangle, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalStudents: number;
  activeLessons: number;
  avgPerformance: number;
  studentsNeedingAttention: number;
}

interface RecentLesson {
  id: string;
  title: string;
  assignmentCount: number;
  avgScore: number;
  lastActivity: string;
}

interface StudentAlert {
  id: string;
  name: string;
  issue: string;
  lessonTitle: string;
}

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeLessons: 0,
    avgPerformance: 0,
    studentsNeedingAttention: 0
  });
  const [recentLessons, setRecentLessons] = useState<RecentLesson[]>([]);
  const [studentAlerts, setStudentAlerts] = useState<StudentAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch total students assigned to teacher's lessons
      const { data: assignments } = await supabase
        .from('lesson_assignments')
        .select(`
          student_id,
          lesson_id,
          is_completed,
          score,
          generated_lessons!inner(teacher_id)
        `)
        .eq('generated_lessons.teacher_id', user.id);

      const uniqueStudents = new Set(assignments?.map(a => a.student_id) || []);
      
      // Fetch active lessons
      const { data: lessons } = await supabase
        .from('generated_lessons')
        .select('*')
        .eq('teacher_id', user.id)
        .eq('is_published', true);

      // Calculate average performance
      const completedAssignments = assignments?.filter(a => a.is_completed && a.score) || [];
      const avgScore = completedAssignments.length > 0 
        ? completedAssignments.reduce((sum, a) => sum + (a.score || 0), 0) / completedAssignments.length
        : 0;

      // Get students needing attention (low scores or incomplete assignments)
      const lowPerformingAssignments = assignments?.filter(a => 
        (!a.is_completed) || (a.score && a.score < 70)
      ) || [];
      const studentsNeedingAttention = new Set(lowPerformingAssignments.map(a => a.student_id));

      setStats({
        totalStudents: uniqueStudents.size,
        activeLessons: lessons?.length || 0,
        avgPerformance: Math.round(avgScore),
        studentsNeedingAttention: studentsNeedingAttention.size
      });

      // Fetch recent lessons with assignment data
      const recentLessonsData = await Promise.all(
        (lessons || []).slice(0, 3).map(async (lesson) => {
          const { data: lessonAssignments } = await supabase
            .from('lesson_assignments')
            .select('*, profiles!lesson_assignments_student_id_fkey(full_name)')
            .eq('lesson_id', lesson.id);

          const completedScores = lessonAssignments?.filter(a => a.is_completed && a.score) || [];
          const avgLessonScore = completedScores.length > 0
            ? completedScores.reduce((sum, a) => sum + (a.score || 0), 0) / completedScores.length
            : 0;

          return {
            id: lesson.id,
            title: lesson.title,
            assignmentCount: lessonAssignments?.length || 0,
            avgScore: Math.round(avgLessonScore),
            lastActivity: new Date(lesson.updated_at).toLocaleDateString()
          };
        })
      );

      setRecentLessons(recentLessonsData);

      // Fetch student alerts
      const { data: alertData } = await supabase
        .from('lesson_assignments')
        .select(`
          *,
          profiles!lesson_assignments_student_id_fkey(full_name),
          generated_lessons!inner(title, teacher_id)
        `)
        .eq('generated_lessons.teacher_id', user.id)
        .or('is_completed.eq.false,score.lt.70')
        .limit(3);

      const alerts = alertData?.map(assignment => ({
        id: assignment.id,
        name: (assignment as any).profiles?.full_name || 'Unknown Student',
        issue: !assignment.is_completed ? 'Incomplete assignment' : 'Low score',
        lessonTitle: (assignment as any).generated_lessons?.title || 'Unknown Lesson'
      })) || [];

      setStudentAlerts(alerts);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6 bg-background min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const classStats = [
    { label: "Total Students", value: stats.totalStudents.toString(), icon: Users, color: "text-blue-500" },
    { label: "Active Lessons", value: stats.activeLessons.toString(), icon: BookOpen, color: "text-green-500" },
    { label: "Avg. Performance", value: `${stats.avgPerformance}%`, icon: TrendingUp, color: "text-purple-500" },
    { label: "Needs Attention", value: stats.studentsNeedingAttention.toString(), icon: AlertTriangle, color: "text-orange-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage your classes and track student progress</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus size={16} className="mr-2" />
          Create New Lesson
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {classStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className={stat.color} size={24} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Lessons */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Recent Lessons</h2>
          {recentLessons.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No lessons created yet.</p>
              </CardContent>
            </Card>
          ) : (
            recentLessons.map((lesson) => (
              <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{lesson.title}</h3>
                      <p className="text-muted-foreground">{lesson.assignmentCount} assignments • Last activity: {lesson.lastActivity}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Lesson
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Average Score</span>
                      <span className="text-foreground">{lesson.avgScore}%</span>
                    </div>
                    <Progress value={lesson.avgScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
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
              {studentAlerts.length === 0 ? (
                <p className="text-center text-muted-foreground">All students are doing well!</p>
              ) : (
                studentAlerts.map((student) => (
                  <div key={student.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                    <p className="font-medium text-sm text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground mb-1">{student.lessonTitle}</p>
                    <p className="text-sm text-orange-700 dark:text-orange-400">{student.issue}</p>
                    <Button size="sm" variant="outline" className="mt-2 text-xs">
                      View Details
                    </Button>
                  </div>
                ))
              )}
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
