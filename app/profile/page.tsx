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
  goals: string[];
  writing_types: string[];
}

const ENGLISH_LEVELS = [
  'Beginner',
  'Elementary', 
  'Intermediate',
  'Upper-Intermediate',
  'Advanced',
  'Proficiency'
];

const GOAL_OPTIONS = [
  'Thu cử',
  'Du lịch',
  'Công việc',
  'Học tập',
  'Giao tiếp hàng ngày',
  'Kinh doanh',
  'Thi cử quốc tế',
  'Khác'
];

const WRITING_TYPE_OPTIONS = [
  'Email công việc',
  'Báo cáo',
  'Luận văn',
  'Blog cá nhân',
  'Tin nhắn',
  'Thư từ',
  'Sáng tác',
  'Khác'
];

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    english_level: '',
    goals: [],
    writing_types: []
  });
  const [originalData, setOriginalData] = useState<ProfileData>({
    name: '',
    english_level: '',
    goals: [],
    writing_types: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [newWritingType, setNewWritingType] = useState('');

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
          .select('name, english_level, goals, writing_types')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          return;
        }

        const profileData = {
          name: (profile as any)?.name || '',
          english_level: (profile as any)?.english_level || '',
          goals: (profile as any)?.goals || [],
          writing_types: (profile as any)?.writing_types || []
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
          goals: profileData.goals,
          writing_types: profileData.writing_types,
          updated_at: new Date().toISOString()
        } as any);

      if (error) {
        throw error;
      }

      setOriginalData(profileData);
      toast.success("Hồ sơ của bạn đã được cập nhật.");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Có lỗi xảy ra khi cập nhật hồ sơ.");
    } finally {
      setIsLoading(false);
    }
  };

  const addGoal = (goal: string) => {
    if (goal && !profileData.goals.includes(goal)) {
      setProfileData(prev => ({
        ...prev,
        goals: [...prev.goals, goal]
      }));
    }
  };

  const removeGoal = (goalToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      goals: prev.goals.filter(goal => goal !== goalToRemove)
    }));
  };

  const addWritingType = (type: string) => {
    if (type && !profileData.writing_types.includes(type)) {
      setProfileData(prev => ({
        ...prev,
        writing_types: [...prev.writing_types, type]
      }));
    }
  };

  const removeWritingType = (typeToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      writing_types: prev.writing_types.filter(type => type !== typeToRemove)
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
              <h1 className="text-3xl font-semibold text-foreground">Cá nhân hóa</h1>
              <p className="text-muted-foreground mt-2">Cập nhật thông tin cá nhân của bạn để có trải nghiệm học tập tốt hơn.</p>
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
                    setNewGoal('');
                    setNewWritingType('');
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
        <div className="space-y-6">
          {/* Name */}
          <Card>
            <CardHeader>
              <CardTitle>Tên:</CardTitle>
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

          {/* English Level */}
          <Card>
            <CardHeader>
              <CardTitle>Trình độ hiện tại:</CardTitle>
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
                    {level}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Mục tiêu sắp tới:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Goals */}
              {profileData.goals.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Mục tiêu hiện tại:</p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.goals.map((goal) => (
                      <div key={goal} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                        <span>{goal}</span>
                        {isEditing && (
                          <button
                            onClick={() => removeGoal(goal)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Goal Options - Only show in edit mode */}
              {isEditing && (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Chọn mục tiêu:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {GOAL_OPTIONS.map((goal) => (
                        <Button
                          key={goal}
                          variant="outline"
                          className={`text-sm ${
                            profileData.goals.includes(goal) 
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                              : "hover:bg-gray-100"
                          }`}
                          disabled={profileData.goals.includes(goal)}
                          onClick={() => addGoal(goal)}
                        >
                          {goal}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Goal */}
                  <div className="space-y-2">
                    <Label>Mục tiêu khác:</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="Nhập mục tiêu khác..."
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          addGoal(newGoal);
                          setNewGoal('');
                        }}
                        disabled={!newGoal.trim()}
                        variant="outline"
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Writing Types */}
          <Card>
            <CardHeader>
              <CardTitle>Loại văn bản quan tâm:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Writing Types */}
              {profileData.writing_types.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Loại văn bản hiện tại:</p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.writing_types.map((type) => (
                      <div key={type} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                        <span>{type}</span>
                        {isEditing && (
                          <button
                            onClick={() => removeWritingType(type)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Writing Type Options - Only show in edit mode */}
              {isEditing && (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Chọn loại văn bản:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {WRITING_TYPE_OPTIONS.map((type) => (
                        <Button
                          key={type}
                          variant="outline"
                          className={`text-sm ${
                            profileData.writing_types.includes(type) 
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                              : "hover:bg-gray-100"
                          }`}
                          disabled={profileData.writing_types.includes(type)}
                          onClick={() => addWritingType(type)}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Writing Type */}
                  <div className="space-y-2">
                    <Label>Loại văn bản khác:</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newWritingType}
                        onChange={(e) => setNewWritingType(e.target.value)}
                        placeholder="Nhập loại văn bản khác..."
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          addWritingType(newWritingType);
                          setNewWritingType('');
                        }}
                        disabled={!newWritingType.trim()}
                        variant="outline"
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>
                </>
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
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}