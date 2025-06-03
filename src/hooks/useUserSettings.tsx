
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  font_size: string;
  language: string;
  email_notifications: boolean;
  push_notifications: boolean;
  lesson_reminders: boolean;
  achievement_notifications: boolean;
  profile_visibility: string;
  show_progress: boolean;
  allow_analytics: boolean;
  sound_effects: boolean;
  autoplay: boolean;
  difficulty_setting: string;
  timezone: string;
  country: string;
}

const defaultSettings: UserSettings = {
  theme: 'system',
  font_size: 'medium',
  language: 'en',
  email_notifications: true,
  push_notifications: true,
  lesson_reminders: true,
  achievement_notifications: true,
  profile_visibility: 'friends',
  show_progress: true,
  allow_analytics: true,
  sound_effects: true,
  autoplay: false,
  difficulty_setting: 'adaptive',
  timezone: 'utc-5',
  country: 'us'
};

export const useUserSettings = () => {
  const { user } = useAuth();
  const { theme: contextTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  // Sync theme from context to settings when it changes
  useEffect(() => {
    console.log('UserSettings: Syncing theme from context:', contextTheme);
    setSettings(prev => ({ ...prev, theme: contextTheme }));
  }, [contextTheme]);

  // Listen for theme changes from navbar
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      console.log('UserSettings: Received theme change event:', event.detail.theme);
      setSettings(prev => ({ ...prev, theme: event.detail.theme }));
    };

    window.addEventListener('themeChanged', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChanged', handleThemeChange as EventListener);
  }, []);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const fetchedSettings = {
          theme: data.theme as 'light' | 'dark' | 'system',
          font_size: data.font_size,
          language: data.language,
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          lesson_reminders: data.lesson_reminders,
          achievement_notifications: data.achievement_notifications,
          profile_visibility: data.profile_visibility,
          show_progress: data.show_progress,
          allow_analytics: data.allow_analytics,
          sound_effects: data.sound_effects,
          autoplay: data.autoplay,
          difficulty_setting: data.difficulty_setting,
          timezone: data.timezone,
          country: data.country
        };
        console.log('UserSettings: Fetched settings from DB:', fetchedSettings);
        setSettings(fetchedSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    if (!user) return;

    try {
      setSaving(true);
      console.log('UserSettings: Saving settings to DB:', newSettings);
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...newSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSettings(newSettings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    console.log('UserSettings: Updating setting:', key, 'to:', value);
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return {
    settings,
    loading,
    saving,
    updateSetting,
    saveSettings
  };
};
