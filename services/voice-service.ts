'use client';

type Language = 'vi-VN' | 'en-US';

class VoiceService {
  private recognition: any = null;
  private isListening = false;
  private currentLanguage: Language = 'vi-VN';

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.currentLanguage;
      }
    }
  }

  setLanguage(lang: Language) {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    language?: Language
  ) {
    if (!this.recognition) {
      onError('Trình duyệt không hỗ trợ ghi âm. Vui lòng dùng Chrome hoặc Edge.');
      return;
    }

    if (!navigator.onLine) {
      onError('Cần kết nối internet để sử dụng tính năng này.');
      return;
    }

    // Set language if provided
    if (language) {
      this.recognition.lang = language;
    }

    this.recognition.onresult = (event: any) => {
      // Get the latest result
      const lastResultIndex = event.results.length - 1;
      const result = event.results[lastResultIndex];
      const text = result[0].transcript.trim();
      
      // Emit both interim and final results
      if (text) {
        onResult(text, result.isFinal);
      }
    };

    this.recognition.onerror = (event: any) => {
      let errorMsg = 'Lỗi ghi âm';
      switch (event.error) {
        case 'no-speech':
          errorMsg = 'Không nghe thấy giọng nói. Vui lòng thử lại.';
          break;
        case 'audio-capture':
          errorMsg = 'Không tìm thấy microphone.';
          break;
        case 'not-allowed':
          errorMsg = 'Vui lòng cho phép truy cập microphone.';
          break;
        case 'network':
          errorMsg = 'Lỗi kết nối mạng.';
          break;
      }
      onError(errorMsg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      onError('Không thể bắt đầu ghi âm.');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }
}

export const voiceService = new VoiceService();
