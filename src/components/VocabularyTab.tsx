import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Brain, Search, Volume2, Trash2, BookOpen, Bookmark, Star, Zap, Puzzle, Link2, CheckCircle2, XCircle, RotateCcw, Trophy, ArrowRight, ChevronLeft, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VocabularyWord, Book, Paragraph, getLevelColor, hexToRgba } from '../types';
import { speakNative } from '../services/tts';
import { OFFLINE_DICTIONARY } from '../dictionary';
import { GLOBAL_DICTIONARY } from '../data';
import { EASY_WORDS_1000_SET } from '../common_easy_words';
import { SUPPORTED_LANGUAGES, LanguageCode, t, translateWithGoogleClient } from '../i18n';
import pretranslatedStories from '../pretranslated_stories.json';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pickRandom<T>(arr: T[], n: number): T[] {
  // Extra shuffle pass for better randomness
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
type FillDifficulty = 'easy' | 'medium' | 'hard';

// Shared difficulty level configuration for both games
const GAME_DIFF_CONFIG: { key: FillDifficulty; label: string; sub: string; color: string }[] = [
  { key: 'easy',   label: 'Kolay', sub: 'A1–A2', color: '#22C55E' },
  { key: 'medium', label: 'Orta',  sub: 'B1–B2', color: '#EAB308' },
  { key: 'hard',   label: 'Zor',   sub: 'C1',    color: '#EF4444' },
];

const PROPER_NAMES_SET = new Set([
  'cinderella', 'aladdin', 'peter', 'pan', 'wendy', 'hook', 'tinker', 'bell', 'darling', 'sinbad',
  'midas', 'marigold', 'bacchus', 'dorothy', 'toto', 'oz', 'scarecrow', 'dummling', 'piper', 'hamelin',
  'rumpelstiltskin', 'gulliver', 'lilliput', 'lilliputians', 'blefuscu', 'robinson', 'crusoe', 'friday',
  'gatsby', 'nick', 'daisy', 'tom', 'jordan', 'myrtle', 'wilson', 'jim', 'hawkins', 'silver', 'billy',
  'bones', 'smollett', 'trelawney', 'livesey', 'ben', 'gunn', 'frankenstein', 'victor', 'elizabeth',
  'clerval', 'dracula', 'jonathan', 'harker', 'mina', 'murray', 'van', 'helsing', 'lucy', 'westenra',
  'sherlock', 'holmes', 'watson', 'john', 'hudson', 'lestrade', 'moriarty', 'adler', 'irene', 'odysseus',
  'penelope', 'telemachus', 'athena', 'poseidon', 'cyclops', 'polyphemus', 'circe', 'calypso', 'sirens',
  'mowgli', 'baloo', 'bagheera', 'shere', 'khan', 'kaa', 'akela', 'raksha', 'hathi', 'gerda', 'kay',
  'snow', 'queen', 'marianne', 'connell', 'goldilocks', 'puss', 'boots', 'carabas', 'marquis', 'red',
  'riding', 'hood', 'wolf', 'granny', 'beauty', 'beast', 'belle', 'gaston', 'alice', 'pinocchio',
  'geppetto', 'romeo', 'juliet', 'hamlet', 'othello', 'macbeth', 'jack', 'jill', 'hansel', 'gretel',
  'rapunzel', 'snowwhite', 'sleeping', 'beauty', 'beast', 'ursula', 'ariel', 'mulan', 'pocahontas',
  'tarzan', 'jane', 'hercules', 'zeus', 'hades', 'thor', 'loki', 'odin', 'arthur', 'merlin',
  'lancelot', 'guinevere', 'excalibur', 'robin', 'hood', 'watson', 'lestrade', 'moriarty',
  'london', 'paris', 'new', 'york', 'england', 'america', 'europe', 'asia', 'earth', 'mars', 'jupiter'
]);

const isCommonEnglishWord = (w: string): boolean => {
  if (!w) return false;
  const clean = w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”指標‘’\[\]{}<>|\\+]/g, "").trim();
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
  return commonWords.includes(clean);
};

const isProperNoun = (w: string): boolean => {
  if (!w) return false;
  const trimmed = w.trim();
  return /^[A-Z]/.test(trimmed) && !isCommonEnglishWord(trimmed);
};

const getLanguageFlag = (lang: LanguageCode): string => {
  const flags: Record<LanguageCode, string> = {
    tr: '🇹🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪', fr: '🇫🇷',
    it: '🇮🇹', pt: '🇵🇹', ru: '🇷🇺', ar: '🇸🇦', zh: '🇨🇳', hi: '🇮🇳', ja: '🇯🇵'
  };
  return flags[lang] || '🌐';
};

const getNativeWordTranslation = (wordEn: string, trFallback: string, nativeLanguage: LanguageCode, bookId?: string, savedWordLang?: string): string => {
  if (nativeLanguage === 'tr') {
    const wLower = wordEn.toLowerCase().trim();
    if (OFFLINE_DICTIONARY[wLower]) {
      return OFFLINE_DICTIONARY[wLower].tr;
    }
    if (GLOBAL_DICTIONARY[wLower]) {
      return GLOBAL_DICTIONARY[wLower];
    }
    if (savedWordLang === 'tr' || !savedWordLang) {
      return trFallback;
    }
  }

  if (savedWordLang && savedWordLang === nativeLanguage) {
    return trFallback;
  }
  
  if (nativeLanguage === 'tr') return trFallback;
  
  const wLower = wordEn.toLowerCase().trim();

  // 1. Check local storage cache of past dynamic translations for this language code
  const cacheKeyObj = `story_word_translations_cache_${nativeLanguage}`;
  const cacheJSON = localStorage.getItem(cacheKeyObj);
  if (cacheJSON) {
    try {
      const cache = JSON.parse(cacheJSON);
      if (cache[wLower] && cache[wLower].translation) {
        const val = cache[wLower].translation;
        const isTrLeak = (
          (OFFLINE_DICTIONARY[wLower] && OFFLINE_DICTIONARY[wLower].tr.toLowerCase().trim() === val.toLowerCase().trim()) ||
          (GLOBAL_DICTIONARY[wLower] && GLOBAL_DICTIONARY[wLower].toLowerCase().trim() === val.toLowerCase().trim())
        );
        if (isTrLeak) {
          delete cache[wLower];
          localStorage.setItem(cacheKeyObj, JSON.stringify(cache));
        } else {
          return val;
        }
      }
    } catch (e) {}
  }
  
  if (bookId) {
    const offlineBook = pretranslatedStories[bookId as keyof typeof pretranslatedStories];
    if (offlineBook && offlineBook.words && offlineBook.words[wordEn as keyof typeof offlineBook.words]) {
      const offlineWord = offlineBook.words[wordEn as keyof typeof offlineBook.words];
      if (offlineWord[nativeLanguage as keyof typeof offlineWord]) {
        return offlineWord[nativeLanguage as keyof typeof offlineWord] as string;
      }
    }
  }
  
  const cacheKey = `linguist_dict_word_${wLower}_${nativeLanguage}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed.translation) {
        const val = parsed.translation;
        const isTrLeak = (
          (OFFLINE_DICTIONARY[wLower] && OFFLINE_DICTIONARY[wLower].tr.toLowerCase().trim() === val.toLowerCase().trim()) ||
          (GLOBAL_DICTIONARY[wLower] && GLOBAL_DICTIONARY[wLower].toLowerCase().trim() === val.toLowerCase().trim())
        );
        if (isTrLeak) {
          localStorage.removeItem(cacheKey);
        } else {
          return val;
        }
      }
    } catch (e) {}
  }
  
  for (const bId in pretranslatedStories) {
    const offlineBook = pretranslatedStories[bId as keyof typeof pretranslatedStories];
    if (offlineBook && offlineBook.words && offlineBook.words[wordEn as keyof typeof offlineBook.words]) {
      const offlineWord = offlineBook.words[wordEn as keyof typeof offlineBook.words];
      if (offlineWord[nativeLanguage as keyof typeof offlineWord]) {
        return offlineWord[nativeLanguage as keyof typeof offlineWord] as string;
      }
    }
  }
  
  return wordEn; // Fallback to English word instead of Turkish
};

const getNativeSentenceTranslation = (exampleEn: string | undefined, trFallback: string, nativeLanguage: LanguageCode, savedWordLang?: string): string => {
  if (nativeLanguage === 'tr') {
    if (savedWordLang === 'tr' || !savedWordLang) {
      return trFallback;
    }
  }

  if (savedWordLang && savedWordLang === nativeLanguage) {
    return trFallback;
  }

  if (nativeLanguage === 'tr') return trFallback;
  if (!exampleEn) return '';

  const key = exampleEn.toLowerCase().trim();
  const gameCacheKey = `linguist_trans_sentence_game_${key}_${nativeLanguage}`;
  const gameCached = localStorage.getItem(gameCacheKey);
  if (gameCached) return gameCached;

  const cacheKey = `linguist_trans_sentence_example_${key}_${nativeLanguage}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  return exampleEn; // Fallback to English sentence instead of Turkish
};

const getNativeParagraphTranslation = (p: Paragraph, book: Book, nativeLanguage: LanguageCode): string => {
  if (nativeLanguage === 'tr') return p.textTr;
  
  const offlineBook = pretranslatedStories[book.id as keyof typeof pretranslatedStories];
  if (offlineBook && offlineBook.paragraphs) {
    let absoluteParaIdx = -1;
    let currentAbsoluteIdx = 0;
    for (const ch of book.chapters) {
      const pIdx = ch.paragraphs.indexOf(p);
      if (pIdx !== -1) {
        absoluteParaIdx = currentAbsoluteIdx + pIdx;
        break;
      }
      currentAbsoluteIdx += ch.paragraphs.length;
    }
    if (absoluteParaIdx !== -1 && offlineBook.paragraphs[absoluteParaIdx]) {
      const offlineParagraph = offlineBook.paragraphs[absoluteParaIdx];
      if (offlineParagraph[nativeLanguage as keyof typeof offlineParagraph]) {
        return offlineParagraph[nativeLanguage as keyof typeof offlineParagraph] as string;
      }
    }
  }
  
  return p.textEn; // Fallback to English paragraph instead of Turkish
};

interface FillQuestion { sentence: string; sentenceTr: string; answer: string; options: string[] }

// Precompute words by level from OFFLINE_DICTIONARY for fast O(1) distractor lookup
const DICTIONARY_WORDS_BY_LEVEL: Record<CefrLevel, string[]> = {
  A1: [],
  A2: [],
  B1: [],
  B2: [],
  C1: []
};

Object.entries(OFFLINE_DICTIONARY).forEach(([word, item]) => {
  const lvl = item.level as CefrLevel;
  if (DICTIONARY_WORDS_BY_LEVEL[lvl] && word.length > 2 && word.length < 14) {
    DICTIONARY_WORDS_BY_LEVEL[lvl].push(word);
  }
});

function getDistractors(levels: CefrLevel[], excludeWord: string): string[] {
  const candidates: string[] = [];
  levels.forEach(lvl => {
    const words = DICTIONARY_WORDS_BY_LEVEL[lvl];
    if (words) {
      candidates.push(...words);
    }
  });

  const excludeLower = excludeWord.toLowerCase();
  const picked: string[] = [];
  const len = candidates.length;
  if (len < 3) return candidates.filter(w => w !== excludeLower).slice(0, 3);

  const seen = new Set<number>();
  let attempts = 0;
  while (picked.length < 3 && attempts < 100) {
    attempts++;
    const idx = Math.floor(Math.random() * len);
    if (seen.has(idx)) continue;
    seen.add(idx);
    const word = candidates[idx];
    if (word !== excludeLower) {
      picked.push(word);
    }
  }
  return picked;
}

