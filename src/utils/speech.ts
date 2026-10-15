export interface SpeechState {
  isSpeaking: boolean;
  isPaused: boolean;
}

class SpeechController {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Array<(state: SpeechState) => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(callback: (state: SpeechState) => void): () => void {
    this.listeners.push(callback);
    callback(this.getState());
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((cb) => cb(state));
  }

  public getState(): SpeechState {
    if (!this.synth) return { isSpeaking: false, isPaused: false };
    return {
      isSpeaking: this.synth.speaking,
      isPaused: this.synth.paused,
    };
  }

  public speak(text: string, lang: 'en' | 'ta' = 'en') {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-US';
    utterance.rate = lang === 'ta' ? 0.9 : 1.0;
    utterance.pitch = 1.0;

    // Pick best available voice if possible
    const voices = this.synth.getVoices();
    if (lang === 'ta') {
      const taVoice = voices.find((v) => v.lang.startsWith('ta'));
      if (taVoice) utterance.voice = taVoice;
    } else {
      const enVoice = voices.find((v) => v.lang === 'en-US' && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => this.notify();
    utterance.onpause = () => this.notify();
    utterance.onresume = () => this.notify();
    utterance.onend = () => {
      this.currentUtterance = null;
      this.notify();
    };
    utterance.onerror = () => {
      this.currentUtterance = null;
      this.notify();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    this.notify();
  }

  public pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.notify();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.notify();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
      this.notify();
    }
  }
}

export const speechService = new SpeechController();
