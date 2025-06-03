
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, BookOpen, Trophy, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';

export const ProfilePage = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [gradeLevel, setGradeLevel] = useState(profile?.grade_level?.toString() || '');
  const [learningStyle, setLearningStyle] = useState(profile?.learning_style || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(profile?.profile_picture_url || '');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setGradeLevel(profile.grade_level?.toString() || '');
      setLearningStyle(profile.learning_style || '');
      setProfilePictureUrl(profile.profile_picture_url || '');
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          grade_level: gradeLevel ? parseInt(gradeLevel) : null,
          learning_style: learningStyle || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-foreground">Profile not found</h2>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>

        {/* Profile Picture & Overview Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <ProfilePictureUpload 
                currentImageUrl={profilePictureUrl}
                onImageUpdate={setProfilePictureUrl}
              />
              <div className="text-center md:text-left">
                <CardTitle className="text-2xl text-foreground">{profile.full_name || 'Anonymous User'}</CardTitle>
                <CardDescription className="flex items-center justify-center md:justify-start space-x-2 mt-2">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </CardDescription>
                <div className="flex items-center justify-center md:justify-start space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <User size={14} />
                    <span className="capitalize">{profile.role}</span>
                  </div>
                  {profile.role === 'student' && profile.grade_level && (
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <BookOpen size={14} />
                      <span>Grade {profile.grade_level}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Edit Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Edit Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              {profile.role === 'student' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="gradeLevel">Grade Level</Label>
                    <Select value={gradeLevel} onValueChange={setGradeLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="learningStyle">Learning Style (VARK)</Label>
                    <Select value={learningStyle} onValueChange={setLearningStyle}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select learning style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visual">Visual</SelectItem>
                        <SelectItem value="auditory">Auditory</SelectItem>
                        <SelectItem value="reading">Reading/Writing</SelectItem>
                        <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Account Information</CardTitle>
            <CardDescription>Your account details and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
                <div>
                  <p className="font-medium text-foreground">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <User className="text-green-600 dark:text-green-400" size={24} />
                <div>
                  <p className="font-medium text-foreground">Role</p>
                  <p className="text-sm text-muted-foreground capitalize">{profile.role}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <Trophy className="text-purple-600 dark:text-purple-400" size={24} />
                <div>
                  <p className="font-medium text-foreground">Status</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
