
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Users, Calendar, Trophy, Eye, Send } from 'lucide-react';
import { lessonService, GeneratedLesson, LessonAssignment } from '@/services/lessonService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const TeacherLessons = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<GeneratedLesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<GeneratedLesson | null>(null);
  const [assignments, setAssignments] = useState<LessonAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLessons();
    }
  }, [user]);

  const fetchLessons = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const lessonsData = await lessonService.getTeacherLessons(user.id);
      setLessons(lessonsData);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      toast({
        title: "Error",
        description: "Failed to fetch lessons.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const viewLessonDetails = async (lesson: GeneratedLesson) => {
    try {
      setSelectedLesson(lesson);
      const assignmentsData = await lessonService.getLessonAssignments(lesson.id);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          My Lessons
        </h1>
        <p className="text-gray-600">
          Manage your created lessons and track student progress
        </p>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No lessons created yet.</p>
            <p className="text-sm text-gray-500">Generate content and create your first lesson!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{lesson.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge>{lesson.subject}</Badge>
                      <Badge variant="outline">Grade {lesson.grade_level}</Badge>
                      <Badge variant="outline" className="capitalize">{lesson.difficulty_level}</Badge>
                      <Badge variant={lesson.is_published ? 'default' : 'secondary'}>
                        {lesson.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          onClick={() => viewLessonDetails(lesson)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{selectedLesson?.title}</DialogTitle>
                        </DialogHeader>
                        {selectedLesson && (
                          <div className="space-y-6">
                            {/* Lesson Info */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h3 className="font-semibold mb-2">Lesson Details</h3>
                                <div className="space-y-1 text-sm">
                                  <p><span className="font-medium">Subject:</span> {selectedLesson.subject}</p>
                                  <p><span className="font-medium">Grade:</span> {selectedLesson.grade_level}</p>
                                  <p><span className="font-medium">Difficulty:</span> {selectedLesson.difficulty_level}</p>
                                  <p><span className="font-medium">Duration:</span> {selectedLesson.estimated_duration} min</p>
                                  <p><span className="font-medium">Points:</span> {selectedLesson.points_value}</p>
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-2">Assignment Status</h3>
                                <div className="space-y-1 text-sm">
                                  <p><span className="font-medium">Total Assigned:</span> {assignments.length}</p>
                                  <p><span className="font-medium">Completed:</span> {assignments.filter(a => a.is_completed).length}</p>
                                  <p><span className="font-medium">In Progress:</span> {assignments.filter(a => !a.is_completed).length}</p>
                                </div>
                              </div>
                            </div>

                            {/* Content Preview */}
                            <div>
                              <h3 className="font-semibold mb-2">Content</h3>
                              <div className="border rounded-lg p-4 bg-gray-50 max-h-60 overflow-y-auto">
                                {Object.entries(selectedLesson.content.sections || {}).map(([section, content]: [string, any]) => (
                                  <div key={section} className="mb-3">
                                    <h4 className="font-medium capitalize">{section.replace('_', ' ')}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{content}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Student Progress */}
                            {assignments.length > 0 && (
                              <div>
                                <h3 className="font-semibold mb-2">Student Progress</h3>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Student</TableHead>
                                      <TableHead>Assigned</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Score</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {assignments.map((assignment) => (
                                      <TableRow key={assignment.id}>
                                        <TableCell>
                                          {(assignment as any).profiles?.full_name || 'Unknown'}
                                        </TableCell>
                                        <TableCell>
                                          {new Date(assignment.assigned_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant={assignment.is_completed ? 'default' : 'secondary'}>
                                            {assignment.is_completed ? 'Completed' : 'In Progress'}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          {assignment.score ? `${assignment.score}%` : '-'}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {lesson.description || 'No description provided'}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Trophy size={16} />
                      <span>{lesson.points_value} pts</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>{lesson.estimated_duration} min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
