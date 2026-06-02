import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

// Centralized Text-to-Speech (TTS) service
// Uses a robust hybrid approach:
// 1. On native platforms (Android/iOS): Uses native TextToSpeech plugin for high-quality, reliable female voice.
// 2. On Web browsers:
//    - Fetches a high-quality, consistent female voice via Google Translate TTS.
//    - Caches the audio blobs in-memory for instant playback next time (fast, offline-friendly).
//    - Adjusts speed using HTML5 audio playbackRate = 0.90.
//    - Automatically falls back to device-native local SpeechSynthesis if offline/error.

let voices: SpeechSynthesisVoice[] = [];
let currentAudio: HTMLAudioElement | null = null;
const audioCache: Record<string, string> = {};

let activeNativeSpeech: { cancel: () => void } | null = null;
let activeAudiobookTimer: any = null;
let activeAudiobookCancelled = false;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  voices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
  };
}

/**
 * Finds the best female voice for native fallback on Web.
 */
export const getFemaleVoice = (lang: 'en-US' | 'tr-TR'): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  if (voices.length === 0) {
    voices = window.speechSynthesis.getVoices();
  }

  const primaryLang = lang.split('-')[0].toLowerCase();
  const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(primaryLang));

  if (langVoices.length === 0) return null;

  const femaleKeywords = [
    'zira', 'samantha', 'google us english', 'google türkçe', 'filiz', 'yelda',
    'seda', 'dilara', 'hazel', 'susan', 'harriet', 'heather', 'female', 'woman',
    'girl', 'en-us-x-sfg', 'en-us-x-iog', 'en-us-x-tpf', 'tr-tr-x'
  ];

  for (const keyword of femaleKeywords) {
    const matched = langVoices.find(v => v.name.toLowerCase().includes(keyword));
    if (matched) return matched;
  }

  const maleKeywords = ['david', 'george', 'mark', 'ravi', 'sean', 'tolga', 'male', 'man', 'boy', 'en-us-x-sfg-local'];
  const nonMaleVoice = langVoices.find(v => {
    const nameLower = v.name.toLowerCase();
    return !maleKeywords.some(m => nameLower.includes(m));
  });

  if (nonMaleVoice) return nonMaleVoice;
  return langVoices[0];
};

/**
 * Stops any active audio streams or SpeechSynthesis/Native speech.
 */
export const stopSpeech = () => {
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
      currentAudio = null;
    }

    if (activeNativeSpeech) {
      activeNativeSpeech.cancel();
      activeNativeSpeech = null;
    }

    activeAudiobookCancelled = true;
    if (activeAudiobookTimer) {
      clearTimeout(activeAudiobookTimer);
      activeAudiobookTimer = null;
    }

    if (Capacitor.isNativePlatform()) {
      TextToSpeech.stop().catch(() => {});
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  } catch (err) {
    console.error("Error stopping speech:", err);
  }
};

/**
 * Speaks native fallback using SpeechSynthesis with a safety timeout (Web only).
 */
const speakViaSpeechSynthesis = (
  text: string,
  lang: 'en-US' | 'tr-TR',
  onStart?: () => void,
  onEnd?: () => void
) => {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;

        const voice = getFemaleVoice(lang);
        if (voice) {
          utterance.voice = voice;
        }

        if (onStart) utterance.onstart = onStart;
        utterance.onend = () => {
          if (onEnd) onEnd();
        };
        utterance.onerror = (e) => {
          console.warn('SpeechSynthesis error:', e);
          if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
      }, 50);
    } else {
      if (onEnd) onEnd();
    }
  } catch (e) {
    console.error("speakViaSpeechSynthesis error:", e);
    if (onEnd) onEnd();
  }
};

/**
 * Speaks text using cached Google Translate TTS female voice, falling back to local speech synthesis.
 * On native platforms, uses Capacitor TextToSpeech plugin directly.
 */
