'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeedbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home after showing message briefly
    const timer = setTimeout(() => {
      router.push('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen py-20 px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <MessageSquare className="w-8 h-8 text-blue-600" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-900">Sử dụng Chat Widget</h1>
          <p className="text-gray-600">
            Bạn có thể gửi phản hồi bất cứ lúc nào bằng cách nhấn vào nút chat ở góc dưới bên phải màn hình.
          </p>
          <p className="text-sm text-gray-500">
            Đang chuyển hướng về trang chủ...
          </p>
        </div>

        <Button 
          onClick={() => router.push('/home')} 
          className="w-full"
        >
          Quay về trang chủ ngay
        </Button>
      </div>
    </div>
  );
}