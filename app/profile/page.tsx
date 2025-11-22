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
  journaling_reasons: string[];
  journaling_challenges: string[];
  english_improvement_reasons: string[];
  english_challenges: string[];
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

const JOURNALING_REASONS = [
  'mental_clarity',
  'express_thoughts',
  'build_habit',
  'explore_self',
  'organize_thoughts',
  'process_emotions',
  'reflect_insight'
];

const JOURNALING_CHALLENGES = [
  'staying_consistent',
  'coming_up_ideas',
  'organizing_thoughts',
  'feeling_stuck',
  'emotions_to_words'
];

const ENGLISH_IMPROVEMENT_REASONS = [
  'travel',
  'conversation',
  'study_exams',
  'professional',
  'express_better',
  'long_term_fluency'
];

const ENGLISH_CHALLENGES = [
  'vocabulary',
  'speaking_fluency',
  'grammar_accuracy',
  'forming_ideas',
  'native_content'
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

const JOURNALING_REASON_LABELS: Record<string, string> = {
  'mental_clarity': 'Mental clarity',
  'express_thoughts': 'Express thoughts better',
  'build_habit': 'Build a writing habit',
  'explore_self': 'Explore myself through journaling',
  'organize_thoughts': 'Organize my thoughts',
  'process_emotions': 'Process emotions',
  'reflect_insight': 'Reflect and gain insight'
};

const JOURNALING_CHALLENGE_LABELS: Record<string, string> = {
  'staying_consistent': 'Staying consistent',
  'coming_up_ideas': 'Coming up with ideas',
  'organizing_thoughts': 'Organizing my thoughts',
  'feeling_stuck': 'Feeling stuck',
  'emotions_to_words': 'Turning emotions into words'
};

const ENGLISH_IMPROVEMENT_LABELS: Record<string, string> = {
  'travel': 'Travel more comfortably',
  'conversation': 'Everyday conversation',
  'study_exams': 'Study or exams',
  'professional': 'Professional communication',
  'express_better': 'Express myself better',
  'long_term_fluency': 'Build long-term fluency'
};

const ENGLISH_CHALLENGE_LABELS: Record<string, string> = {
  'vocabulary': 'Vocabulary',
  'speaking_fluency': 'Speaking fluency',
  'grammar_accuracy': 'Grammar accuracy',
  'forming_ideas': 'Forming ideas in English',
  'native_content': 'Understanding native-level content'
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    english_level: '',
    journaling_reasons: [],
    journaling_challenges: [],
    english_improvement_reasons: [],
    english_challenges: [],
    daily_review_goal: 10
  });
  const [originalData, setOriginalData] = useState<ProfileData>({
    name: '',
    english_level: '',
    journaling_reasons: [],
    journaling_challenges: [],
    english_improvement_reasons: [],
    english_challenges: [],
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
          .select('name, english_level, journaling_reasons, journaling_challenges, english_improvement_reasons, english_challenges, daily_review_goal')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          return;
        }

        const profileData = {
          name: (profile as any)?.name || '',
          english_level: (profile as any)?.english_level || '',
          journaling_reasons: (profile as any)?.journaling_reasons || [],
          journaling_challenges: (profile as any)?.journaling_challenges || [],
          english_improvement_reasons: (profile as any)?.english_improvement_reasons || [],
          english_challenges: (profile as any)?.english_challenges || [],
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
          journaling_reasons: profileData.journaling_reasons,
          journaling_challenges: profileData.journaling_challenges,
          english_improvement_reasons: profileData.english_improvement_reasons,
          english_challenges: profileData.english_challenges,
          daily_review_goal: profileData.daily_review_goal,
          updated_at: new Date().toISOString()
        } as any);

      if (error) {
        throw error;
      }

      setOriginalData(profileData);
      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const addToArray = (field: keyof ProfileData, value: string) => {
    if (value && !((profileData[field] as string[]).includes(value))) {
      setProfileData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value]
      }));
    }
  };

  const removeFromArray = (field: keyof ProfileData, valueToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter(item => item !== valueToRemove)
    }));
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

          {/* Journaling Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>Why do you want to journal?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.journaling_reasons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profileData.journaling_reasons.map((reason) => (
                    <div key={reason} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                      <span>{JOURNALING_REASON_LABELS[reason] || reason}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeFromArray('journaling_reasons', reason)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {JOURNALING_REASONS.map((reason) => (
                    <Button
                      key={reason}
                      variant="outline"
                      className={`text-sm ${
                        profileData.journaling_reasons.includes(reason) 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "hover:bg-gray-100"
                      }`}
                      disabled={profileData.journaling_reasons.includes(reason)}
                      onClick={() => addToArray('journaling_reasons', reason)}
                    >
                      {JOURNALING_REASON_LABELS[reason]}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Journaling Challenges */}
          <Card>
            <CardHeader>
              <CardTitle>What challenges do you face with journaling?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.journaling_challenges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profileData.journaling_challenges.map((challenge) => (
                    <div key={challenge} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                      <span>{JOURNALING_CHALLENGE_LABELS[challenge] || challenge}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeFromArray('journaling_challenges', challenge)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {JOURNALING_CHALLENGES.map((challenge) => (
                    <Button
                      key={challenge}
                      variant="outline"
                      className={`text-sm ${
                        profileData.journaling_challenges.includes(challenge) 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "hover:bg-gray-100"
                      }`}
                      disabled={profileData.journaling_challenges.includes(challenge)}
                      onClick={() => addToArray('journaling_challenges', challenge)}
                    >
                      {JOURNALING_CHALLENGE_LABELS[challenge]}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* English Improvement Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>Why do you want to improve your English?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.english_improvement_reasons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profileData.english_improvement_reasons.map((reason) => (
                    <div key={reason} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                      <span>{ENGLISH_IMPROVEMENT_LABELS[reason] || reason}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeFromArray('english_improvement_reasons', reason)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ENGLISH_IMPROVEMENT_REASONS.map((reason) => (
                    <Button
                      key={reason}
                      variant="outline"
                      className={`text-sm ${
                        profileData.english_improvement_reasons.includes(reason) 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "hover:bg-gray-100"
                      }`}
                      disabled={profileData.english_improvement_reasons.includes(reason)}
                      onClick={() => addToArray('english_improvement_reasons', reason)}
                    >
                      {ENGLISH_IMPROVEMENT_LABELS[reason]}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* English Challenges */}
          <Card>
            <CardHeader>
              <CardTitle>What are your biggest challenges with English?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.english_challenges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profileData.english_challenges.map((challenge) => (
                    <div key={challenge} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                      <span>{ENGLISH_CHALLENGE_LABELS[challenge] || challenge}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeFromArray('english_challenges', challenge)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ENGLISH_CHALLENGES.map((challenge) => (
                    <Button
                      key={challenge}
                      variant="outline"
                      className={`text-sm ${
                        profileData.english_challenges.includes(challenge) 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "hover:bg-gray-100"
                      }`}
                      disabled={profileData.english_challenges.includes(challenge)}
                      onClick={() => addToArray('english_challenges', challenge)}
                    >
                      {ENGLISH_CHALLENGE_LABELS[challenge]}
                    </Button>
                  ))}
                </div>
              )}
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