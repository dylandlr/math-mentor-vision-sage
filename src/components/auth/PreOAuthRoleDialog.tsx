
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Users } from 'lucide-react';

interface PreOAuthRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelect: (role: 'student' | 'teacher') => void;
  provider: 'google' | 'github';
}

export const PreOAuthRoleDialog = ({ isOpen, onClose, onRoleSelect, provider }: PreOAuthRoleDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');

  const handleConfirm = () => {
    onRoleSelect(selectedRole);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Choose Your Role
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Before continuing with {provider === 'google' ? 'Google' : 'GitHub'}, please select your role.
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
          
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Continue with {provider === 'google' ? 'Google' : 'GitHub'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
