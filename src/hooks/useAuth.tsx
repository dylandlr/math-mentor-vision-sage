import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signInWithGoogle: (role?: 'student' | 'teacher') => Promise<{ error: any }>;
  signInWithGithub: (role?: 'student' | 'teacher') => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        console.log('User metadata:', session?.user?.user_metadata);
        console.log('App metadata:', session?.user?.app_metadata);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User session found, checking for profile...');
          // For OAuth users, check if profile exists, if not create it
          setTimeout(async () => {
            try {
              await handleUserProfile(session.user);
            } catch (error) {
              console.error('Error handling user profile:', error);
              setLoading(false);
            }
          }, 100);
        } else {
          console.log('No user session, clearing state');
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserProfile = async (user: User) => {
    try {
      console.log(`Checking profile for user ${user.id}`);
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
        setLoading(false);
        return;
      }

      if (existingProfile) {
        console.log('Profile exists:', existingProfile);
        setProfile(existingProfile);
        setLoading(false);
        return;
      }

      // Profile doesn't exist - check if this is an OAuth user who needs role selection
      const isOAuthUser = user.app_metadata?.provider && user.app_metadata.provider !== 'email';
      
      if (isOAuthUser) {
        console.log('OAuth user without profile, checking for pending role...');
        
        // Check for role in localStorage (fallback)
        const pendingRole = localStorage.getItem('pending_oauth_role');
        const roleToUse = (pendingRole as 'student' | 'teacher') || 'student'; // Cast to proper type
        
        // Clean up localStorage
        if (pendingRole) {
          localStorage.removeItem('pending_oauth_role');
        }

        console.log('Creating profile for OAuth user with role:', roleToUse);
        
        // Create profile for OAuth user
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
            role: roleToUse
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating OAuth profile:', createError);
          setLoading(false);
          return;
        }

        // Create initial points record for students
        if (roleToUse === 'student') {
          await supabase
            .from('student_points')
            .insert({
              student_id: user.id,
              points: 0,
              streak_days: 0
            });
        }

        console.log('OAuth profile created successfully:', newProfile);
        setProfile(newProfile);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in handleUserProfile:', error);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
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
  };

  const signInWithGoogle = async (role?: 'student' | 'teacher') => {
    console.log('Initiating Google OAuth with role:', role);
    
    // Store role in localStorage temporarily to be used after OAuth callback
    if (role) {
      localStorage.setItem('pending_oauth_role', role);
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: role ? { role } : undefined
      }
    });
    return { error };
  };

  const signInWithGithub = async (role?: 'student' | 'teacher') => {
    console.log('Initiating GitHub OAuth with role:', role);
    
    // Store role in localStorage temporarily to be used after OAuth callback
    if (role) {
      localStorage.setItem('pending_oauth_role', role);
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: role ? { role } : undefined
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGithub,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
