import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { AIMentorBubble } from '@/components/layout/AIMentorBubble';
import { RoleSelectionDialog } from '@/components/auth/RoleSelectionDialog';
import { MentorPage } from '@/components/pages/MentorPage';
import { LessonsPage } from '@/components/pages/LessonsPage';
import { AchievementsPage } from '@/components/pages/AchievementsPage';
import { PracticePage } from '@/components/pages/PracticePage';
import { CoursePage } from '@/components/pages/CoursePage';
import { TeacherContentGenerator } from '@/components/pages/TeacherContentGenerator';
import { TeacherLessons } from '@/components/pages/TeacherLessons';
import { StudentManagement } from '@/components/pages/StudentManagement';
import { AnalyticsPage } from '@/components/pages/AnalyticsPage';
import { MessagingPage } from '@/components/pages/MessagingPage';
import { ProfilePage } from '@/components/pages/ProfilePage';

export const MainApp = () => {
  const { user, profile, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState('/dashboard');

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleOpenMentor = () => {
    setCurrentPath('/mentor');
  };

  const handleRoleSelect = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  if (user && !profile) {
    return (
      <div className="min-h-screen bg-background">
        <RoleSelectionDialog
          isOpen={true}
          onRoleSelect={handleRoleSelect}
          userEmail={user.email || 'User'}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-foreground">Profile Setup Required</h2>
          <p className="text-muted-foreground mb-4">We need to set up your profile to continue.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry Setup
          </button>
        </div>
      </div>
    );
  }

  const userRole = profile.role || 'student';
  const userName = profile.full_name || profile.email || 'User';

  const renderContent = () => {
    if (currentPath === '/profile' || currentPath === '/settings') {
      return <ProfilePage />;
    }

    if (userRole === 'student') {
      switch (currentPath) {
        case '/dashboard':
          return <StudentDashboard />;
        case '/courses':
          return <CoursePage />;
        case '/lessons':
          return <LessonsPage />;
        case '/mentor':
          return <MentorPage />;
        case '/achievements':
          return <AchievementsPage />;
        case '/practice':
          return <PracticePage />;
        default:
          return <StudentDashboard />;
      }
    } else {
      switch (currentPath) {
        case '/dashboard':
        case '/teacher':
          return <TeacherDashboard />;
        case '/teacher/courses':
          return <TeacherContentGenerator />;
        case '/teacher/lessons':
          return <TeacherLessons />;
        case '/teacher/students':
          return <StudentManagement />;
        case '/teacher/analytics':
          return <AnalyticsPage />;
        case '/teacher/messages':
          return <MessagingPage />;
        default:
          return <TeacherDashboard />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole={userRole} userName={userName} onNavigate={handleNavigate} />
      <div className="flex">
        <Sidebar 
          userRole={userRole} 
          currentPath={currentPath} 
          onNavigate={handleNavigate} 
        />
        <main className="flex-1 bg-background">
          {renderContent()}
        </main>
      </div>
      {userRole === 'student' && currentPath !== '/mentor' && !currentPath.includes('/lesson') && (
        <AIMentorBubble onOpenMentor={handleOpenMentor} />
      )}
    </div>
  );
};
