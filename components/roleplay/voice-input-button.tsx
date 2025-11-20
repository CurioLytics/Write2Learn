'use client';

import { Mic, MicOff } from 'lucide-react';
import { useVoiceInputChat } from '@/hooks/roleplay/use-voice-input-chat';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInputButton({ onTranscript, disabled }: VoiceInputButtonProps) {
  const {
    isListening,
    startListening,
    stopListening,
    error,
    interimText,
    isSupported
  } = useVoiceInputChat(onTranscript);

  if (!isSupported) return null;

  return (
    <TooltipProvider>
      <div className="relative flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={disabled}
              size="icon"
              variant="ghost"
              className={`rounded-full transition-all ${
                isListening
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-sm">
              {isListening ? 'Dừng ghi âm' : 'Ghi âm'}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Floating status box when listening */}
        {isListening && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-white rounded-lg shadow-lg p-4 max-w-xs">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            
            {interimText && (
              <p className="text-sm text-gray-600 italic">{interimText}</p>
            )}
          </div>
        )}
      </div>

      {/* Error display inline below input */}
      {error && !isListening && (
        <div className="absolute -bottom-8 left-0 text-xs text-red-600">
          {error}
        </div>
      )}
    </TooltipProvider>
  );
}
