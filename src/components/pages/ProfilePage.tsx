
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  BookOpen, 
  Trophy, 
  Calendar,
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Monitor,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Save
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';

export const ProfilePage = () => {
  const { user, profile } = useAuth();
  const { setTheme } = useTheme();
  const { settings, loading: settingsLoading, saving, updateSetting, saveSettings } = useUserSettings();
  
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [gradeLevel, setGradeLevel] = useState(profile?.grade_level?.toString() || '');
  const [learningStyle, setLearningStyle] = useState(profile?.learning_style || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(profile?.profile_picture_url || '');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setUsername(profile.username || '');
      setGradeLevel(profile.grade_level?.toString() || '');
      setLearningStyle(profile.learning_style || '');
      setProfilePictureUrl(profile.profile_picture_url || '');
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    // Validate username format
    if (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      toast.error('Username must be 3-20 characters long and contain only letters, numbers, and underscores');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username || null,
          grade_level: gradeLevel ? parseInt(gradeLevel) : null,
          learning_style: learningStyle || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        if (error.code === '23505') {
          toast.error('Username is already taken. Please choose a different one.');
        } else {
          throw error;
        }
      } else {
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllSettings = async () => {
    await saveSettings(settings);
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requires confirmation');
  };

  const handleExportData = () => {
    toast.success('Data export request submitted. You will receive an email shortly.');
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

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User size={16} />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell size={16} />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette size={16} />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield size={16} />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <Monitor size={16} />
              Learning
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
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
                <CardTitle className="text-foreground">Personal Information</CardTitle>
                <CardDescription>Update your profile details and preferences</CardDescription>
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
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a unique username"
                      className={username && !/^[a-zA-Z0-9_]{3,20}$/.test(username) ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-muted-foreground">
                      3-20 characters, letters, numbers, and underscores only
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                        <SelectItem value="utc-7">Mountain Time (UTC-7)</SelectItem>
                        <SelectItem value="utc-6">Central Time (UTC-6)</SelectItem>
                        <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                      </SelectContent>
                    </Select>
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
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch 
                    checked={settings.email_notifications} 
                    onCheckedChange={(checked) => updateSetting('email_notifications', checked)} 
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Browser notifications for important updates</p>
                  </div>
                  <Switch 
                    checked={settings.push_notifications} 
                    onCheckedChange={(checked) => updateSetting('push_notifications', checked)} 
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">Lesson Reminders</Label>
                    <p className="text-sm text-muted-foreground">Daily reminders to complete lessons</p>
                  </div>
                  <Switch 
                    checked={settings.lesson_reminders} 
                    onCheckedChange={(checked) => updateSetting('lesson_reminders', checked)} 
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">Achievement Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified when you earn badges or complete milestones</p>
                  </div>
                  <Switch 
                    checked={settings.achievement_notifications} 
                    onCheckedChange={(checked) => updateSetting('achievement_notifications', checked)} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Appearance & Display</CardTitle>
                <CardDescription>Customize how the app looks and feels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select 
                    value={settings.theme} 
                    onValueChange={(value) => {
                      const newTheme = value as 'light' | 'dark' | 'system';
                      updateSetting('theme', newTheme);
                      setTheme(newTheme);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun size={16} />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon size={16} />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor size={16} />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select value={settings.font_size} onValueChange={(value) => updateSetting('font_size', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="extra-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <Globe size={16} />
                          English
                        </div>
                      </SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Privacy & Security</CardTitle>
                <CardDescription>Control your privacy and data sharing preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select value={settings.profile_visibility} onValueChange={(value) => updateSetting('profile_visibility', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Eye size={16} />
                          Public
                        </div>
                      </SelectItem>
                      <SelectItem value="friends">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          Friends Only
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <EyeOff size={16} />
                          Private
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">Show Learning Progress</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your learning progress</p>
                  </div>
                  <Switch 
                    checked={settings.show_progress} 
                    onCheckedChange={(checked) => updateSetting('show_progress', checked)} 
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">Analytics & Performance</Label>
                    <p className="text-sm text-muted-foreground">Help improve the app by sharing anonymous usage data</p>
                  </div>
                  <Switch 
                    checked={settings.allow_analytics} 
                    onCheckedChange={(checked) => updateSetting('allow_analytics', checked)} 
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base text-foreground">Data Management</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportData}>
                      <Download size={16} className="mr-2" />
                      Export My Data
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      <Trash2 size={16} className="mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Settings */}
          <TabsContent value="learning">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Learning Preferences</CardTitle>
                <CardDescription>Customize your learning experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">Play sounds for interactions and achievements</p>
                  </div>
                  <Switch 
                    checked={settings.sound_effects} 
                    onCheckedChange={(checked) => updateSetting('sound_effects', checked)} 
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">Auto-play Videos</Label>
                    <p className="text-sm text-muted-foreground">Automatically play lesson videos</p>
                  </div>
                  <Switch 
                    checked={settings.autoplay} 
                    onCheckedChange={(checked) => updateSetting('autoplay', checked)} 
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Difficulty Setting</Label>
                  <Select value={settings.difficulty_setting} onValueChange={(value) => updateSetting('difficulty_setting', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="adaptive">Adaptive (Recommended)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save All Settings Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSaveAllSettings} 
            disabled={saving}
            size="lg"
            className="flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Saving Settings...' : 'Save All Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};
