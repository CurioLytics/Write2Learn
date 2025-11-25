'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';

export default function FeedbackPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'Lỗi kỹ thuật',
    'Đề xuất tính năng',
    'Cải thiện giao diện',
    'Phản hồi chung',
    'Khác'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      setError('Vui lòng nhập nội dung phản hồi');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would normally send to your feedback API
      console.log('Feedback submitted:', formData);
      
      setIsSubmitted(true);
    } catch (err) {
      setError('Đã xảy ra lỗi khi gửi phản hồi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Cảm ơn bạn!</h1>
            <p className="text-gray-600">
              Chúng mình chắc chắn sẽ xem xét phản hồi của bạn để cải thiện <span className="text-black">Write</span><span className="bg-gradient-to-b from-black from-50% to-blue-600 to-50% bg-clip-text text-transparent">2</span><span className="text-blue-600">Learn</span>.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/home')} 
              className="w-full"
            >
              Quay về trang chủ
            </Button>
            <Button 
              onClick={() => {
                setIsSubmitted(false);
                setFormData({ name: '', email: '', category: '', message: '' });
              }} 
              variant="outline" 
              className="w-full"
            >
              Gửi phản hồi khác
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 space-y-8"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Gửi phản hồi</h1>
          <p className="text-gray-600 text-sm">
            Chia sẻ ý kiến của bạn để giúp chúng tôi cải thiện <span className="text-black">Write</span><span className="bg-gradient-to-b from-black from-50% to-blue-600 to-50% bg-clip-text text-transparent">2</span><span className="text-blue-600">Learn</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Tên của bạn (tùy chọn)
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nhập tên của bạn"
              className="w-full"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Email (tùy chọn)
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
              className="w-full"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Loại phản hồi
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Chọn loại phản hồi</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Nội dung phản hồi *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Chia sẻ ý kiến, đề xuất hoặc báo cáo lỗi của bạn..."
              rows={4}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 rounded-lg p-3 text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isSubmitting || !formData.message.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang gửi...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Gửi phản hồi
              </div>
            )}
          </Button>
        </form>

        {/* Back Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}