function getDynamicSentencesFromBooks(books: Book[], levels: CefrLevel[], nativeLanguage: LanguageCode): FillQuestion[] {
  const list: FillQuestion[] = [];
  const seen = new Set<string>();
  const MAX_BOOK_SENTENCES = 50; // Cap search to keep loading instantaneous

  // Randomize books order to distribute the source sentences nicely
  const shuffledBooks = [...books].sort(() => 0.5 - Math.random());

  for (const book of shuffledBooks) {
    if (list.length >= MAX_BOOK_SENTENCES) break;
    const bookLvl = book.level as CefrLevel;
    if (!levels.includes(bookLvl)) continue;

    // Randomize chapters order
    const shuffledChapters = [...book.chapters].sort(() => 0.5 - Math.random());

    for (const chapter of shuffledChapters) {
      if (list.length >= MAX_BOOK_SENTENCES) break;

      // Randomize paragraphs order
      const shuffledParagraphs = [...chapter.paragraphs].sort(() => 0.5 - Math.random());

      for (const p of shuffledParagraphs) {
        if (list.length >= MAX_BOOK_SENTENCES) break;
        if (!p.words || p.words.length === 0) continue;
        
        const sentencesEn = p.textEn.split(/(?<=[.!?])\s+/);
        const nativeParaText = getNativeParagraphTranslation(p, book, nativeLanguage);
        const sentencesNative = nativeParaText.split(/(?<=[.!?])\s+/);

        for (let idx = 0; idx < sentencesEn.length; idx++) {
          if (list.length >= MAX_BOOK_SENTENCES) break;

          const sentEn = sentencesEn[idx];
          const cleanSent = sentEn.trim();
          
          // Üç nokta içeren, üç nokta veya eksi işaretiyle başlayan cümleleri es geç (tam cümle olmaları için)
          if (cleanSent.includes('...') || cleanSent.includes('…') || cleanSent.startsWith('-') || /^[.·…\-\s]/.test(cleanSent) || /^[“"‘'][.·…]/.test(cleanSent)) {
            continue;
          }

          const sentNative = sentencesNative[idx] || nativeParaText;
          const wordCount = cleanSent.split(/\s+/).filter(Boolean).length;
          
          // Cümle uzunluğunu 5 ile 13 kelime arası ile sınırla (maksimum 10-13 kelime)
          if (wordCount < 5 || wordCount > 13) continue;

          const shuffledWords = [...p.words].sort(() => 0.5 - Math.random());
          for (const w of shuffledWords) {
            const cleanW = w.en.replace(/[.,/#!$%^&*;:{}=\-_`~()?"''""''\[\]{}<>|\\+]/g, '').trim();
            if (cleanW.length < 3 || cleanW.length > 14) continue;
            if (isProperNoun(w.en) || PROPER_NAMES_SET.has(cleanW.toLowerCase()) || isCommonEnglishWord(cleanW)) continue;

            const cleanWLower = cleanW.toLowerCase();
            if (seen.has(cleanWLower)) continue;

            // Confirm true level with OFFLINE_DICTIONARY to prevent hard words in easy books
            const isEasy = levels.includes('A1') || levels.includes('A2');
            const dictItem = OFFLINE_DICTIONARY[cleanWLower];
            if (isEasy && !dictItem) continue; // Strict: only verified dictionary words in easy mode

            const actualLevel = dictItem ? (dictItem.level as CefrLevel) : bookLvl;
            if (!levels.includes(actualLevel)) continue;

            const regex = new RegExp('\\b' + cleanW.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '\\b', 'gi');
            if (regex.test(sentEn)) {
              const blanked = sentEn.replace(regex, '___');
              if (blanked === sentEn) continue;

              const distPool = getDistractors(levels, cleanWLower);
              if (distPool.length >= 3) {
                seen.add(cleanWLower);
                list.push({
                  sentence: blanked,
                  sentenceTr: sentNative,
                  answer: w.en,
                  options: pickRandom([w.en, ...distPool], 4),
                });
                break; // One word per sentence
              }
            }
          }
        }
      }
    }
  }
  return list;
}

// ─── Synonym Match fallback pools by level ────────────────────────────────────
const LEVEL_PAIRS: Record<CefrLevel, { en: string; tr: string }[]> = {
  A1: [
    { en: 'cat', tr: 'kedi' }, { en: 'dog', tr: 'köpek' }, { en: 'house', tr: 'ev' },
    { en: 'book', tr: 'kitap' }, { en: 'water', tr: 'su' }, { en: 'food', tr: 'yemek' },
    { en: 'tree', tr: 'ağaç' }, { en: 'sun', tr: 'güneş' }, { en: 'moon', tr: 'ay' },
    { en: 'star', tr: 'yıldız' }, { en: 'bird', tr: 'kuş' }, { en: 'fish', tr: 'balık' },
    { en: 'door', tr: 'kapı' }, { en: 'road', tr: 'yol' }, { en: 'fire', tr: 'ateş' },
    { en: 'hand', tr: 'el' }, { en: 'eye', tr: 'göz' }, { en: 'head', tr: 'baş' },
    { en: 'name', tr: 'isim' }, { en: 'day', tr: 'gün' }, { en: 'time', tr: 'zaman' },
    { en: 'night', tr: 'gece' }, { en: 'good', tr: 'iyi' }, { en: 'bad', tr: 'kötü' },
    { en: 'big', tr: 'büyük' }, { en: 'small', tr: 'küçük' }, { en: 'new', tr: 'yeni' },
    { en: 'old', tr: 'eski' }, { en: 'red', tr: 'kırmızı' }, { en: 'blue', tr: 'mavi' },
  ],
  A2: [
    { en: 'happy', tr: 'mutlu' }, { en: 'angry', tr: 'kızgın' }, { en: 'hungry', tr: 'aç' },
    { en: 'tired', tr: 'yorgun' }, { en: 'busy', tr: 'meşgul' }, { en: 'clean', tr: 'temiz' },
    { en: 'dirty', tr: 'kirli' }, { en: 'strong', tr: 'güçlü' }, { en: 'weak', tr: 'zayıf' },
    { en: 'fast', tr: 'hızlı' }, { en: 'slow', tr: 'yavaş' }, { en: 'early', tr: 'erken' },
    { en: 'late', tr: 'geç' }, { en: 'near', tr: 'yakın' }, { en: 'far', tr: 'uzak' },
    { en: 'free', tr: 'özgür' }, { en: 'safe', tr: 'güvenli' }, { en: 'quiet', tr: 'sessiz' },
    { en: 'hot', tr: 'sıcak' }, { en: 'cold', tr: 'soğuk' }, { en: 'dark', tr: 'karanlık' },
    { en: 'open', tr: 'açık' }, { en: 'teach', tr: 'öğretmek' }, { en: 'learn', tr: 'öğrenmek' },
    { en: 'travel', tr: 'seyahat etmek' }, { en: 'cook', tr: 'pişirmek' }, { en: 'dream', tr: 'hayal kurmak' },
    { en: 'watch', tr: 'izlemek' }, { en: 'listen', tr: 'dinlemek' }, { en: 'speak', tr: 'konuşmak' },
  ],
  B1: [
    { en: 'ancient', tr: 'kadim' }, { en: 'journey', tr: 'yolculuk' }, { en: 'wisdom', tr: 'bilgelik' },
    { en: 'courage', tr: 'cesaret' }, { en: 'shadow', tr: 'gölge' }, { en: 'forest', tr: 'orman' },
    { en: 'mystery', tr: 'gizem' }, { en: 'discover', tr: 'keşfetmek' }, { en: 'promise', tr: 'söz vermek' },
    { en: 'believe', tr: 'inanmak' }, { en: 'remember', tr: 'hatırlamak' }, { en: 'beautiful', tr: 'güzel' },
    { en: 'danger', tr: 'tehlike' }, { en: 'treasure', tr: 'hazine' }, { en: 'freedom', tr: 'özgürlük' },
    { en: 'silence', tr: 'sessizlik' }, { en: 'gentle', tr: 'nazik' }, { en: 'brave', tr: 'cesur' },
    { en: 'lonely', tr: 'yalnız' }, { en: 'curious', tr: 'meraklı' }, { en: 'hidden', tr: 'gizli' },
    { en: 'suggest', tr: 'önermek' }, { en: 'depend', tr: 'bağlı olmak' }, { en: 'mention', tr: 'bahsetmek' },
    { en: 'connect', tr: 'bağlamak' }, { en: 'improve', tr: 'geliştirmek' }, { en: 'provide', tr: 'sağlamak' },
    { en: 'achieve', tr: 'başarmak' }, { en: 'admire', tr: 'hayranlık duymak' }, { en: 'wander', tr: 'dolaşmak' },
  ],
  B2: [
    { en: 'eloquent', tr: 'belagatlı' }, { en: 'ambiguous', tr: 'belirsiz' }, { en: 'diligent', tr: 'çalışkan' },
    { en: 'inevitable', tr: 'kaçınılmaz' }, { en: 'substantial', tr: 'önemli' }, { en: 'reluctant', tr: 'isteksiz' },
    { en: 'acknowledge', tr: 'kabullenmek' }, { en: 'assumption', tr: 'varsayım' }, { en: 'circumstance', tr: 'koşul' },
    { en: 'consequence', tr: 'sonuç' }, { en: 'establish', tr: 'kurmak' }, { en: 'fundamental', tr: 'temel' },
    { en: 'genuine', tr: 'gerçek' }, { en: 'influence', tr: 'etki' }, { en: 'maintain', tr: 'sürdürmek' },
    { en: 'obvious', tr: 'açık' }, { en: 'perceive', tr: 'algılamak' }, { en: 'relevant', tr: 'ilgili' },
    { en: 'resolve', tr: 'çözmek' }, { en: 'skeptical', tr: 'şüpheci' }, { en: 'versatile', tr: 'çok yönlü' },
    { en: 'vulnerable', tr: 'savunmasız' }, { en: 'worthwhile', tr: 'değerli' }, { en: 'anticipate', tr: 'öngörmek' },
    { en: 'contradict', tr: 'çelişmek' }, { en: 'emphasize', tr: 'vurgulamak' }, { en: 'persistent', tr: 'ısrarcı' },
    { en: 'thorough', tr: 'kapsamlı' }, { en: 'elaborate', tr: 'ayrıntılı' }, { en: 'unanimous', tr: 'oybirliğiyle' },
  ],
  C1: [
    { en: 'ephemeral', tr: 'geçici' }, { en: 'benevolent', tr: 'iyiliksever' }, { en: 'audacious', tr: 'cüretkar' },
    { en: 'arduous', tr: 'çetin' }, { en: 'austere', tr: 'sade' }, { en: 'apathy', tr: 'duyarsızlık' },
    { en: 'acrid', tr: 'keskin' }, { en: 'agility', tr: 'çeviklik' }, { en: 'alchemy', tr: 'simya' },
    { en: 'anarchy', tr: 'anarşi' }, { en: 'apprehension', tr: 'endişe' }, { en: 'aversion', tr: 'tiksinti' },
    { en: 'clandestine', tr: 'gizli' }, { en: 'cogent', tr: 'ikna edici' }, { en: 'disparate', tr: 'farklı' },
    { en: 'elusive', tr: 'zor yakalanır' }, { en: 'enigmatic', tr: 'gizemli' }, { en: 'fervent', tr: 'ateşli' },
    { en: 'immutable', tr: 'değişmez' }, { en: 'inherent', tr: 'doğasında olan' }, { en: 'meticulous', tr: 'titiz' },
    { en: 'nuance', tr: 'nüans' }, { en: 'obsolete', tr: 'eskimiş' }, { en: 'paradox', tr: 'paradoks' },
    { en: 'prudent', tr: 'tedbirli' }, { en: 'resilient', tr: 'dirençli' }, { en: 'tenacious', tr: 'inatçı' },
    { en: 'veracious', tr: 'dürüst' }, { en: 'vindicate', tr: 'haklı çıkarmak' }, { en: 'zenith', tr: 'zirve' },
  ],
};

// ─── Fill in the Blanks sentence banks by difficulty ─────────────────────────
interface RawSentence { en: string; tr: string; word: string; distractors: string[] }

const FILL_EASY: RawSentence[] = [
  { en: 'The ___ shone brightly over the mountains.', tr: 'Dağların üzerinde ___ parlak bir şekilde parladı.', word: 'sun', distractors: ['moon', 'star', 'cloud'] },
  { en: 'She opened the ___ and stepped inside.', tr: '___ açtı ve içeri girdi.', word: 'door', distractors: ['window', 'book', 'box'] },
  { en: 'The ___ sang a beautiful song in the morning.', tr: 'Sabahleyin ___ güzel bir şarkı söyledi.', word: 'bird', distractors: ['cat', 'dog', 'fish'] },
  { en: 'The children played in the ___ all afternoon.', tr: 'Çocuklar bütün öğleden sonra ___ oynadı.', word: 'garden', distractors: ['school', 'kitchen', 'market'] },
  { en: 'She wore a ___ dress to the party.', tr: 'Partiye ___ elbise giydi.', word: 'red', distractors: ['blue', 'old', 'wet'] },
  { en: 'The ___ fell gently on the quiet streets.', tr: '___ sessiz sokaklara hafifçe düştü.', word: 'snow', distractors: ['rain', 'leaf', 'dust'] },
  { en: 'The old man sat by the ___ and read his book.', tr: 'Yaşlı adam ___ yanında oturdu ve kitabını okudu.', word: 'fire', distractors: ['river', 'window', 'table'] },
  { en: 'The baker made fresh ___ every single morning.', tr: 'Fırıncı her sabah taze ___ yaptı.', word: 'bread', distractors: ['cake', 'soup', 'rice'] },
  { en: 'The ___ roared loudly in the dark jungle.', tr: '___ karanlık ormanda yüksek sesle kükredi.', word: 'lion', distractors: ['deer', 'bird', 'fish'] },
  { en: 'She smiled and waved her ___ goodbye.', tr: '___ sallayarak gülümsedi ve veda etti.', word: 'hand', distractors: ['head', 'foot', 'hat'] },
  { en: 'He kept his old letters in a wooden ___.', tr: 'Eski mektuplarını tahta bir ___ içinde sakladı.', word: 'box', distractors: ['cup', 'bag', 'pot'] },
  { en: 'Every morning she drank a cup of hot ___.', tr: 'Her sabah bir fincan sıcak ___ içti.', word: 'tea', distractors: ['milk', 'soup', 'juice'] },
  { en: 'They built a small ___ near the river bank.', tr: 'Nehir kıyısına yakın küçük bir ___ inşa ettiler.', word: 'house', distractors: ['bridge', 'tower', 'boat'] },
  { en: 'The river ___ gently through the peaceful valley.', tr: 'Nehir sakin vadiden nazikçe ___.', word: 'flowed', distractors: ['jumped', 'stopped', 'froze'] },
  { en: 'He always tells the ___ no matter what happens.', tr: 'Ne olursa olsun her zaman ___ söyler.', word: 'truth', distractors: ['time', 'story', 'joke'] },
  { en: 'The ___ barked loudly when the stranger arrived.', tr: 'Yabancı geldiğinde ___ yüksek sesle havladı.', word: 'dog', distractors: ['cat', 'bird', 'horse'] },
  { en: 'She read a ___ before going to sleep each night.', tr: 'Her gece uyumadan önce bir ___ okudu.', word: 'book', distractors: ['song', 'game', 'film'] },
  { en: 'The ___ was so bright that it lit up the whole room.', tr: '___ o kadar parlaktı ki tüm odayı aydınlattı.', word: 'lamp', distractors: ['fire', 'moon', 'window'] },
  { en: 'The children ran to the ___ to play after school.', tr: 'Çocuklar okuldan sonra oynamak için ___ koştular.', word: 'park', distractors: ['shop', 'river', 'house'] },
  { en: 'He put on his coat because the ___ was very cold.', tr: 'Paltosunu giydi çünkü ___ çok soğuktu.', word: 'weather', distractors: ['water', 'night', 'ground'] },
  { en: 'She picked a beautiful ___ from the garden.', tr: 'Bahçeden güzel bir ___ kopardı.', word: 'flower', distractors: ['stone', 'leaf', 'branch'] },
  { en: 'The ___ was full of apples and oranges.', tr: '___ elma ve portakallarla doluydu.', word: 'basket', distractors: ['box', 'bag', 'cup'] },
  { en: 'He jumped over the ___ to get to the other side.', tr: 'Karşı tarafa geçmek için ___\'den atladı.', word: 'fence', distractors: ['river', 'road', 'wall'] },
  { en: 'The ___ shines every night and lights up the sky.', tr: '___ her gece parlar ve gökyüzünü aydınlatır.', word: 'moon', distractors: ['star', 'sun', 'cloud'] },
  { en: 'She wore her favourite ___ to the birthday party.', tr: 'Doğum günü partisine en sevdiği ___ giydi.', word: 'dress', distractors: ['shoes', 'hat', 'bag'] },
  { en: 'The ___ was too hot to drink right away.', tr: '___ hemen içilemeyecek kadar sıcaktı.', word: 'coffee', distractors: ['water', 'soup', 'juice'] },
  { en: 'The little boy lost his ___ on the way to school.', tr: 'Küçük çocuk okula giderken ___ kaybetti.', word: 'bag', distractors: ['shoe', 'cap', 'coat'] },
  { en: 'She sent a ___ to her friend who lives far away.', tr: 'Uzakta yaşayan arkadaşına bir ___ gönderdi.', word: 'letter', distractors: ['photo', 'gift', 'book'] },
  { en: 'The ___ chirped cheerfully in the tall tree.', tr: '___ uzun ağaçta neşeyle cıvıldadı.', word: 'bird', distractors: ['cat', 'dog', 'frog'] },
  { en: 'He turned off the ___ before leaving the room.', tr: 'Odadan çıkmadan önce ___\'ı kapattı.', word: 'light', distractors: ['door', 'tap', 'fan'] },
  { en: 'The ___ was cold and refreshing on the hot day.', tr: 'Sıcak günde ___ soğuk ve serinleticiydi.', word: 'water', distractors: ['wind', 'rain', 'ice'] },
  { en: 'She drew a beautiful ___ with her new pencils.', tr: 'Yeni kalemleriyle güzel bir ___ çizdi.', word: 'picture', distractors: ['letter', 'map', 'sign'] },
  { en: 'The ___ blew the leaves off the trees.', tr: '___ yaprakları ağaçlardan uçurdu.', word: 'wind', distractors: ['rain', 'storm', 'cold'] },
  { en: 'He ate a big ___ for breakfast this morning.', tr: 'Bu sabah kahvaltıda büyük bir ___ yedi.', word: 'apple', distractors: ['bread', 'egg', 'cake'] },
  { en: 'The baby fell ___ in the cot after a long day.', tr: 'Uzun bir günün ardından bebek karyolada ___ uykuya daldı.', word: 'asleep', distractors: ['awake', 'quiet', 'happy'] },
  { en: 'She put the ___ in the fridge to keep it fresh.', tr: 'Taze kalması için ___ buzdolabına koydu.', word: 'milk', distractors: ['bread', 'cake', 'meat'] },
  { en: 'The dog wagged its ___ when it saw its owner.', tr: 'Sahipini görünce köpek ___ salladı.', word: 'tail', distractors: ['head', 'leg', 'ear'] },
  { en: 'He forgot to bring his ___ and got wet in the rain.', tr: '___ almayı unuttu ve yağmurda ıslandı.', word: 'umbrella', distractors: ['coat', 'hat', 'bag'] },
  { en: 'The ___ is where we sleep at night.', tr: '___, geceleri uyuduğumuz yerdir.', word: 'bedroom', distractors: ['kitchen', 'garden', 'bathroom'] },
  { en: 'She cooked a delicious ___ for the whole family.', tr: 'Tüm aile için lezzetli bir ___ pişirdi.', word: 'meal', distractors: ['book', 'song', 'game'] },
];

const FILL_MEDIUM: RawSentence[] = [
  { en: 'She learned to ___ the piano when she was five.', tr: 'Beş yaşındayken piyanoya ___ öğrendi.', word: 'play', distractors: ['hold', 'fix', 'paint'] },
  { en: 'The captain steered the ship through the ___ storm.', tr: 'Kaptan gemiyi ___ fırtınanın içinden yönetti.', word: 'fierce', distractors: ['gentle', 'quiet', 'warm'] },
  { en: 'The scientist made an important ___ in the lab.', tr: 'Bilim insanı laboratuvarda önemli bir ___ yaptı.', word: 'discovery', distractors: ['mistake', 'journey', 'drawing'] },
  { en: 'He ran as fast as he ___ to catch the train.', tr: 'Treni yakalamak için elinden geldiğince hızlı koştu.', word: 'could', distractors: ['would', 'should', 'might'] },
  { en: 'The stars ___ brightly in the clear night sky.', tr: 'Yıldızlar açık gece gökyüzünde parlak bir şekilde ___.', word: 'shone', distractors: ['fell', 'rose', 'flew'] },
  { en: 'The ancient castle stood on a ___ above the town.', tr: 'Antik kale, şehrin üzerinde bir ___ üzerinde duruyordu.', word: 'hill', distractors: ['bridge', 'road', 'river'] },
  { en: 'She managed to ___ the difficult exam on her first attempt.', tr: 'Zor sınavı ilk denemede ___ başardı.', word: 'pass', distractors: ['fail', 'skip', 'take'] },
  { en: 'The journalist ___ the story for over a year before publishing it.', tr: 'Gazeteci haberi yayınlamadan önce bir yıldan fazla ___.', word: 'investigated', distractors: ['ignored', 'deleted', 'copied'] },
  { en: 'The teacher encouraged the students to ___ their ideas clearly.', tr: 'Öğretmen öğrencileri fikirlerini açıkça ___ teşvik etti.', word: 'express', distractors: ['hide', 'forget', 'copy'] },
  { en: 'The expedition team set ___ to explore the uncharted territory.', tr: 'Keşif ekibi bilinmeyen araziyi keşfetmek için ___ yola çıktı.', word: 'out', distractors: ['up', 'in', 'back'] },
  { en: 'The old bridge could barely ___ the weight of the truck.', tr: 'Eski köprü kamyonun ağırlığını zar zor ___.', word: 'support', distractors: ['avoid', 'damage', 'replace'] },
  { en: 'She decided to ___ the offer after careful consideration.', tr: 'Dikkatlice düşündükten sonra teklifi ___ karar verdi.', word: 'accept', distractors: ['ignore', 'forget', 'delay'] },
  { en: 'The patient doctor waited ___ for the test results.', tr: 'Sabırlı doktor test sonuçları için ___ bekledi.', word: 'patiently', distractors: ['quickly', 'angrily', 'loudly'] },
  { en: 'The mountain trail was ___ but rewarding at the summit.', tr: 'Dağ yolu ___ ama zirvedeki manzara değerliydi.', word: 'exhausting', distractors: ['boring', 'simple', 'short'] },
  { en: 'The researchers tried to ___ the cause of the disease.', tr: 'Araştırmacılar hastalığın nedenini ___ çalıştı.', word: 'identify', distractors: ['spread', 'enjoy', 'create'] },
  { en: 'She was deeply ___ by the kindness of strangers during her trip.', tr: 'Gezisinde yabancıların nazikliğinden derinden ___.', word: 'moved', distractors: ['bored', 'tired', 'lost'] },
  { en: 'The city has ___ greatly since the new mayor took office.', tr: 'Yeni belediye başkanı göreve geldikten sonra şehir büyük ölçüde ___.', word: 'improved', distractors: ['collapsed', 'shrunk', 'stopped'] },
  { en: 'The debate became ___ when both sides refused to compromise.', tr: 'Her iki taraf da uzlaşmayı reddedince tartışma ___ oldu.', word: 'heated', distractors: ['boring', 'silent', 'simple'] },
  { en: 'She ___ herself to finish the project before the deadline.', tr: 'Projeyi son tarihten önce bitirmek için kendini ___.', word: 'pushed', distractors: ['stopped', 'forgot', 'invited'] },
  { en: 'The long drought had a severe ___ on the local farmers.', tr: 'Uzun süren kuraklık yerel çiftçiler üzerinde ciddi ___ yarattı.', word: 'impact', distractors: ['joy', 'game', 'colour'] },
  { en: 'He tried to ___ the argument by changing the subject.', tr: 'Konuyu değiştirerek tartışmayı ___ çalıştı.', word: 'avoid', distractors: ['start', 'enjoy', 'repeat'] },
  { en: 'The company decided to ___ its operations to three new cities.', tr: 'Şirket operasyonlarını üç yeni şehre ___ karar verdi.', word: 'expand', distractors: ['reduce', 'close', 'ignore'] },
  { en: 'She felt a great sense of ___ when she finished the marathon.', tr: 'Maratonu bitirdiğinde büyük bir ___ hissetti.', word: 'achievement', distractors: ['sadness', 'boredom', 'failure'] },
  { en: 'The lawyer carefully ___ every piece of evidence before the trial.', tr: 'Avukat duruşmadan önce her kanıtı dikkatlice ___.', word: 'examined', distractors: ['destroyed', 'ignored', 'created'] },
  { en: 'The new policy was designed to ___ inequality in the workplace.', tr: 'Yeni politika işyerindeki eşitsizliği ___ tasarlanmıştı.', word: 'reduce', distractors: ['increase', 'ignore', 'copy'] },
  { en: 'The pilot had to make a quick ___ when the engine failed.', tr: 'Motor bozulduğunda pilot hızlı bir ___ almak zorunda kaldı.', word: 'decision', distractors: ['mistake', 'excuse', 'complaint'] },
  { en: 'The volunteers worked tirelessly to ___ food to the flood victims.', tr: 'Gönüllüler sel mağdurlarına yiyecek ___ yorulmadan çalıştı.', word: 'distribute', distractors: ['collect', 'buy', 'hide'] },
  { en: 'The film received widespread ___ from both critics and audiences.', tr: 'Film hem eleştirmenlerden hem de seyircilerden geniş çaplı ___ aldı.', word: 'praise', distractors: ['silence', 'blame', 'delay'] },
  { en: 'She had to ___ her schedule to attend the unexpected meeting.', tr: 'Beklenmedik toplantıya katılmak için programını ___ zorunda kaldı.', word: 'rearrange', distractors: ['cancel', 'ignore', 'extend'] },
  { en: 'The ancient ruins ___ thousands of tourists each year.', tr: 'Antik harabeleri her yıl binlerce turist ___.', word: 'attract', distractors: ['avoid', 'bore', 'confuse'] },
  { en: 'He made a sincere ___ to the team for his earlier mistake.', tr: 'Ekibe önceki hatası için içten bir ___ yaptı.', word: 'apology', distractors: ['promise', 'demand', 'complaint'] },
  { en: 'The investigation ___ that the accident was caused by human error.', tr: 'Soruşturma, kazanın insan hatasından kaynaklandığını ___.', word: 'revealed', distractors: ['denied', 'ignored', 'created'] },
  { en: 'She was ___ to speak in front of such a large audience.', tr: 'Bu kadar büyük bir kitleye karşı konuşmaktan ___.', word: 'nervous', distractors: ['bored', 'excited', 'relaxed'] },
  { en: 'The new medicine proved highly ___ in treating the infection.', tr: 'Yeni ilaç enfeksiyonu tedavi etmede son derece ___ olduğunu kanıtladı.', word: 'effective', distractors: ['harmful', 'boring', 'common'] },
  { en: 'The team worked ___ for months to complete the bridge on time.', tr: 'Ekip köprüyü zamanında tamamlamak için aylarca ___ çalıştı.', word: 'together', distractors: ['slowly', 'separately', 'carelessly'] },
  { en: 'The committee finally ___ on a date for the annual conference.', tr: 'Komite sonunda yıllık konferans için bir tarihte ___.', word: 'agreed', distractors: ['argued', 'failed', 'rushed'] },
  { en: 'The documentary ___ the impact of plastic pollution on marine life.', tr: 'Belgesel, plastik kirliliğinin deniz yaşamı üzerindeki etkisini ___.', word: 'explored', distractors: ['ignored', 'created', 'copied'] },
  { en: 'She kept a ___ of her travels, writing in it every evening.', tr: 'Seyahatlerinin bir ___ tuttu ve her akşam yazdı.', word: 'journal', distractors: ['photo', 'ticket', 'map'] },
  { en: 'The athlete trained ___ to prepare for the championship.', tr: 'Sporcu şampiyonaya hazırlanmak için ___ antrenman yaptı.', word: 'intensely', distractors: ['rarely', 'lazily', 'briefly'] },
  { en: 'He was surprised by the ___ response from the community.', tr: 'Toplumun ___ tepkisinden şaşırdı.', word: 'overwhelming', distractors: ['weak', 'boring', 'expected'] },
];

const FILL_HARD: RawSentence[] = [
  { en: 'The philosopher argued that ___ is the foundation of all knowledge.', tr: 'Filozof, ___\'ın tüm bilginin temeli olduğunu savundu.', word: 'reason', distractors: ['emotion', 'tradition', 'instinct'] },
  { en: 'The treaty was ___ after years of tense diplomatic negotiations.', tr: 'Yıllar süren gergin diplomatik müzakerelerden sonra anlaşma ___ oldu.', word: 'ratified', distractors: ['abandoned', 'delayed', 'questioned'] },
  { en: 'The artist\'s work was celebrated for its ___ approach to form.', tr: 'Sanatçının eseri, forma ___ yaklaşımıyla kutlandı.', word: 'unconventional', distractors: ['familiar', 'simple', 'ordinary'] },
  { en: 'The evidence ___ his innocence beyond any reasonable doubt.', tr: 'Kanıtlar, suçsuzluğunu makul her türlü şüphenin ötesinde ___.', word: 'established', distractors: ['destroyed', 'questioned', 'ignored'] },
  { en: 'The committee was deeply ___ by the conflicting testimonies.', tr: 'Komite, çelişkili ifadelerden derin biçimde ___.', word: 'perplexed', distractors: ['satisfied', 'bored', 'pleased'] },
  { en: 'Her speech was ___ and moved everyone in the audience to tears.', tr: 'Konuşması ___ ve izleyicideki herkesi gözyaşlarına boğdu.', word: 'poignant', distractors: ['dull', 'confusing', 'brief'] },
  { en: 'The scientist\'s findings were considered ___ at the time of publication.', tr: 'Bilimcinin bulguları yayın zamanında ___ kabul edildi.', word: 'groundbreaking', distractors: ['ordinary', 'outdated', 'wrong'] },
  { en: 'The regime\'s policies were widely condemned as ___.', tr: 'Rejimin politikaları yaygın olarak ___ olarak kınandı.', word: 'authoritarian', distractors: ['democratic', 'generous', 'fair'] },
  { en: 'He struggled to ___ his ambition with the demands of family life.', tr: 'Hırsını aile yaşamının talepleriyle ___ çalıştı.', word: 'reconcile', distractors: ['ignore', 'increase', 'share'] },
  { en: 'The novel offers a ___ portrait of life in postwar Europe.', tr: 'Roman, savaş sonrası Avrupa yaşamının ___ bir portresini sunuyor.', word: 'nuanced', distractors: ['simple', 'boring', 'inaccurate'] },
  { en: 'The company\'s rapid expansion was seen as ___ by its rivals.', tr: 'Şirketin hızlı genişlemesi rakipler tarafından ___ olarak görüldü.', word: 'predatory', distractors: ['generous', 'harmless', 'careful'] },
  { en: 'The politician\'s remarks were considered ___ by many commentators.', tr: 'Politikacının açıklamaları pek çok yorumcu tarafından ___ olarak değerlendirildi.', word: 'inflammatory', distractors: ['calming', 'helpful', 'honest'] },
  { en: 'The historian sought to ___ the myths surrounding the ancient war.', tr: 'Tarihçi, antik savaşa ilişkin mitleri ___ çalıştı.', word: 'debunk', distractors: ['promote', 'create', 'ignore'] },
  { en: 'His writing style is characterised by its ___ wit and dry humour.', tr: 'Yazı stili, ___ zekası ve kuru mizahıyla karakterize edilir.', word: 'acerbic', distractors: ['gentle', 'boring', 'cheerful'] },
  { en: 'The summit aimed to forge a ___ approach to climate change.', tr: 'Zirve, iklim değişikliğine ___ bir yaklaşım oluşturmayı amaçladı.', word: 'multilateral', distractors: ['solitary', 'local', 'temporary'] },
  { en: 'The court ruled that the law was ___ under the constitution.', tr: 'Mahkeme, yasanın anayasa kapsamında ___ olduğuna hükmetti.', word: 'unconstitutional', distractors: ['valid', 'helpful', 'necessary'] },
  { en: 'Her calm ___ in the face of chaos impressed everyone around her.', tr: 'Kaosun ortasındaki sakin ___ etrafındaki herkesi etkiledi.', word: 'demeanour', distractors: ['voice', 'mistake', 'opinion'] },
  { en: 'The report highlighted the ___ between official data and ground reality.', tr: 'Rapor, resmi veriler ile gerçeklik arasındaki ___ vurguladı.', word: 'discrepancy', distractors: ['agreement', 'similarity', 'balance'] },
  { en: 'Critics argued that the film lacked any genuine ___.', tr: 'Eleştirmenler filmin gerçek bir ___ yoksun olduğunu savundu.', word: 'authenticity', distractors: ['length', 'colour', 'budget'] },
  { en: 'The professor\'s lecture was so ___ that even experts struggled to follow.', tr: 'Profesörün dersi o kadar ___ ki uzmanlar bile takip etmekte güçlük çekti.', word: 'abstruse', distractors: ['simple', 'boring', 'short'] },
  { en: 'She exhibited a remarkable ___ to adapt to new environments.', tr: 'Yeni ortamlara uyum sağlama konusunda olağanüstü bir ___ sergiledi.', word: 'aptitude', distractors: ['fear', 'delay', 'resistance'] },
  { en: 'The government\'s decision was met with widespread ___ from the public.', tr: 'Hükümetin kararı halk tarafından yaygın ___ ile karşılandı.', word: 'censure', distractors: ['support', 'silence', 'praise'] },
  { en: 'His ___ understanding of economics helped shape the reform package.', tr: 'Ekonomiye dair ___ anlayışı reform paketinin şekillenmesine yardımcı oldu.', word: 'profound', distractors: ['shallow', 'basic', 'outdated'] },
  { en: 'The new regulation was seen as ___ to innovation in the sector.', tr: 'Yeni düzenleme, sektördeki yeniliği ___ olarak görüldü.', word: 'detrimental', distractors: ['essential', 'helpful', 'neutral'] },
  { en: 'The mediator worked to ___ a peaceful resolution between the two parties.', tr: 'Arabulucu, iki taraf arasında barışçıl bir çözümü ___ çalıştı.', word: 'facilitate', distractors: ['block', 'ignore', 'delay'] },
  { en: 'Her argument was ___, yet it convinced few of her colleagues.', tr: 'Argümanı ___ olmasına rağmen meslektaşlarının çoğunu ikna edemedi.', word: 'compelling', distractors: ['weak', 'boring', 'incorrect'] },
  { en: 'The architect\'s vision was both ___ and deeply rooted in tradition.', tr: 'Mimarın vizyonu hem ___ hem de gelenekte derinden köklüydü.', word: 'innovative', distractors: ['outdated', 'simple', 'copied'] },
  { en: 'The discovery cast doubt on previously ___ assumptions about the universe.', tr: 'Keşif, evren hakkında daha önce ___ kabul edilen varsayımlara şüphe düşürdü.', word: 'accepted', distractors: ['rejected', 'ignored', 'unknown'] },
  { en: 'The concept of sovereignty remains ___ in international law.', tr: 'Egemenlik kavramı uluslararası hukukta ___ olmaya devam ediyor.', word: 'contested', distractors: ['clear', 'outdated', 'irrelevant'] },
  { en: 'She approached the problem with ___ precision and methodical care.', tr: 'Soruna ___ bir hassasiyet ve sistematik bir özenle yaklaştı.', word: 'surgical', distractors: ['random', 'slow', 'careless'] },
  { en: 'The ancient text was subject to multiple ___ interpretations over the centuries.', tr: 'Antik metin, yüzyıllar boyunca birden fazla ___ yoruma konu oldu.', word: 'contradictory', distractors: ['identical', 'logical', 'modern'] },
  { en: 'His refusal to engage was seen as an act of quiet ___.', tr: 'Katılmayı reddetmesi sessiz bir ___ eylemi olarak görüldü.', word: 'defiance', distractors: ['agreement', 'support', 'obedience'] },
  { en: 'The policy change was ___ and required years of legislative reform.', tr: 'Politika değişikliği ___ gerektiriyordu ve yıllarca yasama reformu gerekti.', word: 'sweeping', distractors: ['minor', 'temporary', 'simple'] },
  { en: 'The journalist was praised for her ___ in the face of political pressure.', tr: 'Gazeteci, siyasi baskı karşısındaki ___ için övüldü.', word: 'tenacity', distractors: ['silence', 'error', 'laziness'] },
  { en: 'The committee\'s ruling set a significant ___ for future cases.', tr: 'Komitenin kararı gelecekteki davalar için önemli bir ___ oluşturdu.', word: 'precedent', distractors: ['problem', 'delay', 'mistake'] },
  { en: 'The new law was designed to ___ the rights of marginalised communities.', tr: 'Yeni yasa, marjinalleşmiş toplulukların haklarını ___ için tasarlandı.', word: 'safeguard', distractors: ['ignore', 'reduce', 'challenge'] },
  { en: 'The poem\'s beauty lies in its subtle ___ to classical mythology.', tr: 'Şiirin güzelliği, klasik mitolojiye yaptığı ince ___ yatmaktadır.', word: 'allusion', distractors: ['mistake', 'rhyme', 'title'] },
  { en: 'Economic ___ widened significantly during the decade of conflict.', tr: 'Ekonomik ___ çatışma on yılı boyunca önemli ölçüde genişledi.', word: 'disparity', distractors: ['growth', 'stability', 'progress'] },
  { en: 'The reform sought to ___ power from the central government to local authorities.', tr: 'Reform, iktidarı merkezi hükümetten yerel yönetimlere ___ hedefliyordu.', word: 'devolve', distractors: ['concentrate', 'ignore', 'increase'] },
  { en: 'Her tireless advocacy for justice left a lasting ___ on the legal system.', tr: 'Adalet için yorulmaksızın savunuculuğu hukuk sisteminde kalıcı bir ___ bıraktı.', word: 'legacy', distractors: ['problem', 'burden', 'mistake'] },
];

// ─── Shared PlayAgain button ──────────────────────────────────────────────────
function PlayAgainButton({ onClick, gradient, nativeLanguage }: { onClick: () => void; isDarkMode?: boolean; gradient: string; nativeLanguage: LanguageCode }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10 ${gradient}`}
    >
      <div className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine pointer-events-none" />
      <RotateCcw className="w-4.5 h-4.5" />
      {t('game_play_again', nativeLanguage)}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYNONYM MATCH GAME
// ═══════════════════════════════════════════════════════════════════════════════
interface MatchCard {
  id: string; text: string; type: 'en' | 'tr';
  pairId: string; matched: boolean; selected: boolean;
}
interface SynonymMatchGameProps {
  vocabulary: VocabularyWord[];
  books?: Book[];
  isDarkMode?: boolean;
  onBack: () => void;
  usedSynonymWords: string[];
  setUsedSynonymWords: React.Dispatch<React.SetStateAction<string[]>>;
  onCompleteGame?: (gameType: 'synonym' | 'fillblank') => void;
  onSaveWord?: (word: string, translation: string, level: string, exampleEn?: string, exampleTr?: string) => void;
  onRemoveWord: (wordId: string) => void;
  nativeLanguage: LanguageCode;
}

function SynonymMatchGame({ vocabulary, books, isDarkMode, onBack, usedSynonymWords, setUsedSynonymWords, onCompleteGame, onSaveWord, onRemoveWord, nativeLanguage }: SynonymMatchGameProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<FillDifficulty | null>(null);
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<MatchCard | null>(null);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [shakeIds, setShakeIds] = useState<Set<string>>(new Set());
  const [lastChosenPairs, setLastChosenPairs] = useState<{ en: string; tr: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const PAIR_COUNT = 10;

  useEffect(() => {
    if (isComplete && onCompleteGame) {
      onCompleteGame('synonym');
    }
  }, [isComplete, onCompleteGame]);

  const diffToLevels: Record<FillDifficulty, CefrLevel[]> = {
    easy:   ['A1', 'A2'],
    medium: ['B1', 'B2', 'A1', 'A2'],
    hard:   ['C1'],
  };

  const buildGame = useCallback((diff: FillDifficulty) => {
    const levels = diffToLevels[diff];
    const pool: { en: string; tr: string }[] = [];
    const seen = new Set<string>();

    // 1. Vocabulary words
    vocabulary.forEach(v => {
      const key = v.word.toLowerCase().trim();
      const dictItem = OFFLINE_DICTIONARY[key];
      const actualLevel = dictItem ? (dictItem.level as CefrLevel) : ((v.level || '').toUpperCase().substring(0, 2) as CefrLevel);
      if (levels.includes(actualLevel) && !seen.has(key) && v.translation && v.translation.length < 28 && v.word.length < 22) {
        if (diff === 'easy' && !EASY_WORDS_1000_SET.has(key)) return;
        if (diff === 'medium' && (actualLevel === 'A1' || actualLevel === 'A2') && EASY_WORDS_1000_SET.has(key)) return;
        seen.add(key);
        pool.push({ en: v.word, tr: getNativeWordTranslation(v.word, v.translation, nativeLanguage, undefined, v.lang) });
      }
    });

    // 2. Book words
    if (books && books.length > 0) {
      books.forEach(book => {
        const bookLvl = book.level as CefrLevel;
        book.chapters.forEach(ch => {
          ch.paragraphs.forEach(p => {
            if (p.words) {
              p.words.forEach(w => {
                const en = w.en.trim();
                const tr = w.tr.trim();
                const enLower = en.toLowerCase();
                if (en.length > 2 && en.length < 16 && tr.length > 1 && tr.length < 28 && !seen.has(enLower) && !isProperNoun(en) && !PROPER_NAMES_SET.has(enLower)) {
                  const isEasyOrMedium = levels.includes('A1') || levels.includes('A2');
                  const dictItem = OFFLINE_DICTIONARY[enLower];
                  if (isEasyOrMedium && !dictItem) return;

                  const actualLevel = dictItem ? (dictItem.level as CefrLevel) : bookLvl;
                  if (levels.includes(actualLevel)) {
                    if (diff === 'easy' && !EASY_WORDS_1000_SET.has(enLower)) return;
                    if (diff === 'medium' && (actualLevel === 'A1' || actualLevel === 'A2') && EASY_WORDS_1000_SET.has(enLower)) return;
                    seen.add(enLower);
                    pool.push({ en: w.en, tr: getNativeWordTranslation(w.en, w.tr, nativeLanguage, book.id) });
                  }
                }
              });
            }
          });
        });
      });
    }

    // 3. Offline Dictionary
    Object.entries(OFFLINE_DICTIONARY)
      .filter(([word, item]) =>
        levels.includes(item.level as CefrLevel) && word.length > 2 && word.length < 16 &&
        item.tr.length > 1 && item.tr.length < 28 &&
        !item.notes.toLowerCase().includes('özel isim') && !seen.has(word)
      )
      .forEach(([word, item]) => {
        seen.add(word);
        pool.push({ en: word, tr: getNativeWordTranslation(word, item.tr, nativeLanguage) });
      });

    // 4. Fallback list
    levels.forEach(lvl => {
      LEVEL_PAIRS[lvl].forEach(p => {
        const key = p.en.toLowerCase();
        if (!seen.has(key)) {
          if (diff === 'easy' && !EASY_WORDS_1000_SET.has(key)) return;
          if (diff === 'medium' && (lvl === 'A1' || lvl === 'A2') && EASY_WORDS_1000_SET.has(key)) return;
          seen.add(key);
          pool.push({ en: p.en, tr: getNativeWordTranslation(p.en, p.tr, nativeLanguage) });
        }
      });
    });

    // Filter by usedSynonymWords
    let filteredPool = pool.filter(p => !usedSynonymWords.includes(p.en.toLowerCase()));
    if (filteredPool.length < PAIR_COUNT) {
      // Clear this difficulty history
      setUsedSynonymWords(prev => prev.filter(w => !pool.some(p => p.en.toLowerCase() === w)));
      filteredPool = pool;
    }

    const chosen = pickRandom(filteredPool, PAIR_COUNT);
    setLastChosenPairs(chosen);
    setUsedSynonymWords(prev => [...prev, ...chosen.map(c => c.en.toLowerCase())]);

    const startWithChosenPairs = async (pairs: { en: string; tr: string }[]) => {
      if (nativeLanguage === 'tr') {
        finalizeGame(pairs);
        return;
      }

      setIsLoading(true);
      const apiBase = (() => {
        try {
          if (window.location.protocol === 'capacitor:') {
            return 'https://ingilizce-oyk-m.onrender.com';
          }
          return '';
        } catch { return ''; }
      })();

      const translatedPairs = await Promise.all(
        pairs.map(async (p) => {
          const wLower = p.en.toLowerCase().trim();
          
          // Check local storage cache of past dynamic translations for this language code
          const cacheKeyObj = `story_word_translations_cache_${nativeLanguage}`;
          const cacheJSON = localStorage.getItem(cacheKeyObj);
          if (cacheJSON) {
            try {
              const cache = JSON.parse(cacheJSON);
              if (cache[wLower] && cache[wLower].translation) {
                return { en: p.en, tr: cache[wLower].translation };
              }
            } catch (e) {}
          }
          
          const cacheKey = `linguist_dict_word_${wLower}_${nativeLanguage}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed.translation) {
                return { en: p.en, tr: parsed.translation };
              }
            } catch (e) {}
          }

          // If not cached, fetch from the server
          try {
            const res = await fetch(`${apiBase}/api/translate-word`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ word: wLower, context: '', level: 'A1', targetLang: nativeLanguage })
            });
            if (res.ok) {
              const data = await res.json();
              if (data && data.translation) {
                localStorage.setItem(cacheKey, JSON.stringify({ translation: data.translation, notes: data.explanation || '', level: data.wordLevel || 'A1' }));
                return { en: p.en, tr: data.translation };
              }
            }
            throw new Error('Server translate failed');
          } catch (err) {
            console.error('Failed to translate word in match game, trying client fallback:', wLower, err);
            try {
              const fallbackTr = await translateWithGoogleClient(wLower, nativeLanguage);
              localStorage.setItem(cacheKey, JSON.stringify({ translation: fallbackTr, notes: '', level: 'A1' }));
              return { en: p.en, tr: fallbackTr };
            } catch (fallbackErr) {
              console.error('Client fallback failed in match game:', fallbackErr);
            }
          }

          // Fallback if API fails
          return { en: p.en, tr: p.en };
        })
      );

      finalizeGame(translatedPairs);
      setIsLoading(false);
    };

    const finalizeGame = (finalPairs: { en: string; tr: string }[]) => {
      setLastChosenPairs(finalPairs);
      const enCards: MatchCard[] = finalPairs.map((p, i) => ({ id: `en_${i}`, text: p.en, type: 'en', pairId: `pair_${i}`, matched: false, selected: false }));
      const trCards: MatchCard[] = finalPairs.map((p, i) => ({ id: `tr_${i}`, text: p.tr, type: 'tr', pairId: `pair_${i}`, matched: false, selected: false }));
      const shuffledEn = pickRandom(enCards, enCards.length);
      const shuffledTr = pickRandom(trCards, trCards.length);
      const allCards: MatchCard[] = [];
      for (let i = 0; i < PAIR_COUNT; i++) { allCards.push(shuffledEn[i]); allCards.push(shuffledTr[i]); }

      setCards(allCards); setSelectedCard(null); setWrongPair(null);
      setMatchedCount(0); setErrors(0); setIsComplete(false); setShakeIds(new Set());
    };

    startWithChosenPairs(chosen);
  }, [vocabulary, books, usedSynonymWords, setUsedSynonymWords, nativeLanguage]);

  const handleDiffChange = (diff: FillDifficulty) => { setSelectedDifficulty(diff); buildGame(diff); };

  const handleCardClick = (card: MatchCard) => {
    if (card.matched || wrongPair) return;
    if (selectedCard?.id === card.id) {
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, selected: false } : c));
      setSelectedCard(null); return;
    }
    if (selectedCard && selectedCard.type === card.type) {
      setCards(prev => prev.map(c => {
        if (c.id === selectedCard.id) return { ...c, selected: false };
        if (c.id === card.id) return { ...c, selected: true };
        return c;
      })); setSelectedCard(card); return;
    }
    if (selectedCard) {
      if (selectedCard.pairId === card.pairId) {
        setCards(prev => prev.map(c => c.pairId === card.pairId ? { ...c, matched: true, selected: false } : c));
        setMatchedCount(prev => { const n = prev + 1; if (n === PAIR_COUNT) setTimeout(() => setIsComplete(true), 400); return n; });
        setSelectedCard(null);
        speakNative(card.type === 'en' ? card.text : selectedCard.text, 'en-US');
      } else {
        setWrongPair([selectedCard.id, card.id]); setShakeIds(new Set([selectedCard.id, card.id]));
        setErrors(prev => prev + 1);
        setCards(prev => prev.map(c => c.id === card.id ? { ...c, selected: true } : c));
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.id === selectedCard.id || c.id === card.id) ? { ...c, selected: false } : c));
          setWrongPair(null); setSelectedCard(null); setShakeIds(new Set());
        }, 900);
      }
    } else {
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, selected: true } : c));
      setSelectedCard(card);
    }
  };

  const activeDiff = GAME_DIFF_CONFIG.find(d => d.key === selectedDifficulty);
  const enCards = cards.filter(c => c.type === 'en');
  const trCards = cards.filter(c => c.type === 'tr');
  const progress = (matchedCount / PAIR_COUNT) * 100;

  if (isComplete) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[480px] px-4 py-8 text-center">
        <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-5 shadow-xl shadow-amber-500/35">
          <Trophy className="w-12 h-12 text-white" />
        </motion.div>
        <h2 className={`text-3xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
          {errors === 0 ? t('game_completed_awesome', nativeLanguage) + ' 🔥' : t('game_completed_good', nativeLanguage) + ' 🎉'}
        </h2>
        <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('game_match_completed_msg', nativeLanguage).replace('{count}', String(PAIR_COUNT))}</p>
        {activeDiff && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold mb-8"
            style={{ backgroundColor: activeDiff.color + '22', color: activeDiff.color }}>
            {selectedDifficulty === 'easy' ? t('difficulty_easy_label', nativeLanguage) : selectedDifficulty === 'medium' ? t('difficulty_medium_label', nativeLanguage) : t('difficulty_hard_label', nativeLanguage)} ({activeDiff.sub})
          </div>
        )}
        <div className={`w-full rounded-2xl p-4 mb-8 border ${isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex items-center justify-center gap-2">
            <div className={`text-3xl font-black ${errors === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{errors}</div>
            <div className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('game_match_mistakes', nativeLanguage)}</div>
          </div>
          {errors === 0 && <p className="text-emerald-500 text-xs font-bold mt-1">{t('game_match_perfect', nativeLanguage)}</p>}
        </div>
        <div className="flex flex-col gap-3 w-full">
          <PlayAgainButton onClick={() => selectedDifficulty && buildGame(selectedDifficulty)}
            gradient="bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/25" nativeLanguage={nativeLanguage} />
          <button onClick={onBack} className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
            <ChevronLeft className="w-4 h-4" /> {t('btn_back', nativeLanguage)}
          </button>
        </div>

        {/* Words in this game */}
        {lastChosenPairs.length > 0 && (
          <div className="w-full mt-8 text-left">
            <h3 className={`text-xs font-extrabold uppercase tracking-wider mb-3.5 px-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('game_words_in_this_game', nativeLanguage).replace('{count}', String(lastChosenPairs.length))}
            </h3>
            <div className="flex flex-col gap-2">
              {lastChosenPairs.map((pair, idx) => {
                const cleanEn = pair.en.trim();
                const cleanEnLower = cleanEn.toLowerCase();
                const dictItem = OFFLINE_DICTIONARY[cleanEnLower];
                const level = dictItem ? dictItem.level : 'A1';

                const savedWord = vocabulary.find(v => v.word.toLowerCase() === cleanEnLower);
                const isSaved = !!savedWord;

                return (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-[#121214] border-[#2A2A30] hover:border-gray-800' 
                      : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                          {cleanEn}
                        </span>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded" 
                          style={{ 
                            backgroundColor: getLevelColor(level) + '22', 
                            color: getLevelColor(level) 
                          }}>
                          {getFormattedLevel(level, nativeLanguage)}
                        </span>
                      </div>
                      <div className={`text-xs font-bold mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {pair.tr}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => speakNative(cleanEn, 'en-US')}
                        className={`p-2 rounded-xl transition-colors ${
                          isDarkMode ? 'hover:bg-[#2A2A30] text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        }`}
                        title={t('dict_listen_pronunciation', nativeLanguage)}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (isSaved && savedWord) {
                            onRemoveWord(savedWord.id);
                          } else if (onSaveWord) {
                            onSaveWord(cleanEn, pair.tr, level);
                          }
                        }}
                        className={`p-2 rounded-xl transition-colors ${
                          isSaved 
                            ? 'text-amber-500 hover:bg-amber-500/10' 
                            : isDarkMode ? 'text-gray-500 hover:bg-[#2A2A30] hover:text-amber-400' : 'text-gray-400 hover:bg-gray-100 hover:text-amber-500'
                        }`}
                        title={isSaved ? t('vocab_remove_tooltip', nativeLanguage) : t('vocab_add_tooltip', nativeLanguage)}
                      >
                        <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  const renderCard = (card: MatchCard) => {
    const isWrong = wrongPair?.includes(card.id);
    const shake = shakeIds.has(card.id);
    return (
      <motion.button 
        key={card.id} 
        onClick={() => handleCardClick(card)}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={shake ? { x: [0, -8, 8, -6, 6, -4, 0], opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7, height: 0, padding: 0, margin: 0, border: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 500, 
          damping: 30,
          layout: { duration: 0.25 }
        }}
        disabled={card.matched}
        className={`w-full py-3 px-3 rounded-2xl text-sm font-bold text-center transition-all duration-200 active:scale-95 border-2 leading-tight overflow-hidden
          ${card.selected && isWrong
            ? (isDarkMode ? 'bg-rose-950/40 border-rose-600 text-rose-400 scale-95' : 'bg-rose-50 border-rose-400 text-rose-600 scale-95')
            : card.selected ? 'border-2 scale-[1.03]'
            : (isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30] text-gray-200' : 'bg-white border-[#FFE66D]/70 text-[#2D3436]')
          }`}
        style={card.selected && !isWrong ? {
          backgroundColor: (activeDiff?.color ?? '#888') + '18',
          borderColor: activeDiff?.color ?? '#888',
          color: activeDiff?.color ?? '#888',
        } : undefined}
      >
        {card.text}
      </motion.button>
    );
  };

  return (
    <div className="pb-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-[#2A2A30] text-gray-300 hover:bg-[#343A40]' : 'bg-gray-100 text-gray-600 hover:bg-200'}`}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h2 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>{t('game_match_title', nativeLanguage)}</h2>
          <p className={`text-[11px] font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('game_match_subtitle', nativeLanguage)}</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedDifficulty && activeDiff && (
            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: activeDiff.color + '22', color: activeDiff.color }}>{matchedCount}/{PAIR_COUNT}</span>
          )}
          {errors > 0 && (
            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${isDarkMode ? 'bg-rose-950/40 text-rose-400' : 'bg-rose-50 text-rose-500'}`}>{errors}✗</span>
          )}
        </div>
      </div>

      {/* Difficulty picker */}
      <div className={`rounded-2xl p-3 mb-5 border ${isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]/60'}`}>
        <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-2.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('difficulty_label', nativeLanguage)}</p>
        <div className="grid grid-cols-3 gap-1.5">
          {GAME_DIFF_CONFIG.map(d => {
            const isActive = selectedDifficulty === d.key;
            const label = d.key === 'easy' ? t('difficulty_easy_label', nativeLanguage) : d.key === 'medium' ? t('difficulty_medium_label', nativeLanguage) : t('difficulty_hard_label', nativeLanguage);
            return (
              <button key={d.key} type="button" onClick={() => handleDiffChange(d.key)}
                className="py-2.5 px-2 rounded-xl text-center border-2 transition-all duration-200 active:scale-95 flex flex-col justify-center items-center"
                style={isActive ? { backgroundColor: d.color + '18', borderColor: d.color, color: d.color, transform: 'scale(1.05)', boxShadow: `0 2px 8px ${d.color}30` }
                  : { backgroundColor: isDarkMode ? '#121214' : '#F9FAFB', borderColor: isDarkMode ? '#2A2A30' : '#E5E7EB', color: isDarkMode ? '#9CA3AF' : '#6B7280' }}>
                <span className="block text-[12px] font-black tracking-tight">{label}</span>
                <span className="block text-[9px] font-bold mt-0.5 opacity-75">{d.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!selectedDifficulty && (
        <div className={`rounded-3xl border-2 border-dashed p-10 flex flex-col items-center justify-center text-center ${isDarkMode ? 'border-[#2A2A30]' : 'border-gray-200'}`}>
          <Link2 className={`w-10 h-10 mb-3 ${isDarkMode ? 'text-gray-650' : 'text-gray-300'}`} />
          <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('game_select_diff_prompt', nativeLanguage)}</p>
        </div>
      )}

      {selectedDifficulty && activeDiff && (
        isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#4ECDC4] mb-3" />
            <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('quiz_loading', nativeLanguage)}
            </p>
          </div>
        ) : (
          <>
            <div className={`w-full h-1.5 rounded-full mb-5 ${isDarkMode ? 'bg-[#2A2A30]' : 'bg-gray-200'}`}>
            <motion.div className="h-full rounded-full"
              style={{ background: `linear-gradient(to right, ${activeDiff.color}aa, ${activeDiff.color})` }}
              animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 200, damping: 25 }} />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <p className={`text-[10px] font-extrabold uppercase tracking-widest text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('game_match_en_label', nativeLanguage)}</p>
            <p className={`text-[10px] font-extrabold uppercase tracking-widest text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('game_match_tr_label', nativeLanguage)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2.5">
              <AnimatePresence>
                {enCards.map(card => !card.matched && renderCard(card))}
              </AnimatePresence>
            </div>
            <div className="flex flex-col gap-2.5">
              <AnimatePresence>
                {trCards.map(card => !card.matched && renderCard(card))}
              </AnimatePresence>
            </div>
          </div>
          <button onClick={() => buildGame(selectedDifficulty)}
            className={`mt-5 w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border ${isDarkMode ? 'border-[#2A2A30] text-gray-400 hover:text-gray-200 hover:bg-[#2A2A30]' : 'border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
            <RotateCcw className="w-3 h-3" /> {t('game_new_game', nativeLanguage)}
          </button>
        </>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILL IN THE BLANKS GAME
// ═══════════════════════════════════════════════════════════════════════════════
interface FillQuestion { sentence: string; sentenceTr: string; answer: string; options: string[] }

interface FillInTheBlanksGameProps {
  vocabulary: VocabularyWord[];
  books?: Book[];
  isDarkMode?: boolean;
  onBack: () => void;
  usedFillSentences: string[];
  setUsedFillSentences: React.Dispatch<React.SetStateAction<string[]>>;
  onCompleteGame?: (gameType: 'synonym' | 'fillblank') => void;
  nativeLanguage: LanguageCode;
}

function FillInTheBlanksGame({ vocabulary, books, isDarkMode, onBack, usedFillSentences, setUsedFillSentences, onCompleteGame, nativeLanguage }: FillInTheBlanksGameProps) {
  const [difficulty, setDifficulty] = useState<FillDifficulty | null>(null);
  const [questions, setQuestions] = useState<FillQuestion[]>([]);
  const [selectedWord, setSelectedWord] = useState<{ word: string; translation: string; level?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleWordClick = (word: string, cleanWordLower: string) => {
    const dictItem = OFFLINE_DICTIONARY[cleanWordLower];
    const initialTr = getNativeWordTranslation(cleanWordLower, dictItem?.tr || word, nativeLanguage);
    setSelectedWord({
      word: word,
      translation: initialTr,
      level: dictItem?.level || 'A1'
    });
    speakNative(word, 'en-US');

    // If it was a fallback translation and nativeLanguage is not tr, fetch it dynamically!
    if (nativeLanguage !== 'tr' && (initialTr === cleanWordLower || initialTr === word || initialTr === dictItem?.tr)) {
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
        body: JSON.stringify({ word: cleanWordLower, context: '', level: 'A1', targetLang: nativeLanguage })
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.translation) {
          const isTrLeak = (
            (OFFLINE_DICTIONARY[cleanWordLower] && OFFLINE_DICTIONARY[cleanWordLower].tr.toLowerCase().trim() === data.translation.toLowerCase().trim()) ||
            (GLOBAL_DICTIONARY[cleanWordLower] && GLOBAL_DICTIONARY[cleanWordLower].toLowerCase().trim() === data.translation.toLowerCase().trim())
          );
          if (isTrLeak) {
            throw new Error('Server leaked Turkish translation');
          }
          const indCacheKey = `linguist_dict_word_${cleanWordLower.toLowerCase().trim()}_${nativeLanguage}`;
          localStorage.setItem(indCacheKey, JSON.stringify({ translation: data.translation, notes: data.explanation || '', level: data.wordLevel || 'A1' }));
          
          setSelectedWord(prev => prev && prev.word === word ? { ...prev, translation: data.translation } : prev);
        }
      })
      .catch(err => {
        console.error('Failed to translate word, trying client fallback:', err);
        translateWithGoogleClient(cleanWordLower, nativeLanguage)
        .then(fallbackTr => {
          const indCacheKey = `linguist_dict_word_${cleanWordLower.toLowerCase().trim()}_${nativeLanguage}`;
          localStorage.setItem(indCacheKey, JSON.stringify({ translation: fallbackTr, notes: '', level: 'A1' }));
          setSelectedWord(prev => prev && prev.word === word ? { ...prev, translation: fallbackTr } : prev);
        })
        .catch(fallbackErr => console.error('Client-side translation fallback failed:', fallbackErr));
      });
    }
  };

  const renderInteractiveText = (text: string) => {
    const tokens = text.split(/(\s+)/);
    return tokens.map((token, idx) => {
      if (/^\s+$/.test(token)) {
        return <span key={idx}>{token}</span>;
      }
      
      const cleanWord = token.replace(/[.,/#!$%^&*;:{}=\-_`~()?"''""''\[\]{}<>|\\+]/g, '').trim();
      const cleanWLower = cleanWord.toLowerCase();
      const hasTranslation = !!OFFLINE_DICTIONARY[cleanWLower];
      
      if (cleanWord.length > 0 && hasTranslation) {
        return (
          <span
            key={idx}
            onClick={() => handleWordClick(cleanWord, cleanWLower)}
            className="cursor-pointer underline decoration-dotted decoration-violet-400/60 hover:text-violet-500 active:text-violet-650 transition-colors"
          >
            {token}
          </span>
        );
      }
      
      return <span key={idx}>{token}</span>;
    });
  };
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [answerHistory, setAnswerHistory] = useState<boolean[]>([]);
  const QUESTION_COUNT = 10;

  useEffect(() => {
    if (isComplete && onCompleteGame) {
      onCompleteGame('fillblank');
    }
  }, [isComplete, onCompleteGame]);

  // Map difficulty to CEFR levels for vocab filtering + distractor selection
  const diffToLevels: Record<FillDifficulty, CefrLevel[]> = {
    easy:   ['A1', 'A2'],
    medium: ['B1', 'B2'],
    hard:   ['C1'],
  };
  const diffToPool: Record<FillDifficulty, RawSentence[]> = {
    easy:   FILL_EASY,
    medium: FILL_MEDIUM,
    hard:   FILL_HARD,
  };

  const buildGame = useCallback((diff: FillDifficulty) => {
    const levels = diffToLevels[diff];
    const vocabSentences: FillQuestion[] = [];
    const seen = new Set<string>();

    // Vocabulary words matching the difficulty level
    vocabulary.forEach(v => {
      if (!v.exampleEn || !v.exampleTr || seen.has(v.word.toLowerCase())) return;
      
      const cleanExample = v.exampleEn.trim();
      // Üç nokta içeren veya eksi işaretiyle başlayan örnek cümleleri es geç
      if (cleanExample.includes('...') || cleanExample.includes('…') || cleanExample.startsWith('-') || /^[.·…\-\s]/.test(cleanExample) || /^[“"‘'][.·…]/.test(cleanExample)) {
        return;
      }
      
      const wordCount = cleanExample.split(/\s+/).filter(Boolean).length;
      if (wordCount < 5 || wordCount > 13) return;

      const key = v.word.toLowerCase().trim();
      const isEasy = levels.includes('A1') || levels.includes('A2');
      const dictItem = OFFLINE_DICTIONARY[key];
      if (isEasy && !dictItem) return; // Strict: only verified dictionary words in easy mode

      const actualLevel = dictItem ? (dictItem.level as CefrLevel) : ((v.level || '').toUpperCase().substring(0, 2) as CefrLevel);
      if (!levels.includes(actualLevel)) return;
      const cleanWord = v.word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"''""''\[\]{}<>|\\+]/g, '').trim();
      const regex = new RegExp('\\b' + cleanWord.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '\\b', 'gi');
      const blanked = cleanExample.replace(regex, '___');
      if (blanked === cleanExample) return;

      // Same-level distractors from OFFLINE_DICTIONARY for plausible wrong answers
      const distPool = getDistractors(levels, cleanWord);

      seen.add(v.word.toLowerCase());

      let trExample = v.exampleTr;
      if (nativeLanguage === 'tr') {
        const dictItemWord = OFFLINE_DICTIONARY[v.word.toLowerCase().trim()];
        const wordTr = dictItemWord ? dictItemWord.tr : v.word;
        trExample = v.exampleTr.replace(/___/g, wordTr);
      }

      vocabSentences.push({
        sentence: blanked, sentenceTr: trExample, answer: v.word,
        options: pickRandom([v.word, ...distPool], 4),
      });
    });

    // Dynamic sentences from books
    const bookSentences = getDynamicSentencesFromBooks(books || [], levels, nativeLanguage);

    // Static sentences
    const staticBank = diffToPool[diff];
    const combined: FillQuestion[] = [
      ...vocabSentences,
      ...bookSentences,
      ...staticBank.map(s => {
        let trSentence = s.tr;
        if (nativeLanguage === 'tr') {
          const dictItem = OFFLINE_DICTIONARY[s.word.toLowerCase().trim()];
          const wordTr = dictItem ? dictItem.tr : s.word;
          trSentence = s.tr.replace(/___/g, wordTr);
        }
        return {
          sentence: s.en,
          sentenceTr: trSentence,
          answer: s.word,
          options: pickRandom([s.word, ...s.distractors], 4),
        };
      }),
    ];

    // Filter by usedFillSentences
    let filteredPool = combined.filter(q => !usedFillSentences.includes(q.sentence.toLowerCase()));
    if (filteredPool.length < QUESTION_COUNT) {
      // Clear this difficulty history
      setUsedFillSentences(prev => prev.filter(s => !combined.some(q => q.sentence.toLowerCase() === s)));
      filteredPool = combined;
    }

    const chosen = pickRandom(filteredPool, QUESTION_COUNT);
    setUsedFillSentences(prev => [...prev, ...chosen.map(c => c.sentence.toLowerCase())]);

    const startWithChosen = async (questionsList: FillQuestion[]) => {
      if (nativeLanguage === 'tr') {
        finalizeGame(questionsList);
        return;
      }

      setIsLoading(true);
      const apiBase = (() => {
        try {
          if (window.location.protocol === 'capacitor:') {
            return 'https://ingilizce-oyk-m.onrender.com';
          }
          return '';
        } catch { return ''; }
      })();

      const translatedQuestions = await Promise.all(
        questionsList.map(async (q) => {
          const cleanSentence = q.sentence.replace('___', q.answer);
          const cacheKey = `linguist_trans_sentence_game_${cleanSentence.toLowerCase().trim()}_${nativeLanguage}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            return { ...q, sentenceTr: cached };
          }

          // Fetch translation from server
          try {
            const res = await fetch(`${apiBase}/api/translate-sentence`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: cleanSentence, targetLang: nativeLanguage })
            });
            if (res.ok) {
              const data = await res.json();
              if (data && data.translation) {
                localStorage.setItem(cacheKey, data.translation);
                return { ...q, sentenceTr: data.translation };
              }
            }
          } catch (err) {
            console.error('Failed to translate sentence in game, trying client fallback:', cleanSentence, err);
            try {
              const fallbackTr = await translateWithGoogleClient(cleanSentence, nativeLanguage);
              localStorage.setItem(cacheKey, fallbackTr);
              return { ...q, sentenceTr: fallbackTr };
            } catch (fallbackErr) {
              console.error('Client-side translation fallback failed:', fallbackErr);
            }
          }

          return { ...q, sentenceTr: cleanSentence };
          return q;
        })
      );

      finalizeGame(translatedQuestions);
      setIsLoading(false);
    };

    const finalizeGame = (questionsList: FillQuestion[]) => {
      setQuestions(questionsList);
      setCurrentIdx(0); setSelected(null); setIsAnswered(false);
      setCorrectCount(0); setIsComplete(false); setAnswerHistory([]);
    };

    startWithChosen(chosen);
  }, [vocabulary, books, usedFillSentences, setUsedFillSentences, nativeLanguage]);

  const handleDiffChange = (diff: FillDifficulty) => { setDifficulty(diff); buildGame(diff); };

  const activeQ = questions[currentIdx];
  const activeDiffCfg = GAME_DIFF_CONFIG.find(d => d.key === difficulty);

  const handleSelect = (idx: number) => {
    if (isAnswered || !activeQ) return;
    setSelected(idx);
    setIsAnswered(true);
    const isCorrect = activeQ.options[idx] === activeQ.answer;
    if (isCorrect) setCorrectCount(s => s + 1);
    setAnswerHistory(h => [...h, isCorrect]);
  };

  const handleNext = () => {
    if (currentIdx < QUESTION_COUNT - 1) {
      setCurrentIdx(i => i + 1); setSelected(null); setIsAnswered(false);
    } else { setIsComplete(true); }
  };

  const DiffPicker = () => (
    <div className={`rounded-2xl p-3 mb-5 border ${isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]/60'}`}>
      <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-2.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('difficulty_label', nativeLanguage)}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {GAME_DIFF_CONFIG.map(d => {
          const isActive = difficulty === d.key;
          const label = d.key === 'easy' ? t('difficulty_easy_label', nativeLanguage) : d.key === 'medium' ? t('difficulty_medium_label', nativeLanguage) : t('difficulty_hard_label', nativeLanguage);
          return (
            <button key={d.key} type="button" onClick={() => handleDiffChange(d.key)}
              className="py-2.5 px-2 rounded-xl text-center border-2 transition-all duration-200 active:scale-95 flex flex-col justify-center items-center"
              style={isActive ? { backgroundColor: d.color + '18', borderColor: d.color, color: d.color, transform: 'scale(1.05)', boxShadow: `0 2px 8px ${d.color}30` }
                : { backgroundColor: isDarkMode ? '#121214' : '#F9FAFB', borderColor: isDarkMode ? '#2A2A30' : '#E5E7EB', color: isDarkMode ? '#9CA3AF' : '#6B7280' }}>
              <span className="block text-[12px] font-black tracking-tight">{label}</span>
              <span className="block text-[9px] font-bold mt-0.5 opacity-75">{d.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Completion screen ──────────────────────────────────────────────────────
  if (isComplete) {
    const pct = Math.round((correctCount / QUESTION_COUNT) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : '📚';
    const gradientClass = pct >= 80 ? 'from-amber-400 to-orange-500 shadow-amber-500/30'
      : pct >= 60 ? 'from-blue-400 to-indigo-500 shadow-blue-500/30'
      : 'from-gray-400 to-gray-600 shadow-gray-500/30';
    return (
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[480px] px-4 py-8 text-center">
        <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-5 shadow-xl text-4xl bg-gradient-to-br ${gradientClass}`}>
          {emoji}
        </motion.div>
        <h2 className={`text-3xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
          {pct >= 80 ? t('game_completed_awesome', nativeLanguage) : pct >= 60 ? t('game_completed_good', nativeLanguage) : t('game_completed_keep', nativeLanguage)}
        </h2>
        <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {(() => {
            const text = t('game_completed_stats', nativeLanguage).replace('{total}', String(QUESTION_COUNT));
            const parts = text.split('{count}');
            if (parts.length === 2) {
              return <>{parts[0]}<span className="font-black text-emerald-500">{correctCount}</span>{parts[1]}</>;
            }
            return <>{text}</>;
          })()}
        </p>
        {activeDiffCfg && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold mb-8"
            style={{ backgroundColor: activeDiffCfg.color + '22', color: activeDiffCfg.color }}>
            {activeDiffCfg.label} ({activeDiffCfg.sub})
          </div>
        )}
        <div className="flex gap-1.5 mb-8 flex-wrap justify-center">
          {answerHistory.map((correct, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.04 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black ${correct ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
              {correct ? '✓' : '✗'}
            </motion.div>
          ))}
        </div>
        <div className="flex flex-col gap-3 w-full">
          <PlayAgainButton onClick={() => difficulty && buildGame(difficulty)}
            gradient="bg-gradient-to-r from-violet-500 to-purple-600 shadow-violet-500/25"
            nativeLanguage={nativeLanguage} />
          <button onClick={onBack} className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
            <ChevronLeft className="w-4 h-4" /> {t('btn_back', nativeLanguage)}
          </button>
        </div>
      </motion.div>
    );
  }

  const parts = activeQ ? activeQ.sentence.split('___') : ['', ''];
  const progress = (currentIdx / QUESTION_COUNT) * 100;

  return (
    <div className="pb-4">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-[#2A2A30] text-gray-300 hover:bg-[#343A40]' : 'bg-gray-100 text-gray-600 hover:bg-200'}`}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h2 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>{t('game_fill_title', nativeLanguage)}</h2>
          <p className={`text-[11px] font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('game_fill_subtitle', nativeLanguage)}</p>
        </div>
        {difficulty && (
          <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: (activeDiffCfg?.color ?? '#888') + '22', color: activeDiffCfg?.color ?? '#888' }}>
            {currentIdx + 1}/{QUESTION_COUNT}
          </span>
        )}
      </div>

      {/* Difficulty picker — always visible */}
      <DiffPicker />

      {/* No difficulty selected */}
      {!difficulty && (
        <div className={`rounded-3xl border-2 border-dashed p-10 flex flex-col items-center justify-center text-center ${isDarkMode ? 'border-[#2A2A30]' : 'border-gray-200'}`}>
          <Puzzle className={`w-10 h-10 mb-3 ${isDarkMode ? 'text-gray-650' : 'text-gray-300'}`} />
          <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('game_select_diff_prompt', nativeLanguage)}</p>
        </div>
      )}

      {/* Game */}
      {difficulty && activeQ && (
        isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#4ECDC4] mb-3" />
            <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('quiz_loading', nativeLanguage)}
            </p>
          </div>
        ) : (
          <>
            <div className={`w-full h-1.5 rounded-full mb-6 ${isDarkMode ? 'bg-[#2A2A30]' : 'bg-gray-200'}`}>
              <motion.div className="h-full rounded-full"
                style={{ background: `linear-gradient(to right, ${activeDiffCfg?.color ?? '#8B5CF6'}aa, ${activeDiffCfg?.color ?? '#8B5CF6'})` }}
                animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 200, damping: 25 }} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={currentIdx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }}>
                <div className={`rounded-3xl p-5 mb-5 border-2 text-center flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]/70'}`}>
                  <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('quiz_fill_blank_prompt', nativeLanguage)}</p>
                  <p className={`text-lg font-bold leading-relaxed mb-3 text-center w-full break-words whitespace-normal ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                     {renderInteractiveText(parts[0])}
                     <span className={`inline-block mx-1 px-3 py-0.5 rounded-lg font-black border-b-2 transition-colors ${
                       !isAnswered ? 'text-violet-500 border-violet-500'
                       : selected !== null && activeQ.options[selected] === activeQ.answer ? 'text-emerald-500 border-emerald-500'
                       : 'text-rose-400 border-rose-400'
                     }`}>
                       {isAnswered && selected !== null ? activeQ.options[selected] : '___'}
                     </span>
                     {renderInteractiveText(parts[1])}
                   </p>
                   <p className={`text-xs leading-relaxed italic border-t pt-3 w-full text-center flex items-center justify-center gap-1.5 ${isDarkMode ? 'border-[#2A2A30] text-gray-500' : 'border-gray-100 text-gray-400'}`}>
                     <span>{getLanguageFlag(nativeLanguage)}</span>
                     <span>{activeQ.sentenceTr}</span>
                   </p>
                 </div>

                 <div className="grid grid-cols-2 gap-3 mb-5">
                   {activeQ.options.map((opt, idx) => {
                     const isCorrect = opt === activeQ.answer;
                     const isSelected = selected === idx;
                     let stateClass = '';
                     if (!isAnswered) {
                       stateClass = isDarkMode
                         ? 'bg-[#1A1A1E] border-[#2A2A30] text-gray-200 hover:border-violet-500/50 hover:text-violet-400 active:scale-95'
                         : 'bg-white border-[#FFE66D]/70 text-[#2D3436] hover:border-violet-400/50 hover:text-violet-600 active:scale-95';
                     } else if (isCorrect) {
                       stateClass = 'bg-emerald-500/15 border-emerald-500 text-emerald-500';
                     } else if (isSelected && !isCorrect) {
                       stateClass = 'bg-rose-500/15 border-rose-500 text-rose-500';
                     } else {
                       stateClass = isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30] text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-400';
                     }
                     return (
                       <button key={idx} onClick={() => handleSelect(idx)} disabled={isAnswered}
                         className={`py-3.5 px-4 rounded-2xl text-sm font-bold border-2 transition-all duration-200 flex items-center justify-between gap-2 w-full min-w-0 overflow-hidden ${stateClass}`}>
                         <span className="break-words text-left flex-1 whitespace-normal">{opt}</span>
                         {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                         {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 shrink-0" />}
                       </button>
                     );
                   })}
                 </div>

                {isAnswered && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-4 mb-4 border ${selected !== null && activeQ.options[selected] === activeQ.answer
                      ? (isDarkMode ? 'bg-emerald-950/30 border-emerald-700/40' : 'bg-emerald-50 border-emerald-200')
                      : (isDarkMode ? 'bg-rose-950/30 border-rose-700/40' : 'bg-rose-50 border-rose-200')}`}>
                    <p className={`text-xs font-bold ${selected !== null && activeQ.options[selected] === activeQ.answer ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {selected !== null && activeQ.options[selected] === activeQ.answer
                        ? t('game_correct_feedback', nativeLanguage)
                        : t('game_incorrect_feedback', nativeLanguage).replace('{answer}', activeQ.answer)}
                    </p>
                  </motion.div>
                )}

                {isAnswered && (
                  <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    onClick={handleNext}
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-violet-500/20">
                    {currentIdx < QUESTION_COUNT - 1
                      ? <><ArrowRight className="w-4 h-4" /> {t('game_next_question', nativeLanguage)}</>
                      : <><Trophy className="w-4 h-4" /> {t('game_see_results', nativeLanguage)}</>}
                  </motion.button>
                )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-1.5 mt-4 justify-center flex-wrap">
            {Array.from({ length: QUESTION_COUNT }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < answerHistory.length
                  ? (answerHistory[i] ? 'bg-emerald-500' : 'bg-rose-500')
                  : i === currentIdx ? 'scale-125' : (isDarkMode ? 'bg-[#2A2A30]' : 'bg-gray-200')
              }`}
                style={i === currentIdx && !answerHistory[i] !== undefined ? { backgroundColor: activeDiffCfg?.color } : undefined}
              />
            ))}
          </div>
        </>
      )
    )}

      {/* Word Translation Modal */}
      <AnimatePresence>
        {selectedWord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWord(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative z-10 w-full max-w-sm rounded-3xl p-6 shadow-2xl border-2 text-center flex flex-col items-center justify-center ${
                isDarkMode 
                  ? 'bg-[#1A1A1E] border-[#2A2A30] text-white' 
                  : 'bg-white border-[#FFE66D]/80 text-[#2D3436]'
              }`}
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <h3 className="text-2xl font-black">{selectedWord.word}</h3>
                <button
                  onClick={() => speakNative(selectedWord.word, 'en-US')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isDarkMode ? 'bg-violet-950/40 text-violet-400 hover:bg-violet-900/40' : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {selectedWord.level && (() => {
                const cleanL = (selectedWord.level || '').replace(' Seviyesi', '').replace(' Level', '').replace('Seviyesi', '').replace('Level', '').trim();
                const diffCfg = GAME_DIFF_CONFIG.find(c => cleanL && c.sub.includes(cleanL));
                return (
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase mb-4"
                    style={{
                      backgroundColor: (diffCfg?.color ?? '#8B5CF6') + '22',
                      color: diffCfg?.color ?? '#8B5CF6'
                    }}
                  >
                    {getFormattedLevel(selectedWord.level, nativeLanguage)}
                  </span>
                );
              })()}

              <div className={`w-full rounded-2xl p-4 mb-5 border ${
                isDarkMode ? 'bg-[#121214] border-[#2A2A30]' : 'bg-gray-50 border-gray-150'
              }`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t('game_match_tr_label', nativeLanguage)}</p>
                <p className="text-lg font-black text-violet-500">{selectedWord.translation}</p>
              </div>

              <button
                onClick={() => setSelectedWord(null)}
                className="w-full py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {t('btn_close', nativeLanguage)}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN VOCABULARY TAB
// ═══════════════════════════════════════════════════════════════════════════════
type ActiveGame = 'none' | 'synonym' | 'fillblank';

interface VocabularyTabProps {
  vocabulary: VocabularyWord[];
  books?: Book[];
  onStartQuiz: (mode: 'saved' | 'random') => void;
  onStartRandomQuizWithDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onRemoveWord: (wordId: string) => void;
  syncTrigger: () => void;
  isDarkMode?: boolean;
  onCompleteGame?: (gameType: 'synonym' | 'fillblank') => void;
  onSaveWord?: (word: string, translation: string, level: string, exampleEn?: string, exampleTr?: string) => void;
  nativeLanguage: LanguageCode;
}

export default function VocabularyTab({ vocabulary, books, onStartQuiz, onStartRandomQuizWithDifficulty, onRemoveWord, syncTrigger, isDarkMode, onCompleteGame, onSaveWord, nativeLanguage }: VocabularyTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [activeGame, setActiveGame] = useState<ActiveGame>('none');
  const [usedSynonymWords, setUsedSynonymWords] = useState<string[]>([]);
  const [usedFillSentences, setUsedFillSentences] = useState<string[]>([]);
  const [dummyRender, setDummyRender] = useState(0);

  // Background translation fetcher for saved vocabulary items
  useEffect(() => {
    if (nativeLanguage === 'tr' || vocabulary.length === 0) return;

    let isCancelled = false;
    const apiBase = (() => {
      try {
        if (window.location.protocol === 'capacitor:') {
          return 'https://ingilizce-oyk-m.onrender.com';
        }
        return '';
      } catch { return ''; }
    })();

    const fetchNextMissing = async () => {
      // Find a word translation to fetch
      for (const w of vocabulary) {
        const cleanW = w.word.toLowerCase().trim();
        const hasCache = (() => {
          const cacheKeyObj = `story_word_translations_cache_${nativeLanguage}`;
          const cacheJSON = localStorage.getItem(cacheKeyObj);
          if (cacheJSON) {
            try {
              const cache = JSON.parse(cacheJSON);
              if (cache[cleanW] && cache[cleanW].translation) return true;
            } catch {}
          }
          const indCacheKey = `linguist_dict_word_${cleanW}_${nativeLanguage}`;
          const indCache = localStorage.getItem(indCacheKey);
          if (indCache) {
            try {
              const parsed = JSON.parse(indCache);
              if (parsed.translation) return true;
            } catch {}
          }
          // Check offline pretranslated
          for (const bId in pretranslatedStories) {
            const offlineBook = pretranslatedStories[bId as keyof typeof pretranslatedStories];
            if (offlineBook && offlineBook.words && offlineBook.words[w.word as keyof typeof offlineBook.words]) {
              const offlineWord = offlineBook.words[w.word as keyof typeof offlineBook.words];
              if (offlineWord[nativeLanguage as keyof typeof offlineWord]) return true;
            }
          }
          return false;
        })();

        if (!hasCache) {
          try {
            const res = await fetch(`${apiBase}/api/translate-word`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ word: w.word, context: w.exampleEn || '', level: w.level || 'A1', targetLang: nativeLanguage })
            });
             if (res.ok) {
              const data = await res.json();
              if (data && data.translation) {
                const isTrLeak = (
                  (OFFLINE_DICTIONARY[cleanW] && OFFLINE_DICTIONARY[cleanW].tr.toLowerCase().trim() === data.translation.toLowerCase().trim()) ||
                  (GLOBAL_DICTIONARY[cleanW] && GLOBAL_DICTIONARY[cleanW].toLowerCase().trim() === data.translation.toLowerCase().trim())
                );
                if (isTrLeak) {
                  throw new Error('Server leaked Turkish translation');
                }
                const indCacheKey = `linguist_dict_word_${cleanW}_${nativeLanguage}`;
                localStorage.setItem(indCacheKey, JSON.stringify({
                  translation: data.translation,
                  notes: data.explanation || '',
                  level: data.wordLevel || 'A1'
                }));
                if (!isCancelled) {
                  setDummyRender(prev => prev + 1);
                }
              }
            }
          } catch (e) {
            console.error('Background translate-word error in VocabularyTab, trying client fallback:', e);
            try {
              const fallbackTr = await translateWithGoogleClient(w.word, nativeLanguage);
              const indCacheKey = `linguist_dict_word_${cleanW}_${nativeLanguage}`;
              localStorage.setItem(indCacheKey, JSON.stringify({
                translation: fallbackTr,
                notes: '',
                level: w.level || 'A1'
              }));
              if (!isCancelled) {
                setDummyRender(prev => prev + 1);
              }
            } catch (fallbackErr) {
              console.error('Client-side background word translation fallback failed:', fallbackErr);
            }
          }
          return;
        }
      }

      // If all words are translated, look for a missing sentence translation
      for (const w of vocabulary) {
        if (!w.exampleEn) continue;
        const cleanSent = w.exampleEn.toLowerCase().trim();
        const hasCache = (() => {
          const gameCacheKey = `linguist_trans_sentence_game_${cleanSent}_${nativeLanguage}`;
          if (localStorage.getItem(gameCacheKey)) return true;
          const cacheKey = `linguist_trans_sentence_example_${cleanSent}_${nativeLanguage}`;
          if (localStorage.getItem(cacheKey)) return true;
          return false;
        })();

        if (!hasCache) {
          try {
            const res = await fetch(`${apiBase}/api/translate-sentence`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: w.exampleEn, targetLang: nativeLanguage })
            });
            if (res.ok) {
              const data = await res.json();
              if (data && data.translation) {
                const cacheKey = `linguist_trans_sentence_example_${cleanSent}_${nativeLanguage}`;
                localStorage.setItem(cacheKey, data.translation);
                if (!isCancelled) {
                  setDummyRender(prev => prev + 1);
                }
              }
            }
          } catch (e) {
            console.error('Background translate-sentence error in VocabularyTab, trying client fallback:', e);
            try {
              const fallbackTr = await translateWithGoogleClient(w.exampleEn, nativeLanguage);
              const cacheKey = `linguist_trans_sentence_example_${cleanSent}_${nativeLanguage}`;
              localStorage.setItem(cacheKey, fallbackTr);
              if (!isCancelled) {
                setDummyRender(prev => prev + 1);
              }
            } catch (fallbackErr) {
              console.error('Client-side background sentence translation fallback failed:', fallbackErr);
            }
          }
          return;
        }
      }
    };

    const timer = setInterval(fetchNextMissing, 2000);
    fetchNextMissing();

    return () => {
      isCancelled = true;
      clearInterval(timer);
    };
  }, [nativeLanguage, vocabulary, dummyRender]);

  const filteredVocab = vocabulary.filter(w =>
    w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getNativeWordTranslation(w.word, w.translation, nativeLanguage, undefined, w.lang).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const speakWord = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakNative(text, 'en-US');
  };

  const handleRemove = (wordId: string) => { onRemoveWord(wordId); syncTrigger(); };

  if (activeGame === 'synonym') {
    return (
      <div className={`pb-36 max-w-[680px] mx-auto px-5 pt-6 transition-colors ${isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'}`}>
        <style>{`
          @keyframes shine {
            0% { transform: translateX(-150%) skewX(-25deg); }
            100% { transform: translateX(150%) skewX(-25deg); }
          }
          .animate-shine {
            animation: shine 3s infinite ease-in-out;
          }
        `}</style>
        <SynonymMatchGame
          vocabulary={vocabulary}
          books={books}
          isDarkMode={isDarkMode}
          onBack={() => setActiveGame('none')}
          usedSynonymWords={usedSynonymWords}
          setUsedSynonymWords={setUsedSynonymWords}
          onCompleteGame={onCompleteGame}
          onSaveWord={onSaveWord}
          onRemoveWord={onRemoveWord}
          nativeLanguage={nativeLanguage}
        />
      </div>
    );
  }
  if (activeGame === 'fillblank') {
    return (
      <div className={`pb-36 max-w-[680px] mx-auto px-5 pt-6 transition-colors w-full overflow-x-hidden ${isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'}`}>
        <style>{`
          @keyframes shine {
            0% { transform: translateX(-150%) skewX(-25deg); }
            100% { transform: translateX(150%) skewX(-25deg); }
          }
          .animate-shine {
            animation: shine 3s infinite ease-in-out;
          }
        `}</style>
        <FillInTheBlanksGame
          vocabulary={vocabulary}
          books={books}
          isDarkMode={isDarkMode}
          onBack={() => setActiveGame('none')}
          usedFillSentences={usedFillSentences}
          setUsedFillSentences={setUsedFillSentences}
          onCompleteGame={onCompleteGame}
          nativeLanguage={nativeLanguage}
        />
      </div>
    );
  }

  return (
    <div className={`pb-36 max-w-[680px] mx-auto px-5 pt-6 transition-colors ${isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'}`}>

      {/* ── Row 1: Kelimelerim + Rastgele Pratik ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div className={`relative overflow-hidden border-2 rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between group ${isDarkMode ? 'bg-[#1A1A1E]/80 border-[#2A2A30] hover:border-[#FF6B6B]/40' : 'bg-white border-[#FFE66D]/70 hover:border-[#FF6B6B]/40'}`}>
          <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-[#FF6B6B]/5 blur-xl group-hover:bg-[#FF6B6B]/10 transition-all duration-500 pointer-events-none" />
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDarkMode ? 'bg-[#FF6B6B]/15 text-[#FF6B6B]' : 'bg-[#FF6B6B]/10 text-[#FF6B6B]'}`}>
                <Brain className="w-5 h-5 fill-[#FF6B6B]/10 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${vocabulary.length > 0 ? (isDarkMode ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-200/50') : (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')}`}>
                {vocabulary.length > 0 ? `${vocabulary.length} ${t('words_count_suffix', nativeLanguage)}` : t('no_records', nativeLanguage)}
              </span>
            </div>
            <h3 className={`text-base font-black tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>{t('tab_words', nativeLanguage)}</h3>
            <p className={`text-xs leading-relaxed mb-6 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('practice_desc_saved', nativeLanguage)}</p>
          </div>
          <button onClick={() => vocabulary.length > 0 && onStartQuiz('saved')} disabled={vocabulary.length === 0}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-md transform active:scale-95 ${vocabulary.length > 0 ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white hover:scale-[1.02]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            <Zap className="w-3.5 h-3.5" />
            <span>{vocabulary.length > 0 ? t('btn_practice_start', nativeLanguage) : t('btn_practice_add_first', nativeLanguage)}</span>
          </button>
        </div>

        <div className={`relative overflow-hidden border-2 rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between group ${isDarkMode ? 'bg-[#1A1A1E]/80 border-[#2A2A30] hover:border-[#4ECDC4]/40' : 'bg-white border-[#FFE66D]/70 hover:border-[#4ECDC4]/40'}`}>
          <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-[#4ECDC4]/5 blur-xl group-hover:bg-[#4ECDC4]/10 transition-all duration-500 pointer-events-none" />
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDarkMode ? 'bg-[#4ECDC4]/15 text-[#4ECDC4]' : 'bg-[#4ECDC4]/10 text-[#4ECDC4]'}`}>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${selectedDifficulty === 'easy' ? (isDarkMode ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-200/50') : selectedDifficulty === 'medium' ? (isDarkMode ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30' : 'bg-amber-50 text-amber-600 border border-amber-200/50') : (isDarkMode ? 'bg-rose-950/40 text-rose-400 border border-rose-900/30' : 'bg-rose-50 text-rose-600 border border-rose-200/50')}`}>
                {selectedDifficulty === 'easy' ? t('difficulty_easy_label', nativeLanguage) : selectedDifficulty === 'medium' ? t('difficulty_medium_label', nativeLanguage) : t('difficulty_hard_label', nativeLanguage)}
              </span>
            </div>
            <h3 className={`text-base font-black tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>{t('random_practice_title', nativeLanguage)}</h3>
            <p className={`text-xs leading-relaxed mb-4 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('practice_desc_random', nativeLanguage)}</p>
            <div className="grid grid-cols-3 gap-1.5 mb-5">
              {([
                { key: 'easy', label: 'A1-A2', sub: t('difficulty_easy', nativeLanguage).split(' ')[0], colorClass: 'border-emerald-500/80 text-emerald-500 bg-emerald-500/10' },
                { key: 'medium', label: 'B1-B2', sub: t('difficulty_medium', nativeLanguage).split(' ')[0], colorClass: 'border-amber-500/80 text-amber-500 bg-amber-500/10' },
                { key: 'hard', label: 'C1', sub: t('difficulty_hard', nativeLanguage).split(' ')[0], colorClass: 'border-rose-500/80 text-rose-500 bg-rose-500/10' },
              ] as const).map(({ key, label, sub, colorClass }) => (
                <button key={key} onClick={() => setSelectedDifficulty(key)}
                  className={`py-2 px-1 rounded-xl text-center border-2 transition-all duration-200 active:scale-95 flex flex-col items-center ${selectedDifficulty === key ? `${colorClass} scale-[1.02]` : (isDarkMode ? 'bg-[#121214] border-[#2A2A30] text-gray-400 hover:border-[#4ECDC4]/30' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-[#4ECDC4]/30')}`}>
                  <span className="block text-[11px] font-black tracking-tight">{label}</span>
                  <span className="block text-[9px] font-bold mt-0.5 opacity-80">{sub}</span>
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => onStartRandomQuizWithDifficulty(selectedDifficulty)}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-md transform hover:scale-[1.02] active:scale-95 text-white ${selectedDifficulty === 'easy' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : selectedDifficulty === 'medium' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-rose-500 to-red-600'}`}>
            <Zap className="w-3.5 h-3.5 fill-current" /> <span>{t('btn_practice_start', nativeLanguage)}</span>
          </button>
        </div>
      </div>

      {/* ── Row 2: Eş Bulma + Boşluk Doldurmaca ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <div onClick={() => setActiveGame('synonym')}
          className={`relative overflow-hidden border-2 rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer ${isDarkMode ? 'bg-[#1A1A1E]/80 border-[#2A2A30] hover:border-amber-400/50' : 'bg-white border-[#FFE66D]/70 hover:border-amber-400/60'}`}>
          <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-amber-400/5 blur-xl group-hover:bg-amber-400/12 transition-all duration-500 pointer-events-none" />
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDarkMode ? 'bg-amber-400/15 text-amber-400' : 'bg-amber-400/15 text-amber-500'}`}>
                <Link2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${isDarkMode ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30' : 'bg-amber-50 text-amber-600 border border-amber-200/50'}`}>
                {`${t('difficulty_easy', nativeLanguage).split(' ')[0].toUpperCase()} · ${t('difficulty_medium', nativeLanguage).split(' ')[0].toUpperCase()} · ${t('difficulty_hard', nativeLanguage).split(' ')[0].toUpperCase()}`}
              </span>
            </div>
            <h3 className={`text-base font-black tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>{t('game_match_title', nativeLanguage)}</h3>
            <p className={`text-xs leading-relaxed mb-6 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('game_match_desc', nativeLanguage)}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setActiveGame('synonym'); }}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-md transform hover:scale-[1.02] active:scale-95 ${isDarkMode ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900' : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-900'}`}>
            <Link2 className="w-3.5 h-3.5" /> <span>{t('play_game_btn', nativeLanguage)}</span>
          </button>
        </div>

        <div onClick={() => setActiveGame('fillblank')}
          className={`relative overflow-hidden border-2 rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer ${isDarkMode ? 'bg-[#1A1A1E]/80 border-[#2A2A30] hover:border-violet-500/40' : 'bg-white border-[#FFE66D]/70 hover:border-violet-400/50'}`}>
          <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-violet-500/5 blur-xl group-hover:bg-violet-500/10 transition-all duration-500 pointer-events-none" />
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDarkMode ? 'bg-violet-500/15 text-violet-400' : 'bg-violet-500/10 text-violet-500'}`}>
                <Puzzle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${isDarkMode ? 'bg-violet-950/40 text-violet-400 border border-violet-900/30' : 'bg-violet-50 text-violet-600 border border-violet-200/50'}`}>
                {`${t('difficulty_easy', nativeLanguage).split(' ')[0].toUpperCase()} · ${t('difficulty_medium', nativeLanguage).split(' ')[0].toUpperCase()} · ${t('difficulty_hard', nativeLanguage).split(' ')[0].toUpperCase()}`}
              </span>
            </div>
            <h3 className={`text-base font-black tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>{t('game_fill_title', nativeLanguage)}</h3>
            <p className={`text-xs leading-relaxed mb-6 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('game_fill_desc', nativeLanguage)}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setActiveGame('fillblank'); }}
            className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-md transform hover:scale-[1.02] active:scale-95 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
            <Puzzle className="w-3.5 h-3.5" /> <span>{t('play_game_btn', nativeLanguage)}</span>
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#FF6B6B]">
          <Search className="w-4 h-4" />
        </span>
        <input type="text" placeholder={t('search_saved_placeholder', nativeLanguage)}
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] transition-all ${isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30] text-white placeholder-gray-500' : 'bg-white border-[#FFE66D] text-[#2D3436] placeholder-gray-400'}`} />
      </div>

      {/* ── Vocabulary List ── */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredVocab.length > 0 ? (
            filteredVocab.map((w, idx) => (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.4) }}
                key={w.id}
                className={`border rounded-2xl p-5 flex flex-col justify-between group transition-all duration-300 relative ${isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30] hover:border-[#FF6B6B]/45' : 'bg-white border-[#FFE66D]/50 hover:border-[#FF6B6B]/45'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className={`font-headline-lg text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>{w.word}</h3>
                      <button onClick={(e) => speakWord(e, w.word)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-[#2A2A30] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white' : 'bg-[#FF6B6B]/10 text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white'}`}>
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] text-[#FF6B6B] font-extrabold tracking-wide uppercase">{getNativeWordTranslation(w.word, w.translation, nativeLanguage, undefined, w.lang)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    {(() => {
                      const key = w.word.toLowerCase().trim();
                      const dictItem = OFFLINE_DICTIONARY[key];
                      const lvl = dictItem ? dictItem.level : (w.level || 'A1');
                      const color = getLevelColor(lvl);
                      return (
                        <span className="text-[9px] uppercase tracking-wider font-extrabold border px-2.5 py-0.5 rounded-full"
                          style={{ color, backgroundColor: hexToRgba(color, 0.1), borderColor: hexToRgba(color, 0.25) }}>
                          {getFormattedLevel(lvl, nativeLanguage)}
                        </span>
                      );
                    })()}
                    <button onClick={() => handleRemove(w.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${isDarkMode ? 'border-transparent text-gray-500 hover:text-red-400 hover:bg-red-950/15' : 'border-transparent text-gray-450 hover:text-red-500 hover:bg-red-50'}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {(w.exampleEn || w.notes) && (
                  <div className={`mt-3.5 text-xs p-3 rounded-xl border-l-4 ${isDarkMode ? 'bg-[#121214] border-l-[#FF6B6B] border-y-[#2A2A30] border-r-[#2A2A30] text-gray-300' : 'bg-[#FFE66D]/5 border-l-[#FF6B6B] border-y-[#FFE66D]/40 border-r-[#FFE66D]/40 text-gray-700'}`}>
                    {w.notes && (
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Bookmark className="w-3 h-3 text-[#FF6B6B]" />
                        <span>
                          {t('vocab_note_prefix', nativeLanguage).replace('{note}', 
                            w.notes === 'vocab_saved_from_story' || w.notes === 'vocab_saved_from_story_updated'
                              ? t(w.notes, nativeLanguage)
                              : w.notes
                          )}
                        </span>
                      </p>
                    )}
                    {w.exampleEn && (
                      <div className="mt-1 leading-relaxed">
                        <p className="font-semibold text-gray-700 dark:text-gray-200">{w.exampleEn}</p>
                        <p className="text-[#FF6B6B] font-bold mt-0.5">{getNativeSentenceTranslation(w.exampleEn, w.exampleTr, nativeLanguage, w.lang)}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`border-2 border-dashed rounded-[24px] p-10 flex flex-col items-center justify-center text-center mt-4 ${isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'}`}>
              <BookOpen className="w-10 h-10 text-[#FF6B6B] mb-3" />
              <p className={`text-sm font-bold max-w-[280px] ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {searchQuery ? t('search_no_results', nativeLanguage) : t('vocab_empty_msg', nativeLanguage)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
