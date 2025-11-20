'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { voiceService } from '@/services/voice-service';
import { ttsService } from '@/services/tts-service';

type VoiceState = 'idle' | 'bot-speaking' | 'listening' | 'user-speaking' | 'thinking' | 'timeout-prompt';

interface UseVoiceModeOptions {
  onUserMessage: (text: string) => void;
  autoActivateDelay?: number; // Delay after bot finishes (ms)
  listeningTimeout?: number; // Timeout for user silence (ms)
}

export function useVoiceMode({
  onUserMessage,
  autoActivateDelay = 1500, // 1.5 seconds
  listeningTimeout = 12000, // 12 seconds
}: UseVoiceModeOptions) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoActivateRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (autoActivateRef.current) {
      clearTimeout(autoActivateRef.current);
      autoActivateRef.current = null;
    }
  }, []);

  // Start listening with timeout
  const startListening = useCallback(() => {
    if (!voiceService.isSupported()) {
      setError('Trình duyệt không hỗ trợ. Vui lòng dùng Chrome hoặc Edge.');
      return;
    }

    if (!navigator.onLine) {
      setError('Cần kết nối internet để sử dụng tính năng này.');
      return;
    }

    clearTimers();
    setError(null);
    setVoiceState('listening');
    
    // Set to English
    voiceService.setLanguage('en-US');

    // Start timeout for user silence
    timeoutRef.current = setTimeout(() => {
      voiceService.stopListening();
      setVoiceState('timeout-prompt');
      setInterimText('');
    }, listeningTimeout);

    voiceService.startListening(
      (text, isFinal) => {
        if (isFinal) {
          // Clear timeout
          clearTimers();
          
          // Stop listening
          voiceService.stopListening();
          
          // Send message
          onUserMessage(text);
          setInterimText('');
          setVoiceState('thinking');
        } else {
          // User is speaking - update state
          if (voiceState === 'listening') {
            setVoiceState('user-speaking');
          }
          setInterimText(text);
          
          // Reset timeout on speech activity
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              voiceService.stopListening();
              setVoiceState('timeout-prompt');
              setInterimText('');
            }, listeningTimeout);
          }
        }
      },
      (errorMsg) => {
        clearTimers();
        setError(errorMsg);
        setVoiceState('idle');
      }
    );
  }, [onUserMessage, voiceState, listeningTimeout, clearTimers]);

  // Stop listening manually (user clicks mic button)
  const stopListening = useCallback(() => {
    clearTimers();
    voiceService.stopListening();
    
    // If we have interim text, send it
    if (interimText.trim()) {
      onUserMessage(interimText);
      setVoiceState('thinking');
    } else {
      setVoiceState('idle');
    }
    
    setInterimText('');
  }, [interimText, onUserMessage, clearTimers]);

  // Play bot message with auto-activation
  const playBotMessage = useCallback((text: string, messageId: string) => {
    clearTimers();
    setVoiceState('bot-speaking');
    
    ttsService.speak(
      text,
      messageId,
      () => setPlayingMessageId(messageId),
      () => {
        setPlayingMessageId(null);
        
        // Auto-activate mic after delay
        autoActivateRef.current = setTimeout(() => {
          startListening();
        }, autoActivateDelay);
      }
    );
  }, [autoActivateDelay, startListening, clearTimers]);

  // Stop bot speaking
  const stopBotSpeaking = useCallback(() => {
    clearTimers();
    ttsService.stop();
    setPlayingMessageId(null);
    setVoiceState('idle');
  }, [clearTimers]);

  // Handle timeout continuation
  const continueAfterTimeout = useCallback(() => {
    setVoiceState('idle');
    startListening();
  }, [startListening]);

  // Handle timeout cancellation
  const cancelAfterTimeout = useCallback(() => {
    setVoiceState('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      voiceService.stopListening();
      ttsService.stop();
    };
  }, [clearTimers]);

  return {
    voiceState,
    error,
    interimText,
    playingMessageId,
    startListening,
    stopListening,
    playBotMessage,
    stopBotSpeaking,
    continueAfterTimeout,
    cancelAfterTimeout,
    isSupported: voiceService.isSupported() && ttsService.isSupported(),
  };
}
