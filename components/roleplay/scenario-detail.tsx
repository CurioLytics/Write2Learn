'use client';

import { useState } from 'react';
import { RoleplayScenario } from '@/types/roleplay';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { MessageSquare, Mic } from 'lucide-react';

interface ScenarioDetailProps {
  scenario: RoleplayScenario;
}

export function ScenarioDetail({ scenario }: ScenarioDetailProps) {
  const router = useRouter();
  const [showModeDialog, setShowModeDialog] = useState(false);

  const handleStartSession = () => {
    if (!scenario.starter_message) {
      alert('Kịch bản này chưa có tin nhắn bắt đầu. Vui lòng chọn kịch bản khác.');
      return;
    }
    setShowModeDialog(true);
  };

  const startWithMode = (mode: 'text' | 'voice') => {
    setShowModeDialog(false);
    router.push(`/roleplay/session/${scenario.id}?mode=${mode}`);
  };

  const handleBackClick = () => {
    router.push('/roleplay');
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <button 
            onClick={handleBackClick} 
            className="text-[var(--primary)] hover:opacity-80 flex items-center mb-4"
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
          <div className="text-gray-600 bg-[var(--primary-blue-light)] p-4 rounded-md">
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

      {/* Mode Selection Dialog */}
      <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chọn chế độ trò chuyện</DialogTitle>
            <DialogDescription>
              Bạn muốn sử dụng chế độ văn bản hay giọng nói?
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Text Mode */}
            <button
              onClick={() => startWithMode('text')}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 hover:border-[var(--primary)] hover:bg-[var(--primary-blue-light)] transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-[var(--primary-blue-lighter)] flex items-center justify-center transition-colors">
                <MessageSquare className="w-8 h-8 text-gray-600 group-hover:text-[var(--primary)]" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-gray-800">Văn bản</h3>
                <p className="text-xs text-gray-500 mt-1">Gõ tin nhắn thủ công</p>
              </div>
            </button>

            {/* Voice Mode */}
            <button
              onClick={() => startWithMode('voice')}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 hover:border-[var(--primary-purple)] hover:bg-[var(--primary-purple-light)] transition-all group relative"
            >
              {/* Beta Badge */}
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-[var(--primary-purple)] text-white text-[10px] font-medium rounded-full">
                BETA
              </span>
              
              <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-[var(--primary-purple-lighter)] flex items-center justify-center transition-colors">
                <Mic className="w-8 h-8 text-gray-600 group-hover:text-[var(--primary-purple)]" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-gray-800">Giọng nói</h3>
                <p className="text-xs text-gray-500 mt-1">Nói trực tiếp với AI</p>
              </div>
            </button>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              variant="ghost"
              onClick={() => setShowModeDialog(false)}
              className="text-gray-600"
            >
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}