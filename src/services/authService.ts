
import { supabase } from '@/integrations/supabase/client';
import { oauthService } from './oauthService';

export const authService = {
  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  },

  signUp: async (email: string, password: string, metadata?: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    return { error };
  },

  signInWithGoogle: async (role?: 'student' | 'teacher') => {
    return oauthService.signInWithProvider('google', role);
  },

  signInWithGithub: async (role?: 'student' | 'teacher') => {
    return oauthService.signInWithProvider('github', role);
  },

  signOut: async () => {
    // Clear any pending OAuth role data
    localStorage.removeItem('pending_oauth_role');
    
    const { error } = await supabase.auth.signOut();
    return { error };
  }
};
