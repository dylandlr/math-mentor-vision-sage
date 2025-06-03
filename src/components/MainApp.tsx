
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { AIMentorBubble } from '@/components/layout/AIMentorBubble';

export const MainApp = () => {
  const { profile } = useAuth();
  const [currentPath, setCurrentPath] = useState('/dashboard');

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleOpenMentor = () => {
    setCurrentPath('/mentor');
  };

  // Show loading if profile is not yet loaded
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const userRole = profile.role || 'student';
  const userName = profile.full_name || profile.email || 'User';

  const renderContent = () => {
    if (userRole === 'student') {
      switch (currentPath) {
        case '/dashboard':
          return <StudentDashboard />;
        case '/lessons':
          return <div className="p-6">Lessons page coming soon...</div>;
        case '/mentor':
          return <div className="p-6">AI Mentor page coming soon...</div>;
        case '/achievements':
          return <div className="p-6">Achievements page coming soon...</div>;
        case '/practice':
          return <div className="p-6">Practice page coming soon...</div>;
        default:
          return <StudentDashboard />;
      }
    } else {
      switch (currentPath) {
        case '/dashboard':
        case '/teacher':
          return <TeacherDashboard />;
        case '/teacher/courses':
          return <div className="p-6">Courses management coming soon...</div>;
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
      <Navbar userRole={userRole} userName={userName} />
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
