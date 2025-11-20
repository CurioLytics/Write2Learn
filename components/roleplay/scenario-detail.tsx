'use client';

import { useState } from 'react';
import { RoleplayScenario } from '@/types/roleplay';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ScenarioDetailProps {
  scenario: RoleplayScenario;
}

export function ScenarioDetail({ scenario }: ScenarioDetailProps) {
  const router = useRouter();

  const handleStartSession = () => {
    if (!scenario.starter_message) {
      alert('Kịch bản này chưa có tin nhắn bắt đầu. Vui lòng chọn kịch bản khác.');
      return;
    }
    router.push(`/roleplay/session/${scenario.id}`);
  };

  const handleBackClick = () => {
    router.push('/roleplay');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <button 
          onClick={handleBackClick} 
          className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
        >
          ← 
        </button>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{scenario.name}</h1>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-2">Bối cảnh</h2>
        <p className="text-gray-600 bg-gray-50 p-4 rounded-md">{scenario.context}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-2">Nhiệm vụ</h2>
        <div className="text-gray-600 bg-blue-50 p-4 rounded-md">
          {scenario.task}
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button
          variant="default"
          onClick={handleStartSession}
          className="px-6 py-2 rounded-md"
        >
          Let's go
        </Button>
      </div>
    </div>
  );
}