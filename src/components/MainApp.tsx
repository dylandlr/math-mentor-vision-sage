
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { AIMentorBubble } from '@/components/layout/AIMentorBubble';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { CoursePage } from '@/components/pages/CoursePage';
import { LessonsPage } from '@/components/pages/LessonsPage';
import { MentorPage } from '@/components/pages/MentorPage';
import { AchievementsPage } from '@/components/pages/AchievementsPage';
import { PracticePage } from '@/components/pages/PracticePage';
import { TeacherLessons } from '@/components/pages/TeacherLessons';
import { StudentManagement } from '@/components/pages/StudentManagement';
import { AnalyticsPage } from '@/components/pages/AnalyticsPage';
import { MessagingPage } from '@/components/pages/MessagingPage';
import { ProfilePage } from '@/components/pages/ProfilePage';
import { SagePage } from '@/components/pages/SagePage';
import { LessonPlayer } from '@/components/pages/LessonPlayer';
import { useAuth } from '@/hooks/useAuth';

export const MainApp = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMentorChat, setShowMentorChat] = useState(false);

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userRole = profile.role === 'teacher' || profile.role === 'admin' ? 'teacher' : 'student';
  const userName = profile.full_name || user.email || 'User';

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleOpenMentor = () => {
    navigate('/mentor');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        userRole={userRole}
        userName={userName}
        onNavigate={handleNavigation}
      />
      
      <div className="flex">
        <Sidebar userRole={userRole} />
        
        {/* Main content flows naturally next to sidebar */}
        <main className="flex-1 p-6 bg-background min-h-screen">
          <Routes>
            {/* Student Routes */}
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/courses" element={<CoursePage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/mentor" element={<MentorPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/practice" element={<PracticePage />} />
            
            {/* Teacher Routes */}
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/sage" element={<SagePage />} />
            <Route path="/teacher/lessons" element={<TeacherLessons />} />
            <Route path="/teacher/students" element={<StudentManagement />} />
            <Route path="/teacher/analytics" element={<AnalyticsPage />} />
            <Route path="/teacher/messages" element={<MessagingPage />} />
            
            {/* Special Routes */}
            <Route path="/lesson/:lessonId" element={<LessonPlayer />} />
            
            {/* Shared Routes */}
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Default route based on role */}
            <Route path="/" element={
              userRole === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />
            } />
          </Routes>
        </main>
      </div>

      {/* AI Mentor Bubble - only show for students and not on mentor page */}
      {userRole === 'student' && location.pathname !== '/mentor' && (
        <AIMentorBubble 
          onOpenMentor={handleOpenMentor}
        />
      )}
    </div>
  );
};
