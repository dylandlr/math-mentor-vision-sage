
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  showRoleDialog: boolean;
  pendingUser: User | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithGithub: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  completeOAuthSignup: (role: 'student' | 'teacher') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User session found, checking if OAuth user...');
          // Check if this is a new OAuth user without a profile
          const isOAuthUser = session.user.app_metadata?.provider && 
                             session.user.app_metadata.provider !== 'email';
          
          console.log('Is OAuth user:', isOAuthUser, 'Provider:', session.user.app_metadata?.provider);
          
          if (isOAuthUser) {
            // Check if profile exists
            setTimeout(async () => {
              try {
                console.log('Checking for existing profile...');
                const { data: existingProfile, error } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();

                if (error && error.code !== 'PGRST116') {
                  console.error('Error checking profile:', error);
                }

                if (existingProfile) {
                  console.log('Profile found:', existingProfile);
                  setProfile(existingProfile);
                  setLoading(false);
                } else {
                  console.log('No profile found, showing role selection dialog');
                  // New OAuth user - show role selection
                  setPendingUser(session.user);
                  setShowRoleDialog(true);
                  setLoading(false);
                }
              } catch (error) {
                console.error('Error checking profile:', error);
                // Profile doesn't exist, show role dialog
                console.log('Profile check failed, showing role selection dialog');
                setPendingUser(session.user);
                setShowRoleDialog(true);
                setLoading(false);
              }
            }, 100);
          } else {
            // Regular email signup - fetch profile with retry
            setTimeout(async () => {
              try {
                await fetchProfileWithRetry(session.user.id);
              } catch (error) {
                console.error('Error fetching profile:', error);
                if (error.message?.includes('No rows returned')) {
                  await createProfile(session.user);
                }
              }
            }, 100);
          }
        } else {
          console.log('No user session, clearing state');
          setProfile(null);
          setShowRoleDialog(false);
          setPendingUser(null);
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

  const fetchProfileWithRetry = async (userId: string, retries = 3): Promise<void> => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Fetching profile for user ${userId}, attempt ${i + 1}`);
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Profile fetch error:', error);
          if (i === retries - 1) throw error;
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }

        console.log('Profile fetched successfully:', profileData);
        setProfile(profileData);
        setLoading(false);
        return;
      } catch (error) {
        console.error(`Profile fetch attempt ${i + 1} failed:`, error);
        if (i === retries - 1) {
          setLoading(false);
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  const createProfile = async (user: User, role?: 'student' | 'teacher') => {
    try {
      console.log('Creating profile for user:', user.id, 'with role:', role);
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
        role: role || user.user_metadata?.role || 'student'
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      console.log('Profile created successfully:', data);
      setProfile(data);

      // Create initial points for students
      if (profileData.role === 'student') {
        const { error: pointsError } = await supabase
          .from('student_points')
          .insert([{
            student_id: user.id,
            points: 0,
            streak_days: 0
          }]);

        if (pointsError) {
          console.error('Error creating student points:', pointsError);
        }
      }
    } catch (error) {
      console.error('Failed to create profile:', error);
      setLoading(false);
    }
  };

  const completeOAuthSignup = async (role: 'student' | 'teacher') => {
    if (!pendingUser) return;
    
    console.log('Completing OAuth signup with role:', role);
    setLoading(true);
    await createProfile(pendingUser, role);
    setShowRoleDialog(false);
    setPendingUser(null);
    setLoading(false);
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

  const signInWithGoogle = async () => {
    console.log('Initiating Google OAuth...');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  };

  const signInWithGithub = async () => {
    console.log('Initiating GitHub OAuth...');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/`
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
    showRoleDialog,
    pendingUser,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    completeOAuthSignup,
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
