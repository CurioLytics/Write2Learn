'use client';

import { RoleplayMessage } from '@/types/roleplay';

interface MessageBubbleProps {
  message: RoleplayMessage;
  roleName: string;
  compact?: boolean;
}

export function MessageBubble({ message, roleName, compact = false }: MessageBubbleProps) {
  // Định dạng thời gian tin nhắn
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const isUserMessage = message.sender === 'user';
  
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
      <div className={`${compact ? 'max-w-[80%]' : 'max-w-[70%]'} ${isUserMessage ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'} rounded-lg px-3 py-2 shadow-sm`}>
        <div className={`${compact ? 'text-xs' : 'text-sm'} break-words`}>{message.content}</div>
        {!compact && (
          <div className={`text-xs mt-1 ${isUserMessage ? 'text-blue-200' : 'text-gray-400'} text-right`}>
            {formatTime(message.timestamp)}
          </div>
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