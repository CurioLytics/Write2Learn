'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface CongratulationStepProps {
  name: string;
}

export function CongratulationStep({ name }: CongratulationStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-emerald-100">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 text-emerald-600" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-900">
        Chúc mừng{name ? `, ${name}` : ''}!
      </h2>
      
      <p className="text-gray-600">
        Giờ hãy bắt đầu việc học của bạn nào! Chọn một mẫu nhật ký phù hợp để bắt đầu viết.
      </p>
      
      <div className="bg-blue-50 p-4 rounded-lg text-left">
        <h3 className="font-medium text-blue-700">Quy trình học tập</h3>
        <ol className="mt-2 text-sm text-blue-600 space-y-1 pl-5 list-decimal">
          <li>Chọn mẫu nhật ký phù hợp</li>
          <li>Viết suy nghĩ của bạn</li>
          <li>Nhận phản hồi và cải thiện</li>
          <li>Học từ vựng mới từ bài viết của bạn</li>
        </ol>
      </div>
    </div>
  );
}