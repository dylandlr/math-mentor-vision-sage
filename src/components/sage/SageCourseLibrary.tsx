import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Plus, Clock, Users, Settings, Brain } from 'lucide-react';
import { SageCourse, sageService, CreateCourseRequest } from '@/services/sageService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SageCourseLibraryProps {
  onCourseSelect: (course: SageCourse) => void;
}

export const SageCourseLibrary = ({ onCourseSelect }: SageCourseLibraryProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<SageCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCourse, setNewCourse] = useState<CreateCourseRequest>({
    title: '',
    description: '',
    grade_level: 5,
    subject: 'Mathematics',
    difficulty_level: 'intermediate',
    estimated_duration: 60
  });

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const coursesData = await sageService.getCoursesByTeacher(user.id);
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!user || !newCourse.title.trim()) return;

    try {
      const course = await sageService.createCourse(newCourse, user.id);
      setCourses(prev => [course, ...prev]);
      setShowCreateDialog(false);
      setNewCourse({
        title: '',
        description: '',
        grade_level: 5,
        subject: 'Mathematics',
        difficulty_level: 'intermediate',
        estimated_duration: 60
      });

      toast({
        title: "Course Created",
        description: "New course has been created successfully.",
      });
    } catch (error) {
      console.error('Failed to create course:', error);
      toast({
        title: "Error",
        description: "Failed to create course.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading SAGE courses...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg">
              <Brain size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SAGE Course Builder
              </h1>
              <p className="text-gray-600">Create and manage AI-powered educational courses</p>
            </div>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="course-title">Course Title</Label>
                  <Input
                    id="course-title"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter course title..."
                  />
                </div>

                <div>
                  <Label htmlFor="course-description">Description</Label>
                  <Textarea
                    id="course-description"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Course description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Subject</Label>
                    <Select 
                      value={newCourse.subject} 
                      onValueChange={(value) => setNewCourse(prev => ({ ...prev, subject: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Art">Art</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Grade Level</Label>
                    <Select 
                      value={newCourse.grade_level.toString()} 
                      onValueChange={(value) => setNewCourse(prev => ({ ...prev, grade_level: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                          <SelectItem key={grade} value={grade.toString()}>Grade {grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Difficulty</Label>
                    <Select 
                      value={newCourse.difficulty_level} 
                      onValueChange={(value: any) => setNewCourse(prev => ({ ...prev, difficulty_level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Duration (min)</Label>
                    <Input
                      type="number"
                      value={newCourse.estimated_duration}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 60 }))}
                      min={15}
                      max={300}
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateCourse}
                    disabled={!newCourse.title.trim()}
                    className="flex-1"
                  >
                    Create Course
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-4">Create your first course to get started with SAGE</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <Badge variant={course.is_published ? 'default' : 'secondary'}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{course.subject}</Badge>
                  <Badge variant="outline">Grade {course.grade_level}</Badge>
                  <Badge variant="outline" className="capitalize">{course.difficulty_level}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description || 'No description provided'}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{course.estimated_duration || 60} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users size={14} />
                    <span>0 students</span>
                  </div>
                </div>
                <Button 
                  onClick={() => onCourseSelect(course)}
                  className="w-full"
                  variant="outline"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Open Builder
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
