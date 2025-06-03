
import { supabase } from '@/integrations/supabase/client';

export const oauthService = {
  signInWithProvider: async (provider: 'google' | 'github', role?: 'student' | 'teacher') => {
    console.log(`Initiating ${provider} OAuth with role:`, role);
    
    // Store role in localStorage temporarily to be used after OAuth callback
    if (role) {
      localStorage.setItem('pending_oauth_role', role);
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: role ? { role } : undefined
      }
    });
    
    return { error };
  },

  getPendingRole: (): 'student' | 'teacher' | null => {
    const pendingRole = localStorage.getItem('pending_oauth_role');
    return (pendingRole as 'student' | 'teacher') || null;
  },

  clearPendingRole: () => {
    localStorage.removeItem('pending_oauth_role');
  }
};
