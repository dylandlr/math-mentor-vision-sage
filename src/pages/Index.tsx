
import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { AIMentorBubble } from '@/components/layout/AIMentorBubble';

const Index = () => {
  const [user, setUser] = useState<{
    role: 'student' | 'teacher';
    name: string;
  } | null>(null);
  const [currentPath, setCurrentPath] = useState('/dashboard');

  const handleLogin = (role: 'student' | 'teacher', name: string) => {
    setUser({ role, name });
    setCurrentPath(role === 'student' ? '/dashboard' : '/teacher');
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleOpenMentor = () => {
    // In a real app, this would open the AI mentor chat
    console.log('Opening AI Mentor...');
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (user.role === 'student') {
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
      <Navbar userRole={user.role} userName={user.name} />
      <div className="flex">
        <Sidebar 
          userRole={user.role} 
          currentPath={currentPath} 
          onNavigate={handleNavigate} 
        />
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
      {user.role === 'student' && currentPath !== '/mentor' && (
        <AIMentorBubble onOpenMentor={handleOpenMentor} />
      )}
    </div>
  );
};

export default Index;
