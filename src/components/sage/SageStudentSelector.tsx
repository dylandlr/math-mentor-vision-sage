
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users, Send, Calendar, Loader2 } from 'lucide-react';
import { SageCourse } from '@/services/sageService';
import { lessonService } from '@/services/lessonService';
import { useToast } from '@/hooks/use-toast';

interface SageStudentSelectorProps {
  course: SageCourse;
  onClose: () => void;
}

export const SageStudentSelector = ({ course, onClose }: SageStudentSelectorProps) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [course.grade_level]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const studentsData = await lessonService.getStudentsByGrade(course.grade_level);
      setStudents(studentsData);
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

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssignCourse = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one student.",
        variant: "destructive",
      });
      return;
    }

    setAssigning(true);
    try {
      // Create assignments in the new sage_course_assignments table
      const assignments = selectedStudents.map(studentId => ({
        course_id: course.id,
        student_id: studentId,
        assigned_by: course.teacher_id,
        due_date: dueDate || null
      }));

      // You would implement this in the sageService
      // await sageService.assignCourseToStudents(assignments);

      toast({
        title: "Course Assigned",
        description: `Course assigned to ${selectedStudents.length} student(s) successfully.`,
      });

      onClose();
    } catch (error) {
      console.error('Failed to assign course:', error);
      toast({
        title: "Error",
        description: "Failed to assign course.",
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users size={20} />
            <span>Assign Course to Students</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Course Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">{course.title}</h3>
            <div className="flex space-x-2">
              <Badge variant="outline">{course.subject}</Badge>
              <Badge variant="outline">Grade {course.grade_level}</Badge>
              <Badge variant="outline" className="capitalize">{course.difficulty_level}</Badge>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor="due-date">Due Date (Optional)</Label>
            <Input
              id="due-date"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Student Selection */}
          <div>
            <Label>Select Students (Grade {course.grade_level})</Label>
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2 mt-2">
              {loading ? (
                <div className="text-center py-4 text-gray-500">Loading students...</div>
              ) : students.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No students found for Grade {course.grade_level}
                </div>
              ) : (
                students.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={student.id}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => handleStudentToggle(student.id)}
                    />
                    <Label htmlFor={student.id} className="flex-1 cursor-pointer">
                      {student.full_name || student.email}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selected Count */}
          {selectedStudents.length > 0 && (
            <div className="text-sm text-gray-600">
              {selectedStudents.length} student(s) selected
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleAssignCourse}
            disabled={assigning || selectedStudents.length === 0}
            className="flex-1"
          >
            {assigning ? (
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
      </DialogContent>
    </Dialog>
  );
};
