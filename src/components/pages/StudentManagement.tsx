
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Search, Filter, UserPlus, Mail, Trophy, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  full_name: string;
  email: string;
  grade_level: number;
  total_points: number;
  assignments_completed: number;
  assignments_total: number;
  avg_score: number;
  last_activity: string;
}

export const StudentManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [performanceFilter, setPerformanceFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, gradeFilter, performanceFilter]);

  const fetchStudents = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get all students who have assignments from this teacher
      const { data: assignments } = await supabase
        .from('lesson_assignments')
        .select(`
          student_id,
          is_completed,
          score,
          assigned_at,
          profiles!lesson_assignments_student_id_fkey(id, full_name, email, grade_level),
          generated_lessons!inner(teacher_id)
        `)
        .eq('generated_lessons.teacher_id', user.id);

      if (!assignments) {
        setStudents([]);
        return;
      }

      // Get student points
      const studentIds = [...new Set(assignments.map(a => a.student_id))];
      const { data: pointsData } = await supabase
        .from('student_points')
        .select('student_id, points, last_activity')
        .in('student_id', studentIds);

      // Aggregate student data
      const studentMap = new Map<string, Student>();

      assignments.forEach(assignment => {
        const profile = (assignment as any).profiles;
        if (!profile) return;

        const studentId = assignment.student_id;
        const points = pointsData?.find(p => p.student_id === studentId);

        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            id: studentId,
            full_name: profile.full_name || 'Unknown',
            email: profile.email || '',
            grade_level: profile.grade_level || 0,
            total_points: points?.points || 0,
            assignments_completed: 0,
            assignments_total: 0,
            avg_score: 0,
            last_activity: points?.last_activity || assignment.assigned_at
          });
        }

        const student = studentMap.get(studentId)!;
        student.assignments_total++;
        
        if (assignment.is_completed) {
          student.assignments_completed++;
          if (assignment.score) {
            student.avg_score = ((student.avg_score * (student.assignments_completed - 1)) + assignment.score) / student.assignments_completed;
          }
        }
      });

      setStudents(Array.from(studentMap.values()));
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast({
        title: "Error",
        description: "Failed to load students.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Grade filter
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(student => student.grade_level === parseInt(gradeFilter));
    }

    // Performance filter
    if (performanceFilter !== 'all') {
      if (performanceFilter === 'high') {
        filtered = filtered.filter(student => student.avg_score >= 80);
      } else if (performanceFilter === 'medium') {
        filtered = filtered.filter(student => student.avg_score >= 60 && student.avg_score < 80);
      } else if (performanceFilter === 'low') {
        filtered = filtered.filter(student => student.avg_score < 60);
      } else if (performanceFilter === 'incomplete') {
        filtered = filtered.filter(student => student.assignments_completed < student.assignments_total);
      }
    }

    setFilteredStudents(filtered);
  };

  const getPerformanceBadge = (avgScore: number, completed: number, total: number) => {
    if (completed < total) {
      return <Badge variant="secondary">Incomplete</Badge>;
    } else if (avgScore >= 80) {
      return <Badge className="bg-green-500">Excellent</Badge>;
    } else if (avgScore >= 60) {
      return <Badge className="bg-yellow-500">Good</Badge>;
    } else {
      return <Badge variant="destructive">Needs Help</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Student Management
        </h1>
        <p className="text-gray-600">
          Monitor and manage your students' progress and performance
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="text-blue-500" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="text-green-500" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">High Performers</p>
                <p className="text-2xl font-bold">{students.filter(s => s.avg_score >= 80).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="text-orange-500" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Need Attention</p>
                <p className="text-2xl font-bold">{students.filter(s => s.avg_score < 60 || s.assignments_completed < s.assignments_total).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="text-purple-500" size={20} />
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">
                  {students.length > 0 ? Math.round((students.reduce((sum, s) => sum + (s.assignments_completed / s.assignments_total * 100), 0) / students.length)) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {[...Array(12)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>Grade {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by performance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Performance</SelectItem>
                <SelectItem value="high">High (80%+)</SelectItem>
                <SelectItem value="medium">Medium (60-79%)</SelectItem>
                <SelectItem value="low">Low (&lt;60%)</SelectItem>
                <SelectItem value="incomplete">Incomplete Assignments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No students found matching your criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Avg Score</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{student.grade_level}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{student.assignments_completed}/{student.assignments_total}</span>
                          <span>{Math.round((student.assignments_completed / student.assignments_total) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(student.assignments_completed / student.assignments_total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{Math.round(student.avg_score)}%</TableCell>
                    <TableCell>{student.total_points}</TableCell>
                    <TableCell>
                      {getPerformanceBadge(student.avg_score, student.assignments_completed, student.assignments_total)}
                    </TableCell>
                    <TableCell>
                      {new Date(student.last_activity).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
