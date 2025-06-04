
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Trophy, 
  Users, 
  BarChart3, 
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Brain,
  Play,
  Wand2,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userRole: 'student' | 'teacher';
}

export const Sidebar = ({ userRole }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const studentItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: BookOpen, label: 'Lessons', path: '/lessons' },
    { icon: Brain, label: 'AI Mentor', path: '/mentor' },
    { icon: Trophy, label: 'Achievements', path: '/achievements' },
    { icon: Play, label: 'Practice', path: '/practice' },
  ];

  const teacherItems = [
    { icon: Home, label: 'Dashboard', path: '/teacher' },
    { icon: Wand2, label: 'SAGE Builder', path: '/sage' },
    { icon: GraduationCap, label: 'My Lessons', path: '/teacher/lessons' },
    { icon: Users, label: 'Students', path: '/teacher/students' },
    { icon: BarChart3, label: 'Analytics', path: '/teacher/analytics' },
    { icon: MessageCircle, label: 'Messages', path: '/teacher/messages' },
  ];

  const items = userRole === 'student' ? studentItems : teacherItems;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className={cn(
      "bg-background border-r border-border fixed top-0 left-0 z-40 transition-all duration-300",
      "h-screen flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Add top padding to account for navbar */}
      <div className="h-16 flex-shrink-0"></div>
      
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        {!collapsed && (
          <h2 className="font-semibold text-foreground">
            {userRole === 'student' ? 'Learning Hub' : 'Teaching Hub'}
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
      
      <nav className="p-2 space-y-1 overflow-y-auto flex-1">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
              location.pathname === item.path 
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon size={20} />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};
