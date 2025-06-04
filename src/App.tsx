
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Index from '@/pages/Index';
import { LessonPlayer } from '@/components/pages/LessonPlayer';
import { SagePage } from '@/components/pages/SagePage';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              <Route path="/sage" element={<SagePage />} />
              <Route path="/lesson/:lessonId" element={<LessonPlayer />} />
              <Route path="/" element={<Index />} />
            </Routes>
            <Toaster />
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
