'use client';

import { RoleplayMessage } from '@/types/roleplay';
import { Volume2, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageBubbleProps {
  message: RoleplayMessage;
  roleName: string;
  compact?: boolean;
  onSpeakToggle?: (messageId: string, text: string) => void;
  isPlaying?: boolean;
}

export function MessageBubble({ message, roleName, compact = false, onSpeakToggle, isPlaying = false }: MessageBubbleProps) {
  const isUserMessage = message.sender === 'user';
  
  const handleSpeakerClick = () => {
    if (onSpeakToggle) {
      onSpeakToggle(message.id, message.content);
    }
  };
  
  return (
    <div className={`${compact ? 'mb-2' : 'mb-4'} flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar và tên - chỉ hiển thị cho tin nhắn bot */}
      {!isUserMessage && !compact && (
        <div className="flex flex-col items-center mr-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium text-sm">
            {roleName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-500 mt-1">{roleName}</span>
        </div>
      )}
      
      {/* Compact avatar for conversation history */}
      {!isUserMessage && compact && (
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium text-xs mr-2 mt-1">
          {roleName.charAt(0).toUpperCase()}
        </div>
      )}
      
      {/* Bong bóng tin nhắn */}
      <div className={`${compact ? 'max-w-[80%]' : 'max-w-[70%]'} ${isUserMessage ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'} rounded-lg px-3 py-2 shadow-sm relative group`}>
        <div className={`${compact ? 'text-xs' : 'text-sm'} break-words pr-8`}>{message.content}</div>
        
        {/* Speaker icon */}
        {onSpeakToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSpeakerClick}
            className={`absolute top-2 right-1 h-6 w-6 transition-opacity ${
              isPlaying 
                ? 'text-blue-600' 
                : isUserMessage 
                  ? 'text-white hover:text-white/80' 
                  : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {isPlaying ? (
              <Square className="h-3 w-3 fill-current" />
            ) : (
              <Volume2 className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
      
      {/* Avatar và tên - chỉ hiển thị cho tin nhắn người dùng */}
      {isUserMessage && !compact && (
        <div className="flex flex-col items-center ml-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 font-medium text-sm">
            {roleName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-500 mt-1">{roleName}</span>
        </div>
      )}
      
      {/* Compact avatar for user messages */}
      {isUserMessage && compact && (
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 font-medium text-xs ml-2 mt-1">
          {roleName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}