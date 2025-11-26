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
  daily_vocab_goal: number;
  daily_journal_goal: number;
  daily_roleplay_goal: number;
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
  { value: 'conversational', label: 'Tiếng Anh đời thường', description: 'Dùng cho tình huống hàng ngày — thân thiện, tự nhiên' },
  { value: 'professional', label: 'Tiếng Anh chuyên nghiệp', description: 'Dùng cho công việc — lịch sự, rõ ràng' },
  { value: 'academic', label: 'Tiếng Anh học thuật', description: 'Dùng cho viết học thuật — mạch lạc, chuẩn xác' }
];

// Display labels for better UI
const ENGLISH_LEVEL_LABELS: Record<string, string> = {
  'beginner': 'Mới bắt đầu',
  'elementary': 'Sơ cấp',
  'pre-intermediate': 'Tiền trung cấp',
  'intermediate': 'Trung cấp',
  'upper-intermediate': 'Trung cao cấp',
  'advanced': 'Cao cấp'
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    english_level: '',
    style: '',
    daily_review_goal: 10,
    daily_vocab_goal: 10,
    daily_journal_goal: 1,
    daily_roleplay_goal: 2
  });
  const [originalData, setOriginalData] = useState<ProfileData>({
    name: '',
    english_level: '',
    style: '',
    daily_review_goal: 10,
    daily_vocab_goal: 10,
    daily_journal_goal: 1,
    daily_roleplay_goal: 2
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
          .select('name, english_level, style, daily_review_goal, daily_vocab_goal, daily_journal_goal, daily_roleplay_goal')
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
          daily_review_goal: (profile as any)?.daily_review_goal || 10,
          daily_vocab_goal: (profile as any)?.daily_vocab_goal || 10,
          daily_journal_goal: (profile as any)?.daily_journal_goal || 1,
          daily_roleplay_goal: (profile as any)?.daily_roleplay_goal || 2
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
          daily_vocab_goal: profileData.daily_vocab_goal,
          daily_journal_goal: profileData.daily_journal_goal,
          daily_roleplay_goal: profileData.daily_roleplay_goal,
          updated_at: new Date().toISOString()
        } as any);

      if (error) {
        throw error;
      }

      setOriginalData(profileData);
      
      // Trigger auth state refresh to update cached preferences
      // This will cause AuthProvider to re-fetch user preferences
      await supabase.auth.refreshSession();
      
      toast.success("Cập nhật hồ sơ thành công.");
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
              <h1 className="text-3xl font-semibold text-foreground">Cài đặt hồ sơ</h1>
              <p className="text-muted-foreground mt-2">Cập nhật thông tin cá nhân để học hiệu quả hơn.</p>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-800 hover:bg-gray-900 text-white"
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setProfileData(originalData); // Reset changes
                  }}
                  variant="outline"
                >
                  Hủy
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="space-y-8">
          {/* Profile Information Section */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Thông tin hồ sơ</h2>
            <Card>
              <CardHeader>
                <CardTitle>Tên</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập tên của bạn"
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-gray-50 cursor-default" : ""}
                />
              </CardContent>
            </Card>
          </div>

          {/* English Level & Preferences Section */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Trình độ & tùy chọn tiếng Anh</h2>
            <div className="space-y-6">
              {/* English Level */}
              <Card>
                <CardHeader>
                  <CardTitle>Trình độ tiếng Anh</CardTitle>
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

              {/* Tone and Style Preference */}
              <Card>
                <CardHeader>
                  <CardTitle>Phong cách & giọng điệu</CardTitle>
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
            </div>
          </div>

          {/* Learning Goals Section */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Mục tiêu học tập</h2>
            <div className="space-y-6">
              {/* Daily Vocabulary Goal */}
              <Card>
                <CardHeader>
                  <CardTitle>Mục tiêu từ vựng hằng ngày</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Số từ mới mỗi ngày</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={profileData.daily_vocab_goal}
                      onChange={(e) => setProfileData(prev => ({ ...prev, daily_vocab_goal: parseInt(e.target.value) || 10 }))}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-gray-50 cursor-default" : ""}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Daily Journal Goal */}
              <Card>
                <CardHeader>
                  <CardTitle>Mục tiêu viết nhật ký</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Số bài nhật ký mỗi ngày</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={profileData.daily_journal_goal}
                      onChange={(e) => setProfileData(prev => ({ ...prev, daily_journal_goal: parseInt(e.target.value) || 1 }))}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-gray-50 cursor-default" : ""}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Daily Roleplay Goal */}
              <Card>
                <CardHeader>
                  <CardTitle>Mục tiêu Roleplay</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Số buổi luyện mỗi ngày</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={profileData.daily_roleplay_goal}
                      onChange={(e) => setProfileData(prev => ({ ...prev, daily_roleplay_goal: parseInt(e.target.value) || 2 }))}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-gray-50 cursor-default" : ""}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Daily Review Goal */}
              <Card>
                <CardHeader>
                  <CardTitle>Mục tiêu ôn tập</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Số thẻ flashcard cần ôn mỗi ngày</Label>
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
            </div>
          </div>

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
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}