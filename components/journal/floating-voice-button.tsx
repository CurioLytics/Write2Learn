'use client';

import { Mic, MicOff, Languages } from 'lucide-react';
import { useVoiceInput } from '@/hooks/journal/use-voice-input';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FloatingVoiceButtonProps {
  onTranscript: (text: string) => void;
}

export function FloatingVoiceButton({ onTranscript }: FloatingVoiceButtonProps) {
  const {
    isListening,
    startListening,
    stopListening,
    toggleLanguage,
    language,
    error,
    interimText,
    isSupported
  } = useVoiceInput(onTranscript);

  if (!isSupported) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
              <Button
                disabled
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg opacity-50 cursor-not-allowed"
              >
                <Mic className="h-5 w-5" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-sm">Trình duyệt không hỗ trợ.<br/>Vui lòng dùng Chrome hoặc Edge.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      {/* Main Floating Button */}
      <TooltipProvider>
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
          {/* Language Toggle (shown when listening) */}
          {isListening && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleLanguage}
                  size="sm"
                  variant="outline"
                  className="rounded-full shadow-md bg-white hover:bg-gray-50 h-10 w-10 animate-fade-in"
                >
                  <Languages className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-sm">{language === 'vi-VN' ? 'Tiếng Việt' : 'English'}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Main Mic Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={isListening ? stopListening : startListening}
                size="lg"
                className={`h-14 w-14 rounded-full shadow-lg transition-all duration-300 ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110'
                    : 'bg-gray-900 hover:bg-gray-800 hover:scale-110'
                }`}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5 text-white" />
                ) : (
                  <Mic className="h-5 w-5 text-white" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-sm">
                {isListening ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Status Overlay */}
      {(isListening || error || interimText) && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-white rounded-lg shadow-lg p-4 max-w-xs animate-fade-in">
          {isListening && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Đang ghi âm...</span>
            </div>
          )}
          
          {interimText && (
            <p className="text-sm text-gray-600 italic mt-2">{interimText}</p>
          )}
          
          {error && (
            <div className="text-sm text-red-600 mt-2">{error}</div>
          )}
        </div>
      )}
    </>
  );
}
