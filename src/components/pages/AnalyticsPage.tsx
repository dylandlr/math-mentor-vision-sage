
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, BookOpen, Trophy, Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  overviewStats: {
    totalStudents: number;
    totalLessons: number;
    avgCompletion: number;
    avgScore: number;
  };
  performanceData: Array<{
    lesson: string;
    avgScore: number;
    completionRate: number;
  }>;
  engagementData: Array<{
    date: string;
    activeStudents: number;
    completedLessons: number;
  }>;
  gradeDistribution: Array<{
    grade: string;
    students: number;
  }>;
  scoreDistribution: Array<{
    range: string;
    count: number;
  }>;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

export const AnalyticsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overviewStats: { totalStudents: 0, totalLessons: 0, avgCompletion: 0, avgScore: 0 },
    performanceData: [],
    engagementData: [],
    gradeDistribution: [],
    scoreDistribution: []
  });
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      startDate.setDate(endDate.getDate() - days);

      // Fetch assignments and lessons data
      const { data: assignments } = await supabase
        .from('lesson_assignments')
        .select(`
          *,
          profiles!lesson_assignments_student_id_fkey(grade_level),
          generated_lessons!inner(title, teacher_id)
        `)
        .eq('generated_lessons.teacher_id', user.id)
        .gte('assigned_at', startDate.toISOString());

      const { data: lessons } = await supabase
        .from('generated_lessons')
        .select('*')
        .eq('teacher_id', user.id);

      if (!assignments || !lessons) {
        setAnalyticsData({
          overviewStats: { totalStudents: 0, totalLessons: 0, avgCompletion: 0, avgScore: 0 },
          performanceData: [],
          engagementData: [],
          gradeDistribution: [],
          scoreDistribution: []
        });
        return;
      }

      // Calculate overview stats
      const uniqueStudents = new Set(assignments.map(a => a.student_id));
      const completedAssignments = assignments.filter(a => a.is_completed);
      const avgCompletion = assignments.length > 0 ? (completedAssignments.length / assignments.length) * 100 : 0;
      const scoresWithValues = completedAssignments.filter(a => a.score !== null);
      const avgScore = scoresWithValues.length > 0 
        ? scoresWithValues.reduce((sum, a) => sum + (a.score || 0), 0) / scoresWithValues.length 
        : 0;

      // Performance data by lesson
      const lessonPerformance = lessons.map(lesson => {
        const lessonAssignments = assignments.filter(a => a.lesson_id === lesson.id);
        const lessonCompleted = lessonAssignments.filter(a => a.is_completed);
        const lessonScores = lessonCompleted.filter(a => a.score !== null);
        
        return {
          lesson: lesson.title.substring(0, 20) + (lesson.title.length > 20 ? '...' : ''),
          avgScore: lessonScores.length > 0 
            ? lessonScores.reduce((sum, a) => sum + (a.score || 0), 0) / lessonScores.length 
            : 0,
          completionRate: lessonAssignments.length > 0 
            ? (lessonCompleted.length / lessonAssignments.length) * 100 
            : 0
        };
      });

      // Engagement data over time
      const engagementMap = new Map<string, { activeStudents: Set<string>, completedLessons: number }>();
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        engagementMap.set(dateStr, { activeStudents: new Set(), completedLessons: 0 });
      }

      assignments.forEach(assignment => {
        if (assignment.completed_at) {
          const dateStr = new Date(assignment.completed_at).toISOString().split('T')[0];
          const entry = engagementMap.get(dateStr);
          if (entry) {
            entry.activeStudents.add(assignment.student_id);
            entry.completedLessons++;
          }
        }
      });

      const engagementData = Array.from(engagementMap.entries()).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString(),
        activeStudents: data.activeStudents.size,
        completedLessons: data.completedLessons
      }));

      // Grade distribution
      const gradeMap = new Map<number, number>();
      assignments.forEach(assignment => {
        const grade = (assignment as any).profiles?.grade_level;
        if (grade) {
          gradeMap.set(grade, (gradeMap.get(grade) || 0) + 1);
        }
      });

      const gradeDistribution = Array.from(gradeMap.entries())
        .map(([grade, count]) => ({ grade: `Grade ${grade}`, students: count }))
        .sort((a, b) => parseInt(a.grade.split(' ')[1]) - parseInt(b.grade.split(' ')[1]));

      // Score distribution
      const scoreRanges = [
        { range: '90-100%', min: 90, max: 100 },
        { range: '80-89%', min: 80, max: 89 },
        { range: '70-79%', min: 70, max: 79 },
        { range: '60-69%', min: 60, max: 69 },
        { range: 'Below 60%', min: 0, max: 59 }
      ];

      const scoreDistribution = scoreRanges.map(range => ({
        range: range.range,
        count: scoresWithValues.filter(a => (a.score || 0) >= range.min && (a.score || 0) <= range.max).length
      }));

      setAnalyticsData({
        overviewStats: {
          totalStudents: uniqueStudents.size,
          totalLessons: lessons.length,
          avgCompletion: Math.round(avgCompletion),
          avgScore: Math.round(avgScore)
        },
        performanceData: lessonPerformance,
        engagementData,
        gradeDistribution,
        scoreDistribution
      });

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track student performance and engagement metrics
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="text-blue-500" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold">{analyticsData.overviewStats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="text-green-500" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
                <p className="text-2xl font-bold">{analyticsData.overviewStats.totalLessons}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="text-yellow-500" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">{analyticsData.overviewStats.avgCompletion}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-purple-500" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{analyticsData.overviewStats.avgScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Performance by Lesson */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Lesson</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="lesson" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgScore" fill="#8884d8" name="Avg Score %" />
                <Bar dataKey="completionRate" fill="#82ca9d" name="Completion Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student Engagement Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Student Engagement Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="activeStudents" stroke="#8884d8" name="Active Students" />
                <Line type="monotone" dataKey="completedLessons" stroke="#82ca9d" name="Completed Lessons" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Students by Grade Level</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ grade, students }) => `${grade}: ${students}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="students"
                >
                  {analyticsData.gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" name="Number of Students" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
