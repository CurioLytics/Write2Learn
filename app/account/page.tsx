'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { signOut } from '@/services/auth-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/services/supabase/client';

interface UserData {
  email: string;
  name: string;
}

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({ email: '', name: '' });
  const [originalData, setOriginalData] = useState<UserData>({ email: '', name: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNameLoading, setIsNameLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/auth');
      return;
    }

    // Fetch user profile data
    const fetchUserData = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        }

        const userData = {
          email: user.email || '',
          name: (profile as any)?.name || ''
        };
        
        setUserData(userData);
        setOriginalData(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveName = async () => {
    if (!user) return;
    
    if (userData.name === originalData.name) return;

    setIsNameLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: userData.name,
          updated_at: new Date().toISOString()
        } as any);

      if (error) {
        throw error;
      }

      setOriginalData(prev => ({ ...prev, name: userData.name }));
      toast.success("Tên của bạn đã được cập nhật.");
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error("Có lỗi xảy ra khi cập nhật tên.");
    } finally {
      setIsNameLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (!newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setIsPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast.success("Mật khẩu đã được thay đổi.");
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error("Có lỗi xảy ra khi thay đổi mật khẩu.");
    } finally {
      setIsPasswordLoading(false);
    }
  };

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
          <h1 className="text-3xl font-semibold text-foreground">Account</h1>
          
          {/* Logout Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Đăng xuất</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn đăng xuất không?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>Đăng xuất</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Settings Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Settings</h2>

          {/* Name Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Name:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  value={userData.name}
                  onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập tên của bạn"
                  className="flex-1"
                />
                <Button 
                  onClick={handleSaveName}
                  disabled={isNameLoading || userData.name === originalData.name}
                  className="bg-gray-800 hover:bg-gray-900 text-white px-6"
                >
                  {isNameLoading ? 'Đang lưu...' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Email:</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={userData.email}
                disabled
                className="bg-gray-100"
              />
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password:</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New password:</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Retype new password:</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <Button 
                onClick={handleChangePassword}
                disabled={isPasswordLoading || !newPassword || !confirmPassword}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6"
              >
                {isPasswordLoading ? 'Đang lưu...' : 'Save'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}