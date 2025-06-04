import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Star, PlayCircle, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { studentService, StudentLesson } from '@/services/studentService';

export const LessonsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<StudentLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  useEffect(() => {
    if (user?.id) {
      fetchLessons();
    }
  }, [user?.id]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const lessonsData = await studentService.getStudentLessons(user!.id);
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const filteredLessons = selectedCourse === 'all' 
    ? lessons 
    : lessons.filter(lesson => lesson.course_id === selectedCourse);

  const overallProgress = lessons.length > 0 
    ? Math.round(lessons.reduce((acc, lesson) => acc + lesson.progress, 0) / lessons.length)
    : 0;

  const uniqueCourses = Array.from(new Set(lessons.map(l => ({ id: l.course_id, title: l.course_title }))
    .map(c => JSON.stringify(c))))
    .map(c => JSON.parse(c));

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-background min-h-screen">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
            <BookOpen size={24} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Lessons
          </h1>
        </div>

        {/* Course Filter */}
        {uniqueCourses.length > 1 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCourse === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCourse('all')}
              >
                All Courses
              </Button>
              {uniqueCourses.map((course) => (
                <Button
                  key={course.id}
                  variant={selectedCourse === course.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCourse(course.id)}
                >
                  {course.title}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Overall Progress</h3>
              <span className="text-2xl font-bold text-blue-600">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {lessons.filter(l => l.is_completed).length} of {lessons.length} lessons completed
            </p>
          </CardContent>
        </Card>
      </div>

      {filteredLessons.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No lessons available</h3>
            <p className="text-muted-foreground">
              {lessons.length === 0 
                ? "You're not enrolled in any courses yet. Contact your teacher to get started!"
                : "No lessons found for the selected course."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <Card key={lesson.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-foreground">{lesson.title}</CardTitle>
                  {lesson.is_completed && (
                    <CheckCircle className="text-green-500 h-6 w-6" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getDifficultyColor(lesson.difficulty_level)}>
                    {lesson.difficulty_level}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {lesson.course_title}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground mb-4">{lesson.description}</p>

                {!lesson.is_completed && lesson.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium text-foreground">{lesson.progress}%</span>
                    </div>
                    <Progress value={lesson.progress} className="h-2" />
                  </div>
                )}

                {lesson.is_completed && lesson.score > 0 && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-700">Final Score:</span>
                      <span className="font-bold text-green-800">{lesson.score}%</span>
                    </div>
                    {lesson.time_spent > 0 && (
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-green-700">Time Spent:</span>
                        <span className="text-green-800">{Math.round(lesson.time_spent / 60)} min</span>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => handleStartLesson(lesson.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {lesson.is_completed ? (
                    <>
                      <Star className="mr-2 h-4 w-4" />
                      Review
                    </>
                  ) : lesson.progress > 0 ? (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Continue
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Start Lesson
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