export const speakNative = async (
  text: string,
  lang: 'en-US' | 'tr-TR',
  onStart?: () => void,
  onEnd?: () => void
) => {
  const cleanT = text.trim();
  if (!cleanT) {
    if (onEnd) onEnd();
    return;
  }

  // Instantly cancel any ongoing speech
  stopSpeech();

  // 1. If on native platform (Android/iOS), use Capacitor TextToSpeech plugin
  if (Capacitor.isNativePlatform()) {
    let isCancelled = false;
    activeNativeSpeech = {
      cancel: () => {
        isCancelled = true;
      }
    };

    if (onStart) onStart();
    try {
      await TextToSpeech.speak({
        text: cleanT,
        lang: lang,
        rate: 0.90,
        pitch: 1.0,
        volume: 1.0,
        queueStrategy: 1
      });
      if (!isCancelled && onEnd) {
        onEnd();
      }
    } catch (err) {
      console.warn("Capacitor TextToSpeech speak error:", err);
      if (onEnd) onEnd();
    }
    return;
  }

  // 2. Otherwise (Web browser), use Google TTS with SpeechSynthesis fallback
  const langCode = lang.split('-')[0];
  const cacheKey = `${lang}:${cleanT}`;

  const playAudio = (url: string): HTMLAudioElement => {
    const audio = new Audio(url);
    currentAudio = audio;

    audio.playbackRate = 0.9;

    audio.onplay = () => {
      audio.playbackRate = 0.9;
      if (onStart) onStart();
    };

    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
      if (onEnd) onEnd();
    };

    audio.onerror = (e) => {
      console.warn("Audio playback failed, falling back to native SpeechSynthesis:", e);
      if (currentAudio === audio) currentAudio = null;
      speakViaSpeechSynthesis(cleanT, lang, onStart, onEnd);
    };

    audio.play().catch((err) => {
      console.warn("Audio play promise rejected, falling back to native SpeechSynthesis:", err);
      if (currentAudio === audio) currentAudio = null;
      speakViaSpeechSynthesis(cleanT, lang, onStart, onEnd);
    });

    return audio;
  };

  // 2.1 Try Cache
  if (audioCache[cacheKey]) {
    playAudio(audioCache[cacheKey]);
    return;
  }

  // 2.2 Fetch from Google Translate TTS API
  try {
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(cleanT)}`;
    const response = await fetch(googleTtsUrl, { referrerPolicy: 'no-referrer' });
    if (!response.ok) {
      throw new Error(`Google TTS fetch status: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    audioCache[cacheKey] = blobUrl;

    playAudio(blobUrl);
  } catch (err) {
    console.warn("Google TTS fetch failed, falling back to native SpeechSynthesis:", err);
    speakViaSpeechSynthesis(cleanT, lang, onStart, onEnd);
  }
};

/**
 * Speaks an audiobook sentence.
 * On native platforms, uses Capacitor TextToSpeech and simulates word boundary highlights.
 * On Web, uses SpeechSynthesisUtterance and triggers onboundary highlights natively.
 * Returns a cancel function.
 */
export const speakAudiobookSentence = (
  text: string,
  lang: 'en-US',
  onBoundary: (charIndex: number) => void,
  onStart?: () => void,
  onEnd?: () => void
): () => void => {
  const cleanT = text.trim();
  if (!cleanT) {
    if (onEnd) onEnd();
    return () => {};
  }

  stopSpeech();

  if (Capacitor.isNativePlatform()) {
    activeAudiobookCancelled = false;

    // Simulate word highlights by splitting text
    const parts = cleanT.split(/(\s+)/).filter(Boolean);
    let currentCharIndex = 0;
    const wordRanges = parts.map((part) => {
      const start = currentCharIndex;
      const end = currentCharIndex + part.length;
      currentCharIndex = end;
      const isWhitespace = /\s/.test(part);
      return {
        start,
        end,
        length: part.length,
        isWhitespace
      };
    }).filter(r => !r.isWhitespace);

    if (onStart) onStart();

    // Start native speech
    TextToSpeech.speak({
      text: cleanT,
      lang: lang,
      rate: 0.90,
      pitch: 1.0,
      volume: 1.0,
      queueStrategy: 1
    }).then(() => {
      if (!activeAudiobookCancelled && onEnd) {
        onEnd();
      }
    }).catch(err => {
      console.warn("Capacitor Audiobook native speak error:", err);
      if (!activeAudiobookCancelled && onEnd) {
        onEnd();
      }
    });

    // Run simulated word highlight sequence
    let wordIdx = 0;
    const speakNextWord = () => {
      if (activeAudiobookCancelled || wordIdx >= wordRanges.length) return;
      
      const range = wordRanges[wordIdx];
      onBoundary(range.start);

      // Simple timing model: per-character delay + base word delay
      // Rate is 0.90, which is slightly slower than normal speed.
      const baseWordDelay = 190; // ms
      const perCharDelay = 35; // ms
      const delay = range.length * perCharDelay + baseWordDelay;

      wordIdx++;
      activeAudiobookTimer = setTimeout(speakNextWord, delay);
    };

    speakNextWord();

    return () => {
      activeAudiobookCancelled = true;
      if (activeAudiobookTimer) {
        clearTimeout(activeAudiobookTimer);
        activeAudiobookTimer = null;
      }
      TextToSpeech.stop().catch(() => {});
    };
  } else {
    // Web Speech API
    let utterance: SpeechSynthesisUtterance | null = null;
    let timerId: any = null;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      timerId = setTimeout(() => {
        utterance = new SpeechSynthesisUtterance(cleanT);
        utterance.lang = lang;
        utterance.rate = 0.90;

        const voice = getFemaleVoice(lang);
        if (voice) {
          utterance.voice = voice;
        }

        if (onStart) utterance.onstart = onStart;
        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            onBoundary(event.charIndex);
          }
        };

        utterance.onend = () => {
          if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
          console.warn("Web SpeechSynthesis error in audiobook:", e);
          if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
      }, 50);
    } else {
      if (onEnd) onEnd();
    }

    return () => {
      if (timerId) clearTimeout(timerId);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }
};
