'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { voiceService } from '@/services/voice-service';

export function useVoiceInput(onTranscript: (text: string, isFinal: boolean) => void) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');
  const [language, setLanguage] = useState<'vi-VN' | 'en-US'>('vi-VN');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-stop after 2 minutes
  useEffect(() => {
    if (isListening) {
      timeoutRef.current = setTimeout(() => {
        stopListening();
        setError('Đã dừng tự động sau 2 phút.');
      }, 120000); // 2 minutes
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isListening]);

  const startListening = useCallback(async () => {
    if (!voiceService.isSupported()) {
      setError('Trình duyệt không hỗ trợ. Vui lòng dùng Chrome hoặc Edge.');
      return;
    }

    setError(null);
    setIsListening(true);

    await voiceService.startListening(
      (text, isFinal) => {
        if (isFinal) {
          // Send final text to parent and clear interim
          onTranscript(text, true);
          setInterimText('');
        } else {
          // Show interim text in real-time
          setInterimText(text);
          // Also send interim to parent for immediate feedback
          onTranscript(text, false);
        }
      },
      (errorMsg) => {
        setError(errorMsg);
        setIsListening(false);
        setInterimText('');
      },
      language
    );
  }, [onTranscript, language]);

  const stopListening = useCallback(() => {
    voiceService.stopListening();
    setIsListening(false);
    setInterimText('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'vi-VN' ? 'en-US' : 'vi-VN';
    setLanguage(newLang);
    voiceService.setLanguage(newLang);
    
    // Restart if currently listening
    if (isListening) {
      voiceService.stopListening();
      setTimeout(() => {
        startListening();
      }, 100);
    }
  }, [language, isListening, startListening]);

  return {
    isListening,
    startListening,
    stopListening,
    toggleLanguage,
    language,
    error,
    interimText,
    isSupported: voiceService.isSupported()
  };
}
