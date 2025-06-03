
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play,
  CheckCircle,
  Trophy,
  Calendar
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  rating: number;
  enrolledStudents: number;
  nextLesson?: string;
  category: string;
}

// TODO: Replace with actual API call to fetch user's enrolled courses
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Algebra Foundations',
    description: 'Master the fundamentals of algebra with step-by-step guidance and interactive exercises.',
    instructor: 'Dr. Sarah Johnson',
    progress: 65,
    totalLessons: 20,
    completedLessons: 13,
    difficulty: 'beginner',
    estimatedTime: '8 weeks',
    rating: 4.8,
    enrolledStudents: 1250,
    nextLesson: 'Solving Linear Equations',
    category: 'Algebra'
  },
  {
    id: '2',
    title: 'Geometry Essentials',
    description: 'Explore shapes, angles, and spatial relationships through visual learning.',
    instructor: 'Prof. Michael Chen',
    progress: 30,
    totalLessons: 15,
    completedLessons: 4,
    difficulty: 'intermediate',
    estimatedTime: '6 weeks',
    rating: 4.6,
    enrolledStudents: 890,
    nextLesson: 'Triangle Properties',
    category: 'Geometry'
  },
  {
    id: '3',
    title: 'Statistics & Probability',
    description: 'Learn to analyze data and understand probability in real-world contexts.',
    instructor: 'Dr. Emily Rodriguez',
    progress: 0,
    totalLessons: 25,
    completedLessons: 0,
    difficulty: 'advanced',
    estimatedTime: '10 weeks',
    rating: 4.9,
    enrolledStudents: 650,
    category: 'Statistics'
  }
];

export const CoursePage = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  // TODO: Implement actual filtering based on course progress from database
  const filteredCourses = mockCourses.filter(course => {
    if (selectedFilter === 'in-progress') return course.progress > 0 && course.progress < 100;
    if (selectedFilter === 'completed') return course.progress === 100;
    return true;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // TODO: Implement navigation to specific course/lesson pages
  const handleContinueCourse = (courseId: string, nextLesson?: string) => {
    console.log('Navigate to course:', courseId, 'lesson:', nextLesson);
    // TODO: Navigate to course detail or specific lesson
  };

  // TODO: Implement course enrollment functionality
  const handleEnrollInNewCourse = () => {
    console.log('Navigate to course catalog');
    // TODO: Navigate to course catalog/browse page
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-background min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Courses</h1>
            <p className="text-muted-foreground">Track your progress and continue learning</p>
          </div>
          <Button 
            onClick={handleEnrollInNewCourse}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Browse Courses
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          {[
            { key: 'all', label: 'All Courses' },
            { key: 'in-progress', label: 'In Progress' },
            { key: 'completed', label: 'Completed' }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-background text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold text-foreground">{mockCourses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-foreground">
                  {mockCourses.filter(c => c.progress > 0 && c.progress < 100).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">
                  {mockCourses.filter(c => c.progress === 100).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Progress</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(mockCourses.reduce((acc, c) => acc + c.progress, 0) / mockCourses.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 text-foreground">{course.title}</CardTitle>
                  <p className="text-muted-foreground text-sm mb-3">{course.description}</p>
                </div>
                <Badge className={getDifficultyColor(course.difficulty)}>
                  {course.difficulty}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{course.enrolledStudents.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  <span>{course.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.estimatedTime}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">
                    {course.completedLessons}/{course.totalLessons} lessons
                  </span>
                </div>
                <Progress value={course.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{course.progress}% complete</p>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Instructor: {course.instructor}</p>
                  {course.nextLesson && (
                    <p className="text-blue-600 dark:text-blue-400 mt-1">Next: {course.nextLesson}</p>
                  )}
                </div>
                
                <Button 
                  onClick={() => handleContinueCourse(course.id, course.nextLesson)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {course.progress === 0 ? 'Start Course' : 'Continue'}
                  <Play className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No courses found</h3>
          <p className="text-muted-foreground mb-4">
            {selectedFilter === 'all' 
              ? "You haven't enrolled in any courses yet."
              : `No ${selectedFilter.replace('-', ' ')} courses found.`
            }
          </p>
          <Button 
            onClick={handleEnrollInNewCourse}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Explore Courses
          </Button>
        </div>
      )}
    </div>
  );
};
