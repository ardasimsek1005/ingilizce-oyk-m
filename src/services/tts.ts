// Centralized Text-to-Speech (TTS) service
// Uses a robust hybrid approach:
// 1. Fetches a high-quality, consistent female voice via Google Translate TTS.
// 2. Caches the audio blobs in-memory for instant playback next time (fast, offline-friendly).
// 3. Adjusts speed using HTML5 audio playbackRate = 1.15.
// 4. Automatically falls back to device-native local SpeechSynthesis if offline/error.

let voices: SpeechSynthesisVoice[] = [];
let currentAudio: HTMLAudioElement | null = null;
const audioCache: Record<string, string> = {};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  voices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
  };
}

/**
 * Finds the best female voice for native fallback.
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
 * Stops any active audio streams or SpeechSynthesis speech.
 */
export const stopSpeech = () => {
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
      currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch (err) {
    console.error("Error stopping speech:", err);
  }
};

/**
 * Speaks native fallback using SpeechSynthesis with a safety timeout.
 */
const speakViaSpeechSynthesis = (
  text: string,
  lang: 'en-US' | 'tr-TR',
  onStart?: () => void,
  onEnd?: () => void
) => {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Use setTimeout to avoid the Chrome cancel-immediate-speak bug
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

  const langCode = lang.split('-')[0];
  const cacheKey = `${lang}:${cleanT}`;

  const playAudio = (url: string): HTMLAudioElement => {
    const audio = new Audio(url);
    currentAudio = audio;

    // Apply speed increase
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

  // 1. Try Cache
  if (audioCache[cacheKey]) {
    playAudio(audioCache[cacheKey]);
    return;
  }

  // 2. Fetch from Google Translate TTS API
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
