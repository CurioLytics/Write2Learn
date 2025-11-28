'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { MessageBubble } from './message-bubble';
import { useVoiceMode } from '@/hooks/roleplay/use-voice-mode';
import { roleplayConversationService } from '@/services/roleplay/roleplay-conversation-service';
import { roleplaySessionService } from '@/services/roleplay/roleplay-session-service';
import { useAuth } from '@/hooks/auth/use-auth';
import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';
import { Mic, MicOff, Send, Keyboard, Lightbulb } from 'lucide-react';

interface VoiceModeChatInterfaceProps {
  scenario: RoleplayScenario;
}

export function VoiceModeChatInterface({ scenario }: VoiceModeChatInterfaceProps) {
  const router = useRouter();
  const { user, userPreferences: cachedPreferences } = useAuth();

  // Generate unique session ID for this conversation
  const [sessionId] = useState(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `session_${timestamp}_${random}`;
  });

  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [backupInput, setBackupInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use cached preferences from auth context with defaults
  const userPreferences = {
    name: cachedPreferences?.name || 'User',
    english_level: cachedPreferences?.english_level || 'intermediate',
    style: cachedPreferences?.style || 'conversational',
  };

  const endRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  const hasUserMessages = messages.filter(msg => msg.sender === 'user').length > 0;

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: RoleplayMessage = {
      id: `user-${Date.now()}`,
      content: text,
      sender: 'user',
      timestamp: Date.now(),
    };

    addMessage(userMsg);

    try {
      const reply = await roleplayConversationService.getBotResponse(
        scenario,
        [...messages, userMsg],
        sessionId,
        userPreferences
      );
      const botMsg: RoleplayMessage = {
        id: `bot-${Date.now()}`,
        content: reply,
        sender: 'bot',
        timestamp: Date.now(),
      };
      addMessage(botMsg);

      // Auto-play and auto-activate next
      playBotMessage(reply, botMsg.id);
    } catch (error: any) {
      const errMsg: RoleplayMessage = {
        id: `err-${Date.now()}`,
        content: `Error: ${error?.message}`,
        sender: 'bot',
        timestamp: Date.now(),
      };
      addMessage(errMsg);
      // Still try to play error message
      playBotMessage(errMsg.content, errMsg.id);
    }
  };

  const {
    voiceState,
    error: voiceError,
    interimText,
    playingMessageId,
    playBotMessage,
    stopBotSpeaking,
    startListening,
    stopListening,
    isSupported,
  } = useVoiceMode({
    onUserMessage: handleUserMessage,
  });

  const addMessage = (msg: RoleplayMessage) =>
    setMessages((prev) => [...prev, msg]);

  // Intro message - auto-play on mount
  useEffect(() => {
    const introMsg: RoleplayMessage = {
      id: 'intro',
      content: scenario.starter_message,
      sender: 'bot',
      timestamp: Date.now(),
    };
    setMessages([introMsg]);

    // Auto-play intro after small delay
    if (!hasStarted.current) {
      hasStarted.current = true;
      setTimeout(() => {
        playBotMessage(scenario.starter_message, 'intro');
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.starter_message]); // Only depend on the message content, not the function

  // Scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Prevent navigation/reload when there are user messages
  useEffect(() => {
    if (!hasUserMessages) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = (e: PopStateEvent) => {
      if (hasUserMessages) {
        const confirmLeave = window.confirm(
          'Bạn đã có tin nhắn trong cuộc trò chuyện này. Nếu thoát bây giờ, cuộc trò chuyện sẽ không được lưu lại. Bạn có chắc muốn thoát?'
        );

        if (!confirmLeave) {
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUserMessages]);

  const handleMicClick = () => {
    if (voiceState === 'listening' || voiceState === 'user-speaking') {
      // Stop recording
      stopListening();
    } else if (voiceState === 'bot-speaking') {
      // Stop bot speaking, don't start recording automatically
      stopBotSpeaking();
    } else if (voiceState === 'idle') {
      // Only start listening if truly idle (not speaking or thinking)
      startListening();
    }
    // If thinking, do nothing (button is disabled anyway)
  };

  const handleBackupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = backupInput.trim();
    if (!text) return;

    handleUserMessage(text);
    setBackupInput('');
  };

  const handleFinish = async () => {
    // Stop all ongoing actions first
    stopListening();
    stopBotSpeaking();

    setFinishing(true);
    setError(null);

    try {
      if (!user?.id || messages.length <= 1) {
        throw new Error('Unable to save session. Please try again.');
      }

      const sessionId = await roleplaySessionService.completeSession(
        user.id,
        scenario,
        messages,
        userPreferences
      );

      router.push(`/roleplay/summary/${sessionId}`);
    } catch (error: any) {
      setError(error?.message || 'Error saving session. Please try again.');
    } finally {
      setFinishing(false);
    }
  };

  const handleExit = () => {
    router.push(`/roleplay/${scenario.id}`);
  };

  // Mic button states
  const isMicActive = voiceState === 'listening' || voiceState === 'user-speaking';
  const isBotSpeaking = voiceState === 'bot-speaking';
  const isThinking = voiceState === 'thinking';

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-8rem)] bg-gradient-to-b from-gray-50 to-white rounded-lg shadow-sm overflow-hidden">

        {/* Header */}
        <div className="p-3 border-b flex justify-between items-center bg-white">
          <Dialog>
            <DialogTrigger asChild>
              <button
                aria-label="Show roleplay task"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
              >
                <Lightbulb className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-md">
              <DialogHeader>
                <DialogTitle>Roleplay Task</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {scenario.task || 'No task available'}
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2">
            {hasUserMessages ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    Thoát
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Thoát khỏi cuộc trò chuyện?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn đã có tin nhắn trong cuộc trò chuyện này. Nếu thoát bây giờ, cuộc trò chuyện sẽ không được lưu lại.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleExit} className="bg-red-600 hover:bg-red-700">
                      Thoát
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleExit}>
                Thoát
              </Button>
            )}

            <Button
              onClick={handleFinish}
              disabled={finishing || messages.length <= 1}
              variant="outline"
              size="sm"
            >
              {finishing ? 'Saving...' : 'Finish'}
            </Button>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              roleName={m.sender === 'bot' ? scenario.ai_role : 'You'}
              onSpeakToggle={(msgId, text) => {
                if (playingMessageId === msgId) {
                  stopBotSpeaking();
                } else {
                  playBotMessage(text, msgId);
                }
              }}
              isPlaying={playingMessageId === m.id}
            />
          ))}

          <div ref={endRef} />
        </div>

        {/* Voice Controls Container */}
        <div className="relative pb-8">
          {/* Toggle Icons (top-right) */}
          {!showTextInput && (
            <div className="absolute top-2 right-6 z-10">
              <button
                onClick={() => setShowTextInput(true)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="Toggle text input"
              >
                <Keyboard className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}

          {/* Text Input Mode */}
          {showTextInput ? (
            <div className="px-4 pb-2 pt-2">
              <form onSubmit={handleBackupSubmit} className="flex gap-2 max-w-md mx-auto items-center">
                {/* Small Mic Icon Button */}
                <button
                  type="button"
                  onClick={() => setShowTextInput(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
                  aria-label="Switch to voice mode"
                >
                  <Mic className="w-4 h-4 text-gray-600" />
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  value={backupInput}
                  onChange={(e) => setBackupInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isThinking || finishing}
                  className="flex-1 px-4 py-2 text-sm border rounded-full focus:ring-2 focus:ring-[var(--primary-purple-lighter)] outline-none bg-white"
                  autoFocus
                />

                {/* Send Button */}
                <Button
                  type="submit"
                  disabled={!backupInput.trim() || isThinking || finishing}
                  size="sm"
                  className="bg-[var(--primary-purple)] hover:bg-[var(--primary-purple-hover)] rounded-full h-9 w-9 p-0 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          ) : (
            /* Voice Mode - Large Centered Mic Button with Transcription Above */
            <div className="flex flex-col items-center gap-3 pb-4 pt-4">
              {/* Status Text */}
              <div className="h-6 flex items-center">
                {isThinking && (
                  <p className="text-sm text-gray-600 animate-pulse">Đang nghĩ...</p>
                )}
                {voiceState === 'listening' && (
                  <p className="text-sm text-purple-600 font-medium animate-pulse">Lắng nghe...</p>
                )}
                {voiceState === 'user-speaking' && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1 h-4 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full animate-[wave_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0s' }}></span>
                      <span className="w-1 h-4 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full animate-[wave_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1 h-4 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full animate-[wave_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1 h-4 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full animate-[wave_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }}></span>
                    </div>
                    <p className="text-sm text-purple-600 font-medium">Bạn đang nói...</p>
                  </div>
                )}
              </div>

              {/* Interim Text Display - Directly Above Mic */}
              {interimText && (
                <div className="max-w-md px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-sm text-gray-700 mb-2">
                  {interimText}
                </div>
              )}

              <div className="relative">
                {/* Outer glow rings */}
                <div className={`absolute inset-0 rounded-full transition-all duration-700 ${isMicActive
                    ? 'animate-ping-slow bg-gradient-to-r from-purple-400/30 to-pink-400/30'
                    : isBotSpeaking
                      ? 'animate-pulse bg-gray-400/20'
                      : 'bg-gradient-to-r from-purple-900/20 to-pink-900/20'
                  }`} style={{ padding: '20px' }}></div>

                <div className={`absolute inset-0 rounded-full transition-all duration-500 ${isMicActive
                    ? 'animate-pulse-glow bg-gradient-to-r from-purple-500/20 to-pink-500/20'
                    : isBotSpeaking
                      ? 'bg-gray-400/10'
                      : 'bg-gradient-to-r from-purple-800/10 to-pink-800/10'
                  }`} style={{ padding: '10px' }}></div>

                {/* Main button */}
                <button
                  onClick={handleMicClick}
                  disabled={isThinking || finishing}
                  aria-label={isMicActive ? 'Stop recording' : isBotSpeaking ? 'Stop bot speaking' : 'Start recording'}
                  className={`relative h-20 w-20 rounded-full shadow-2xl transition-all duration-500 ease-out transform ${isMicActive
                      ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 scale-110 shadow-purple-500/50 animate-breathe'
                      : isBotSpeaking
                        ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 scale-105 shadow-gray-500/30 animate-pulse'
                        : 'bg-gradient-to-br from-purple-800 via-purple-900 to-pink-900 hover:scale-110 hover:shadow-purple-900/50 shadow-purple-900/30'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {/* Inner glow */}
                  <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${isMicActive ? 'opacity-100 bg-gradient-to-br from-white/20 to-yellow-200/20 animate-pulse' : 'opacity-0'
                    }`}></div>

                  <Mic className={`relative z-10 h-8 w-8 text-white mx-auto transition-transform duration-300 ${isMicActive ? 'animate-bounce-subtle' : ''
                    }`} />
                </button>
              </div>

              {/* Tap to stop hint */}
              {isMicActive && (
                <p className="text-xs text-gray-500">Nhấn để gửi tin nhắn</p>
              )}
            </div>
          )}



          {/* Error Display */}
          {(error || voiceError) && (
            <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <strong>Error:</strong> {error || voiceError}
            </div>
          )}

          {/* Browser Support Warning */}
          {!isSupported && (
            <div className="mx-4 mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              Voice mode không được hỗ trợ trên trình duyệt này. Vui lòng dùng Chrome hoặc Edge.
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { height: 1rem; }
          50% { height: 1.5rem; }
        }
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes breathe {
          0%, 100% {
            transform: scale(1.1);
          }
          50% {
            transform: scale(1.15);
          }
        }
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-breathe {
          animation: breathe 3s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
