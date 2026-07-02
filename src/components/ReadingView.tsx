import React, { useState, useRef, useEffect, useMemo, memo, useCallback } from 'react';
import { ArrowLeft, Volume2, Bookmark, BookmarkCheck, Share2, Info, Check, HelpCircle, ChevronRight, BookOpen, Sun, Moon, Heart, Star, X, Loader2, Lock, AlertCircle, RefreshCw, CheckCircle2, Zap, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Paragraph, VocabularyWord, getLevelColor, hexToRgba } from '../types';
import { OFFLINE_DICTIONARY } from '../dictionary';
import { GLOBAL_DICTIONARY } from '../data';
import { speakNative, speakAudiobookSentence, stopSpeech } from '../services/tts';
import { SUPPORTED_LANGUAGES, LanguageCode, t, translateWithGoogleClient, PLACEHOLDER_STRINGS } from '../i18n';
import pretranslatedStories from '../pretranslated_stories.json';

const ENABLE_TRANSLATION_LIMITS = false; // Toggle to false to suspend daily translation limits for free users

interface ReadingViewProps {
  book: Book;
  backRef?: React.MutableRefObject<(() => boolean) | null>;
  onBack: (percentage?: number, currentPage?: number, totalPages?: number) => void;
  savedWords: VocabularyWord[];
  onSaveWord: (word: string, translation: string, level: string, exampleEn?: string, exampleTr?: string) => void;
  onUnsaveWord: (wordId: string) => void;
  syncTrigger: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  stats: any;
  setStats: React.Dispatch<React.SetStateAction<any>>;
  onAnswerIncorrect: () => void;
  onGoToPremium: (percentage?: number, currentPage?: number, totalPages?: number) => void;
  onToggleFavorite?: (bookId: string) => void;
  onPageChange?: (percentage: number, currentPage: number, totalPages: number) => void;
  onFinishBook?: (bookId: string) => void;
  onStartBook?: (bookId: string) => void;
  userEmail?: string | null;
  deviceUuid: string;
  refillCountdown: string;
  nativeLanguage: LanguageCode;
}

const isCommonEnglishWord = (w: string): boolean => {
  if (!w) return false;
  const clean = w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”‘’\[\]{}<>|\\+]/g, "").trim();
  const commonWords = [
    "the", "a", "an", "and", "but", "or", "if", "because", "although", "while", "though",
    "every", "each", "some", "any", "no", "all", "both", "either", "neither",
    "once", "then", "there", "here", "now", "today", "yesterday", "tomorrow",
    "they", "them", "their", "theirs", "he", "him", "his", "she", "her", "hers", "it", "its",
    "we", "us", "our", "ours", "you", "your", "yours", "i", "me", "my", "mine",
    "who", "whom", "whose", "what", "which", "when", "where", "why", "how",
    "always", "never", "sometimes", "usually", "often", "rarely", "seldom",
    "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "hello", "hi", "ok", "okay", "yes", "no", "please", "thank", "thanks"
  ];
  return commonWords.includes(clean) || !!OFFLINE_DICTIONARY[clean] || !!GLOBAL_DICTIONARY[clean];
};

const looksLikeProperNoun = (w: string): boolean => {
  if (!w) return false;
  const trimmed = w.trim();
  if (!/^[A-Z]/.test(trimmed)) return false;

  const clean = trimmed.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”‘’\[\]{}<>|\\+]/g, "").trim();
  const structuralWords = [
    "the", "a", "an", "and", "but", "or", "if", "because", "although", "while", "though",
    "every", "each", "some", "any", "no", "all", "both", "either", "neither",
    "once", "then", "there", "here", "now", "today", "yesterday", "tomorrow",
    "they", "them", "their", "theirs", "he", "him", "his", "she", "her", "hers", "it", "its",
    "we", "us", "our", "ours", "you", "your", "yours", "i", "me", "my", "mine",
    "always", "never", "sometimes", "usually", "often", "rarely", "seldom",
    "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "hello", "hi", "ok", "okay", "yes", "no", "please", "thank", "thanks"
  ];

  if (structuralWords.includes(clean)) return false;

  const offlineEntry = OFFLINE_DICTIONARY[clean];
  const globalEntry = (GLOBAL_DICTIONARY as any)[clean];
  const tr = offlineEntry ? offlineEntry.tr : (globalEntry || "");

  // If translation is equal to the word itself, it's a Proper Noun (like "Tom", "Pierre")
  if (tr && tr.toLowerCase().trim() === clean) {
    return true;
  }

  // If it doesn't exist in the dictionary, it's a Proper Noun (uncommon/capitalized name)
  if (!offlineEntry && !globalEntry) {
    return true;
  }

  return false;
};

interface TextToken {
  type: 'sentence' | 'whitespace';
  text: string;
}

// Tokenizes paragraph text to preserve spelling, punctuation, spacing, and newlines exactly
const parseParagraphText = (text: string): TextToken[] => {
  if (!text) return [];
  const tokens: TextToken[] = [];
  let current = "";
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    current += char;
    
    if (/[.!?]/.test(char)) {
      if (char === '.') {
        const trimmed = current.trim();
        const isAbbr = /\b(Mr|Mrs|Ms|Dr|St|Co|Ltd|Inc|e\.g|i\.e|vs|a\.m|p\.m)\.$/i.test(trimmed);
        if (isAbbr) {
          continue;
        }
      }
      
      // Look ahead for closing quotes so they belong to the sentence
      let nextIdx = i + 1;
      let quotes = "";
      while (nextIdx < text.length && /["'”’]/.test(text[nextIdx])) {
        quotes += text[nextIdx];
        nextIdx++;
      }
      
      // Look ahead for dialogue tag continuation (lowercase letter after whitespace)
      let wsIdx = nextIdx;
      let ws = "";
      while (wsIdx < text.length && /\s/.test(text[wsIdx])) {
        ws += text[wsIdx];
        wsIdx++;
      }
      
      if (wsIdx < text.length) {
        const nextChar = text[wsIdx];
        if (/^[a-zçğışöüı]$/.test(nextChar)) {
          current += quotes + ws;
          i = wsIdx - 1;
          continue;
        }
      }
      
      // Check if after quotes we have a whitespace or end of string
      const charAfterQuotes = text[nextIdx];
      if (!charAfterQuotes || /\s/.test(charAfterQuotes)) {
        // Append quotes to current sentence
        current += quotes;
        i = nextIdx - 1; // Advance main pointer over the quotes
        
        // Finish sentence
        tokens.push({ type: 'sentence', text: current });
        current = "";
        
        // Consume subsequent whitespaces
        let wsToConsume = "";
        while (i + 1 < text.length && /\s/.test(text[i + 1])) {
          wsToConsume += text[i + 1];
          i++;
        }
        if (wsToConsume) {
          tokens.push({ type: 'whitespace', text: wsToConsume });
        }
      }
    }
  }
  
  if (current) {
    tokens.push({ type: 'sentence', text: current });
  }
  
  return tokens;
};

// Robust sentence splitter without Safari-breaking lookbehinds, keeping parity with tokenization
const splitSentencesSafe = (text: string): string[] => {
  return parseParagraphText(text)
    .filter(t => t.type === 'sentence')
    .map(t => t.text.trim())
    .filter(Boolean);
};

// Safe cleaner for dictionary formatting
const cleanWord = (w: string): string => {
  if (!w) return "";
  return w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”‘’\[\]{}<>|\\+]/g, "").trim();
};

// Intercepts and overrides common words with contextual character explanations and translations
const getContextualOverride = (word: string, storyId: string, lang: string): { tr: string; notes: string; level: string } | null => {
  const w = word.toLowerCase().trim();
  
  // For non-Turkish readers, skip contextual overrides (Türkçe sabit metin içeriyor)
  // The AI translator will handle the correct translation in their native language
  if (!storyId || lang !== 'tr') return null;

  const overrides: Record<string, Record<string, { tr: string; notes: string; level: string }>> = {
    'tortoise_hare': {
      'hare': { tr: 'yaban tavşanı', notes: 'İsim • Normal tavşandan (rabbit) daha uzun kulaklı ve bacaklı yaban tavşanı türüdür. Hikayedeki "Tavşan" karakterini temsil eder.', level: 'B2 Seviyesi' },
      'tortoise': { tr: 'kara kaplumbağası', notes: 'İsim • Karada yaşayan kaplumbağa türüdür. Su kaplumbağası "turtle" olarak adlandırılır. Hikayedeki "Kaplumbağa" karakterini temsil eder.', level: 'B2 Seviyesi' }
    },
    'ant_grasshopper': {
      'grasshopper': { tr: 'ağustos böceği / çekirge', notes: 'İsim • Kelime anlamı çekirge olsa da, Ezop masalında Türkçe çevirilerde "Ağustos Böceği" olarak geçer.', level: 'B2 Seviyesi' },
      'ant': { tr: 'karınca', notes: 'İsim • Hikayedeki çalışkan "Karınca" karakterini temsil eder.', level: 'A1 Seviyesi' }
    },
    'lion_mouse': {
      'lion': { tr: 'aslan', notes: 'İsim • Hikayedeki güçlü "Aslan" karakteridir.', level: 'A1 Seviyesi' },
      'mouse': { tr: 'fare', notes: 'İsim • Hikayedeki küçük ama aslanı kurtaran "Fare" karakteridir.', level: 'A1 Seviyesi' }
    },
    'town_country_mouse': {
      'mouse': { tr: 'fare', notes: 'İsim • Hikayedeki "Şehir Faresi" ve "Köy Faresi" karakterlerini temsil eder.', level: 'A1 Seviyesi' }
    },
    'crow_pitcher': {
      'pitcher': { tr: 'su testisi / sürahi', notes: 'İsim • Karganın içine taş atarak su içtiği dar ağızlı toprak su kabıdır.', level: 'B2 Seviyesi' },
      'crow': { tr: 'karga', notes: 'İsim • Hikayedeki susamış zeki "Karga" karakteridir.', level: 'A2 Seviyesi' }
    },
    'red_riding_hood': {
      'wolf': { tr: 'kurt', notes: 'İsim • Hikayedeki Kırmızı Başlıklı Kız\'ı aldatan "Kötü Kurt" karakteridir.', level: 'A1 Seviyesi' },
      'hood': { tr: 'kırmızı başlık / pelerin', notes: 'İsim • Kırmızı Başlıklı Kız\'ın giydiği pelerin veya başlıktır.', level: 'B1 Seviyesi' }
    },
    'three_pigs': {
      'wolf': { tr: 'kurt', notes: 'İsim • Üç küçük domuzcuğun evlerini yıkmaya çalışan "Kötü Kurt" karakteridir.', level: 'A1 Seviyesi' }
    },
    'goldilocks_bears': {
      'goldilocks': { tr: 'Altınsaç', notes: 'Özel İsim • Altın sarısı saçları olan meraklı kız karakteridir.', level: 'Özel İsim' }
    },
    'ugly_duckling': {
      'duckling': { tr: 'ördek yavrusu', notes: 'İsim • Hikayedeki sonradan kuğuya dönüşen "Çirkin Ördek Yavrusu"dur.', level: 'B1 Seviyesi' }
    },
    'rapunzel': {
      'rapunzel': { tr: 'Rapunzel / Marul', notes: 'İsim • 1) Hikayedeki altın saçlı kızın adı. 2) Bahçede yetişen yeşil marul türü.', level: 'Özel İsim' }
    },
    'puss_boots': {
      'puss': { tr: 'kedi / pisi', notes: 'İsim • Hikayedeki zeki "Çizmeli Kedi" (Puss) karakterini temsil eder.', level: 'A2 Seviyesi' }
    },
    'jack_beanstalk': {
      'beanstalk': { tr: 'fasulye sırığı', notes: 'İsim • Gökyüzüne uzanan dev fasulye bitkisinin gövdesidir.', level: 'B2 Seviyesi' }
    },
    'sleeping_beauty': {
      'spindle': { tr: 'iğ / ağırşak', notes: 'İsim • Prensesin parmağına batıp 100 yıllık uykuya sebep olan iplik eğirme iğnesidir.', level: 'C1 Seviyesi' }
    },
    'gingerbread_man': {
      'gingerbread': { tr: 'zencefilli kurabiye', notes: 'İsim • Hikayedeki canlanan ve fırından kaçan kurabiye adamı temsil eder.', level: 'B2 Seviyesi' }
    },
    'chicken_little': {
      'chicken': { tr: 'piliç / tavuk', notes: 'İsim • Gökyüzünün kafasına düşeceğini sanan saf "Küçük Piliç" karakteridir.', level: 'A1 Seviyesi' }
    },
    'fisherman_wife': {
      'fisherman': { tr: 'balıkçı', notes: 'İsim • Dilekleri gerçekleştiren büyülü balığı yakalayan balıkçı karakteridir.', level: 'A2 Seviyesi' }
    },
    'little_red_hen': {
      'hen': { tr: 'tavuk / piliç', notes: 'İsim • Buğday ekerek ekmek yapan çalışkan "Kırmızı Tavuk" karakteridir.', level: 'A2 Seviyesi' }
    },
    'frog_prince': {
      'frog': { tr: 'kurbağa', notes: 'İsim • Prensesin öpücüğüyle yakışıklı bir prense dönüşecek olan büyülü kurbağadır.', level: 'A1 Seviyesi' }
    }
  };

  return overrides[storyId]?.[w] || null;
};

import { AVATAR_OPTIONS } from '../avatar_assets';

// Word translation cache to make loading instant (Module Scope)
const getCachedTranslation = (
  word: string,
  lang: LanguageCode,
  bookId?: string
): { translation: string; notes?: string; level?: string } | null => {
  try {
    const wLower = word.toLowerCase().trim();
    
    // 1. Check local storage cache of past dynamic translations for this language code
    const cacheKey = `story_word_translations_cache_${lang}`;
    const cacheJSON = localStorage.getItem(cacheKey);
    if (cacheJSON) {
      const cache = JSON.parse(cacheJSON);
      if (cache[wLower]) {
        const item = cache[wLower];
        if (item.translation && item.translation.toLowerCase().trim() !== wLower) {
          // Detect leaked Turkish translation in non-Turkish language settings
          const isTrLeak = lang !== 'tr' && (
            (OFFLINE_DICTIONARY[wLower] && OFFLINE_DICTIONARY[wLower].tr.toLowerCase().trim() === item.translation.toLowerCase().trim()) ||
            (GLOBAL_DICTIONARY[wLower] && GLOBAL_DICTIONARY[wLower].toLowerCase().trim() === item.translation.toLowerCase().trim())
          );
          if (isTrLeak) {
            delete cache[wLower];
            localStorage.setItem(cacheKey, JSON.stringify(cache));
          } else {
            return item;
          }
        }
      }
    }

    // 2. Check the individual word cache key
    const indCacheKey = `linguist_dict_word_${wLower}_${lang}`;
    const indCache = localStorage.getItem(indCacheKey);
    if (indCache) {
      try {
        const parsed = JSON.parse(indCache);
        if (parsed.translation && parsed.translation.toLowerCase().trim() !== wLower) {
          // Detect leaked Turkish translation in non-Turkish language settings
          const isTrLeak = lang !== 'tr' && (
            (OFFLINE_DICTIONARY[wLower] && OFFLINE_DICTIONARY[wLower].tr.toLowerCase().trim() === parsed.translation.toLowerCase().trim()) ||
            (GLOBAL_DICTIONARY[wLower] && GLOBAL_DICTIONARY[wLower].toLowerCase().trim() === parsed.translation.toLowerCase().trim())
          );
          if (isTrLeak) {
            localStorage.removeItem(indCacheKey);
          } else {
            return parsed;
          }
        }
      } catch (e) {}
    }

    // 3. For non-Turkish readers, check if pre-translated story has this word definition!
    if (lang !== 'tr' && bookId) {
      const offlineBook = pretranslatedStories[bookId as keyof typeof pretranslatedStories];
      if (offlineBook && offlineBook.words && offlineBook.words[wLower as keyof typeof offlineBook.words]) {
        const offlineWord = offlineBook.words[wLower as keyof typeof offlineBook.words];
        if (offlineWord[lang as keyof typeof offlineWord]) {
          const dictItem = OFFLINE_DICTIONARY[wLower];
          const standardLevel = dictItem
            ? (dictItem.level === 'Özel İsim' ? 'Özel İsim' : `${dictItem.level} Seviyesi`)
            : 'Kelime';
          return {
            translation: offlineWord[lang as keyof typeof offlineWord] as string,
            notes: t('dict_offline_label', lang),
            level: standardLevel
          };
        }
      }
    }

    // 4. For Turkish readers only, check premium offline dictionary and global dictionary
    if (lang === 'tr') {
      if (OFFLINE_DICTIONARY[wLower]) {
        const dictItem = OFFLINE_DICTIONARY[wLower];
        return {
          translation: dictItem.tr,
          notes: dictItem.notes,
          level: dictItem.level === 'Özel İsim' ? 'Özel İsim' : `${dictItem.level} Seviyesi`
        };
      }

      if (GLOBAL_DICTIONARY[wLower]) {
        const offlineForGlobal = OFFLINE_DICTIONARY[wLower];
        const globalLevel = offlineForGlobal
          ? (offlineForGlobal.level === 'Özel İsim' ? 'Özel İsim' : `${offlineForGlobal.level} Seviyesi`)
          : undefined;
        return {
          translation: GLOBAL_DICTIONARY[wLower],
          notes: t('dict_global_offline_label', lang),
          level: globalLevel
        };
      }
    }
  } catch (e) {
    console.error("Cache read error:", e);
  }
  return null;
};

const saveCachedTranslation = (word: string, translation: string, lang: LanguageCode, notes?: string, level?: string) => {
  try {
    const wLower = word.toLowerCase().trim();
    
    // Save to the language-specific cache batch
    const cacheKey = `story_word_translations_cache_${lang}`;
    const cacheJSON = localStorage.getItem(cacheKey) || '{}';
    const cache = JSON.parse(cacheJSON);
    cache[wLower] = { translation, notes, level };
    localStorage.setItem(cacheKey, JSON.stringify(cache));

    // Save to individual word key as well to sync vocabulary/other tabs
    const indCacheKey = `linguist_dict_word_${wLower}_${lang}`;
    localStorage.setItem(indCacheKey, JSON.stringify({ translation, notes, level }));
  } catch (e) {
    console.error("Cache write error:", e);
  }
};

const getFormattedLevel = (level: string | undefined, lang: LanguageCode): string => {
  if (!level) return '';
  if (level === 'Özel İsim' || level === 'proper' || level === 'Proper Noun') {
    return t('dict_proper_noun_label', lang);
  }
  if (level === 'Kelime' || level === 'Word') {
    return t('dict_word_label', lang);
  }
  const cleanLevel = level.replace(' Seviyesi', '').replace(' Level', '').replace('Seviyesi', '').replace('Level', '').trim();
  return t('dict_level_label', lang).replace('{level}', cleanLevel);
};

