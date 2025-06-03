
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { oauthService } from './oauthService';

export const profileService = {
  handleUserProfile: async (user: User) => {
    try {
      console.log(`Checking profile for user ${user.id}`);
      
      // First, try to get existing profile
      const existingProfile = await profileService.getProfile(user.id);
      if (existingProfile) {
        console.log('Profile exists:', existingProfile);
        return existingProfile;
      }

      // Profile doesn't exist - check if this is an OAuth user
      const isOAuthUser = user.app_metadata?.provider && user.app_metadata.provider !== 'email';
      
      if (isOAuthUser) {
        console.log('OAuth user without profile, creating one...');
        return await profileService.createOAuthProfile(user);
      }

      return null;
    } catch (error) {
      console.error('Error in handleUserProfile:', error);
      throw error;
    }
  },

  getProfile: async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      throw error;
    }

    return profile;
  },

  createOAuthProfile: async (user: User) => {
    // Get role from localStorage or default to student
    const pendingRole = oauthService.getPendingRole();
    const roleToUse = pendingRole || 'student';
    
    // Clean up localStorage
    oauthService.clearPendingRole();

    console.log('Creating profile for OAuth user with role:', roleToUse);
    
    // Create profile for OAuth user
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
        role: roleToUse as 'student' | 'teacher',
        profile_picture_url: user.user_metadata?.avatar_url || null
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating OAuth profile:', createError);
      throw createError;
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
    return newProfile;
  }
};
