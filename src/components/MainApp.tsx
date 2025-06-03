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
import { ProfilePage } from '@/components/pages/ProfilePage';
import { SettingsPage } from '@/components/pages/SettingsPage';

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
    // Force a reload to refresh the profile data after role selection
    window.location.reload();
  };

  // Show loading if still loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  // Show role selection if user exists but no profile (OAuth users)
  if (user && !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RoleSelectionDialog
          isOpen={true}
          onRoleSelect={handleRoleSelect}
          userEmail={user.email || 'User'}
        />
      </div>
    );
  }

  // If no profile after loading, something went wrong
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Profile Setup Required</h2>
          <p className="text-gray-600 mb-4">We need to set up your profile to continue.</p>
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
    // Handle profile and settings pages for both roles
    if (currentPath === '/profile') {
      return <ProfilePage />;
    }
    
    if (currentPath === '/settings') {
      return <SettingsPage />;
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
        case '/teacher/students':
          return <div className="p-6">Student management coming soon...</div>;
        case '/teacher/analytics':
          return <div className="p-6">Analytics page coming soon...</div>;
        case '/teacher/messages':
          return <div className="p-6">Messages page coming soon...</div>;
        default:
          return <TeacherDashboard />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userName={userName} onNavigate={handleNavigate} />
      <div className="flex">
        <Sidebar 
          userRole={userRole} 
          currentPath={currentPath} 
          onNavigate={handleNavigate} 
        />
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
      {userRole === 'student' && currentPath !== '/mentor' && (
        <AIMentorBubble onOpenMentor={handleOpenMentor} />
      )}
    </div>
  );
};
