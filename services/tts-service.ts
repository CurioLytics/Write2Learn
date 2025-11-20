'use client';

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioCache: Map<string, SpeechSynthesisUtterance> = new Map();
  private currentMessageId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
    }
  }

  isSupported(): boolean {
    return this.synth !== null;
  }

  speak(
    text: string, 
    messageId: string,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!this.synth) return;

    // Stop any currently playing speech
    this.stop();

    // Check cache first
    let utterance = this.audioCache.get(messageId);
    
    if (!utterance) {
      // Create new utterance
      utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.3;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Cache it
      this.audioCache.set(messageId, utterance);
    }

    // Set up event handlers
    utterance.onstart = () => {
      this.currentMessageId = messageId;
      onStart?.();
    };

    utterance.onend = () => {
      this.currentMessageId = null;
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = () => {
      this.currentMessageId = null;
      this.currentUtterance = null;
      onEnd?.();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.currentMessageId = null;
      this.currentUtterance = null;
    }
  }

  isPlaying(messageId: string): boolean {
    return this.currentMessageId === messageId && this.synth?.speaking === true;
  }

  getCurrentMessageId(): string | null {
    return this.currentMessageId;
  }
}

export const ttsService = new TTSService();