interface ParagraphBlockProps {
  p: Paragraph;
  isDarkMode: boolean;
  clickedWordIdx: number;
  clickedWordTr: string;
  activeSentenceIdx: number;
  activeSpokenWordIdx: number;
  handleSentenceClick: (e: React.MouseEvent, paragraphId: string, sentenceIdx: number, textEn: string, textTr: string) => void;
  handleWordClick: (e: React.MouseEvent, rawWord: string, tr: string, paragraphId: string, wordIdx: number, sentenceIdx: number, sentEn: string, sentTr: string) => void;
  wordClickTimeoutRef: React.MutableRefObject<any>;
  setActiveSentenceTr: (val: any) => void;
  setClickedWord: (val: any) => void;
  setSelectedDictWord: (val: any) => void;
  isAudiobookPlaying?: boolean;
  nativeLanguage: LanguageCode;
}

const ParagraphBlock = memo(function ParagraphBlock({
  p,
  isDarkMode,
  clickedWordIdx,
  clickedWordTr,
  activeSentenceIdx,
  activeSpokenWordIdx,
  handleSentenceClick,
  handleWordClick,
  wordClickTimeoutRef,
  setActiveSentenceTr,
  setClickedWord,
  setSelectedDictWord,
  isAudiobookPlaying = false,
  nativeLanguage
}: ParagraphBlockProps) {
  const sentencesEn = useMemo(() => splitSentencesSafe(p.textEn), [p.textEn]);
  const sentencesTr = useMemo(() => splitSentencesSafe(p.textTr), [p.textTr]);
  const tokensEn = useMemo(() => parseParagraphText(p.textEn), [p.textEn]);

  const longPressTimeoutRef = useRef<any>(null);
  const isLongPressActive = useRef<boolean>(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  // Tracks whether current session is touch-based — blocks synthetic mouse events on Android
  const isTouchSession = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="py-2 px-4 -mx-1.5 rounded-2xl border border-transparent select-text cursor-default relative font-body-reading"
    >
      {/* Fluid paragraph content, keeping all user formatting, newlines and spaces exactly! */}
      <p className="w-full block text-left leading-relaxed text-[18px] whitespace-pre-wrap">
        {(() => {
          let sentenceCount = 0;
          return tokensEn.map((token, tokIdx) => {
            if (token.type === 'whitespace') {
              return <span key={tokIdx}>{token.text}</span>;
            }

            const sIdx = sentenceCount++;
            const sentEn = token.text;
            const sentTr = sentencesEn.length === sentencesTr.length
              ? sentencesTr[sIdx]
              : (sentencesTr.length > 0 
                  ? sentencesTr[Math.min(Math.round(sIdx * (sentencesTr.length - 1) / (sentencesEn.length - 1 || 1)), sentencesTr.length - 1)]
                  : p.textTr);
            const isSentenceActive = activeSentenceIdx === sIdx;

            return (
              // Sentence span — simplified: only handles click and double-click.
              // Long-press is handled at the WORD level to avoid Android synthetic mouse event interference.
              <span
                key={tokIdx}
                id={`sent-${p.id}-${sIdx}`}
                onContextMenu={(e) => e.preventDefault()}
                onClick={(e) => {
                  if (isLongPressActive.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  handleSentenceClick(e, p.id, sIdx, sentEn, sentTr);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (wordClickTimeoutRef.current) {
                    clearTimeout(wordClickTimeoutRef.current);
                    wordClickTimeoutRef.current = null;
                  }
                  setActiveSentenceTr({
                    paragraphId: p.id,
                    sentenceIdx: sIdx,
                    textEn: sentEn,
                    textTr: sentTr
                  });
                  setClickedWord(null);
                  setSelectedDictWord(null);
                }}
                style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
                className={`inline rounded-sm cursor-help select-none ${
                  isSentenceActive
                    ? isDarkMode
                      ? 'relative bg-[#4ECDC4]/25 text-white z-30'
                      : 'relative bg-[#FFE66D]/45 text-gray-900 z-30'
                    : isDarkMode
                      ? 'hover:bg-white/5'
                      : 'hover:bg-[#FFE66D]/15'
                }`}
              >
                {sentEn.split(/(\s+)/).filter(Boolean).map((part, partIdx) => {
                  const isWhitespace = /\s/.test(part);
                  if (isWhitespace) {
                    return <span key={partIdx}>{part}</span>;
                  }

                  const rawWord = part;
                  const cleanW = cleanWord(rawWord);
                  const customMatch = p.words?.find((w: any) => cleanWord(w.en).toLowerCase() === cleanW.toLowerCase());
                  const uniqueWordIdx = sIdx * 1000 + partIdx;
                  const isWordClicked = clickedWordIdx === uniqueWordIdx;
                  const isWordSpoken = activeSpokenWordIdx === uniqueWordIdx;

                  // Helper: fire sentence translation (long-press result)
                  const fireSentenceTr = () => {
                    isLongPressActive.current = true;
                    if (wordClickTimeoutRef.current) {
                      clearTimeout(wordClickTimeoutRef.current);
                      wordClickTimeoutRef.current = null;
                    }
                    setActiveSentenceTr({ paragraphId: p.id, sentenceIdx: sIdx, textEn: sentEn, textTr: sentTr });
                    setClickedWord(null);
                    setSelectedDictWord(null);
                    try { navigator.vibrate(40); } catch (_) {}
                  };

                  return (
                    <span
                      key={partIdx}

                      // ── TOUCH HANDLERS (mobile / Android) ──────────────────────────
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        isTouchSession.current = true;          // Mark: real touch, block synthetic mouse
                        if (isAudiobookPlaying) return;         // No long-press during audiobook

                        isLongPressActive.current = false;
                        if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);

                        touchStartPos.current = {
                          x: e.touches[0].clientX,
                          y: e.touches[0].clientY
                        };

                        // 1-second hold → show sentence translation
                        longPressTimeoutRef.current = setTimeout(fireSentenceTr, 1000);
                      }}

                      onTouchMove={(e) => {
                        e.stopPropagation();
                        if (!touchStartPos.current || !e.touches[0]) return;
                        const dx = e.touches[0].clientX - touchStartPos.current.x;
                        const dy = e.touches[0].clientY - touchStartPos.current.y;
                        // Cancel if user is scrolling (> 15px movement)
                        if (Math.sqrt(dx * dx + dy * dy) > 15) {
                          if (longPressTimeoutRef.current) {
                            clearTimeout(longPressTimeoutRef.current);
                            longPressTimeoutRef.current = null;
                          }
                          isLongPressActive.current = false;
                        }
                      }}

                      onTouchEnd={(e) => {
                        e.stopPropagation();
                        // Clear timer if long-press didn't fire yet
                        if (longPressTimeoutRef.current && !isLongPressActive.current) {
                          clearTimeout(longPressTimeoutRef.current);
                          longPressTimeoutRef.current = null;
                        }
                        // If long-press fired, swallow the trailing click for 700ms
                        if (isLongPressActive.current) {
                          try { e.preventDefault(); } catch (_) {}
                          setTimeout(() => { isLongPressActive.current = false; }, 700);
                        }
                        // Reset touch session after delay — blocks Android synthetic mouse events
                        setTimeout(() => { isTouchSession.current = false; }, 600);
                      }}

                      // ── MOUSE HANDLERS (desktop) ────────────────────────────────────
                      // NOTE: onMouseMove intentionally OMITTED — it fired synthetically
                      // on Android after touchstart, immediately killing the long-press timer.

                      onMouseDown={(e) => {
                        if (isTouchSession.current) return;  // Ignore synthetic events from Android
                        e.stopPropagation();
                        if (isAudiobookPlaying) return;

                        isLongPressActive.current = false;
                        if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
                        touchStartPos.current = null;

                        // 1-second hold → show sentence translation
                        longPressTimeoutRef.current = setTimeout(fireSentenceTr, 1000);
                      }}

                      onMouseUp={(e) => {
                        if (isTouchSession.current) return;
                        e.stopPropagation();
                        if (longPressTimeoutRef.current && !isLongPressActive.current) {
                          clearTimeout(longPressTimeoutRef.current);
                          longPressTimeoutRef.current = null;
                        }
                        if (isLongPressActive.current) {
                          setTimeout(() => { isLongPressActive.current = false; }, 700);
                        }
                      }}

                      onMouseLeave={(e) => {
                        if (isTouchSession.current) return;  // Don't cancel during touch
                        e.stopPropagation();
                        // Cancel if mouse leaves word before 1s is up
                        if (longPressTimeoutRef.current && !isLongPressActive.current) {
                          clearTimeout(longPressTimeoutRef.current);
                          longPressTimeoutRef.current = null;
                        }
                      }}

                      onContextMenu={(e) => e.preventDefault()}

                      onClick={(e) => {
                        e.stopPropagation();
                        if (isLongPressActive.current) {
                          isLongPressActive.current = false;
                          return;
                        }
                        if (customMatch) {
                          handleWordClick(e, rawWord, customMatch.tr, p.id, uniqueWordIdx, sIdx, sentEn, sentTr);
                        } else {
                          handleWordClick(e, rawWord, t('dict_loading_placeholder', nativeLanguage), p.id, uniqueWordIdx, sIdx, sentEn, sentTr);
                        }
                      }}

                      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
                      className={`cursor-pointer inline transition-colors ${
                        isWordClicked
                          ? 'relative text-[#FF6B6B] bg-[#FFE66D]/30 rounded underline underline-offset-4 decoration-2 decoration-[#FF6B6B]'
                          : isWordSpoken
                            ? 'bg-[#FF6B6B] text-white rounded relative z-40 shadow-xs'
                            : isDarkMode
                              ? 'hover:text-[#FF6B6B] text-white'
                              : 'hover:text-[#FF6b6B]'
                      }`}
                    >
                      {rawWord}
                    </span>
                  );
                })}
              </span>
            );
          });
        })()}
      </p>
    </div>
  );
});





