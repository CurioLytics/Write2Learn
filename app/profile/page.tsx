'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/services/supabase/client';

interface ProfileData {
  name: string;
  english_level: string;
  style: string;
  daily_review_goal: number;
}

const ENGLISH_LEVELS = [
  'beginner',
  'elementary',
  'pre-intermediate',
  'intermediate',
  'upper-intermediate',
  'advanced'
];

const ENGLISH_TONES = [
  { value: 'conversational', label: 'Conversational English', description: 'For daily life — casual and friendly' },
  { value: 'professional', label: 'Professional English', description: 'For workplace — formal and polite' },
  { value: 'academic', label: 'Academic English', description: 'For academic writing — clear and precise' }
];

// Display labels for better UI
const ENGLISH_LEVEL_LABELS: Record<string, string> = {
  'beginner': 'Beginner',
  'elementary': 'Elementary',
  'pre-intermediate': 'Pre-intermediate',
  'intermediate': 'Intermediate',
  'upper-intermediate': 'Upper-intermediate',
  'advanced': 'Advanced'
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    english_level: '',
    style: '',
    daily_review_goal: 10
  });
  const [originalData, setOriginalData] = useState<ProfileData>({
    name: '',
    english_level: '',
    style: '',
    daily_review_goal: 10
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/auth');
      return;
    }

    // Fetch user profile data
    const fetchProfileData = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('name, english_level, style, daily_review_goal')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          return;
        }

        const profileData = {
          name: (profile as any)?.name || '',
          english_level: (profile as any)?.english_level || '',
          style: (profile as any)?.style || '',
          daily_review_goal: (profile as any)?.daily_review_goal || 10
        };
        
        setProfileData(profileData);
        setOriginalData(profileData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, [user, loading, router]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profileData.name,
          english_level: profileData.english_level,
          style: profileData.style,
          daily_review_goal: profileData.daily_review_goal,
          updated_at: new Date().toISOString()
        } as any);

      if (error) {
        throw error;
      }

      setOriginalData(profileData);
      
      // Trigger auth state refresh to update cached preferences
      // This will cause AuthProvider to re-fetch user preferences
      await supabase.auth.refreshSession();
      
      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalData);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">Profile Settings</h1>
              <p className="text-muted-foreground mt-2">Update your personal information for a better learning experience.</p>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-800 hover:bg-gray-900 text-white"
                >
                  Edit
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setProfileData(originalData); // Reset changes
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="space-y-6">
          {/* Name */}
          <Card>
            <CardHeader>
              <CardTitle>Name</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
                readOnly={!isEditing}
                className={!isEditing ? "bg-gray-50 cursor-default" : ""}
              />
            </CardContent>
          </Card>

          {/* English Level */}
          <Card>
            <CardHeader>
              <CardTitle>English Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ENGLISH_LEVELS.map((level) => (
                  <Button
                    key={level}
                    variant={profileData.english_level === level ? "default" : "outline"}
                    className={`text-sm ${
                      profileData.english_level === level 
                        ? "bg-gray-800 hover:bg-gray-900 text-white" 
                        : "hover:bg-gray-100"
                    } ${!isEditing ? "cursor-default" : ""}`}
                    onClick={() => isEditing && setProfileData(prev => ({ ...prev, english_level: level }))}
                    disabled={!isEditing}
                  >
                    {ENGLISH_LEVEL_LABELS[level]}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Review Goal */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Review Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Number of flashcards to review per day</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={profileData.daily_review_goal}
                  onChange={(e) => setProfileData(prev => ({ ...prev, daily_review_goal: parseInt(e.target.value) || 10 }))}
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-gray-50 cursor-default" : ""}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tone and Style Preference */}
          <Card>
            <CardHeader>
              <CardTitle>Tone and Style Preference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ENGLISH_TONES.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => isEditing && setProfileData(prev => ({ ...prev, style: tone.value }))}
                    disabled={!isEditing}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      profileData.style === tone.value
                        ? 'border-gray-800 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="font-medium text-gray-900">{tone.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{tone.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button - Only show when editing */}
          {isEditing && (
            <div className="flex justify-end">
              <Button 
                onClick={() => {
                  handleSaveProfile();
                  setIsEditing(false);
                }}
                disabled={isLoading || !hasChanges}
                className="bg-gray-800 hover:bg-gray-900 text-white px-8"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}