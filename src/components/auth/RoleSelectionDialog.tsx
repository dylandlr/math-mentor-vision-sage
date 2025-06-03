
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RoleSelectionDialogProps {
  isOpen: boolean;
  onRoleSelect: (role: 'student' | 'teacher') => void;
  userEmail: string;
}

export const RoleSelectionDialog = ({ isOpen, onRoleSelect, userEmail }: RoleSelectionDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('No user found');
        return;
      }

      // Create profile for the user
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
          role: selectedRole
        });

      if (createError) {
        console.error('Error creating profile:', createError);
        toast.error('Failed to create profile');
        return;
      }

      // Create initial points record for students
      if (selectedRole === 'student') {
        await supabase
          .from('student_points')
          .insert({
            student_id: user.id,
            points: 0,
            streak_days: 0
          });
      }

      toast.success('Profile created successfully!');
      onRoleSelect(selectedRole);
    } catch (error) {
      console.error('Error in role selection:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Welcome to EduAI!
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Hi {userEmail}! Please select your role to get started.
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'student' | 'teacher')}>
            <Card className={`cursor-pointer transition-colors ${selectedRole === 'student' ? 'ring-2 ring-blue-500' : ''}`} 
                  onClick={() => setSelectedRole('student')}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="student" id="student" />
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <label htmlFor="student" className="font-medium cursor-pointer">
                        I'm a Student
                      </label>
                      <p className="text-sm text-gray-600">
                        Learn math with AI-powered personalized lessons
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className={`cursor-pointer transition-colors ${selectedRole === 'teacher' ? 'ring-2 ring-purple-500' : ''}`} 
                  onClick={() => setSelectedRole('teacher')}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="teacher" id="teacher" />
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <label htmlFor="teacher" className="font-medium cursor-pointer">
                        I'm a Teacher
                      </label>
                      <p className="text-sm text-gray-600">
                        Create courses and track student progress
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </RadioGroup>
          
          <Button 
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {loading ? 'Setting up...' : `Continue as ${selectedRole === 'student' ? 'Student' : 'Teacher'}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
