
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { BookOpen, Users, Calendar, Trophy, Loader2, Send } from 'lucide-react';
import { lessonService, CreateLessonRequest, AssignLessonRequest } from '@/services/lessonService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface LessonBuilderProps {
  generatedContent: any;
  onClose: () => void;
}

export const LessonBuilder = ({ generatedContent, onClose }: LessonBuilderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [lessonData, setLessonData] = useState({
    title: generatedContent.topic || '',
    description: '',
    points_value: 100,
  });
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [createdLesson, setCreatedLesson] = useState<any>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);

  const handleCreateLesson = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const request: CreateLessonRequest = {
        title: lessonData.title,
        description: lessonData.description,
        content: generatedContent,
        subject: generatedContent.subject,
        grade_level: generatedContent.gradeLevel,
        difficulty_level: generatedContent.difficulty,
        learning_style: generatedContent.learningStyle,
        estimated_duration: generatedContent.duration,
        points_value: lessonData.points_value,
      };

      const lesson = await lessonService.createLesson(request);
      setCreatedLesson(lesson);
      
      toast({
        title: "Lesson Created!",
        description: "Your lesson has been saved successfully.",
      });

      // Fetch students for assignment
      const studentsData = await lessonService.getStudentsByGrade(generatedContent.gradeLevel);
      setStudents(studentsData);
      setShowAssignmentDialog(true);

    } catch (error) {
      console.error('Failed to create lesson:', error);
      toast({
        title: "Error",
        description: "Failed to create lesson. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLesson = async () => {
    if (!createdLesson || selectedStudents.length === 0) return;

    setAssignmentLoading(true);
    try {
      const request: AssignLessonRequest = {
        lesson_id: createdLesson.id,
        student_ids: selectedStudents,
        due_date: dueDate || undefined,
      };

      await lessonService.assignLesson(request);
      await lessonService.publishLesson(createdLesson.id);

      toast({
        title: "Lesson Assigned!",
        description: `Lesson assigned to ${selectedStudents.length} student(s) successfully.`,
      });

      setShowAssignmentDialog(false);
      onClose();

    } catch (error) {
      console.error('Failed to assign lesson:', error);
      toast({
        title: "Error",
        description: "Failed to assign lesson. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAssignmentLoading(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen size={20} />
            <span>Create Gamified Lesson</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lesson Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Generated Content Type</Label>
              <Badge variant="outline" className="capitalize">
                {generatedContent.type}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label>Subject & Grade</Label>
              <div className="flex space-x-2">
                <Badge>{generatedContent.subject}</Badge>
                <Badge variant="outline">Grade {generatedContent.gradeLevel}</Badge>
              </div>
            </div>
          </div>

          {/* Lesson Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Lesson Title</Label>
              <Input
                id="title"
                value={lessonData.title}
                onChange={(e) => setLessonData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter lesson title..."
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={lessonData.description}
                onChange={(e) => setLessonData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add a description for this lesson..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="points">Points Value</Label>
                <Input
                  id="points"
                  type="number"
                  value={lessonData.points_value}
                  onChange={(e) => setLessonData(prev => ({ ...prev, points_value: parseInt(e.target.value) }))}
                  min={10}
                  max={1000}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Trophy className="text-yellow-500" size={20} />
                <span className="text-sm text-gray-600">
                  Students will earn {lessonData.points_value} points
                </span>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">Generated Content Preview:</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Object.entries(generatedContent.sections || {}).map(([section, content]: [string, any]) => (
                <div key={section} className="text-sm">
                  <span className="font-medium capitalize">{section.replace('_', ' ')}: </span>
                  <span className="text-gray-600">{content.substring(0, 100)}...</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateLesson}
              disabled={loading || !lessonData.title.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Create & Assign Lesson
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users size={20} />
              <span>Assign Lesson to Students</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Select Students (Grade {generatedContent.gradeLevel})</Label>
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                {students.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No students found for Grade {generatedContent.gradeLevel}
                  </p>
                ) : (
                  students.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={student.id}
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => toggleStudentSelection(student.id)}
                      />
                      <Label htmlFor={student.id} className="flex-1 cursor-pointer">
                        {student.full_name || student.email}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowAssignmentDialog(false)}
                className="flex-1"
              >
                Skip Assignment
              </Button>
              <Button 
                onClick={handleAssignLesson}
                disabled={assignmentLoading || selectedStudents.length === 0}
                className="flex-1"
              >
                {assignmentLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Assign to {selectedStudents.length} Student(s)
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
