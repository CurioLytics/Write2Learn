'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import { roleplayWebhookService } from '@/services/roleplay-webhook-service';
import { roleplaySessionService } from '@/services/roleplay-session-service';
import { useAuth } from '@/hooks/auth/use-auth';
import { RoleplayMessage, RoleplayScenario } from '@/types/roleplay';
import { Mic, MicOff, Send } from 'lucide-react';

interface VoiceModeChatInterfaceProps {
  scenario: RoleplayScenario;
}

export function VoiceModeChatInterface({ scenario }: VoiceModeChatInterfaceProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [backupInput, setBackupInput] = useState('');
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const reply = await roleplayWebhookService.getBotResponse(
        scenario,
        [...messages, userMsg]
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
    continueAfterTimeout,
    cancelAfterTimeout,
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
      stopListening();
    } else if (voiceState === 'bot-speaking') {
      stopBotSpeaking();
    } else {
      startListening();
    }
  };

  const handleBackupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = backupInput.trim();
    if (!text) return;

    handleUserMessage(text);
    setBackupInput('');
  };

  const handleFinish = async () => {
    setFinishing(true);
    setError(null);

    try {
      if (!user?.id || messages.length <= 1) {
        throw new Error('Unable to save session. Please try again.');
      }

      const sessionId = await roleplaySessionService.completeSession(
        user.id,
        scenario,
        messages
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
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-[calc(100vh-8rem)] bg-gradient-to-b from-gray-50 to-white rounded-lg shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <h2 className="font-medium text-gray-800">{scenario.name}</h2>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              Voice Mode
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label="Show roleplay task"
                  className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 
                      0116 0zm-7-4a1 1 0 11-2 0 1 1 
                      0 012 0zM9 9a1 1 0 000 2v3a1 1 
                      0 001 1h1a1 1 0 100-2v-3a1 1 
                      0 00-1-1H9z"
                    />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-sm">
                <p className="text-sm whitespace-pre-wrap">
                  {scenario.task || 'No task available'}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

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
              {finishing ? 'Finishing...' : 'Done'}
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
              onSpeakToggle={() => {}} // No manual control in voice mode
              isPlaying={playingMessageId === m.id}
            />
          ))}

          <div ref={endRef} />
        </div>

        {/* Voice Controls Container */}
        <div className="relative pb-8">
          {/* Backup Text Input (small, top) */}
          <div className="px-4 pb-2">
            <form onSubmit={handleBackupSubmit} className="flex gap-2 max-w-md mx-auto">
              <input
                type="text"
                value={backupInput}
                onChange={(e) => setBackupInput(e.target.value)}
                placeholder="Backup text input..."
                disabled={isThinking}
                className="flex-1 px-3 py-1.5 text-sm border rounded-full focus:ring-2 focus:ring-gray-300 outline-none bg-white"
              />
              <Button
                type="submit"
                disabled={!backupInput.trim() || isThinking}
                size="sm"
                className="bg-gray-900 hover:bg-gray-800 rounded-full h-8 w-8 p-0"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>

          {/* Large Centered Mic Button */}
          <div className="flex flex-col items-center gap-3 pb-4">
            {/* Status Text */}
            <div className="h-6 flex items-center">
              {isThinking && (
                <p className="text-sm text-gray-600 animate-pulse">Đang nghĩ...</p>
              )}
              {isBotSpeaking && (
                <p className="text-sm text-blue-600 font-medium">AI đang nói...</p>
              )}
              {voiceState === 'listening' && (
                <p className="text-sm text-purple-600 font-medium animate-pulse">Lắng nghe...</p>
              )}
              {voiceState === 'user-speaking' && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1 h-4 bg-purple-600 rounded-full animate-[wave_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0s' }}></span>
                    <span className="w-1 h-4 bg-purple-600 rounded-full animate-[wave_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1 h-4 bg-purple-600 rounded-full animate-[wave_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1 h-4 bg-purple-600 rounded-full animate-[wave_0.6s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }}></span>
                  </div>
                  <p className="text-sm text-purple-600 font-medium">Bạn đang nói...</p>
                </div>
              )}
            </div>

            {/* Interim Text Display */}
            {interimText && (
              <div className="max-w-md px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm text-gray-700">
                {interimText}
              </div>
            )}

            {/* Mic Button */}
            <button
              onClick={handleMicClick}
              disabled={isThinking || voiceState === 'timeout-prompt'}
              className={`
                w-20 h-20 rounded-full flex items-center justify-center
                transition-all duration-200 transform
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isMicActive 
                  ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-lg shadow-red-300' 
                  : isBotSpeaking
                  ? 'bg-blue-500 hover:bg-blue-600 animate-pulse'
                  : 'bg-gray-900 hover:bg-gray-800 hover:scale-110 shadow-lg'
                }
              `}
            >
              {isMicActive ? (
                <MicOff className="w-9 h-9 text-white" />
              ) : (
                <Mic className="w-9 h-9 text-white" />
              )}
            </button>

            {/* Tap to stop hint */}
            {isMicActive && (
              <p className="text-xs text-gray-500">Nhấn để gửi tin nhắn</p>
            )}
          </div>

          {/* Timeout Prompt Dialog */}
          {voiceState === 'timeout-prompt' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                <h3 className="font-medium text-gray-800 mb-2">Bạn còn ở đây không?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tôi không nghe thấy bạn nói gì. Bạn có muốn tiếp tục không?
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={cancelAfterTimeout}
                    variant="outline"
                    className="flex-1"
                  >
                    Không
                  </Button>
                  <Button
                    onClick={continueAfterTimeout}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Tiếp tục
                  </Button>
                </div>
              </div>
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
      `}</style>
    </TooltipProvider>
  );
}