export default function ReadingView({
  book,
  backRef,
  onBack,
  savedWords,
  onSaveWord,
  onUnsaveWord,
  syncTrigger,
  isDarkMode,
  onToggleDarkMode,
  stats,
  setStats,
  onAnswerIncorrect,
  onGoToPremium,
  onToggleFavorite,
  onPageChange,
  onFinishBook,
  onStartBook,
  userEmail,
  deviceUuid,
  refillCountdown,
  nativeLanguage,
}: ReadingViewProps) {
  // Navigation & interaction states
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const currentChapter = book.chapters[activeChapterIdx] || { title: 'Ana Metin', paragraphs: [] };
  const [clickedWord, setClickedWord] = useState<{ en: string; tr: string; paragraphId: string; wordIdx: number } | null>(null);
  const [activeSentenceTr, setActiveSentenceTrRaw] = useState<{ paragraphId: string; sentenceIdx: number; textEn: string; textTr: string } | null>(null);
  
  const [wordLookupsToday, setWordLookupsToday] = useState(0);
  const [sentenceTransToday, setSentenceTransToday] = useState(0);
  const [showLimitReachedModal, setShowLimitReachedModal] = useState<'word' | 'sentence' | null>(null);

  const getDailyCounts = useCallback(() => {
    try {
      const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local format
      const savedDate = localStorage.getItem('linguist_daily_date');
      if (savedDate !== todayStr) {
        localStorage.setItem('linguist_daily_date', todayStr);
        localStorage.setItem('linguist_word_lookups_today', '0');
        localStorage.setItem('linguist_sentence_trans_today', '0');
        localStorage.setItem('linguist_today_looked_up_words', JSON.stringify([]));
        localStorage.setItem('linguist_today_translated_sentences', JSON.stringify([]));
        return { words: 0, sentences: 0 };
      }
      const words = parseInt(localStorage.getItem('linguist_word_lookups_today') || '0', 10);
      const sentences = parseInt(localStorage.getItem('linguist_sentence_trans_today') || '0', 10);
      return { words, sentences };
    } catch (e) {
      console.error('Failed to get daily counts:', e);
      return { words: 0, sentences: 0 };
    }
  }, []);

  const incrementDailyCount = useCallback((type: 'word' | 'sentence') => {
    try {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const savedDate = localStorage.getItem('linguist_daily_date');
      if (savedDate !== todayStr) {
        localStorage.setItem('linguist_daily_date', todayStr);
        localStorage.setItem('linguist_word_lookups_today', type === 'word' ? '1' : '0');
        localStorage.setItem('linguist_sentence_trans_today', type === 'sentence' ? '1' : '0');
        setWordLookupsToday(type === 'word' ? 1 : 0);
        setSentenceTransToday(type === 'sentence' ? 1 : 0);
      } else {
        if (type === 'word') {
          const words = parseInt(localStorage.getItem('linguist_word_lookups_today') || '0', 10) + 1;
          localStorage.setItem('linguist_word_lookups_today', String(words));
          setWordLookupsToday(words);
        } else {
          const sentences = parseInt(localStorage.getItem('linguist_sentence_trans_today') || '0', 10) + 1;
          localStorage.setItem('linguist_sentence_trans_today', String(sentences));
          setSentenceTransToday(sentences);
        }
      }
    } catch (e) {
      console.error('Failed to increment daily count:', e);
    }
  }, []);

  useEffect(() => {
    const counts = getDailyCounts();
    setWordLookupsToday(counts.words);
    setSentenceTransToday(counts.sentences);
  }, [getDailyCounts]);

  const setActiveSentenceTr = useCallback((val: { paragraphId: string; sentenceIdx: number; textEn: string; textTr: string } | null) => {
    if (!val) {
      setActiveSentenceTrRaw(null);
      return;
    }

    if (ENABLE_TRANSLATION_LIMITS && !stats?.isPremium) {
      const isAlreadyActive = activeSentenceTr && activeSentenceTr.paragraphId === val.paragraphId && activeSentenceTr.sentenceIdx === val.sentenceIdx;
      const sentenceKey = `${book.id}_${activeChapterIdx}_${val.paragraphId}_${val.sentenceIdx}`;
      let lookedUpToday = false;
      try {
        const sentencesList = JSON.parse(localStorage.getItem('linguist_today_translated_sentences') || '[]');
        if (sentencesList.includes(sentenceKey)) {
          lookedUpToday = true;
        }
      } catch (e) {
        console.error(e);
      }

      if (!isAlreadyActive && !lookedUpToday) {
        const counts = getDailyCounts();
        if (counts.sentences >= 200) {
          setShowLimitReachedModal('sentence');
          return;
        }
        incrementDailyCount('sentence');

        // Add to today's translated sentences list
        try {
          const sentencesList = JSON.parse(localStorage.getItem('linguist_today_translated_sentences') || '[]');
          if (!sentencesList.includes(sentenceKey)) {
            sentencesList.push(sentenceKey);
            localStorage.setItem('linguist_today_translated_sentences', JSON.stringify(sentencesList));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (nativeLanguage === 'tr') {
      setActiveSentenceTrRaw(val);
      return;
    }

    // Check cache first for non-Turkish readers
    const cacheKey = `linguist_trans_sentence_${book.id}_${activeChapterIdx}_${val.paragraphId}_${val.sentenceIdx}_${nativeLanguage}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setActiveSentenceTrRaw({ ...val, textTr: cached });
    } else {
      // Set textTr to empty string to trigger translate-sentence fetch in useEffect
      setActiveSentenceTrRaw({ ...val, textTr: '' });
    }
  }, [nativeLanguage, book.id, activeChapterIdx, stats, activeSentenceTr, getDailyCounts, incrementDailyCount]);

  const [isTranslatingSentence, setIsTranslatingSentence] = useState(false);
  const [dynamicParagraphTranslations, setDynamicParagraphTranslations] = useState<Record<string, string>>({});
  const [localizedTitleTr, setLocalizedTitleTr] = useState<string>('');

  useEffect(() => {
    if (!book) return;
    if (nativeLanguage === 'tr') {
      setLocalizedTitleTr(book.titleTr || '');
      return;
    }
    
    // Non-Turkish reader: Check cache first
    const cacheKey = `book_title_tr_${book.id}_${nativeLanguage}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setLocalizedTitleTr(cached);
    } else {
      // Set to empty temporarily while translating
      setLocalizedTitleTr('');
      // Trigger client translation directly
      translateWithGoogleClient(book.title, nativeLanguage)
        .then(tr => {
          localStorage.setItem(cacheKey, tr);
          setLocalizedTitleTr(tr);
        })
        .catch(err => {
          console.error('Failed to translate book title:', err);
          setLocalizedTitleTr('');
        });
    }
  }, [book.id, nativeLanguage]);


  useEffect(() => {
    const loaded: Record<string, string> = {};
    try {
      const prefix = `linguist_trans_para_${book.id}_${activeChapterIdx}_`;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix) && key.endsWith(`_${nativeLanguage}`)) {
          const val = localStorage.getItem(key);
          if (val) {
            loaded[key] = val;
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    setDynamicParagraphTranslations(loaded);
  }, [book.id, activeChapterIdx, nativeLanguage]);

  // Dynamic sentence translation effect
  useEffect(() => {
    if (!activeSentenceTr || nativeLanguage === 'tr') return;
    
    // If the sentence already has a translation, we don't need to fetch
    if (activeSentenceTr.textTr && activeSentenceTr.textTr !== '...') return;
    
    const sentenceToTranslate = activeSentenceTr.textEn;
    if (!sentenceToTranslate || !sentenceToTranslate.trim()) return;
    
    setIsTranslatingSentence(true);
    
    const cacheKey = `linguist_trans_sentence_${book.id}_${activeChapterIdx}_${activeSentenceTr.paragraphId}_${activeSentenceTr.sentenceIdx}_${nativeLanguage}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setActiveSentenceTrRaw(prev => prev ? { ...prev, textTr: cached } : null);
      setIsTranslatingSentence(false);
      return;
    }
    
    const apiBase = (() => {
      try {
        if (window.location.protocol === 'capacitor:') {
          return 'https://ingilizce-oyk-m.onrender.com';
        }
        return '';
      } catch { return ''; }
    })();
    
    fetch(`${apiBase}/api/translate-sentence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sentenceToTranslate, targetLang: nativeLanguage })
    })
    .then(res => {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then((data: any) => {
      if (data && data.translation) {
        localStorage.setItem(cacheKey, data.translation);
        setActiveSentenceTrRaw(prev => prev && prev.textEn === sentenceToTranslate ? { ...prev, textTr: data.translation } : prev);
      }
    })
    .catch(err => {
      console.error('Sentence translation error, trying client fallback:', err);
      translateWithGoogleClient(sentenceToTranslate, nativeLanguage)
      .then(fallbackTr => {
        localStorage.setItem(cacheKey, fallbackTr);
        setActiveSentenceTrRaw(prev => prev && prev.textEn === sentenceToTranslate ? { ...prev, textTr: fallbackTr } : prev);
      })
      .catch(fallbackErr => {
        console.error('Client-side sentence translation fallback failed:', fallbackErr);
        setActiveSentenceTrRaw(prev => prev && prev.textEn === sentenceToTranslate ? { ...prev, textTr: t('dict_translation_failed', nativeLanguage) } : prev);
      });
    })
    .finally(() => {
      setIsTranslatingSentence(false);
    });
  }, [activeSentenceTr, nativeLanguage, book.id, activeChapterIdx]);

  const sentenceModalOpenTimeRef = useRef<number>(0);
  const isTouchSession = useRef<boolean>(false);
  const titleLongPressTimeoutRef = useRef<any>(null);
  const isTitleLongPressActive = useRef<boolean>(false);
  const titleTouchStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    return () => {
      if (titleLongPressTimeoutRef.current) {
        clearTimeout(titleLongPressTimeoutRef.current);
      }
    };
  }, []);

  const handleShowSentenceTr = useCallback((val: any) => {
    if (val) {
      sentenceModalOpenTimeRef.current = Date.now();
    }
    setActiveSentenceTr(val);
  }, []);
  const closeSentenceTrSafely = useCallback(() => {
    if (Date.now() - sentenceModalOpenTimeRef.current < 450) {
      return;
    }
    setActiveSentenceTr(null);
  }, []);
  const [selectedDictWord, setSelectedDictWord] = useState<{ 
    word: string; 
    translation: string; 
    level: string; 
    paragraphId: string; 
    notes?: string;
    exampleEn?: string;
    exampleTr?: string;
  } | null>(null);
  const [speechSuccess, setSpeechSuccess] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const duration = toastMessage.length > 30 ? 2500 : 1600;
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);


  const lastTapRef = useRef<{ time: number; sentenceKey: string; wordIdx?: number }>({ time: 0, sentenceKey: '', wordIdx: -1 });
  const wordClickTimeoutRef = useRef<any>(null);

  const handleClearAllOverlays = () => {
    setClickedWord(null);
    setSelectedDictWord(null);
    setActiveSentenceTr(null);
  };

  // Word translation cache is declared globally at module scope.

  // Localized Paragraphs memo
  const localizedParagraphs = React.useMemo(() => {
    const baseParas = currentChapter.paragraphs.map((p, idx) => {
      if (nativeLanguage === 'tr') {
        return p;
      }
      
      const offlineBook = pretranslatedStories[book.id as keyof typeof pretranslatedStories];
      if (offlineBook && offlineBook.paragraphs && offlineBook.paragraphs[idx]) {
        const offlineParagraph = offlineBook.paragraphs[idx];
        if (offlineParagraph[nativeLanguage as keyof typeof offlineParagraph]) {
          return {
            ...p,
            textTr: offlineParagraph[nativeLanguage as keyof typeof offlineParagraph] as string
          };
        }
      }
      
      const cacheKey = `linguist_trans_para_${book.id}_${activeChapterIdx}_${idx}_${nativeLanguage}`;
      if (dynamicParagraphTranslations[cacheKey]) {
        return {
          ...p,
          textTr: dynamicParagraphTranslations[cacheKey]
        };
      }
      
      return {
        ...p,
        textTr: ''
      };
    });

    // 1. Flatten all sentences across the entire chapter/paragraphs
    const allSentences: {
      en: string;
      tr: string;
      originalPara: typeof baseParas[0];
    }[] = [];

    baseParas.forEach((p) => {
      const sEn = splitSentencesSafe(p.textEn);
      const sTr = splitSentencesSafe(p.textTr || p.textEn);
      
      sEn.forEach((enSent, sIdx) => {
        const trSent = sEn.length === sTr.length
          ? sTr[sIdx]
          : (sTr.length > 0 
              ? sTr[Math.min(Math.round(sIdx * (sTr.length - 1) / (sEn.length - 1 || 1)), sTr.length - 1)]
              : p.textTr || p.textEn);
        allSentences.push({
          en: enSent,
          tr: trSent,
          originalPara: p
        });
      });
    });

    const totalWords = allSentences.reduce((sum, s) => sum + s.en.split(/\s+/).filter(Boolean).length, 0);
    const N = Math.max(1, Math.round(totalWords / 125.0));

    // 2. Group sentences into exactly N balanced pages
    const pagesList: { sentences: typeof allSentences; wordCount: number }[] = [];
    let currentGroup: typeof allSentences = [];
    let currentWordCount = 0;
    let pagesLeft = N;
    let wordsLeft = totalWords;

    allSentences.forEach((sent) => {
      currentGroup.push(sent);
      const sentWords = sent.en.split(/\s+/).filter(Boolean).length;
      currentWordCount += sentWords;
      wordsLeft -= sentWords;

      if (pagesLeft > 1) {
        const target = (wordsLeft + currentWordCount) / pagesLeft;
        if (currentGroup.length > 0 && currentWordCount >= target) {
          pagesList.push({
            sentences: currentGroup,
            wordCount: currentWordCount
          });
          pagesLeft -= 1;
          currentGroup = [];
          currentWordCount = 0;
        }
      }
    });

    if (currentGroup.length > 0) {
      pagesList.push({
        sentences: currentGroup,
        wordCount: currentWordCount
      });
    }

    // 3. Re-group sentences on each page into paragraph structures to preserve layout & properties
    const splitParas: typeof baseParas = [];
    
    pagesList.forEach((pageItem, pageIdx) => {
      const groups: { originalPara: typeof baseParas[0]; sentences: typeof allSentences }[] = [];
      pageItem.sentences.forEach((sent) => {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup && lastGroup.originalPara.id === sent.originalPara.id) {
          lastGroup.sentences.push(sent);
        } else {
          groups.push({
            originalPara: sent.originalPara,
            sentences: [sent]
          });
        }
      });

      groups.forEach((group, gIdx) => {
        const textEn = group.sentences.map(s => s.en).join(' ');
        const textTr = group.sentences.map(s => s.tr).join(' ');

        // Extract vocabulary words present in this sub-paragraph
        const subWords: { [key: string]: string } = {};
        const textEnLower = textEn.toLowerCase();

        if (Array.isArray(group.originalPara.words)) {
          group.originalPara.words.forEach((w) => {
            if (w && w.en && w.tr) {
              const cleanW = w.en.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”‘’\[\]{}<>|\\+]/g, "").trim().toLowerCase();
              if (cleanW && textEnLower.includes(cleanW)) {
                subWords[w.en] = w.tr;
              }
            }
          });
        }

        const subWordsArray = Object.keys(subWords).map(k => ({ en: k, tr: subWords[k] }));

        splitParas.push({
          ...group.originalPara,
          id: `${group.originalPara.id}_page${pageIdx}_g${gIdx}`,
          textEn,
          textTr,
          words: subWordsArray
        });
      });
    });

    return splitParas;
  }, [currentChapter.paragraphs, book.id, activeChapterIdx, nativeLanguage, dynamicParagraphTranslations]);

  // Pages & Navigation States
  const pages = React.useMemo(() => {
    const list: { paragraphIndices: number[]; wordCount: number }[] = [];
    const pageGroups: { [key: number]: number[] } = {};
    const pageWordCounts: { [key: number]: number } = {};

    localizedParagraphs.forEach((p, idx) => {
      const match = p.id.match(/_page(\d+)_g\d+$/);
      if (match) {
        const pageIdx = parseInt(match[1], 10);
        if (!pageGroups[pageIdx]) {
          pageGroups[pageIdx] = [];
          pageWordCounts[pageIdx] = 0;
        }
        pageGroups[pageIdx].push(idx);
        const wordsCount = p.textEn.split(/\s+/).filter(Boolean).length;
        pageWordCounts[pageIdx] += wordsCount;
      } else {
        if (!pageGroups[0]) {
          pageGroups[0] = [];
          pageWordCounts[0] = 0;
        }
        pageGroups[0].push(idx);
        const wordsCount = p.textEn.split(/\s+/).filter(Boolean).length;
        pageWordCounts[0] += wordsCount;
      }
    });

    const sortedPageKeys = Object.keys(pageGroups).map(Number).sort((a, b) => a - b);
    sortedPageKeys.forEach((pageIdx) => {
      list.push({
        paragraphIndices: pageGroups[pageIdx],
        wordCount: pageWordCounts[pageIdx]
      });
    });

    return list;
  }, [localizedParagraphs]);

  const [currentPageIdx, setCurrentPageIdx] = useState<number>(0);
  const [maxUnlockedPageIdx, setMaxUnlockedPageIdx] = useState<number>(0);

  // Load saved page progress from localStorage or default to the book's currentPage state
  useEffect(() => {
    if (pages.length > 0) {
      const ns = deviceUuid || 'guest';
      const targetKeyPage = `linguist_current_page_${book.id}_${ns}`;
      const targetKeyMax = `linguist_max_unlocked_page_${book.id}_${ns}`;

      let savedPage = localStorage.getItem(targetKeyPage);
      let savedMax = localStorage.getItem(targetKeyMax);

      // Legacy fallback migration
      if (savedPage === null) {
        const emailNs = userEmail ? userEmail.toLowerCase().trim() : '';
        const legacyPageKeys = [
          emailNs ? `linguist_current_page_${book.id}_${emailNs}` : '',
          `linguist_current_page_${book.id}_guest`,
          `linguist_current_page_${book.id}`
        ].filter(Boolean);

        for (const legacyKey of legacyPageKeys) {
          const val = localStorage.getItem(legacyKey);
          if (val !== null) {
            savedPage = val;
            localStorage.setItem(targetKeyPage, val);
            break;
          }
        }
      }

      if (savedMax === null) {
        const emailNs = userEmail ? userEmail.toLowerCase().trim() : '';
        const legacyMaxKeys = [
          emailNs ? `linguist_max_unlocked_page_${book.id}_${emailNs}` : '',
          `linguist_max_unlocked_page_${book.id}_guest`,
          `linguist_max_unlocked_page_${book.id}`
        ].filter(Boolean);

        for (const legacyKey of legacyMaxKeys) {
          const val = localStorage.getItem(legacyKey);
          if (val !== null) {
            savedMax = val;
            localStorage.setItem(targetKeyMax, val);
            break;
          }
        }
      }

      // Use localStorage as source of truth; fall back to book.currentPage only on fresh open (no saved page)
      const pageVal = savedPage ? parseInt(savedPage, 10) : Math.max(0, (book.currentPage || 1) - 1);
      setCurrentPageIdx(Math.max(0, Math.min(pageVal, pages.length - 1)));

      const maxVal = savedMax ? parseInt(savedMax, 10) : Math.max(0, (book.currentPage || 1) - 1);
      setMaxUnlockedPageIdx(Math.max(0, Math.min(maxVal, pages.length - 1)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id, pages.length, userEmail, deviceUuid]); // Intentionally omit book.currentPage to prevent re-sync loop when onPageChange updates it

  // Save progress dynamically to localStorage and trigger real-time updates in App.tsx
  useEffect(() => {
    if (pages.length > 0) {
      const ns = deviceUuid || 'guest';
      localStorage.setItem(`linguist_current_page_${book.id}_${ns}`, String(currentPageIdx));
      localStorage.setItem(`linguist_max_unlocked_page_${book.id}_${ns}`, String(maxUnlockedPageIdx));
      
      // Only update percentage in App.tsx if user has explicitly started the book
      // This prevents auto-adding to "currently reading" just by opening a story
      if (onPageChange && book.isStarted) {
        const percentage = Math.round(((currentPageIdx + 1) / pages.length) * 100);
        onPageChange(percentage, currentPageIdx + 1, pages.length);
      }
    }
  }, [book.id, book.isStarted, currentPageIdx, maxUnlockedPageIdx, pages.length, onPageChange, deviceUuid]);



  const handleGoBack = () => {
    if (pages.length > 0) {
      const percentage = Math.round(((currentPageIdx + 1) / pages.length) * 100);
      onBack(percentage, currentPageIdx + 1, pages.length);
    } else {
      onBack();
    }
  };

  // Audiobook states
  const [isAudiobookPlaying, setIsAudiobookPlaying] = useState(false);
  const [playingSentenceIdx, setPlayingSentenceIdx] = useState<number | null>(null);
  const [activeSpokenWordIdx, setActiveSpokenWordIdx] = useState<number>(-1);
  const [lastSpokenSentenceIdx, setLastSpokenSentenceIdx] = useState<number | null>(null);

  // Track playing sentence index to remember the last spoken sentence index
  useEffect(() => {
    if (isAudiobookPlaying && playingSentenceIdx !== null) {
      setLastSpokenSentenceIdx(playingSentenceIdx);
    }
  }, [isAudiobookPlaying, playingSentenceIdx]);

  // Stop audiobook handler
  const handleStopAudiobook = useCallback(() => {
    setIsAudiobookPlaying(false);
    setPlayingSentenceIdx(null);
    setActiveSpokenWordIdx(-1);
    setActiveSentenceTr(null);
    stopSpeech();
  }, []);

  // Compute sentences on current page
  const pageSentences = useMemo(() => {
    const list: { paragraphId: string; sentenceIdx: number; text: string }[] = [];
    const currentPage = pages[currentPageIdx];
    if (currentPage) {
      currentPage.paragraphIndices.forEach(pIdx => {
        const p = localizedParagraphs[pIdx];
        if (p) {
          const sentences = splitSentencesSafe(p.textEn);
          sentences.forEach((text, sIdx) => {
            list.push({
              paragraphId: p.id,
              sentenceIdx: sIdx,
              text
            });
          });
        }
      });
    }
    return list;
  }, [currentPageIdx, pages, localizedParagraphs]);

  // Track the active audiobook sentence dynamically from the playingSentenceIdx
  const currentAudiobookSentence = useMemo(() => {
    if (isAudiobookPlaying && playingSentenceIdx !== null) {
      return pageSentences[playingSentenceIdx] || null;
    }
    return null;
  }, [isAudiobookPlaying, playingSentenceIdx, pageSentences]);

  // Start audiobook handler
  const handleStartAudiobook = () => {
    if (pageSentences.length === 0) return;
    
    // Stop any standard speech playing
    stopSpeech();
    
    setActiveSentenceTr(null);
    setClickedWord(null);
    setSelectedDictWord(null);
    setLastSpokenSentenceIdx(null); // Reset continuation on fresh start
    setIsAudiobookPlaying(true);
    setPlayingSentenceIdx(0);
  };

  // Continue audiobook from last spoken sentence
  const handleContinueAudiobook = () => {
    if (pageSentences.length === 0 || lastSpokenSentenceIdx === null) return;
    
    // Stop any standard speech playing
    stopSpeech();
    
    setActiveSentenceTr(null);
    setClickedWord(null);
    setSelectedDictWord(null);
    setIsAudiobookPlaying(true);
    setPlayingSentenceIdx(lastSpokenSentenceIdx);
  };

  // Stop audiobook when current page index changes
  useEffect(() => {
    handleStopAudiobook();
    setLastSpokenSentenceIdx(null); // Reset continuation on page change
  }, [currentPageIdx, handleStopAudiobook]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Smoothly center the active audiobook sentence on screen when it changes
  useEffect(() => {
    if (isAudiobookPlaying && currentAudiobookSentence) {
      const { paragraphId, sentenceIdx } = currentAudiobookSentence;
      const element = document.getElementById(`sent-${paragraphId}-${sentenceIdx}`);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [currentAudiobookSentence, isAudiobookPlaying]);

  // Audiobook narration loop
  useEffect(() => {
    if (!isAudiobookPlaying || playingSentenceIdx === null || playingSentenceIdx >= pageSentences.length) {
      if (isAudiobookPlaying && playingSentenceIdx !== null && playingSentenceIdx >= pageSentences.length) {
        handleStopAudiobook();
      }
      return;
    }

    const sentence = pageSentences[playingSentenceIdx];
    if (!sentence) return;

    // Clear word click highlights when sentence advances
    setClickedWord(null);
    setSelectedDictWord(null);

    const cancelSpeech = speakAudiobookSentence(
      sentence.text,
      'en-US',
      (charIndex) => {
        const parts = sentence.text.split(/(\s+)/).filter(Boolean);
        let currentCharIndex = 0;
        const wordRanges = parts.map((part, partIdx) => {
          const start = currentCharIndex;
          const end = currentCharIndex + part.length;
          currentCharIndex = end;
          const isWhitespace = /\s/.test(part);
          return {
            partIdx,
            start,
            end,
            isWhitespace
          };
        });

        let activeRange = wordRanges.find(
          r => !r.isWhitespace && charIndex >= r.start && charIndex < r.end
        );
        if (!activeRange) {
          activeRange = wordRanges.find(
            r => !r.isWhitespace && charIndex >= r.start && charIndex <= r.end
          );
        }
        if (activeRange) {
          setActiveSpokenWordIdx(sentence.sentenceIdx * 1000 + activeRange.partIdx);
        }
      },
      () => {
        // onStart
      },
      () => {
        // onEnd
        setPlayingSentenceIdx(prev => (prev !== null ? prev + 1 : null));
      }
    );

    return () => {
      cancelSpeech();
    };
  }, [isAudiobookPlaying, playingSentenceIdx, pageSentences, handleStopAudiobook]);

  const [activeQuizQuestions, setActiveQuizQuestions] = useState<any[] | null>(null);
  const [activeQuizQuestionIdx, setActiveQuizQuestionIdx] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);
  const [activeQuizCpIndex, setActiveQuizCpIndex] = useState<number | null>(null);
  const [showQuizRoadblockModal, setShowQuizRoadblockModal] = useState(false);
  const [quizCorrectAnswersCount, setQuizCorrectAnswersCount] = useState(0);
  const [isQuizTranslating, setIsQuizTranslating] = useState(false);

  useEffect(() => {
    if (backRef) {
      backRef.current = () => {
        // 1. If limit warning modal is open, close it
        if (showLimitReachedModal) {
          setShowLimitReachedModal(null);
          return true;
        }
        // 2. If dictionary popup is open, close it
        if (selectedDictWord) {
          setSelectedDictWord(null);
          return true;
        }
        // 3. If quiz roadblock is open or active quiz is in progress, close it
        if (showQuizRoadblockModal || activeQuizQuestions !== null) {
          setShowQuizRoadblockModal(false);
          setActiveQuizQuestions(null);
          setActiveQuizCpIndex(null);
          setActiveQuizQuestionIdx(0);
          setIsQuizTranslating(false);
          return true;
        }
        // 4. If standard word click popup is open, close it
        if (clickedWord) {
          setClickedWord(null);
          return true;
        }
        // 5. If active sentence translation is open, close it
        if (activeSentenceTr) {
          setActiveSentenceTr(null);
          return true;
        }
        return false; // Not handled, let parent close the book/view
      };
    }
    return () => {
      if (backRef) {
        backRef.current = null;
      }
    };
  }, [selectedDictWord, showQuizRoadblockModal, activeQuizQuestions, clickedWord, activeSentenceTr, backRef, showLimitReachedModal]);

  const [quizCorrectStreak, setQuizCorrectStreak] = useState<number>(() => {
    const ns = deviceUuid || 'guest';
    const saved = localStorage.getItem(`linguist_quiz_correct_streak_${ns}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [quizTimeLeft, setQuizTimeLeft] = useState<number>(15);
  const timerRef = useRef<any>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const audiobookBarRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    try {
      const scrollContainers = document.querySelectorAll('.overflow-y-auto');
      scrollContainers.forEach(container => {
        container.scrollTop = 0;
      });
    } catch (e) {
      console.error("Scroll to top container error:", e);
    }
  };

  // Sync scroll to top on page index change, active quiz dismissal, or chapter change
  // Using a stable boolean ref to avoid stale closure issues with activeQuizQuestions
  const isQuizActiveRef = useRef(activeQuizQuestions !== null);
  useEffect(() => {
    isQuizActiveRef.current = activeQuizQuestions !== null;
  }, [activeQuizQuestions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToTop();
    }, 50);
    return () => clearTimeout(timer);
  }, [currentPageIdx, activeChapterIdx]); // removed activeQuizQuestions to prevent scroll-flicker when quiz state changes

  const handleQuizTimeout = () => {
    if (isQuizAnswered) return;
    setIsQuizAnswered(true);
    setSelectedQuizOption(null);

    // Reset streak on timeout
    const ns = deviceUuid || 'guest';
    setQuizCorrectStreak(0);
    localStorage.setItem(`linguist_quiz_correct_streak_${ns}`, '0');
    setToastMessage(t('reading_time_expired', nativeLanguage));

    onAnswerIncorrect();
    syncTrigger();
  };

  useEffect(() => {
    if (activeQuizQuestions && !isQuizAnswered) {
      setQuizTimeLeft(15);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        setQuizTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleQuizTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeQuizQuestions, activeQuizQuestionIdx, isQuizAnswered]);



  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveSentenceTr(null);
      setClickedWord(null);
      setSelectedDictWord(null);
    };
    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
      if (wordClickTimeoutRef.current) {
        clearTimeout(wordClickTimeoutRef.current);
      }
    };
  }, []);

  const generateCheckpointQuiz = (pageIdx: number) => {
    const cpPage = pages[pageIdx];
    if (!cpPage) return [];
    
    const sectionParagraphs = cpPage.paragraphIndices.map(pIdx => localizedParagraphs[pIdx]);
    
    let vocab: { en: string; tr: string; sentenceEn: string; sentenceTr: string }[] = [];
    
    sectionParagraphs.forEach(p => {
      if (!p) return;
      const sentencesEn = splitSentencesSafe(p.textEn);
      const sentencesTr = splitSentencesSafe(p.textTr);
      
      if (p.words) {
        p.words.forEach(w => {
          let contextEn = '';
          let contextTr = '';
          
          for (let i = 0; i < sentencesEn.length; i++) {
            const cleanSentence = sentencesEn[i].toLowerCase();
            const regex = new RegExp('\\b' + cleanWord(w.en).toLowerCase() + '\\b');
            if (regex.test(cleanSentence)) {
              contextEn = sentencesEn[i];
              contextTr = sentencesEn.length === sentencesTr.length ? sentencesTr[i] : p.textTr;
              break;
            }
          }
          
          if (!contextEn && sentencesEn.length > 0) {
            contextEn = sentencesEn[0];
            contextTr = sentencesTr[0] || p.textTr;
          }
          
          if (nativeLanguage === 'en') {
            const cleanW = cleanWord(w.en).toLowerCase();
            if (!contextEn || !contextEn.toLowerCase().includes(cleanW)) {
              contextEn = `This is a very nice ${w.en}.`;
            }
          }

          let nativeWordTranslation = nativeLanguage === 'tr' ? w.tr : w.en; // Default fallback to English word instead of Turkish
          if (nativeLanguage !== 'tr' && nativeLanguage !== 'en') {
            const offlineBook = pretranslatedStories[book.id as keyof typeof pretranslatedStories];
            if (offlineBook && offlineBook.words && offlineBook.words[w.en as keyof typeof offlineBook.words]) {
              const offlineWord = offlineBook.words[w.en as keyof typeof offlineBook.words];
              if (offlineWord[nativeLanguage as keyof typeof offlineWord]) {
                nativeWordTranslation = offlineWord[nativeLanguage as keyof typeof offlineWord] as string;
              }
            } else {
              // Check if we have a cached translation in localStorage
              const cacheKey = `linguist_dict_word_${w.en.toLowerCase()}_${nativeLanguage}`;
              const cached = localStorage.getItem(cacheKey);
              if (cached) {
                try {
                  const parsed = JSON.parse(cached);
                  if (parsed.translation) {
                    nativeWordTranslation = parsed.translation;
                  }
                } catch (e) {}
              }
            }
          }
          
          vocab.push({
            en: w.en,
            tr: nativeWordTranslation,
            sentenceEn: contextEn,
            sentenceTr: contextTr
          });
        });
      }
    });
    
    const seen = new Set();
    let uniqueVocab = vocab.filter(item => {
      const key = item.en.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    // 1. If we have less than 10 words, pull from other paragraphs in the CURRENT BOOK first
    if (uniqueVocab.length < 10) {
      for (const p of localizedParagraphs) {
        if (uniqueVocab.length >= 12) break;
        if (p.words) {
          p.words.forEach(w => {
            const key = w.en.toLowerCase().trim();
            if (!seen.has(key)) {
              seen.add(key);
              
              const sentencesEn = splitSentencesSafe(p.textEn);
              const sentencesTr = splitSentencesSafe(p.textTr);
              let contextEn = sentencesEn[0] || '';
              const contextTr = sentencesTr[0] || p.textTr;
              
              if (nativeLanguage === 'en') {
                const cleanW = cleanWord(w.en).toLowerCase();
                if (!contextEn || !contextEn.toLowerCase().includes(cleanW)) {
                  contextEn = `This is a very nice ${w.en}.`;
                }
              }

              let nativeWordTranslation = nativeLanguage === 'tr' ? w.tr : w.en; // Default fallback to English word instead of Turkish
              if (nativeLanguage !== 'tr' && nativeLanguage !== 'en') {
                const offlineBook = pretranslatedStories[book.id as keyof typeof pretranslatedStories];
                if (offlineBook && offlineBook.words && offlineBook.words[w.en as keyof typeof offlineBook.words]) {
                  const offlineWord = offlineBook.words[w.en as keyof typeof offlineBook.words];
                  if (offlineWord[nativeLanguage as keyof typeof offlineWord]) {
                    nativeWordTranslation = offlineWord[nativeLanguage as keyof typeof offlineWord] as string;
                  }
                } else {
                  // Check if we have a cached translation in localStorage
                  const cacheKey = `linguist_dict_word_${w.en.toLowerCase()}_${nativeLanguage}`;
                  const cached = localStorage.getItem(cacheKey);
                  if (cached) {
                    try {
                      const parsed = JSON.parse(cached);
                      if (parsed.translation) {
                        nativeWordTranslation = parsed.translation;
                      }
                    } catch (e) {}
                  }
                }
              }
              
              uniqueVocab.push({
                en: w.en,
                tr: nativeWordTranslation,
                sentenceEn: contextEn,
                sentenceTr: contextTr
              });
            }
          });
        }
      }
    }
    
    // 2. Fallback to clean context-relevant common words if the book has extremely few words
    const fallbackVocab = [
      { en: 'story', tr: t('fallback_word_story', nativeLanguage), sentenceEn: 'She read an interesting story.', sentenceTr: t('fallback_sent_story', nativeLanguage) },
      { en: 'friend', tr: t('fallback_word_friend', nativeLanguage), sentenceEn: 'He met his best friend.', sentenceTr: t('fallback_sent_friend', nativeLanguage) },
      { en: 'happy', tr: t('fallback_word_happy', nativeLanguage), sentenceEn: 'They lived a happy life.', sentenceTr: t('fallback_sent_happy', nativeLanguage) },
      { en: 'time', tr: t('fallback_word_time', nativeLanguage), sentenceEn: 'Once upon a time.', sentenceTr: t('fallback_sent_time', nativeLanguage) },
      { en: 'day', tr: t('fallback_word_day', nativeLanguage), sentenceEn: 'It was a sunny day.', sentenceTr: t('fallback_sent_day', nativeLanguage) },
      { en: 'house', tr: t('fallback_word_house', nativeLanguage), sentenceEn: 'They walked to the house.', sentenceTr: t('fallback_sent_house', nativeLanguage) },
      { en: 'word', tr: t('fallback_word_word', nativeLanguage), sentenceEn: 'Write down the word.', sentenceTr: t('fallback_sent_word', nativeLanguage) }
    ];
    
    fallbackVocab.forEach(f => {
      if (uniqueVocab.length < 10 && !seen.has(f.en)) {
        seen.add(f.en);
        uniqueVocab.push(f);
      }
    });
    
    const selectedVocab = [...uniqueVocab].sort(() => 0.5 - Math.random()).slice(0, 5);
    
    const isA1A2 = book.level === 'A1' || book.level === 'A2';
    
    return selectedVocab.map((item, qIdx) => {
      // For A1/A2, restrict fill-in-the-blanks to maximum 1 question to make it easier for kids/beginners
      const isFillBlank = nativeLanguage === 'en'
        ? true
        : (!isA1A2
          ? (qIdx % 2 === 1 && item.sentenceEn && item.sentenceEn.toLowerCase().includes(cleanWord(item.en).toLowerCase()))
          : (qIdx === 1 && item.sentenceEn && item.sentenceEn.toLowerCase().includes(cleanWord(item.en).toLowerCase())));
      
      const correctOptionValue = isFillBlank ? item.en : item.tr;
      
      const distractors = uniqueVocab
        .filter(x => x.en.toLowerCase() !== item.en.toLowerCase())
        .map(x => isFillBlank ? x.en : x.tr)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
        
      const defaultNativeDistractors = [
        t('distractor_run', nativeLanguage),
        t('fallback_word_house', nativeLanguage),
        t('distractor_eat', nativeLanguage),
        t('distractor_smile', nativeLanguage),
        t('distractor_tree', nativeLanguage),
        t('distractor_basket', nativeLanguage),
        t('distractor_dog', nativeLanguage),
        t('fallback_word_happy', nativeLanguage)
      ];
      const defaultEnDistractors = ['run', 'house', 'eat', 'smile', 'tree', 'basket', 'dog', 'happy'];
      const defaults = isFillBlank ? defaultEnDistractors : defaultNativeDistractors;
      
      defaults.forEach(d => {
        if (distractors.length < 3 && !distractors.includes(d) && d.toLowerCase() !== correctOptionValue.toLowerCase()) {
          distractors.push(d);
        }
      });
      
      const options = [correctOptionValue, ...distractors].sort(() => 0.5 - Math.random());
      const correctIndex = options.indexOf(correctOptionValue);
      
      if (isFillBlank) {
        const cleanItemWord = cleanWord(item.en);
        const regex = new RegExp('\\b' + cleanItemWord + '\\b', 'gi');
        let questionText = item.sentenceEn.replace(regex, '_____');
        
        if (questionText === item.sentenceEn) {
          const lowerSentence = item.sentenceEn.toLowerCase();
          const cleanLowerWord = cleanItemWord.toLowerCase();
          const idx = lowerSentence.indexOf(cleanLowerWord);
          if (idx !== -1) {
            questionText = item.sentenceEn.substring(0, idx) + '_____' + item.sentenceEn.substring(idx + cleanItemWord.length);
          }
        }

        // Limit the length of the sentence to keep it short and child-friendly
        const qWords = questionText.split(/\s+/);
        if (qWords.length > 12) {
          const blankIdx = qWords.findIndex(w => w.includes('_____'));
          if (blankIdx !== -1) {
            const start = Math.max(0, blankIdx - 5);
            const end = Math.min(qWords.length, blankIdx + 6);
            const subWords = qWords.slice(start, end);
            questionText = (start > 0 ? '... ' : '') + subWords.join(' ') + (end < qWords.length ? ' ...' : '');
          }
        }
        
        return {
          id: `cp_${pageIdx}_q_${qIdx}`,
          type: 'fill_blank',
          question: questionText,
          hint: nativeLanguage === 'tr' ? item.sentenceTr : '',
          word: item.en,
          options,
          correctIndex,
          sentenceEn: item.sentenceEn,
          sentenceTr: item.sentenceTr
        };
      } else {
        const optionsEn = options.map(opt => {
          const found = uniqueVocab.find(x => x.tr === opt || x.en === opt);
          return found ? found.en : opt;
        });
        return {
          id: `cp_${pageIdx}_q_${qIdx}`,
          type: 'word_meaning',
          word: item.en,
          options,
          optionsEn,
          correctIndex,
          hint: item.sentenceEn ? `${t('sentence_label', nativeLanguage)}: "${item.sentenceEn}"` : '',
          sentenceEn: item.sentenceEn,
          sentenceTr: item.sentenceTr
        };
      }
    });
  };

  const handleStartCheckpointQuiz = (pageIdx: number) => {
    const questions = generateCheckpointQuiz(pageIdx);
    setActiveQuizQuestions(questions);
    setActiveQuizQuestionIdx(0);
    setSelectedQuizOption(null);
    setIsQuizAnswered(false);
    setActiveQuizCpIndex(pageIdx);
    setQuizCorrectAnswersCount(0);

    // Dynamic background fetch for quiz hints and option translations if not native Turkish or English
    if (nativeLanguage !== 'tr' && nativeLanguage !== 'en' && questions && questions.length > 0) {
      const apiBase = (() => {
        try {
          if (window.location.protocol === 'capacitor:') {
            return 'https://ingilizce-oyk-m.onrender.com';
          }
          return '';
        } catch { return ''; }
      })();

      const translationPromises: Promise<any>[] = [];

      questions.forEach((q: any, qIdx: number) => {
        // 1. Fetch hint translation for fill_blank questions
        if (q.type === 'fill_blank' && q.sentenceEn) {
          const cacheKey = `linguist_trans_sentence_game_${q.sentenceEn.toLowerCase().trim()}_${nativeLanguage}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            setActiveQuizQuestions((prev: any) => {
              if (!prev) return null;
              const updated = [...prev];
              if (updated[qIdx]) {
                updated[qIdx].hint = cached;
              }
              return updated;
            });
          } else {
            // Instantly fetch client-side translation as a fast fallback
            const p = translateWithGoogleClient(q.sentenceEn, nativeLanguage)
              .then(fallbackTrans => {
                if (fallbackTrans) {
                  setActiveQuizQuestions((prev: any) => {
                    if (!prev) return null;
                    const updated = [...prev];
                    if (updated[qIdx] && (!updated[qIdx].hint || updated[qIdx].hint === '')) {
                      updated[qIdx].hint = fallbackTrans;
                    }
                    return updated;
                  });
                  localStorage.setItem(cacheKey, fallbackTrans);
                }
              })
              .catch(err => console.error('Client-side hint translation failed:', err));
            translationPromises.push(p);

            // Query the backend in parallel
            fetch(`${apiBase}/api/translate-sentence`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: q.sentenceEn, targetLang: nativeLanguage })
            })
            .then(res => {
              if (!res.ok) throw new Error('API error');
              return res.json();
            })
            .then((data: any) => {
              if (data && data.translation) {
                localStorage.setItem(cacheKey, data.translation);
                setActiveQuizQuestions((prev: any) => {
                  if (!prev) return null;
                  const updated = [...prev];
                  if (updated[qIdx]) {
                    updated[qIdx].hint = data.translation;
                  }
                  return updated;
                });
              }
            })
            .catch(err => console.error('Checkpoint quiz hint translation backend error:', err));
          }
        }

        // 2. Fetch option translations for word_meaning questions
        if (q.type === 'word_meaning' && q.optionsEn) {
          q.optionsEn.forEach((engWord: string, optIdx: number) => {
            const cleanW = engWord.toLowerCase().trim();
            
            // Check cache
            const getCachedWord = () => {
              const cacheKeyObj = `story_word_translations_cache_${nativeLanguage}`;
              const cacheJSON = localStorage.getItem(cacheKeyObj);
              if (cacheJSON) {
                try {
                  const cache = JSON.parse(cacheJSON);
                  if (cache[cleanW] && cache[cleanW].translation) return cache[cleanW].translation;
                } catch {}
              }
              const indCacheKey = `linguist_dict_word_${cleanW}_${nativeLanguage}`;
              const indCache = localStorage.getItem(indCacheKey);
              if (indCache) {
                try {
                  const parsed = JSON.parse(indCache);
                  if (parsed.translation) return parsed.translation;
                } catch {}
              }
              // Check offline pretranslated
              const offlineBook = pretranslatedStories[book.id as keyof typeof pretranslatedStories];
              if (offlineBook && offlineBook.words && offlineBook.words[engWord as keyof typeof offlineBook.words]) {
                const offlineWord = offlineBook.words[engWord as keyof typeof offlineBook.words];
                if (offlineWord[nativeLanguage as keyof typeof offlineWord]) {
                  return offlineWord[nativeLanguage as keyof typeof offlineWord] as string;
                }
              }
              return null;
            };

            const cachedTr = getCachedWord();
            if (cachedTr) {
              setActiveQuizQuestions((prev: any) => {
                if (!prev) return null;
                const updated = [...prev];
                if (updated[qIdx] && updated[qIdx].options) {
                  updated[qIdx].options[optIdx] = cachedTr;
                }
                return updated;
              });
            } else {
              // Instantly translate using client-side Google Translate to avoid English leaks
              const p = translateWithGoogleClient(engWord, nativeLanguage)
                .then(fallbackTr => {
                  if (fallbackTr) {
                    setActiveQuizQuestions((prev: any) => {
                      if (!prev) return null;
                      const updated = [...prev];
                      if (updated[qIdx] && updated[qIdx].options) {
                        const currentVal = updated[qIdx].options[optIdx];
                        if (currentVal && currentVal.toLowerCase() === engWord.toLowerCase()) {
                          updated[qIdx].options[optIdx] = fallbackTr;
                        }
                      }
                      return updated;
                    });
                    
                    // Cache the fallback translation
                    const indCacheKey = `linguist_dict_word_${cleanW}_${nativeLanguage}`;
                    if (!localStorage.getItem(indCacheKey)) {
                      localStorage.setItem(indCacheKey, JSON.stringify({
                        translation: fallbackTr,
                        notes: '',
                        level: book.level || 'A1'
                      }));
                    }
                  }
                })
                .catch(err => console.error('Client-side option translation fallback failed:', err));
              translationPromises.push(p);

              // Fetch from backend in parallel
              fetch(`${apiBase}/api/translate-word`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word: engWord, context: q.sentenceEn || '', level: book.level || 'A1', targetLang: nativeLanguage })
              })
              .then(res => {
                if (!res.ok) throw new Error('API error');
                return res.json();
              })
              .then((data: any) => {
                if (data && data.translation) {
                  const indCacheKey = `linguist_dict_word_${cleanW}_${nativeLanguage}`;
                  localStorage.setItem(indCacheKey, JSON.stringify({
                    translation: data.translation,
                    notes: data.explanation || '',
                    level: data.wordLevel || 'A1'
                  }));
                  setActiveQuizQuestions((prev: any) => {
                    if (!prev) return null;
                    const updated = [...prev];
                    if (updated[qIdx] && updated[qIdx].options) {
                      updated[qIdx].options[optIdx] = data.translation;
                    }
                    return updated;
                  });
                }
              })
              .catch(err => console.error('Checkpoint quiz option translation backend error:', err));
            }
          });
        }
      });

      if (translationPromises.length > 0) {
        setIsQuizTranslating(true);
        Promise.all(translationPromises)
          .then(() => setIsQuizTranslating(false))
          .catch(() => setIsQuizTranslating(false));
      } else {
        setIsQuizTranslating(false);
      }
    } else {
      setIsQuizTranslating(false);
    }
  };

  const handleQuizNextDirect = () => {
    setSelectedQuizOption(null);
    setIsQuizAnswered(false);

    if (activeQuizQuestionIdx < 4) {
      setActiveQuizQuestionIdx(prev => prev + 1);
    } else {
      if (activeQuizCpIndex !== null) {
        const nextMax = activeQuizCpIndex + 1;
        setMaxUnlockedPageIdx(prev => {
          const nextUnlocked = Math.max(prev, nextMax);
          const ns = deviceUuid || 'guest';
          localStorage.setItem(`linguist_max_unlocked_page_${book.id}_${ns}`, String(nextUnlocked));
          return nextUnlocked;
        });
        
        setCurrentPageIdx(nextMax);
        const ns = deviceUuid || 'guest';
        localStorage.setItem(`linguist_current_page_${book.id}_${ns}`, String(nextMax));
      }
      
      setStats((prev: any) => {
        const nextSolved = (prev.dailyQuizzesSolvedCount || 0) + 1;
        const nextScoreSum = (prev.dailyQuizzesScoreSum || 0) + quizCorrectAnswersCount;
        const nextQuestionsSum = (prev.dailyQuizzesQuestionsSum || 0) + 5;
        return {
          ...prev,
          dailyQuizzesSolvedCount: nextSolved,
          dailyQuizzesScoreSum: nextScoreSum,
          dailyQuizzesQuestionsSum: nextQuestionsSum
        };
      });

      setActiveQuizQuestions(null);
      setActiveQuizCpIndex(null);
      setActiveQuizQuestionIdx(0);
      setShowQuizRoadblockModal(false);
      setToastMessage(t('reading_checkpoint_success_toast', nativeLanguage));
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleQuizOptionClick = (optionIdx: number) => {
    if (isQuizAnswered || !activeQuizQuestions) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSelectedQuizOption(optionIdx);
    setIsQuizAnswered(true);

    const question = activeQuizQuestions[activeQuizQuestionIdx];
    const isCorrect = optionIdx === question.correctIndex;

    const ns = deviceUuid || 'guest';

    if (isCorrect) {
      setQuizCorrectAnswersCount(prev => prev + 1);
      setStats((prev: any) => ({
        ...prev,
        readingGoalPercent: Math.min(prev.readingGoalPercent + 4, 100)
      }));

      // Increment streak
      const nextStreak = quizCorrectStreak + 1;
      if (nextStreak >= 15) {
        // Award heart if not premium and hearts < 5
        setStats((prev: any) => {
          if (prev.isPremium) return prev;
          const currentHearts = prev.hearts ?? 5;
          if (currentHearts >= 5) return prev;
          
          const nextHearts = Math.min(5, currentHearts + 1);
          return {
            ...prev,
            hearts: nextHearts
          };
        });
        
        // Show success toast
        if (stats?.isPremium) {
          setToastMessage(t('reading_streak_15_toast_1', nativeLanguage));
        } else if ((stats?.hearts ?? 5) >= 5) {
          setToastMessage(t('reading_streak_15_toast_2', nativeLanguage));
        } else {
          setToastMessage(t('reading_streak_15_toast_3', nativeLanguage));
        }
        
        // Reset streak
        setQuizCorrectStreak(0);
        localStorage.setItem(`linguist_quiz_correct_streak_${ns}`, '0');
      } else {
        setQuizCorrectStreak(nextStreak);
        localStorage.setItem(`linguist_quiz_correct_streak_${ns}`, String(nextStreak));
      }

      // Auto-advance on correct answers after 800ms
      setTimeout(() => {
        handleQuizNextDirect();
      }, 800);
    } else {
      // Reset streak
      setQuizCorrectStreak(0);
      localStorage.setItem(`linguist_quiz_correct_streak_${ns}`, '0');
      setToastMessage(t('reading_streak_reset', nativeLanguage));
      onAnswerIncorrect();
    }
    syncTrigger();
  };

  const handleQuizNext = () => {
    if (!activeQuizQuestions) return;
    handleQuizNextDirect();
  };

  const handleSkipQuiz = () => {
    if (!stats?.isPremium) return;
    
    const targetIdx = activeQuizCpIndex !== null ? activeQuizCpIndex : currentPageIdx;
    const nextMax = targetIdx + 1;
    
    setMaxUnlockedPageIdx(prev => {
      const nextUnlocked = Math.max(prev, nextMax);
      const ns = deviceUuid || 'guest';
      localStorage.setItem(`linguist_max_unlocked_page_${book.id}_${ns}`, String(nextUnlocked));
      return nextUnlocked;
    });
    
    setCurrentPageIdx(nextMax);
    const ns = deviceUuid || 'guest';
    localStorage.setItem(`linguist_current_page_${book.id}_${ns}`, String(nextMax));
    
    setActiveQuizQuestions(null);
    setActiveQuizCpIndex(null);
    setActiveQuizQuestionIdx(0);
    setShowQuizRoadblockModal(false);
    
    setToastMessage(t('quiz_premium_skipped', nativeLanguage));
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle word clicking
  const handleWordClick = useCallback((
    e: React.MouseEvent,
    wordEn: string,
    wordTr: string,
    paragraphId: string,
    wordIdx: number,
    sentenceIdx: number,
    sentEn: string,
    sentTr: string
  ) => {
    try {
      e.stopPropagation();

      if (isAudiobookPlaying) {
        handleStopAudiobook();
        return;
      }

      const now = Date.now();
      const DOUBLE_PRESS_DELAY = 300; // ms
      const currentKey = `${paragraphId}_${sentenceIdx}`;

      // If it's a double click (or more) or we have a swift consecutive tap on the same word
      const isConsecutiveTap = lastTapRef.current.sentenceKey === currentKey 
        && lastTapRef.current.wordIdx === wordIdx 
        && (now - lastTapRef.current.time) < DOUBLE_PRESS_DELAY;

      if (e.detail >= 2 || isConsecutiveTap) {
        if (wordClickTimeoutRef.current) {
          clearTimeout(wordClickTimeoutRef.current);
          wordClickTimeoutRef.current = null;
        }
        setClickedWord(null);
        setSelectedDictWord(null);
        handleShowSentenceTr({
          paragraphId,
          sentenceIdx,
          textEn: sentEn || '',
          textTr: sentTr || ''
        });
        lastTapRef.current = { time: now, sentenceKey: currentKey, wordIdx };
        
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(40);
          } catch (err) {}
        }
        return;
      }

      lastTapRef.current = { time: now, sentenceKey: currentKey, wordIdx };

      if (wordClickTimeoutRef.current) {
        clearTimeout(wordClickTimeoutRef.current);
      }

      // Delay the single click action slightly to ensure a potential double click takes precedence
      wordClickTimeoutRef.current = setTimeout(() => {
        try {
          const cleanW = cleanWord(wordEn);
          if (!cleanW) return; // Ignore clicking on pure symbols/punctuation

          const looksLikePropName = looksLikeProperNoun(wordEn);

          if (ENABLE_TRANSLATION_LIMITS && !stats?.isPremium && !looksLikePropName) {
            const isAlreadySelected = selectedDictWord && selectedDictWord.word.toLowerCase() === cleanW.toLowerCase();
            let lookedUpToday = false;
            try {
              const wordsList = JSON.parse(localStorage.getItem('linguist_today_looked_up_words') || '[]');
              if (wordsList.includes(cleanW.toLowerCase())) {
                lookedUpToday = true;
              }
            } catch (e) {
              console.error(e);
            }

            if (!isAlreadySelected && !lookedUpToday) {
              const counts = getDailyCounts();
              if (counts.words >= 300) {
                setShowLimitReachedModal('word');
                return;
              }
              incrementDailyCount('word');

              // Add to today's looked up words list
              try {
                const wordsList = JSON.parse(localStorage.getItem('linguist_today_looked_up_words') || '[]');
                if (!wordsList.includes(cleanW.toLowerCase())) {
                  wordsList.push(cleanW.toLowerCase());
                  localStorage.setItem('linguist_today_looked_up_words', JSON.stringify(wordsList));
                }
              } catch (e) {
                console.error(e);
              }
            }
          }

          const isPlaceholder = nativeLanguage !== 'tr'
            || !wordTr
            || PLACEHOLDER_STRINGS.has(wordTr.trim())
            || wordTr.toLowerCase().trim() === cleanW.toLowerCase().trim();

          const cleanProp = cleanW.charAt(0).toUpperCase() + cleanW.slice(1);

          // Contextual override check
          const contextOverride = getContextualOverride(cleanW, book?.id || '', nativeLanguage);

          // Check if word is already translated in cache for maximum speed
          const cached = contextOverride 
            ? { translation: contextOverride.tr, notes: contextOverride.notes, level: contextOverride.level }
            : getCachedTranslation(cleanW, nativeLanguage, book?.id);
          
          let initialTr = cached ? cached.translation : (isPlaceholder ? t('translating_word', nativeLanguage) : wordTr);
          if (!cached && looksLikePropName) {
            initialTr = `${cleanProp} (${t('dict_proper_noun_label', nativeLanguage)})`;
          }

          let initialNotes = cached ? cached.notes : (isPlaceholder ? t('dict_ai_placeholder', nativeLanguage) : undefined);
          if (!cached && looksLikePropName) {
            initialNotes = t('dict_proper_noun_detailed', nativeLanguage);
          }
          
          // Determine initial level using our multi-tier cache
          // Priority: cache → OFFLINE_DICTIONARY → book.level (fallback)
          let initialLevel: string;
          if (cached && cached.level) {
            initialLevel = cached.level;
          } else if (looksLikePropName) {
            initialLevel = 'Özel İsim';
          } else {
            // Check OFFLINE_DICTIONARY for the word's true level before defaulting to book level
            const offlineLookup = OFFLINE_DICTIONARY[cleanW.toLowerCase()];
            initialLevel = offlineLookup
              ? (offlineLookup.level === 'Özel İsim' ? 'Özel İsim' : `${offlineLookup.level} Seviyesi`)
              : (book?.level || 'A1') + ' Seviyesi';
          }

          // Set clicked word to display inline translation above the clicked span
          setClickedWord({ en: cleanW, tr: initialTr, paragraphId, wordIdx });

          // Also populate Dictionary Hud at the bottom
          setSelectedDictWord({
            word: cleanW,
            translation: initialTr,
            level: initialLevel,
            paragraphId,
            notes: initialNotes,
            exampleEn: sentEn,
            exampleTr: sentTr
          });

          // Close any active sentence overlay
          setActiveSentenceTr(null);

          // Audio/Speech synthesizer auto trigger and play the pronunciation on single click
          setSpeechSuccess(false);
          speakWordAloud(cleanW);

          // If not already cached locally, fetch it dynamically from server-side AI and cache it
          if (!cached) {
            if (looksLikePropName) {
              const propVal = `${cleanW} (${t('dict_proper_noun_label', nativeLanguage)})`;
              const propNotes = t('dict_proper_noun_detailed', nativeLanguage);
              saveCachedTranslation(cleanW, propVal, nativeLanguage, propNotes, 'Özel İsim');
            } else {
              // Try offline suffix stripping first (plurals, past tense, -ing, -er, -est, -ly)
              const tryOfflineSuffixes = (w: string): string | null => {
                const stems = [
                  w.endsWith('s') && w.length > 3 ? w.slice(0, -1) : null,
                  w.endsWith('es') && w.length > 4 ? w.slice(0, -2) : null,
                  w.endsWith('ed') && w.length > 4 ? w.slice(0, -2) : null,
                  w.endsWith('ed') && w.length > 4 ? w.slice(0, -1) : null,
                  w.endsWith('ing') && w.length > 5 ? w.slice(0, -3) : null,
                  w.endsWith('ing') && w.length > 5 ? w.slice(0, -3) + 'e' : null,
                  w.endsWith('ing') && w.length > 6 ? w.slice(0, -4) : null, // running->run
                  w.endsWith('ly') && w.length > 4 ? w.slice(0, -2) : null,
                  w.endsWith('er') && w.length > 4 ? w.slice(0, -2) : null,
                  w.endsWith('est') && w.length > 5 ? w.slice(0, -3) : null,
                  w.endsWith('tion') ? w.slice(0, -4) + 'te' : null,
                  w.endsWith('ness') ? w.slice(0, -4) : null,
                  w.endsWith('ful') ? w.slice(0, -3) : null,
                  w.endsWith('less') ? w.slice(0, -4) : null,
                ].filter(Boolean) as string[];
                for (const stem of stems) {
                  const d = OFFLINE_DICTIONARY[stem];
                  if (d) return d.tr;
                  const g = (GLOBAL_DICTIONARY as any)[stem];
                  if (g) return g;
                }
                return null;
              };

              const offlineStem = nativeLanguage === 'tr' ? tryOfflineSuffixes(cleanW) : null;
              if (offlineStem) {
                // Found via suffix stripping — find the stem's true CEFR level from OFFLINE_DICTIONARY
                const findStemLevel = (w: string): string => {
                  const possibleStems = [
                    w.endsWith('s') && w.length > 3 ? w.slice(0, -1) : null,
                    w.endsWith('es') && w.length > 4 ? w.slice(0, -2) : null,
                    w.endsWith('ed') && w.length > 4 ? w.slice(0, -2) : null,
                    w.endsWith('ed') && w.length > 4 ? w.slice(0, -1) : null,
                    w.endsWith('ing') && w.length > 5 ? w.slice(0, -3) : null,
                    w.endsWith('ing') && w.length > 5 ? w.slice(0, -3) + 'e' : null,
                    w.endsWith('ing') && w.length > 6 ? w.slice(0, -4) : null,
                    w.endsWith('ly') && w.length > 4 ? w.slice(0, -2) : null,
                    w.endsWith('er') && w.length > 4 ? w.slice(0, -2) : null,
                    w.endsWith('est') && w.length > 5 ? w.slice(0, -3) : null,
                    w.endsWith('tion') ? w.slice(0, -4) + 'te' : null,
                    w.endsWith('ness') ? w.slice(0, -4) : null,
                    w.endsWith('ful') ? w.slice(0, -3) : null,
                    w.endsWith('less') ? w.slice(0, -4) : null,
                  ].filter(Boolean) as string[];
                  for (const stem of possibleStems) {
                    const d = OFFLINE_DICTIONARY[stem];
                    if (d) return d.level === 'Özel İsim' ? 'Özel İsim' : `${d.level} Seviyesi`;
                  }
                  return (book?.level || 'A1') + ' Seviyesi';
                };
                const stemLevel = findStemLevel(cleanW.toLowerCase());
                const stemNotes = t('dict_derived_word', nativeLanguage);
                saveCachedTranslation(cleanW, offlineStem, nativeLanguage, stemNotes, stemLevel);
                setClickedWord(prev => prev && prev.paragraphId === paragraphId && prev.wordIdx === wordIdx
                  ? { ...prev, tr: offlineStem }
                  : prev
                );
                setSelectedDictWord(prev => prev && prev.paragraphId === paragraphId && prev.word.toLowerCase() === cleanW.toLowerCase()
                  ? { ...prev, translation: offlineStem, notes: stemNotes, level: stemLevel }
                  : prev
                );
              } else {
              // Determine API base URL (works both on web and in Android Capacitor)
              const apiBase = (() => {
                try {
                  if (window.location.protocol === 'capacitor:') {
                    return 'https://ingilizce-oyk-m.onrender.com';
                  }
                  return '';
                } catch { return ''; }
              })();

              fetch(`${apiBase}/api/translate-word`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word: cleanW, context: sentEn || '', level: book?.level || 'A1', targetLang: nativeLanguage })
              })
              .then(res => {
                if (!res.ok) throw new Error('API error');
                return res.json();
              })
              .then((data: any) => {
                if (data && data.translation) {
                  // Detect if server returned Turkish translation for non-Turkish readers
                  const isTrLeak = nativeLanguage !== 'tr' && (
                    (OFFLINE_DICTIONARY[cleanW.toLowerCase()] && OFFLINE_DICTIONARY[cleanW.toLowerCase()].tr.toLowerCase().trim() === data.translation.toLowerCase().trim()) ||
                    (GLOBAL_DICTIONARY[cleanW.toLowerCase()] && GLOBAL_DICTIONARY[cleanW.toLowerCase()].toLowerCase().trim() === data.translation.toLowerCase().trim())
                  );
                  if (isTrLeak) {
                    throw new Error('Server leaked Turkish translation');
                  }

                  const finalNotes = data.explanation || `${t('dict_contextual_word', nativeLanguage)} • ${t('dict_translation_api', nativeLanguage)}`;
                  const finalLevel = data.isName ? 'Özel İsim' : `${data.wordLevel || book?.level || 'A1'} Seviyesi`;
                  saveCachedTranslation(cleanW, data.translation, nativeLanguage, finalNotes, finalLevel);
                  setClickedWord(prev => prev && prev.paragraphId === paragraphId && prev.wordIdx === wordIdx
                    ? { ...prev, tr: data.translation }
                    : prev
                  );
                  setSelectedDictWord(prev => prev && prev.paragraphId === paragraphId && prev.word.toLowerCase() === cleanW.toLowerCase()
                    ? { ...prev, translation: data.translation, level: finalLevel, notes: finalNotes }
                    : prev
                  );

                  // Auto-update translation in vocabulary tab if it is already bookmarked
                  if (savedWords.some(w => w.word.toLowerCase() === cleanW.toLowerCase())) {
                    onSaveWord(
                      cleanW,
                      data.translation,
                      finalLevel,
                      sentEn,
                      sentTr
                    );
                  }
                }
              })
              .catch(err => {
                console.error('Dynamic translation failed, trying client fallback:', err);
                translateWithGoogleClient(cleanW, nativeLanguage)
                .then(fallbackTr => {
                  const finalNotes = `${t('dict_contextual_word', nativeLanguage)} • ${t('dict_translation_api', nativeLanguage)}`;
                  const finalLevel = `${book?.level || 'A1'} Seviyesi`;
                  saveCachedTranslation(cleanW, fallbackTr, nativeLanguage, finalNotes, finalLevel);
                  setClickedWord(prev => prev && prev.paragraphId === paragraphId && prev.wordIdx === wordIdx
                    ? { ...prev, tr: fallbackTr }
                    : prev
                  );
                  setSelectedDictWord(prev => prev && prev.paragraphId === paragraphId && prev.word.toLowerCase() === cleanW.toLowerCase()
                    ? { ...prev, translation: fallbackTr, level: finalLevel, notes: finalNotes }
                    : prev
                  );
                  if (savedWords.some(w => w.word.toLowerCase() === cleanW.toLowerCase())) {
                    onSaveWord(cleanW, fallbackTr, finalLevel, sentEn, sentTr);
                  }
                })
                .catch(fallbackErr => {
                  console.error('Client-side translation fallback failed:', fallbackErr);
                  const looksLikePropName = looksLikeProperNoun(wordEn);
                  const cleanProp = cleanW.charAt(0).toUpperCase() + cleanW.slice(1);
                  const finalTr = looksLikePropName ? `${cleanProp} (${t('dict_proper_noun_label', nativeLanguage)})` : t('dict_translation_failed', nativeLanguage);
                  const fallbackNotes = looksLikePropName ? t('dict_proper_noun_desc', nativeLanguage) : t('dict_connection_required', nativeLanguage);
                  const fallbackLevel = looksLikePropName ? 'Özel İsim' : `${book?.level || 'A1'} Seviyesi`;
                  setClickedWord(prev => prev && prev.paragraphId === paragraphId && prev.wordIdx === wordIdx
                    ? { ...prev, tr: finalTr }
                    : prev
                  );
                  setSelectedDictWord(prev => prev && prev.paragraphId === paragraphId && prev.word.toLowerCase() === cleanW.toLowerCase()
                    ? { ...prev, translation: finalTr, notes: fallbackNotes, level: fallbackLevel }
                    : prev
                  );
                });
              });
            }
          }
        }
        } catch (innerErr) {
          console.error("Internal word click timer process error:", innerErr);
        }
      }, 220);
    } catch (outerErr) {
      console.error("Fatal word click outer handling error:", outerErr);
    }
  }, [book?.level, book?.id, isAudiobookPlaying, handleStopAudiobook, savedWords, onSaveWord, nativeLanguage, handleShowSentenceTr, stats, selectedDictWord, getDailyCounts, incrementDailyCount]);

  // Helpers splitSentencesSafe, parseParagraphText, and cleanWord are declared globally at module scope for static references.

  // Handle double tap / double click for sentence translation (precise sentence bounding)
  const handleSentenceClick = useCallback((
    e: React.MouseEvent,
    paragraphId: string,
    sentenceIdx: number,
    textEn: string,
    textTr: string
  ) => {
    if (isAudiobookPlaying) {
      handleStopAudiobook();
      return;
    }

    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300; // ms
    const currentKey = `${paragraphId}_${sentenceIdx}`;

    const isDoubleClick = e.detail >= 2 || (lastTapRef.current.sentenceKey === currentKey && lastTapRef.current.wordIdx === -1 && now - lastTapRef.current.time < DOUBLE_PRESS_DELAY);

    if (isDoubleClick) {
      e.stopPropagation();
      // Çift tıklama algılandı!
      if (wordClickTimeoutRef.current) {
        clearTimeout(wordClickTimeoutRef.current);
        wordClickTimeoutRef.current = null;
      }
      setActiveSentenceTr({
        paragraphId,
        sentenceIdx,
        textEn,
        textTr
      });
      setClickedWord(null);
      setSelectedDictWord(null);
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(40);
        } catch (err) {}
      }
    }
    lastTapRef.current = { time: now, sentenceKey: currentKey, wordIdx: -1 };
  }, [isAudiobookPlaying, handleStopAudiobook]);

  // Speaks text aloud using native SpeechSynthesis service (fast, female, offline)
  const speakTextAloud = (text: string, lang: 'en-US' | 'tr-TR') => {
    if (lang === 'en-US') {
      setSpeechSuccess(true);
    }
    speakNative(
      text,
      lang,
      () => {
        if (lang === 'en-US') setSpeechSuccess(true);
      },
      () => {
        if (lang === 'en-US') setSpeechSuccess(false);
      }
    );
  };

  const speakWordAloud = (text: string) => {
    speakTextAloud(text, 'en-US');
  };

  const speakTranslationAloud = (text: string) => {
    speakTextAloud(text, 'tr-TR');
  };

  // Bookmark Toggle logic for Word State
  const isWordSaved = (word: string) => {
    return savedWords.some(w => w.word.toLowerCase() === word.toLowerCase());
  };

  const toggleWordSave = () => {
    if (!selectedDictWord) return;
    const wordClean = selectedDictWord.word;
    const isSaved = isWordSaved(wordClean);

    if (isSaved) {
      const match = savedWords.find(w => w.word.toLowerCase() === wordClean.toLowerCase());
      if (match) onUnsaveWord(match.id);
    } else {
      let finalTr = selectedDictWord.translation;
      if (finalTr === t('translating_word', nativeLanguage) || finalTr === t('dict_loading_placeholder', nativeLanguage)) {
        // Failsafe: don't save if currently translating
        return;
      }

      const cleanW = wordClean.toLowerCase().trim();
      const isPlaceholder = !finalTr
        || finalTr === t('translating_word', nativeLanguage)
        || finalTr === t('dict_loading_placeholder', nativeLanguage)
        || finalTr === t('dict_translation_failed', nativeLanguage)
        || finalTr === t('dict_connection_required', nativeLanguage)
        || finalTr.toLowerCase().trim() === cleanW;

      if (isPlaceholder) {
        const cached = getCachedTranslation(wordClean, nativeLanguage, book?.id);
        if (cached && cached.translation && 
            cached.translation !== t('translating_word', nativeLanguage) && 
            cached.translation !== t('dict_loading_placeholder', nativeLanguage) &&
            cached.translation !== t('dict_translation_failed', nativeLanguage) &&
            cached.translation !== t('dict_connection_required', nativeLanguage)) {
          finalTr = cached.translation;
        } else if (nativeLanguage === 'tr' && OFFLINE_DICTIONARY[cleanW]) {
          finalTr = OFFLINE_DICTIONARY[cleanW].tr;
        } else if (nativeLanguage === 'tr' && GLOBAL_DICTIONARY[cleanW]) {
          finalTr = GLOBAL_DICTIONARY[cleanW];
        } else {
          let foundOffline = false;
          if (nativeLanguage !== 'tr' && book?.id) {
            const offlineBook = pretranslatedStories[book.id as keyof typeof pretranslatedStories];
            if (offlineBook && offlineBook.words && offlineBook.words[cleanW as keyof typeof offlineBook.words]) {
              const offlineWord = offlineBook.words[cleanW as keyof typeof offlineBook.words];
              if (offlineWord[nativeLanguage as keyof typeof offlineWord]) {
                finalTr = offlineWord[nativeLanguage as keyof typeof offlineWord] as string;
                foundOffline = true;
              }
            }
          }
          if (!foundOffline) {
            finalTr = wordClean.charAt(0).toUpperCase() + wordClean.slice(1);
          }
        }
      }

      onSaveWord(
        wordClean, 
        finalTr, 
        selectedDictWord.level, 
        selectedDictWord.exampleEn, 
        selectedDictWord.exampleTr
      );
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2005);
    }
    syncTrigger();
  };

  const handleShareTranslation = () => {
    if (!selectedDictWord) return;
    const shareText = t('share_word_text', nativeLanguage)
      .replace('{word}', selectedDictWord.word)
      .replace('{translation}', selectedDictWord.translation);
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(shareText)
          .then(() => {
            setToastMessage(t('toast_word_copied', nativeLanguage));
          })
          .catch((err) => {
            console.warn("Clipboard promise rejected, using fallback:", err);
            setToastMessage(t('toast_copy_tip', nativeLanguage));
          });
      } else {
        setToastMessage(t('toast_copy_failed', nativeLanguage));
      }
    } catch (e) {
      console.error("Clipboard write syntax exception caught:", e);
      setToastMessage(t('toast_copy_failed', nativeLanguage));
    }
  };

  const isTranslating = !!(selectedDictWord && PLACEHOLDER_STRINGS.has(selectedDictWord.translation));

  return (
    <div 
      onClick={handleClearAllOverlays}
      className={`min-h-screen pb-16 flex flex-col font-body-ui transition-colors duration-200 ${
        isDarkMode ? 'bg-[#121214] text-[#E6E6E6]' : 'bg-[#FFFBF0] text-gray-800'
      }`}
    >
      <div ref={topRef} />
      {/* Centered Premium Toast Notification */}
      <AnimatePresence>
        {toastMessage && (() => {
          const isWarning = toastMessage.includes('⚠️') || 
                            toastMessage.includes('?') || 
                            /error|fail|invalid|unauthorized|exception|hata|gecersiz|basarisiz|olustu|yetersiz/i.test(toastMessage);
          
          return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 pointer-events-none select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                onClick={() => setToastMessage(null)}
                className={`w-full max-w-[340px] rounded-3xl p-6 border text-center flex flex-col items-center gap-4 backdrop-blur-lg transition-all duration-300 shadow-2xl pointer-events-auto cursor-pointer ${
                  isDarkMode 
                    ? 'bg-[#1E1E22]/95 border-[#2A2A30] text-white shadow-black/60' 
                    : 'bg-white/95 border-[#FFE66D]/80 text-[#2D3436] shadow-gray-400/20'
                }`}
              >
                {isWarning ? (
                  <div className="w-12 h-12 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center border border-[#FF6B6B]/30 shrink-0">
                    <X className="w-6 h-6 text-[#FF6B6B] animate-pulse" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#4ECDC4]/10 flex items-center justify-center border border-[#4ECDC4]/30 shrink-0">
                    <Check className="w-6 h-6 text-[#4ECDC4] animate-bounce" />
                  </div>
                )}
                <span className="text-sm font-bold leading-relaxed">{toastMessage}</span>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Top Header */}
      <header 
        className={`sticky top-0 z-40 backdrop-blur-md transition-colors border-b ${
          isDarkMode ? 'bg-[#121214]/85 border-[#2A2A30]' : 'bg-white/70 border-[#FFE66D]/80'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-[680px] mx-auto px-5 min-h-[3.5rem] flex items-center justify-between py-2 gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={handleGoBack}
              className={`h-8 px-2.5 -ml-2 rounded-xl transition-all flex items-center gap-1.5 text-sm font-bold cursor-pointer shrink-0 ${
                isDarkMode ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-[#FFFBF0] text-gray-700'
              }`}
            >
              <ArrowLeft className="w-4 h-4 text-[#FF6B6B]" />
              <span>{t('btn_back', nativeLanguage)}</span>
            </button>
            <div className={`w-[1px] h-5 shrink-0 ${isDarkMode ? 'bg-gray-700' : 'bg-[#FFE66D]'}`} />
            <h1 className={`text-sm font-bold line-clamp-2 tracking-wider font-headline-lg transition-colors flex-1 leading-snug overflow-hidden ${
              isDarkMode ? 'text-white' : 'text-[#2D3436]'
            }`}>
              {book.title}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Favorite Toggle Button */}
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(book.id)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
                  book.isFavorited
                    ? 'bg-[#F59E0B]/15 border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/25'
                    : isDarkMode
                      ? 'bg-[#1A1A1E] border-[#2A2A30] text-gray-400 hover:text-white hover:border-gray-500'
                      : 'bg-white border-gray-250 text-gray-550 hover:text-[#F59E0B] hover:border-gray-300'
                }`}
                title={book.isFavorited ? t('fav_remove_tooltip', nativeLanguage) : t('fav_add_tooltip', nativeLanguage)}
              >
                <Star className={`w-3.5 h-3.5 ${book.isFavorited ? 'fill-[#F59E0B]' : ''}`} />
              </button>
            )}

            {/* Embedded Dark mode switch inside reading view */}
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-[#1A1A1E] border-[#2A2A30] text-[#FFE66D] hover:bg-[#2A2A30]' 
                    : 'bg-white border-[#FFE66D] text-[#FF6B6B] hover:bg-[#FFE66D]/15'
                }`}
                title={isDarkMode ? t('theme_light', nativeLanguage) : t('theme_dark', nativeLanguage)}
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Cohesive Sub-row for Lives indicator and level badge (User Focus) */}
        <div className="max-w-[680px] mx-auto px-5 pt-3 pb-4 flex flex-col items-center gap-2.5">
          <div className="flex items-center justify-center gap-3">
            {/* Lives Indicator */}
            <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-[#FF6B6B]/10 border border-[#FF6B6B]/25 rounded-full font-bold h-8 text-[13px]" title="Can Bilgisi">
              <Heart className={`w-4 h-4 text-[#FF6B6B] ${stats?.isPremium ? 'fill-[#FF6B6B] animate-pulse' : 'fill-[#FF6B6B]'}`} />
              <span className="text-[#FF6B6B] font-mono leading-none">
                {stats?.isPremium ? '∞' : (stats?.hearts ?? 5)}
              </span>
            </div>

            {/* Book Level Badge */}
            <span 
              className="flex items-center justify-center px-4 py-1.5 font-bold border rounded-full text-[13px] leading-none h-8"
              style={{
                color: getLevelColor(book.level),
                borderColor: hexToRgba(getLevelColor(book.level), 0.3),
                backgroundColor: hexToRgba(getLevelColor(book.level), 0.1),
              }}
            >
              {book.level}
            </span>
          </div>

          {/* Centered Aesthetic Countdown Timer */}
          {!stats?.isPremium && stats?.hearts !== undefined && stats?.hearts !== null && Number(stats.hearts) < 5 && refillCountdown && (
            <div className="flex items-center gap-1.5 text-[11px] bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 text-[#FF6B6B] px-3.5 py-1 rounded-full font-bold tracking-wide shadow-3xs transition-all">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
              <span>{t('refill_new_heart', nativeLanguage)}</span>
              <span className="font-mono font-extrabold">{refillCountdown}</span>
            </div>
          )}
        </div>
      </header>

      {/* Reading Canvas */}
      <main 
        onClick={(e) => {
          if (isAudiobookPlaying) {
            // Ignore if click is inside the audiobook control bar to allow controls to be clicked
            if (audiobookBarRef.current && audiobookBarRef.current.contains(e.target as Node)) {
              return;
            }
            handleStopAudiobook();
          }
        }}
        className="flex-1 w-full max-w-[680px] mx-auto px-5 pt-8 pb-36 select-none"
      >
        
        {/* Story Illustration Image Header */}
        <div className={`w-full h-56 sm:h-72 rounded-3xl overflow-hidden mb-8 shadow-sm border transition-colors ${
          isDarkMode ? 'border-[#2A2A30]' : 'border-[#FFE66D]'
        }`}>
          <img
            alt="Illustrated scenery"
            className="w-full h-full object-cover brightness-90 group-hover:brightness-95"
            style={{ objectPosition: book.coverPosition || 'center 28%' }}
            src={book.coverUrl || 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&auto=format&fit=crop&q=80'}
          />
        </div>

        {/* Tip Badge */}
        <div className={`p-4 rounded-2xl mb-8 flex items-start gap-2.5 text-xs leading-relaxed border-2 border-dashed transition-all ${
          isDarkMode 
            ? 'bg-[#FF6B6B]/10 border-[#FF6B6B]/40 text-gray-300' 
            : 'bg-FFE66D/15 bg-[#FFE66D]/15 border-[#FFE66D] text-[#2D3436] shadow-3xs'
        }`}>
          <Info className="w-4.5 h-4.5 text-[#FF6B6B] shrink-0 mt-0.5" />
          <p>
            <b>{t('tips_title', nativeLanguage)}</b> {t('tips_content', nativeLanguage)}
          </p>
        </div>

        {/* Audiobook Control Bar */}
        <div ref={audiobookBarRef} className={`p-4 rounded-2xl mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-2 transition-all select-none ${
          isDarkMode 
            ? 'bg-[#1A1A1E] border-[#2A2A30] text-white shadow-md' 
            : 'bg-white border-[#FFE66D] text-[#2D3436] shadow-sm shadow-[#FFE66D]/10'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isAudiobookPlaying ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-[#FF6B6B]/10 text-[#FF6B6B] border border-[#FF6B6B]/20'
            }`}>
              {isAudiobookPlaying ? (
                <Volume2 className="w-5 h-5 animate-pulse text-emerald-500" />
              ) : (
                <BookOpen className="w-5 h-5 text-[#FF6B6B]" />
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold font-headline-lg leading-tight">{t('audiobook_header', nativeLanguage)}</h4>
              <p className="text-[10px] text-gray-400 font-semibold leading-normal mt-0.5">
                {isAudiobookPlaying ? t('audiobook_playing', nativeLanguage) : t('audiobook_idle', nativeLanguage)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            {isAudiobookPlaying ? (
              <button
                onClick={handleStopAudiobook}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#FF6B6B] hover:bg-[#e05a5a] text-white rounded-xl text-xs font-bold transition-all transform active:scale-95 cursor-pointer shadow-md shadow-[#FF6B6B]/20 font-headline-lg flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>{t('audiobook_stop', nativeLanguage)}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleStartAudiobook}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#4ECDC4] hover:bg-[#3db8af] text-white rounded-xl text-xs font-bold transition-all transform active:scale-95 cursor-pointer shadow-md shadow-[#4ECDC4]/20 font-headline-lg flex items-center justify-center gap-1.5"
                >
                  <Volume2 className="w-4.5 h-4.5 shrink-0" />
                  <span className="leading-tight text-center">{t('audiobook_listen', nativeLanguage)}</span>
                </button>
                {lastSpokenSentenceIdx !== null && (
                  <button
                    onClick={handleContinueAudiobook}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#FFE66D] hover:bg-[#ebd152] text-gray-900 rounded-xl text-xs font-bold transition-all transform active:scale-95 cursor-pointer shadow-md shadow-[#FFE66D]/20 font-headline-lg flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 text-gray-900 animate-pulse shrink-0" />
                    <span className="leading-tight text-center">{t('audiobook_resume', nativeLanguage)}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Story Main Title (English & Turkish) - Only on first page */}
        {currentPageIdx === 0 && (
          <div className="mb-8 select-text px-4 -mx-1.5">
            <h1 className={`font-headline-lg text-[21px] sm:text-[23px] font-bold tracking-tight mb-1 transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {/* Clickable English Title Words wrapped in a sentence block for full translation support */}
              <span
                id="sent-book-title-heading-0"
                onContextMenu={(e) => e.preventDefault()}
                onClick={(e) => {
                  if (isTitleLongPressActive.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  handleSentenceClick(e, 'book-title-heading', 0, book.title, localizedTitleTr || '');
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (wordClickTimeoutRef.current) {
                    clearTimeout(wordClickTimeoutRef.current);
                    wordClickTimeoutRef.current = null;
                  }
                  setActiveSentenceTr({
                    paragraphId: 'book-title-heading',
                    sentenceIdx: 0,
                    textEn: book.title,
                    textTr: localizedTitleTr || ''
                  });
                  setClickedWord(null);
                  setSelectedDictWord(null);
                }}
                style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
                className={`inline rounded-sm cursor-help select-none ${
                  activeSentenceTr?.paragraphId === 'book-title-heading'
                    ? isDarkMode
                      ? 'relative bg-[#4ECDC4]/25 text-white z-30'
                      : 'relative bg-[#FFE66D]/45 text-gray-900 z-30'
                    : isDarkMode
                      ? 'hover:bg-white/5'
                      : 'hover:bg-[#FFE66D]/15'
                }`}
              >
                {book.title.split(/(\s+)/).filter(Boolean).map((part, partIdx) => {
                  const isWhitespace = /\s/.test(part);
                  if (isWhitespace) {
                    return <span key={partIdx}>{part}</span>;
                  }

                  const rawWord = part;
                  const cleanW = cleanWord(rawWord);
                  const uniqueWordIdx = 9999 + partIdx;
                  const isWordClicked = clickedWord?.paragraphId === 'book-title-heading' && clickedWord?.wordIdx === uniqueWordIdx;

                  const cleanWLower = cleanW.toLowerCase();
                  const customMatch = OFFLINE_DICTIONARY[cleanWLower] || GLOBAL_DICTIONARY[cleanWLower];

                  const fireTitleSentenceTr = () => {
                    if ('vibrate' in navigator) {
                      try { navigator.vibrate(40); } catch (_) {}
                    }
                    setActiveSentenceTr({
                      paragraphId: 'book-title-heading',
                      sentenceIdx: 0,
                      textEn: book.title,
                      textTr: localizedTitleTr || ''
                    });
                    setClickedWord(null);
                    setSelectedDictWord(null);
                  };

                  return (
                    <span
                      key={partIdx}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        isTouchSession.current = true;
                        isTitleLongPressActive.current = false;
                        if (titleLongPressTimeoutRef.current) clearTimeout(titleLongPressTimeoutRef.current);
                        
                        const touch = e.touches[0];
                        titleTouchStartPos.current = { x: touch.clientX, y: touch.clientY };
                        
                        titleLongPressTimeoutRef.current = setTimeout(() => {
                          isTitleLongPressActive.current = true;
                          fireTitleSentenceTr();
                        }, 1000);
                      }}
                      onTouchMove={(e) => {
                        e.stopPropagation();
                        if (titleTouchStartPos.current) {
                          const touch = e.touches[0];
                          const dx = touch.clientX - titleTouchStartPos.current.x;
                          const dy = touch.clientY - titleTouchStartPos.current.y;
                          if (Math.sqrt(dx*dx + dy*dy) > 10) {
                            if (titleLongPressTimeoutRef.current) {
                              clearTimeout(titleLongPressTimeoutRef.current);
                              titleLongPressTimeoutRef.current = null;
                            }
                          }
                        }
                      }}
                      onTouchEnd={(e) => {
                        e.stopPropagation();
                        if (titleLongPressTimeoutRef.current && !isTitleLongPressActive.current) {
                          clearTimeout(titleLongPressTimeoutRef.current);
                          titleLongPressTimeoutRef.current = null;
                        }
                        if (isTitleLongPressActive.current) {
                          try { e.preventDefault(); } catch (_) {}
                          setTimeout(() => { isTitleLongPressActive.current = false; }, 700);
                        }
                        setTimeout(() => { isTouchSession.current = false; }, 600);
                      }}
                      onMouseDown={(e) => {
                        if (isTouchSession.current) return;
                        e.stopPropagation();
                        isTitleLongPressActive.current = false;
                        if (titleLongPressTimeoutRef.current) clearTimeout(titleLongPressTimeoutRef.current);
                        titleTouchStartPos.current = null;
                        titleLongPressTimeoutRef.current = setTimeout(fireTitleSentenceTr, 1000);
                      }}
                      onMouseUp={(e) => {
                        if (isTouchSession.current) return;
                        e.stopPropagation();
                        if (titleLongPressTimeoutRef.current && !isTitleLongPressActive.current) {
                          clearTimeout(titleLongPressTimeoutRef.current);
                          titleLongPressTimeoutRef.current = null;
                        }
                        if (isTitleLongPressActive.current) {
                          setTimeout(() => { isTitleLongPressActive.current = false; }, 700);
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isTouchSession.current) return;
                        e.stopPropagation();
                        if (titleLongPressTimeoutRef.current && !isTitleLongPressActive.current) {
                          clearTimeout(titleLongPressTimeoutRef.current);
                          titleLongPressTimeoutRef.current = null;
                        }
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isTitleLongPressActive.current) {
                          isTitleLongPressActive.current = false;
                          return;
                        }
                        let initialTr = t('dict_loading_placeholder', nativeLanguage);
                        if (customMatch) {
                          initialTr = typeof customMatch === 'string' ? customMatch : customMatch.tr;
                        }
                        handleWordClick(
                          e,
                          rawWord,
                          initialTr,
                          'book-title-heading',
                          uniqueWordIdx,
                          0,
                          book.title,
                          localizedTitleTr || ''
                        );
                      }}
                      className={`cursor-pointer inline transition-colors ${
                        isWordClicked
                          ? 'relative text-[#FF6B6B] bg-[#FFE66D]/30 rounded underline underline-offset-4 decoration-2 decoration-[#FF6B6B]'
                          : isDarkMode
                            ? 'hover:text-[#FF6B6B] text-white'
                            : 'hover:text-[#FF6b6B]'
                      }`}
                      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
                    >
                      {rawWord}
                    </span>
                  );
                })}
              </span>
            </h1>
            {localizedTitleTr && (
              <p className={`text-xs sm:text-sm font-medium opacity-70 font-headline-lg ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {localizedTitleTr}
              </p>
            )}
          </div>
        )}

        {/* Chapter Title */}
        {currentChapter.title && !/^(chapter|section|capture|bölüm)/i.test(currentChapter.title) && (
          <h2 className={`font-headline-lg text-2xl font-bold tracking-tight mb-6 transition-colors ${
            isDarkMode ? 'text-white' : 'text-[#2D3436]'
          }`}>
            {currentChapter.title}
          </h2>
        )}

        {/* Core Book Paragraph Text Area */}
        <article className={`font-body-reading text-[18px] leading-[1.8] select-text transition-colors ${
          isDarkMode ? 'text-gray-300' : 'text-gray-805'
        }`}>
          {localizedParagraphs.length > 0 ? (
            (() => {
              const currentPage = pages[currentPageIdx];
              if (!currentPage) return null;

              const renderedParagraphs = currentPage.paragraphIndices.map(pIdx => localizedParagraphs[pIdx]);

              return (
                <div className="space-y-2 font-body-reading">
                  {currentPageIdx === 0 && !book.isStarted && (
                    <div className={`p-5 rounded-3xl border-2 border-dashed flex flex-col items-center text-center gap-3.5 mb-6 transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-[#4ECDC4]/5 border-[#4ECDC4]/25' 
                        : 'bg-[#4ECDC4]/5 border-[#4ECDC4]/30'
                    }`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        isDarkMode ? 'bg-[#4ECDC4]/10 text-[#4ECDC4] border-[#4ECDC4]/20' : 'bg-[#4ECDC4]/10 text-[#2c8d86] border-[#4ECDC4]/20'
                      }`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className={`text-base font-bold font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                          {t('book_start_title', nativeLanguage)}
                        </h4>
                        <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('book_start_desc', nativeLanguage)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (onStartBook) {
                            onStartBook(book.id);
                          }
                          setToastMessage(t('book_started_success', nativeLanguage));
                          setTimeout(() => setToastMessage(null), 3500);
                        }}
                        className="w-full sm:w-auto px-8 py-3 bg-[#4ECDC4] hover:bg-[#3db8af] text-white rounded-full text-xs font-bold transition-all transform active:scale-95 cursor-pointer shadow-md shadow-[#4ECDC4]/20 font-headline-lg flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>{t('book_start_btn', nativeLanguage)}</span>
                      </button>
                    </div>
                  )}

                  {renderedParagraphs.map((p) => (
                    <ParagraphBlock
                      key={p.id}
                      p={p}
                      isDarkMode={!!isDarkMode}
                      clickedWordIdx={clickedWord?.paragraphId === p.id ? clickedWord.wordIdx : -1}
                      clickedWordTr={clickedWord?.paragraphId === p.id ? clickedWord.tr : ''}
                      activeSentenceIdx={
                        activeSentenceTr?.paragraphId === p.id 
                          ? activeSentenceTr.sentenceIdx 
                          : (currentAudiobookSentence?.paragraphId === p.id 
                              ? currentAudiobookSentence.sentenceIdx 
                              : -1)
                      }
                      activeSpokenWordIdx={
                        activeSentenceTr?.paragraphId === p.id
                          ? activeSpokenWordIdx
                          : (currentAudiobookSentence?.paragraphId === p.id
                              ? activeSpokenWordIdx
                              : -1)
                      }
                      handleSentenceClick={handleSentenceClick}
                      handleWordClick={handleWordClick}
                      wordClickTimeoutRef={wordClickTimeoutRef}
                      setActiveSentenceTr={handleShowSentenceTr}
                      setClickedWord={setClickedWord}
                      setSelectedDictWord={setSelectedDictWord}
                      isAudiobookPlaying={isAudiobookPlaying}
                      nativeLanguage={nativeLanguage}
                    />
                  ))}

                  {/* PAGE TRANSITION / ROADBLOCK CHECKPOINT CARD */}
                  {currentPageIdx < pages.length - 1 && (
                    <div className="pt-6 border-t border-dashed border-[#FFE66D]/50">
                      {currentPageIdx < maxUnlockedPageIdx ? (
                        /* DIRECT NEXT PAGE BUTTON (ALREADY UNLOCKED) */
                        <button
                          onClick={() => {
                            setCurrentPageIdx(prev => prev + 1);
                            scrollToTop();
                          }}
                          className="w-full py-3.5 px-4 bg-[#4ECDC4] text-white rounded-xl text-sm font-bold hover:bg-[#3db8af] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4ECDC4]/20"
                        >
                          <span>{t('reading_next_page_prompt', nativeLanguage).replace('{page}', String(currentPageIdx + 2))}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        /* STATIC SONRAKİ SAYFA BUTTON TO TRIGGER ROADBLOCK MODAL */
                        <button
                          onClick={() => {
                            setShowQuizRoadblockModal(true);
                          }}
                          className="w-full py-3.5 px-4 bg-[#FF6B6B] text-white rounded-xl text-sm font-bold hover:bg-[#e05a5a] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#FF6B6B]/20"
                        >
                          <span>{t('btn_next_page', nativeLanguage)}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {currentPageIdx === pages.length - 1 && (
                    <div className="pt-6 border-t border-dashed border-[#FFE66D]/50 text-center space-y-4">
                      {book.isCompleted ? (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-[#4ECDC4]/10 rounded-full flex items-center justify-center mx-auto text-[#4ECDC4] border border-[#4ECDC4]/30 shadow-xs animate-pulse">
                            <CheckCircle2 className="w-8 h-8" />
                          </div>
                          <h3 className={`text-lg font-bold font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                            {t('book_completed_title', nativeLanguage)}
                          </h3>
                          <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('book_completed_desc', nativeLanguage)}
                          </p>

                          {/* Play Store Rating Card */}
                          <div className={`p-5 rounded-2xl border text-center space-y-4 max-w-sm mx-auto shadow-xs transition-all duration-350 ${
                            isDarkMode 
                              ? 'bg-[#1a1a1e]/85 border-[#2E2E35] shadow-black/30' 
                              : 'bg-white border-[#FFE66D]/50 shadow-[#FFE66D]/15'
                          }`}>
                            {/* Stars Animation */}
                            <div className="flex items-center justify-center gap-1.5 py-1">
                              {[1, 2, 3, 4, 5].map((starIdx) => (
                                <Star 
                                  key={starIdx} 
                                  className="w-5 h-5 text-[#FFE66D] fill-[#FFE66D] animate-bounce" 
                                  style={{ animationDelay: `${starIdx * 120}ms`, animationDuration: '2s' }}
                                />
                              ))}
                            </div>

                            <div className="space-y-1.5">
                              <h4 className={`text-xs font-bold font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                                {t('playstore_card_title', nativeLanguage)}
                              </h4>
                              <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {t('playstore_card_desc', nativeLanguage)}
                              </p>
                            </div>

                            <a
                              href="https://play.google.com/store/apps/details?id=com.ingilizceoykum.app"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 bg-[#4ECDC4] hover:bg-[#3dbbb2] active:scale-95 text-[#121214] font-bold text-xs rounded-xl shadow-md shadow-[#4ECDC4]/10 transition-all font-headline-lg"
                            >
                              <Heart className="w-3.5 h-3.5 fill-[#121214] text-[#121214]" />
                              <span>{t('btn_rate_review', nativeLanguage)}</span>
                            </a>
                          </div>

                          <button
                            onClick={() => {
                              const percentage = Math.round(((currentPageIdx + 1) / pages.length) * 100);
                              onBack(percentage, currentPageIdx + 1, pages.length);
                            }}
                            className="px-8 py-3 bg-[#FF6B6B] hover:bg-[#e05a5a] text-white rounded-full text-xs font-bold transition-all transform active:scale-95 cursor-pointer shadow-md shadow-[#FF6B6B]/20 font-headline-lg"
                          >
                            {t('btn_back_library', nativeLanguage)}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h3 className={`text-lg font-bold font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                            {t('book_end_title', nativeLanguage)}
                          </h3>
                          <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('book_end_desc', nativeLanguage)}
                          </p>
                          <button
                            onClick={() => {
                              if (onFinishBook) {
                                onFinishBook(book.id);
                              }
                            }}
                            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 font-headline-lg"
                          >
                            <span>{t('btn_finish_book', nativeLanguage)}</span>
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="text-center py-20 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto text-gray-200 mb-3" />
              <p className="font-headline-lg font-bold text-gray-500">{t('book_no_story', nativeLanguage)}</p>
              <button
                onClick={onBack}
                className="mt-4 px-4 py-2 bg-gray-105 hover:bg-gray-200 text-gray-750 rounded-lg text-sm font-semibold cursor-pointer"
              >
                {t('btn_back_library', nativeLanguage)}
              </button>
            </div>
          )}
        </article>

      </main>

      {/* Chapter Progress Bar Overlay Footer */}
      <footer 
        className={`fixed bottom-0 left-0 w-full border-t z-35 backdrop-blur-md transition-colors ${
          isDarkMode 
            ? 'bg-[#1A1A1E]/95 border-[#2A2A30] shadow-[0_-5px_20px_rgba(0,0,0,0.35)]' 
            : 'bg-white/90 border-[#FFE66D]/80 shadow-[0_-5px_20px_rgba(255,107,107,0.03)]'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-[680px] mx-auto px-5 py-4 pb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-550 font-bold tracking-wider font-headline-lg">
              {book.title}
            </span>
          </div>

          <div className={`w-full h-2 rounded-full overflow-hidden border ${
            isDarkMode ? 'bg-[#2A2A30] border-[#343A40]/50' : 'bg-gray-100 border-[#FFE66D]/40'
          }`}>
            <div
              className="bg-[#4ECDC4] h-full rounded-full transition-all duration-300"
              style={{ width: `${pages.length > 0 ? Math.round(((currentPageIdx + 1) / pages.length) * 100) : 0}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-3 text-xs text-gray-550 dark:text-gray-400">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (currentPageIdx > 0) {
                  setCurrentPageIdx(prev => prev - 1);
                  scrollToTop();
                }
              }}
              disabled={currentPageIdx === 0}
              className={`p-1.5 px-3 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
                currentPageIdx === 0 
                  ? 'opacity-30 cursor-not-allowed text-gray-400' 
                  : isDarkMode
                    ? 'hover:bg-white/5 text-[#FF6B6B]'
                    : 'hover:bg-gray-100 text-[#FF6B6B]'
              }`}
            >
              <span>← {t('btn_back', nativeLanguage)}</span>
            </button>
            
            <span className="font-bold font-mono">
              {t('page_label', nativeLanguage)} {currentPageIdx + 1} / {pages.length}
            </span>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (currentPageIdx < maxUnlockedPageIdx) {
                  if (currentPageIdx < pages.length - 1) {
                    setCurrentPageIdx(prev => prev + 1);
                    scrollToTop();
                  }
                }
              }}
              disabled={currentPageIdx >= maxUnlockedPageIdx}
              className={`p-1.5 px-3 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
                currentPageIdx >= maxUnlockedPageIdx 
                  ? 'opacity-30 cursor-not-allowed text-gray-400' 
                  : isDarkMode
                    ? 'hover:bg-white/5 text-[#4ECDC4]'
                    : 'hover:bg-gray-100 text-[#4ECDC4]'
              }`}
            >
              <span>{t('reading_next_page_btn', nativeLanguage)}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* FLOATING DICTIONARY AND STUDY DRAWER HUD ON WORD SELECTION */}
      <AnimatePresence>
        {selectedDictWord && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const isInteractive = target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select');
              if (!isInteractive) {
                setSelectedDictWord(null);
                setClickedWord(null);
              } else {
                e.stopPropagation();
              }
            }}
            className={`fixed bottom-[110px] left-1/2 -translate-x-1/2 w-[90%] max-w-[640px] border-2 rounded-[24px] p-5 z-45 flex flex-col gap-4 select-none shadow-xl transition-colors ${
              isDarkMode 
                ? 'bg-[#1A1A1E] border-[#2A2A30] text-[#E6E6E6]' 
                : 'bg-white border-[#FFE66D] text-[#2D3436]'
            }`}
          >
            {/* Context word and English label */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-gray-400 tracking-widest block mb-1">
                  {t('dict_selected_word', nativeLanguage)}
                </span>
                <div className="flex items-center gap-2">
                  <h4 className={`text-2xl font-bold font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                    {selectedDictWord.word}
                  </h4>
                  <button
                    onClick={() => speakWordAloud(selectedDictWord.word)}
                    className="p-1 rounded-full text-[#FF6B6B] hover:bg-[#FFE66D]/20 transition-colors cursor-pointer"
                    title={t('dict_listen_pronunciation', nativeLanguage)}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Right side controls and daily limit badge */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-xs font-bold px-2 py-0.5 rounded-md border"
                    style={{
                      color: getLevelColor(selectedDictWord.level),
                      borderColor: hexToRgba(getLevelColor(selectedDictWord.level), 0.3),
                      backgroundColor: hexToRgba(getLevelColor(selectedDictWord.level), 0.1)
                    }}
                  >
                    {getFormattedLevel(selectedDictWord.level, nativeLanguage)}
                  </span>
                  <button
                    onClick={() => setSelectedDictWord(null)}
                    className={`p-1 px-2.5 rounded-lg font-bold text-xs cursor-pointer ${
                      isDarkMode ? 'bg-[#2A2A30] text-gray-300 hover:bg-[#343A40]' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                    }`}
                  >
                    {t('btn_close', nativeLanguage).toUpperCase()}
                  </button>
                </div>

                {ENABLE_TRANSLATION_LIMITS && !stats?.isPremium && (
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/25 text-center inline-flex flex-col items-center justify-center leading-tight">
                    {nativeLanguage === 'tr' ? (
                      <>
                        <span>⚠️ Bugün için {Math.max(0, 300 - wordLookupsToday)} kelime</span>
                        <span className="block mt-0.5">hakkınız kaldı</span>
                      </>
                    ) : (
                      <span>⚠️ {t('dict_lookups_left', nativeLanguage).replace('{count}', String(Math.max(0, 300 - wordLookupsToday)))}</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className={`h-[1px] ${isDarkMode ? 'bg-gray-800' : 'bg-[#FFE66D]/50'}`} />

            {/* Turkish Translation Area */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 tracking-widest block mb-1">
                {t('translation_header', nativeLanguage)}
              </span>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold leading-normal font-headline-lg text-[#FF6B6B]">
                  {selectedDictWord.translation}
                </p>
                <button
                  onClick={() => speakTranslationAloud(selectedDictWord.translation)}
                  className="p-1 rounded-full text-[#4ECDC4] hover:bg-[#4ECDC4]/10 transition-colors cursor-pointer"
                  title={t('listen_meaning', nativeLanguage)}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              {selectedDictWord.notes && (
                <p className="text-xs text-gray-400 mt-1.5 italic font-light block">
                  {selectedDictWord.notes}
                </p>
              )}
            </div>

            {/* Bottom Actions Row */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={toggleWordSave}
                disabled={isTranslating}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isWordSaved(selectedDictWord.word)
                    ? 'bg-[#4ECDC4]/15 text-[#4ECDC4] border-2 border-[#4ECDC4] hover:bg-[#4ECDC4]/20'
                    : isTranslating
                      ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed opacity-70 border border-transparent'
                      : 'bg-[#FF6B6B] text-white hover:bg-[#e05a5a] shadow-md shadow-[#FF6B6B]/20'
                }`}
              >
                {isWordSaved(selectedDictWord.word) ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-[#4ECDC4] fill-[#4ECDC4]" />
                    <span>{t('dict_saved_success', nativeLanguage)}</span>
                  </>
                ) : isTranslating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                    <span>{t('translating_word', nativeLanguage)}</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>{t('dict_save_to_vocab', nativeLanguage)}</span>
                  </>
                )}
              </button>

              {/* Share translation without custom alarm dialogs */}
              <button
                onClick={handleShareTranslation}
                className={`w-12 h-12 border-2 rounded-xl flex items-center justify-center text-[#FF6B6B] transition-colors cursor-pointer ${
                  isDarkMode ? 'border-[#2A2A30] hover:bg-white/5' : 'border-[#FFE66D] hover:bg-[#FFFBF0]'
                }`}
                title={t('dict_share_word', nativeLanguage)}
              >
                <Share2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING SENTENCE TRANSLATION MODAL (Viewport Centered Overlay) */}
      <AnimatePresence>
        {activeSentenceTr && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-55 flex items-center justify-center p-4 cursor-pointer"
            onClick={closeSentenceTrSafely}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className={`w-[90%] max-w-[340px] shadow-2xl border-2 rounded-2xl p-4.5 flex flex-col gap-3 text-left relative cursor-pointer ${
                isDarkMode
                  ? 'bg-[#151518] border-[#4ECDC4]/80 text-white shadow-black/95'
                  : 'bg-white border-[#FF6B6B]/80 text-slate-800 shadow-slate-300'
              }`}
              onClick={closeSentenceTrSafely}
            >
              {/* Header label */}
              <div className="flex items-center justify-between border-b border-gray-400/15 pb-2 select-none w-full">
                <span className="text-[10px] font-bold text-[#FF6B6B] tracking-wider font-headline-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
                  {t('translating_sentence', nativeLanguage).toLocaleUpperCase(nativeLanguage === 'tr' ? 'tr-TR' : 'en-US')}
                </span>
                <span className="text-gray-400 text-[10px] font-bold font-headline-lg">
                  {t('btn_close', nativeLanguage)} [✕]
                </span>
              </div>
              
              {/* Remaining limit badge */}
              {ENABLE_TRANSLATION_LIMITS && !stats?.isPremium && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/25 text-[9px] font-bold select-none w-fit">
                  ⚠️ {t('sentence_trans_left', nativeLanguage).replace('{count}', String(Math.max(0, 200 - sentenceTransToday)))}
                </div>
              )}
              
              {/* Body: Translation strictly on top, English sentence below */}
              <div className="space-y-2 text-left">
                {/* Turkish Translation on top */}
                <div className={`text-[13px] sm:text-[14px] font-extrabold leading-relaxed block ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  {isTranslatingSentence || !activeSentenceTr.textTr ? (
                    <div className="flex items-center gap-2 text-gray-400 select-none">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span>{t('translating_sentence', nativeLanguage)}</span>
                    </div>
                  ) : (
                    activeSentenceTr.textTr
                  )}
                </div>
                
                {/* English original text below */}
                <div className={`text-[13px] sm:text-[14px] font-extrabold leading-relaxed block italic border-t border-gray-400/10 pt-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-slate-500'
                }`}>
                  {activeSentenceTr.textEn}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Limit Reached Premium Warning Modal */}
      <AnimatePresence>
        {showLimitReachedModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-55 flex items-center justify-center p-4" onClick={() => setShowLimitReachedModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className={`w-full max-w-[340px] rounded-3xl p-6 border-2 transition-all relative ${
                isDarkMode 
                  ? 'bg-[#1A1A1E] border-[#2A2A30] text-white shadow-2xl shadow-black/80' 
                  : 'bg-white border-[#FFE66D] text-gray-800 shadow-2xl shadow-slate-200'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4 pt-2">
                <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20">
                  <Crown className="w-8 h-8 fill-amber-500 text-amber-500" />
                </div>
                
                <h3 className="text-base font-bold font-headline-lg text-amber-500 leading-snug">
                  {showLimitReachedModal === 'word' 
                    ? t('limit_reached_title_word', nativeLanguage) 
                    : t('limit_reached_title_sentence', nativeLanguage)}
                </h3>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                  {showLimitReachedModal === 'word' 
                    ? t('limit_reached_desc_word', nativeLanguage) 
                    : t('limit_reached_desc_sentence', nativeLanguage)}
                </p>
                
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const percentage = Math.round(((currentPageIdx + 1) / pages.length) * 100);
                      onGoToPremium(percentage, currentPageIdx + 1, pages.length);
                      setShowLimitReachedModal(null);
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 animate-pulse"
                  >
                    <Crown className="w-4 h-4 fill-white text-white" />
                    {t('limit_btn_premium', nativeLanguage)}
                  </button>
                  
                  <button
                    onClick={() => setShowLimitReachedModal(null)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'bg-[#2A2A30] hover:bg-[#343A40] text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-550'
                    }`}
                  >
                    {t('btn_maybe_later', nativeLanguage)}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quiz / Roadblock Modal Overlay */}
      <AnimatePresence>
        {(showQuizRoadblockModal || activeQuizQuestions !== null) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              onClick={(e) => e.stopPropagation()} 
              className={`w-full max-w-[420px] rounded-3xl p-6 border-2 transition-all relative ${
                isDarkMode 
                  ? 'bg-[#1A1A1E] border-[#2A2A30] text-white shadow-2xl shadow-black/80' 
                  : 'bg-white border-[#FFE66D] text-gray-800 shadow-2xl shadow-slate-200'
              }`}
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setShowQuizRoadblockModal(false);
                  setActiveQuizQuestions(null);
                  setActiveQuizCpIndex(null);
                  setActiveQuizQuestionIdx(0);
                  setIsQuizTranslating(false);
                }}
                className={`absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-200/20 transition-all cursor-pointer ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-550'
                }`}
                title="Kapat"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Out of Lives screen */}
              {(stats?.hearts ?? 5) === 0 && !stats?.isPremium ? (
                <div className="text-center space-y-4 pt-4">
                  <div className="w-14 h-14 bg-red-400/15 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <Heart className="w-8 h-8 fill-red-500 animate-pulse text-red-500" />
                  </div>
                  <h3 className="text-base font-bold text-red-500">{t('no_lives_title', nativeLanguage)}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                    {t('no_lives_desc', nativeLanguage)}
                  </p>
                  <div className="text-xs font-mono font-bold bg-[#FF6B6B]/10 text-[#FF6B6B] inline-block px-3 py-1 rounded-full">
                    {t('next_life_label', nativeLanguage)} {refillCountdown || t('status_refilling', nativeLanguage)}
                  </div>
                  
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        const percentage = Math.round(((currentPageIdx + 1) / pages.length) * 100);
                        onGoToPremium(percentage, currentPageIdx + 1, pages.length);
                        setShowQuizRoadblockModal(false);
                      }}
                      className="w-full py-2.5 px-4 bg-[#FF6B6B] hover:bg-[#e05a5a] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#FF6B6B]/20"
                    >
                      {t('out_of_lives_btn', nativeLanguage)}
                    </button>
                  </div>
                </div>
              ) : activeQuizQuestions === null ? (
                /* ROADBLOCK INTRO SCREEN */
                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-4 select-none">
                    <span className="w-9 h-9 bg-[#4ECDC4]/10 rounded-full flex items-center justify-center text-[#4ECDC4] shrink-0 font-extrabold text-sm">
                      {currentPageIdx + 1}
                    </span>
                    <div>
                      <h4 className="text-[9px] font-bold tracking-wider text-gray-400 block uppercase">
                        {t('roadblock_title', nativeLanguage).replace('{page}', String(currentPageIdx + 1))}
                      </h4>
                      <h3 className="font-bold text-base leading-snug">{t('roadblock_subtitle', nativeLanguage)}</h3>
                    </div>
                  </div>
                  
                  <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 mb-5">
                    {t('roadblock_desc', nativeLanguage)}
                  </p>
                  
                  <div className="flex justify-between items-center bg-[#FFE66D]/15 px-4 py-3 rounded-2xl border border-[#FFE66D]/45 mb-5 select-none">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                       {stats?.isPremium ? (
                         t('roadblock_lives_infinite', nativeLanguage)
                       ) : (
                         t('roadblock_lives_normal', nativeLanguage)
                       )}
                     </span>
                    <div className="flex items-center gap-1 font-bold text-xs text-[#FF6B6B]">
                      <Heart className="w-4 h-4 fill-[#FF6B6B]" />
                      <span>{stats?.isPremium ? '∞' : (stats?.hearts ?? 5)} {t('quiz_lives_label', nativeLanguage)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartCheckpointQuiz(currentPageIdx)}
                    className="w-full py-3 bg-[#FF6B6B] text-white rounded-xl text-sm font-bold hover:bg-[#e05a5a] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#FF6B6B]/20"
                  >
                    <span>{t('roadblock_btn_solve', nativeLanguage)}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {stats?.isPremium && (
                    <button
                      onClick={handleSkipQuiz}
                      className="w-full mt-3 py-3 bg-[#4ECDC4] text-white rounded-xl text-sm font-bold hover:bg-[#3db8af] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4ECDC4]/20"
                    >
                      <span>{t('roadblock_btn_skip', nativeLanguage)}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : isQuizTranslating ? (
                /* QUIZ PREPARATION LOADING STATE */
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center select-none animate-pulse">
                  <div className="w-10 h-10 rounded-full border-4 border-[#FF6B6B]/20 border-t-[#FF6B6B] animate-spin" />
                  <div className="space-y-1.5">
                    <p className={`text-sm font-bold font-headline-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {t('quiz_preparing_title', nativeLanguage)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {t('quiz_preparing_desc', nativeLanguage)}
                    </p>
                  </div>
                </div>
              ) : (
                /* ACTIVE INTERACTIVE QUIZ CARD */
                <div className="pt-2">
                  {/* Quiz status bar */}
                  <div className="flex justify-between items-center mb-4 select-none">
                    <span className="text-xs font-extrabold tracking-wider text-[#4ECDC4] font-headline-lg">
                      BARAJ SORUSU {activeQuizQuestionIdx + 1} / 5
                    </span>
                    <div className="flex items-center gap-3">
                      {/* Streak flame badge */}
                      <div 
                        className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border transition-all duration-300 ${
                          quizCorrectStreak > 0
                            ? 'text-amber-500 bg-amber-500/10 border-amber-500/20 scale-[1.04]'
                            : 'text-gray-400 bg-gray-100/10 border-gray-200/20'
                        }`}
                        title={t('quiz_streak_tooltip', nativeLanguage)}
                      >
                        <span>🔥</span>
                        <span>{t('quiz_streak_label', nativeLanguage).replace('{streak}', String(quizCorrectStreak))}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF6B6B]">
                        <Heart className="w-3.5 h-3.5 fill-[#FF6B6B]" />
                        <span>{stats?.isPremium ? '∞' : (stats?.hearts ?? 5)} {t('quiz_lives_label', nativeLanguage)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Dots */}
                  <div className="flex gap-1.5 mb-5 select-none">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                          i < activeQuizQuestionIdx
                            ? 'bg-[#4ECDC4]'
                            : i === activeQuizQuestionIdx
                              ? 'bg-[#FF6B6B] animate-pulse'
                              : 'bg-gray-300/60'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Timer Progress Bar */}
                  {!isQuizAnswered && (
                    <div className="mb-5 select-none">
                      <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                        <span className={
                          quizTimeLeft > 8 
                            ? 'text-emerald-500' 
                            : quizTimeLeft > 4 
                              ? 'text-amber-500 font-extrabold animate-pulse' 
                              : 'text-rose-500 font-extrabold animate-bounce'
                        }>
                          ⏱️ {t('quiz_timer', nativeLanguage).replace('{time}', String(quizTimeLeft))}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ease-linear ${
                            quizTimeLeft > 8 
                              ? 'bg-emerald-500' 
                              : quizTimeLeft > 4 
                                ? 'bg-amber-500' 
                                : 'bg-rose-500'
                          }`}
                          style={{ width: `${(quizTimeLeft / 15) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Question text */}
                  <div className="text-left mb-5">
                    <span className="text-xs text-gray-500 font-medium block mb-1.5">
                      {activeQuizQuestions[activeQuizQuestionIdx]?.type === 'fill_blank'
                        ? t('quiz_fill_blank_prompt', nativeLanguage)
                        : (t('quiz_meaning_prompt', nativeLanguage).charAt(0).toUpperCase() + t('quiz_meaning_prompt', nativeLanguage).slice(1))}
                    </span>
                    <h4 className="text-lg font-bold text-[#FF6B6B] leading-relaxed">
                      {activeQuizQuestions[activeQuizQuestionIdx]?.type === 'fill_blank' ? (
                        activeQuizQuestions[activeQuizQuestionIdx]?.question
                      ) : (
                        <span>&ldquo;{activeQuizQuestions[activeQuizQuestionIdx]?.word}&rdquo;</span>
                      )}
                    </h4>
                    {activeQuizQuestions[activeQuizQuestionIdx]?.hint && (
                      <p className={`text-xs mt-2.5 italic leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        💡 {activeQuizQuestions[activeQuizQuestionIdx]?.type === 'fill_blank' ? t('quiz_fill_blank_hint_prefix', nativeLanguage) : t('quiz_hint_prefix', nativeLanguage)} {activeQuizQuestions[activeQuizQuestionIdx]?.hint}
                      </p>
                    )}
                  </div>

                  {/* Options Grid */}
                  <div className="grid gap-2 text-left">
                    {activeQuizQuestions[activeQuizQuestionIdx]?.options.map((option: string, oIdx: number) => {
                      const isSelected = selectedQuizOption === oIdx;
                      const isCorrectOption = oIdx === activeQuizQuestions[activeQuizQuestionIdx].correctIndex;
                      
                      let btnStyle = isDarkMode 
                        ? 'bg-[#1A1A1E] border-gray-700 hover:bg-[#25252B] text-gray-300' 
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800';

                      if (isQuizAnswered) {
                        if (isCorrectOption) {
                          btnStyle = 'bg-emerald-500/25 border-emerald-500 text-emerald-500 font-bold';
                        } else if (isSelected) {
                          btnStyle = 'bg-red-500/25 border-red-500 text-red-500 font-bold';
                        } else {
                          btnStyle = 'opacity-40 border-transparent';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isQuizAnswered}
                          onClick={() => handleQuizOptionClick(oIdx)}
                          className={`p-3.5 rounded-xl border text-sm text-left transition-all flex items-center justify-between ${btnStyle} cursor-pointer`}
                        >
                          <span>{option}</span>
                          {isQuizAnswered && isCorrectOption && (
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                          )}
                          {isQuizAnswered && isSelected && !isCorrectOption && (
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quiz Next controls */}
                  {isQuizAnswered && (
                    <div className={`mt-5 pt-4 border-t border-dashed flex items-center justify-between ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <span className={`text-xs font-semibold ${
                        selectedQuizOption === activeQuizQuestions[activeQuizQuestionIdx].correctIndex
                          ? 'text-emerald-500'
                          : 'text-red-500 font-bold'
                      }`}>
                        {selectedQuizOption === null
                          ? (stats?.isPremium ? t('quiz_feedback_timeout_premium', nativeLanguage) : t('quiz_feedback_timeout_normal', nativeLanguage))
                          : selectedQuizOption === activeQuizQuestions[activeQuizQuestionIdx].correctIndex
                            ? t('quiz_feedback_correct', nativeLanguage)
                            : (stats?.isPremium ? t('quiz_feedback_incorrect_premium', nativeLanguage) : t('quiz_feedback_incorrect_normal', nativeLanguage))}
                      </span>
                      
                      {/* Show next button if answer was incorrect or timed out, correct answers auto-advance */}
                      {(selectedQuizOption === null || selectedQuizOption !== activeQuizQuestions[activeQuizQuestionIdx].correctIndex) && (
                        <button
                          onClick={handleQuizNext}
                          className="py-2.5 px-5 bg-[#4ECDC4] hover:bg-[#3db8af] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>{activeQuizQuestionIdx === 4 ? t('btn_complete', nativeLanguage) : t('game_next_question', nativeLanguage)}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {stats?.isPremium && (
                    <button
                      onClick={handleSkipQuiz}
                      className="w-full mt-4 py-2.5 bg-gray-500/10 border border-gray-500/20 hover:bg-gray-500/20 text-[#4ECDC4] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{t('roadblock_btn_skip', nativeLanguage)}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
