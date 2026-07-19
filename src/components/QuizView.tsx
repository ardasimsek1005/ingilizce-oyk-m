import React, { useState, useEffect } from 'react';
import { Heart, Brain, AlertCircle, CheckCircle2, ChevronRight, Sparkles, ShieldCheck, CreditCard, Lock, RefreshCw, X, Award, Crown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { purchasePlayStoreSubscription, restorePlayStorePurchases, getLocalizedPrices, registerPricingListener } from '../services/billing';
import { Book, QuizQuestion, UserStats, VocabularyWord, getLevelColor, hexToRgba } from '../types';
import { OFFLINE_DICTIONARY } from '../dictionary';
import { GLOBAL_DICTIONARY } from '../data';
import { SUPPORTED_LANGUAGES, LanguageCode, t, translateWithGoogleClient } from '../i18n';
import pretranslatedStories from '../pretranslated_stories.json';

interface QuizViewProps {
  stats: UserStats;
  vocabulary: VocabularyWord[];
  books: Book[];
  quizMode: 'saved' | 'random';
  initialDifficulty?: 'easy' | 'medium' | 'hard';
  initiallyShowPaywall?: boolean;
  onAnswerCorrect: () => void;
  onAnswerIncorrect: () => void;
  onSubscribe: (tier: 'monthly' | 'yearly' | 'trial') => void;
  onBackToVocabulary: () => void;
  onGoToLibrary: () => void;
  syncTrigger: () => void;
  isDarkMode?: boolean;
  onUnlockBadge?: (id: string) => void;
  refillCountdown: string;
  onQuizCompleted?: (score: number, totalQuestions: number) => void;
  nativeLanguage: LanguageCode;
}

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

const looksLikeProperNoun = (w: string): boolean => {
  if (!w) return false;
  const trimmed = w.trim();
  if (!/^[A-Z]/.test(trimmed)) return false;
  return !isCommonEnglishWord(trimmed);
};

const isProperNoun = (word: string, level?: string): boolean => {
  if (!word) return false;
  const cleanWord = word.trim().toLowerCase();
  
  if (level) {
    const cleanLevel = level.toLowerCase();
    if (cleanLevel.includes('özel') || cleanLevel.includes('isim') || cleanLevel.includes('name') || cleanLevel.includes('proper')) {
      return true;
    }
    if (/(a1|a2|b1|b2|c1|c2|seviye)/.test(cleanLevel) && !PROPER_NAMES_SET.has(cleanWord)) {
      return false;
    }
  }
  
  if (PROPER_NAMES_SET.has(cleanWord)) {
    return true;
  }
  
  return looksLikeProperNoun(word);
};

const isTurkishProperNoun = (tr: string): boolean => {
  if (!tr) return false;
  const trClean = tr.trim().toLowerCase();
  if (trClean.includes('özel') || trClean.includes('isim')) return true;
  
  const words = trClean.split(/\s+/);
  for (const w of words) {
    const cleanW = w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”指標‘’\[\]{}<>|\\+]/g, "");
    if (PROPER_NAMES_SET.has(cleanW)) {
      return true;
    }
  }
  return false;
};

const findSentenceInBooks = (word: string, books: Book[]): { en: string; tr: string } | null => {
  if (!word || !books) return null;
  const cleanWord = word.toLowerCase().trim();
  
  for (const book of books) {
    for (const chapter of book.chapters) {
      for (const p of chapter.paragraphs) {
        const wordsInP = p.words || [];
        const hasWord = wordsInP.some(w => w.en.toLowerCase().trim() === cleanWord);
        
        if (hasWord) {
          const sentencesEn = p.textEn.split(/(?<=[.!?])\s+/);
          const sentencesTr = p.textTr.split(/(?<=[.!?])\s+/);
          
          for (let i = 0; i < sentencesEn.length; i++) {
            const sent = sentencesEn[i];
            const trimmed = sent.trim();
            
            // Üç nokta içeren, üç nokta veya eksi işaretiyle başlayan cümleleri es geç
            if (trimmed.includes('...') || trimmed.includes('…') || trimmed.startsWith('-') || /^[.·…\-\s]/.test(trimmed) || /^[“"‘'][.·…]/.test(trimmed)) {
              continue;
            }

            const cleanSent = sent.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”指標‘’\[\]{}<>|\\+]/g, " ");
            const words = cleanSent.split(/\s+/).filter(Boolean);
            
            // Cümle uzunluğunu 5 ile 13 kelime arası ile sınırla
            if (words.length < 5 || words.length > 13) continue;

            if (words.includes(cleanWord)) {
              const enTr = sentencesTr[i] || p.textTr;
              return { en: sent, tr: enTr };
            }
          }
        }
      }
    }
  }
  return null;
};

const getFallbackSentence = (word: string, translation: string, nativeLanguage: LanguageCode): { en: string; tr: string } => {
  const wLower = word.toLowerCase().trim();
  const tLower = translation.toLowerCase().trim();
  
  if (wLower === 'nice') {
    return {
      en: 'Have a nice day!',
      tr: nativeLanguage === 'tr' ? 'İyi günler!' : ''
    };
  }
  
  const dictItem = OFFLINE_DICTIONARY[wLower];
  const notes = dictItem?.notes ? dictItem.notes.toLowerCase() : '';
  const isAdjective = notes.includes('sıfat') || notes.includes('adjective');
  const isVerb = notes.includes('fiil') || notes.includes('verb') || tLower.endsWith('mek') || tLower.endsWith('mak');
  
  if (isAdjective) {
    return {
      en: `This is a ${wLower} day.`,
      tr: nativeLanguage === 'tr' ? `Bu ${tLower} bir gün.` : ''
    };
  }
  
  if (isVerb) {
    return {
      en: `I want to ${wLower} now.`,
      tr: nativeLanguage === 'tr' ? `Şimdi ${tLower} istiyorum.` : ''
    };
  }
  
  // Nouns and default fallbacks
  return {
    en: `This is a very nice ${wLower}.`,
    tr: nativeLanguage === 'tr' ? `Bu çok güzel bir ${tLower}.` : ''
  };
};

const DEFAULT_DISTRACTORS: Record<LanguageCode, string[]> = {
  tr: ['koşmak', 'ev', 'yemek', 'gülümsemek', 'ağaç', 'sepet', 'köpek', 'mutlu', 'zaman', 'gün', 'kitap'],
  en: ['run', 'house', 'eat', 'smile', 'tree', 'basket', 'dog', 'happy', 'time', 'day', 'book'],
  es: ['correr', 'casa', 'comer', 'sonreír', 'árbol', 'cesta', 'perro', 'feliz', 'tiempo', 'día', 'libro'],
  fr: ['courir', 'maison', 'manger', 'sourire', 'arbre', 'panier', 'chien', 'heureux', 'temps', 'jour', 'livre'],
  de: ['laufen', 'haus', 'essen', 'lächeln', 'baum', 'korb', 'hund', 'glücklich', 'zeit', 'tag', 'buch'],
  it: ['correre', 'casa', 'mangiare', 'sorridere', 'albero', 'cestino', 'cane', 'felice', 'tempo', 'giorno', 'libro'],
  pt: ['correr', 'casa', 'comer', 'sorrir', 'árvore', 'cesta', 'cachorro', 'feliz', 'tempo', 'dia', 'livro'],
  ru: ['бежать', 'дом', 'есть', 'улыбаться', 'дерево', 'корзина', 'собака', 'счастливый', 'время', 'день', 'книга'],
  ar: ['يجري', 'بيت', 'يأكل', 'يبتسم', 'شجرة', 'سلة', 'كلب', 'سعيد', 'الوقت', 'يوم', 'كتاب'],
  zh: ['跑', '房子', '吃', '微笑', '树', '篮子', '狗', '快乐', '时间', '天', '书'],
  hi: ['दौड़ना', 'घर', 'खाना', 'मुस्कुराना', 'पेड़', 'टोकरी', 'कुत्ता', 'खुश', 'समय', 'दिन', 'किताब'],
  ja: ['走る', '家', '食べる', '微笑む', '木', 'かご', '犬', '嬉しい', '時間', '日', '本']
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
        return cache[wLower].translation;
      }
    } catch (e) {}
  }
  
  if (bookId) {
    const offlineBook = pretranslatedStories[bookId as keyof typeof pretranslatedStories];
    if (offlineBook && offlineBook.words && offlineBook.words[wLower as keyof typeof offlineBook.words]) {
      const offlineWord = offlineBook.words[wLower as keyof typeof offlineBook.words];
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
        return parsed.translation;
      }
    } catch (e) {}
  }
  
  for (const bId in pretranslatedStories) {
    const offlineBook = pretranslatedStories[bId as keyof typeof pretranslatedStories];
    if (offlineBook && offlineBook.words && offlineBook.words[wLower as keyof typeof offlineBook.words]) {
      const offlineWord = offlineBook.words[wLower as keyof typeof offlineBook.words];
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

const generateVocabularyQuiz = (vocabList: VocabularyWord[], books: Book[], nativeLanguage: LanguageCode, excludeFillBlank: boolean = false): QuizQuestion[] => {
  if (!vocabList) return [];
  
  // 1. Filter out proper nouns (names) and the word 'harness'
  const filteredVocab = vocabList.filter(item => 
    !isProperNoun(item.word, item.level) && 
    item.word.toLowerCase().trim() !== 'harness'
  );
  if (filteredVocab.length < 3) return [];
  
  // Quiz is always exactly 15 questions if filteredVocab.length >= 3
  const questionsList: { item: VocabularyWord; qType: 'en_to_tr' | 'tr_to_en' | 'fill_blank' }[] = [];
  const generatedTypes = new Map<string, Set<string>>();
  let attempt = 0;
  
  while (questionsList.length < 15 && attempt < 100) {
    attempt++;
    const shuffled = [...filteredVocab].sort(() => 0.5 - Math.random());
    for (const item of shuffled) {
      if (questionsList.length >= 15) break;
      
      if (!generatedTypes.has(item.id)) {
        generatedTypes.set(item.id, new Set());
      }
      const typesSet = generatedTypes.get(item.id)!;
      
      const bookSentence = findSentenceInBooks(item.word, books);
      const hasSentence = !!(item.exampleEn || (bookSentence && bookSentence.en.split(/\s+/).length < 15));
      
      const possibleTypes: ('en_to_tr' | 'tr_to_en' | 'fill_blank')[] = (hasSentence && !excludeFillBlank)
        ? ['en_to_tr', 'tr_to_en', 'fill_blank']
        : ['en_to_tr', 'tr_to_en'];
      
      const remainingTypes = possibleTypes.filter(t => !typesSet.has(t));
      if (remainingTypes.length === 0) {
        continue;
      }
      
      const qType = remainingTypes[Math.floor(Math.random() * remainingTypes.length)];
      typesSet.add(qType);
      
      questionsList.push({ item, qType });
    }
  }
  
  if (questionsList.length < 15) {
    let fallbackAttempt = 0;
    while (questionsList.length < 15 && fallbackAttempt < 50) {
      fallbackAttempt++;
      for (const item of filteredVocab) {
        if (questionsList.length >= 15) break;
        
        const bookSentence = findSentenceInBooks(item.word, books);
        const hasSentence = !!(item.exampleEn || (bookSentence && bookSentence.en.split(/\s+/).length < 15));
        
        const possibleTypes: ('en_to_tr' | 'tr_to_en' | 'fill_blank')[] = (hasSentence && !excludeFillBlank)
          ? ['en_to_tr', 'tr_to_en', 'fill_blank']
          : ['en_to_tr', 'tr_to_en'];
          
        const qType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
        questionsList.push({ item, qType });
      }
    }
  }
  
  return questionsList.map((qInfo, qIdx) => {
    const item = qInfo.item;
    const qType = qInfo.qType;
    
    let exampleEn = item.exampleEn;
    let exampleTr = item.exampleTr;
    
    if (!exampleEn) {
      const bookSentence = findSentenceInBooks(item.word, books);
      if (bookSentence && bookSentence.en.split(/\s+/).length < 15) {
        exampleEn = bookSentence.en;
        exampleTr = bookSentence.tr;
      } else {
        exampleEn = '';
        exampleTr = '';
      }
    }

    const nativeTranslation = getNativeWordTranslation(item.word, item.translation, nativeLanguage, undefined, item.lang);
    let nativeExampleTr = getNativeSentenceTranslation(exampleEn, exampleTr || '', nativeLanguage, item.lang);
    
    // Distractors (wrong options)
    const cleanW = item.word.toLowerCase().trim();
    const dictItem = OFFLINE_DICTIONARY[cleanW];
    const rawLevel = (dictItem ? dictItem.level : (item.level || 'A1')).trim().toUpperCase();
    const levelCode = rawLevel.substring(0, 2); // "A1", "A2", "B1", "B2", "C1"

    // Build adjacent-level fallback order: exact → 1 step away → 2 steps → all
    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const exactIdx = levelOrder.indexOf(levelCode);
    const levelPriority: string[][] = [
      [levelCode],
      levelOrder.filter((_, i) => Math.abs(i - exactIdx) === 1),
      levelOrder.filter((_, i) => Math.abs(i - exactIdx) === 2),
      levelOrder.filter((_, i) => Math.abs(i - exactIdx) >= 3),
    ];

    const levelPool: { en: string; tr: string }[] = [];
    const seenWords = new Set<string>();
    const correctWordLower = item.word.toLowerCase().trim();

    const addWordsFromBooks = (targetLevels: string[]) => {
      if (!books || books.length === 0) return;
      books.forEach(book => {
        if (!targetLevels.includes(book.level)) return;
        book.chapters.forEach(chapter => {
          chapter.paragraphs.forEach(p => {
            if (p.words) {
              p.words.forEach(w => {
                const key = w.en.toLowerCase().trim();
                if (!seenWords.has(key) && !isProperNoun(w.en) && key !== correctWordLower && key !== 'harness' && w.en.length > 2) {
                  // Verify that the word's true level matches targetLevels
                  const dictItem = OFFLINE_DICTIONARY[key];
                  const actualLevel = dictItem ? dictItem.level : book.level;
                  if (targetLevels.includes(actualLevel)) {
                    seenWords.add(key);
                    levelPool.push({ en: w.en, tr: getNativeWordTranslation(w.en, w.tr, nativeLanguage, book.id) });
                  }
                }
              });
            }
          });
        });
      });
    };

    // Fill pool tier by tier until we have enough candidates
    for (const tier of levelPriority) {
      if (levelPool.length >= 15) break;
      addWordsFromBooks(tier);
    }

    // Also add sibling saved-vocabulary items as distractors (same-ish level)
    if (levelPool.length < 8 && vocabList && vocabList.length > 1) {
      vocabList.forEach(v => {
        const key = v.word.toLowerCase().trim();
        if (!seenWords.has(key) && key !== correctWordLower && !isProperNoun(v.word) && v.translation) {
          seenWords.add(key);
          levelPool.push({ en: v.word, tr: getNativeWordTranslation(v.word, v.translation, nativeLanguage, undefined, v.lang) });
        }
      });
    }
    
    const defaultTrDistractors = DEFAULT_DISTRACTORS[nativeLanguage] || DEFAULT_DISTRACTORS['tr'];
    const defaultEnDistractors = DEFAULT_DISTRACTORS['en'];

    let correctValue = '';
    let questionText = '';
    let hintText = '';
    let explanationText = '';
    let distractors: string[] = [];

    if (qType === 'fill_blank') {
      correctValue = item.word;
      
      const cleanW = item.word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”‘’\[\]{}<>|\\+]/g, "").trim();
      const regex = new RegExp('\\b' + cleanW + '\\b', 'gi');
      
      let sentenceToUse = exampleEn || '';
      if (!regex.test(sentenceToUse) && sentenceToUse.toLowerCase().indexOf(cleanW.toLowerCase()) === -1) {
        const fallback = getFallbackSentence(item.word, item.translation, nativeLanguage);
        sentenceToUse = fallback.en;
        nativeExampleTr = fallback.tr;
      }
      
      questionText = sentenceToUse.replace(regex, '_____');
      
      if (questionText === sentenceToUse) {
        const lowerSentence = sentenceToUse.toLowerCase();
        const cleanLowerWord = cleanW.toLowerCase();
        const idx = lowerSentence.indexOf(cleanLowerWord);
        if (idx !== -1) {
          questionText = sentenceToUse.substring(0, idx) + '_____' + sentenceToUse.substring(idx + cleanW.length);
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
      
      hintText = nativeExampleTr ? `${t('translation', nativeLanguage)}: "${nativeExampleTr}"` : t('quiz_fill_blank_prompt', nativeLanguage);
      explanationText = t('quiz_explanation_fill_blank', nativeLanguage)
        .replace('{word}', item.word)
        .replace('{translation}', nativeTranslation)
        .replace('{sentence}', exampleEn);
      
      // English distractors
      const cleanCorrect = correctValue.trim().toLowerCase();
      const distractorList: string[] = [];
      const distractorSetLower = new Set<string>();
      
      const shuffledPool = [...levelPool].sort(() => 0.5 - Math.random());
      for (const w of shuffledPool) {
        const d = w.en.trim();
        const dLower = d.toLowerCase();
        if (dLower !== cleanCorrect && !isProperNoun(d) && !PROPER_NAMES_SET.has(dLower) && !distractorSetLower.has(dLower)) {
          distractorList.push(d);
          distractorSetLower.add(dLower);
          if (distractorList.length >= 3) break;
        }
      }
      
      if (distractorList.length < 3) {
        const shuffledDefault = [...defaultEnDistractors].sort(() => 0.5 - Math.random());
        for (const d of shuffledDefault) {
          const dClean = d.trim();
          const dLower = dClean.toLowerCase();
          if (dLower !== cleanCorrect && !distractorSetLower.has(dLower) && !isProperNoun(dClean) && !PROPER_NAMES_SET.has(dLower)) {
            distractorList.push(dClean);
            distractorSetLower.add(dLower);
            if (distractorList.length >= 3) break;
          }
        }
      }
      distractors = distractorList;
    } else if (qType === 'tr_to_en') {
      correctValue = item.word;
      questionText = `"${nativeTranslation}" ${t('quiz_translation_prompt', nativeLanguage)}`;
      hintText = t('quiz_hint_level', nativeLanguage).replace('{level}', levelCode);
      explanationText = t('quiz_explanation_tr_to_en', nativeLanguage)
        .replace('{translation}', nativeTranslation)
        .replace('{word}', item.word);
      
      // English distractors
      const cleanCorrect = correctValue.trim().toLowerCase();
      const distractorList: string[] = [];
      const distractorSetLower = new Set<string>();
      
      const shuffledPool = [...levelPool].sort(() => 0.5 - Math.random());
      for (const w of shuffledPool) {
        const d = w.en.trim();
        const dLower = d.toLowerCase();
        if (dLower !== cleanCorrect && !isProperNoun(d) && !PROPER_NAMES_SET.has(dLower) && !distractorSetLower.has(dLower)) {
          distractorList.push(d);
          distractorSetLower.add(dLower);
          if (distractorList.length >= 3) break;
        }
      }
      
      if (distractorList.length < 3) {
        const shuffledDefault = [...defaultEnDistractors].sort(() => 0.5 - Math.random());
        for (const d of shuffledDefault) {
          const dClean = d.trim();
          const dLower = dClean.toLowerCase();
          if (dLower !== cleanCorrect && !distractorSetLower.has(dLower) && !isProperNoun(dClean) && !PROPER_NAMES_SET.has(dLower)) {
            distractorList.push(dClean);
            distractorSetLower.add(dLower);
            if (distractorList.length >= 3) break;
          }
        }
      }
      distractors = distractorList;
    } else {
      correctValue = nativeTranslation;
      questionText = `"${item.word}" ${t('quiz_meaning_prompt', nativeLanguage)}`;
      hintText = exampleEn ? `${t('quiz_hint_prefix', nativeLanguage)}"${exampleEn}"` : t('quiz_hint_level', nativeLanguage).replace('{level}', levelCode);
      explanationText = t('quiz_explanation_en_to_tr', nativeLanguage)
        .replace('{word}', item.word)
        .replace('{translation}', nativeTranslation);
      
      // Turkish (native) distractors
      const cleanCorrect = correctValue.trim().toLowerCase();
      const distractorList: string[] = [];
      const distractorSetLower = new Set<string>();
      
      const shuffledPool = [...levelPool].sort(() => 0.5 - Math.random());
      for (const w of shuffledPool) {
        if (!w.tr) continue;
        const d = w.tr.trim();
        const dLower = d.toLowerCase();
        // isTurkishProperNoun only relevant when native lang is Turkish
        const isNativeProperNoun = nativeLanguage === 'tr' ? isTurkishProperNoun(d) : false;
        if (dLower !== cleanCorrect && !isNativeProperNoun && !isProperNoun(w.en) && !distractorSetLower.has(dLower)) {
          distractorList.push(d);
          distractorSetLower.add(dLower);
          if (distractorList.length >= 3) break;
        }
      }
      
      if (distractorList.length < 3) {
        const shuffledDefault = [...defaultTrDistractors].sort(() => 0.5 - Math.random());
        for (const d of shuffledDefault) {
          const dClean = d.trim();
          const dLower = dClean.toLowerCase();
          const isNativeProperNoun = nativeLanguage === 'tr' ? isTurkishProperNoun(dClean) : false;
          if (dLower !== cleanCorrect && !distractorSetLower.has(dLower) && !isNativeProperNoun) {
            distractorList.push(dClean);
            distractorSetLower.add(dLower);
            if (distractorList.length >= 3) break;
          }
        }
      }
      distractors = distractorList;
    }

    const options = [correctValue, ...distractors].sort(() => 0.5 - Math.random());
    const correctIndex = options.indexOf(correctValue);

    return {
      id: `vocab_q_${qIdx}_${item.id}`,
      word: item.word,
      translation: nativeTranslation,
      level: item.level,
      options,
      optionsEn: options.map(opt => {
        if (qType === 'en_to_tr') {
          const found = levelPool.find(x => x.tr === opt) || (nativeTranslation === opt ? item : null);
          if (!found) return opt;
          return 'word' in found ? found.word : found.en;
        } else {
          return opt;
        }
      }),
      correctIndex,
      hint: hintText,
      explanation: explanationText,
      questionText,
      qType,
      sentenceEn: exampleEn,
      sentenceTr: nativeExampleTr
    };
  });
};

const generateRandomQuizForLevels = (levels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1')[], books: Book[], nativeLanguage: LanguageCode): QuizQuestion[] => {
  // 1. Gather all words from all books of the specified levels
  const wordPool: { en: string; tr: string; level: string; exampleEn?: string; exampleTr?: string }[] = [];
  const seenWords = new Set<string>();
  
  // We scan all books, but only keep words whose actual dictionary level matches the target levels
  books.forEach(book => {
    book.chapters.forEach(chapter => {
      chapter.paragraphs.forEach(p => {
        if (p.words) {
          p.words.forEach(w => {
            const key = w.en.toLowerCase().trim();
            if (!seenWords.has(key) && !isProperNoun(w.en) && w.en.length > 2 && key !== 'harness') {
              // Look up in OFFLINE_DICTIONARY to get the word's true level
              const dictItem = OFFLINE_DICTIONARY[key];
              const actualLevel = dictItem ? dictItem.level : book.level;
              
              if (levels.includes(actualLevel as any)) {
                seenWords.add(key);
                
                // Try to find a context sentence from the paragraph without lookbehinds (safari friendly)
                let contextEn = '';
                let contextTr = '';
                const sentencesEn = p.textEn.split(/[.!?]/).map(s => s.trim()).filter(Boolean);
                const sentencesTr = p.textTr.split(/[.!?]/).map(s => s.trim()).filter(Boolean);
                
                for (let i = 0; i < sentencesEn.length; i++) {
                  const sent = sentencesEn[i];
                  const trimmed = sent.trim();
                  
                  // Üç nokta içeren, üç nokta veya eksiyle başlayan cümleleri es geç
                  if (trimmed.includes('...') || trimmed.includes('…') || trimmed.startsWith('-') || /^[.·…\-\s]/.test(trimmed) || /^[“"‘'][.·…]/.test(trimmed)) {
                    continue;
                  }

                  const cleanSent = sent.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”]/g, " ");
                  const words = cleanSent.split(/\s+/).filter(Boolean);
                  
                  // Kelime sayısını 5-13 arası ile sınırla
                  if (words.length < 5 || words.length > 13) continue;

                  if (words.includes(key)) {
                    contextEn = sent + '.';
                    contextTr = sentencesTr[i] || p.textTr;
                    break;
                  }
                }
                
                if (!contextEn && sentencesEn.length > 0) {
                  // Fallback: İlk temiz cümleyi bulmaya çalış, yoksa ilk cümleyi seç
                  const cleanFallback = sentencesEn.find(s => {
                    const t = s.trim();
                    return !(t.includes('...') || t.includes('…') || t.startsWith('-') || /^[.·…\-\s]/.test(t) || /^[“"‘'][.·…]/.test(t));
                  });
                  const chosenFallback = cleanFallback || sentencesEn[0];
                  contextEn = chosenFallback + '.';
                  const fallbackIdx = sentencesEn.indexOf(chosenFallback);
                  contextTr = sentencesTr[fallbackIdx] || p.textTr;
                }
                
                wordPool.push({
                  en: w.en,
                  tr: w.tr,
                  level: actualLevel,
                  exampleEn: contextEn,
                  exampleTr: contextTr
                });
              }
            }
          });
        }
      });
    });
  });
  
  // If the pool is too small, fallback to other levels (still filtering strictly by levels)
  if (wordPool.length < 15) {
    books.forEach(book => {
      book.chapters.forEach(chapter => {
        chapter.paragraphs.forEach(p => {
          if (p.words) {
            p.words.forEach(w => {
              const key = w.en.toLowerCase().trim();
              if (!seenWords.has(key) && !isProperNoun(w.en) && w.en.length > 2 && key !== 'harness') {
                const dictItem = OFFLINE_DICTIONARY[key];
                const actualLevel = dictItem ? dictItem.level : book.level;
                if (levels.includes(actualLevel as any)) {
                  seenWords.add(key);
                  wordPool.push({
                    en: w.en,
                    tr: w.tr,
                    level: actualLevel
                  });
                }
              }
            });
          }
        });
      });
    });
  }
  
  // Select 15 random words from the pool
  const selectedWords = [...wordPool].sort(() => 0.5 - Math.random()).slice(0, 15);
  
  // Transform selected words into VocabularyWord structure for the existing generateVocabularyQuiz function
  const vocabWords: VocabularyWord[] = selectedWords.map((item, idx) => ({
    id: `rand_word_${idx}_${Date.now()}`,
    word: item.en,
    translation: item.tr,
    level: item.level,
    exampleEn: item.exampleEn,
    exampleTr: item.exampleTr,
    savedAt: new Date().toISOString()
  }));
  
  return generateVocabularyQuiz(vocabWords, books, nativeLanguage, true);
};

export default function QuizView({
  stats,
  vocabulary,
  books,
  quizMode,
  initialDifficulty = 'easy',
  initiallyShowPaywall = false,
  onAnswerCorrect,
  onAnswerIncorrect,
  onSubscribe,
  onBackToVocabulary,
  onGoToLibrary,
  syncTrigger,
  isDarkMode,
  onUnlockBadge,
  refillCountdown,
  onQuizCompleted,
  nativeLanguage,
}: QuizViewProps) {
  // Questions navigation & status structures
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showSubscriptionPanel, setShowSubscriptionPanel] = useState(initiallyShowPaywall);
  const [isCompleted, setIsCompleted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{
    wordIndex: number;
    word: string;
    translation: string;
  } | null>(null);

  const getLanguageFlag = (lang: string): string => {
    const flags: Record<string, string> = {
      tr: '🇹🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪', fr: '🇫🇷',
      it: '🇮🇹', pt: '🇵🇹', ru: '🇷🇺', ar: '🇸🇦', zh: '🇨🇳', hi: '🇮🇳', ja: '🇯🇵'
    };
    return flags[lang] || '🌐';
  };

  // Safe cleaner for dictionary formatting
  const cleanWord = (w: string): string => {
    if (!w) return "";
    return w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”‘’\[\]{}<>|\\+]/g, "").trim();
  };

  const getCachedTranslation = (word: string) => {
    try {
      const wLower = word.toLowerCase().trim();
      
      // 1. Language-specific story translations cache
      const cacheKeyObj = `story_word_translations_cache_${nativeLanguage}`;
      const cacheJSON = localStorage.getItem(cacheKeyObj);
      if (cacheJSON) {
        const cache = JSON.parse(cacheJSON);
        if (cache[wLower] && cache[wLower].translation) {
          const item = cache[wLower];
          const isTrLeak = nativeLanguage !== 'tr' && (
            (OFFLINE_DICTIONARY[wLower] && OFFLINE_DICTIONARY[wLower].tr.toLowerCase().trim() === item.translation.toLowerCase().trim()) ||
            (GLOBAL_DICTIONARY[wLower] && GLOBAL_DICTIONARY[wLower].toLowerCase().trim() === item.translation.toLowerCase().trim())
          );
          if (isTrLeak) {
            delete cache[wLower];
            localStorage.setItem(cacheKeyObj, JSON.stringify(cache));
          } else {
            return item as {
              translation: string;
              notes?: string;
              level?: string;
            };
          }
        }
      }

      // 2. Language-specific individual word cache
      const indCacheKey = `linguist_dict_word_${wLower}_${nativeLanguage}`;
      const indCacheJSON = localStorage.getItem(indCacheKey);
      if (indCacheJSON) {
        const parsed = JSON.parse(indCacheJSON);
        if (parsed.translation) {
          const isTrLeak = nativeLanguage !== 'tr' && (
            (OFFLINE_DICTIONARY[wLower] && OFFLINE_DICTIONARY[wLower].tr.toLowerCase().trim() === parsed.translation.toLowerCase().trim()) ||
            (GLOBAL_DICTIONARY[wLower] && GLOBAL_DICTIONARY[wLower].toLowerCase().trim() === parsed.translation.toLowerCase().trim())
          );
          if (isTrLeak) {
            localStorage.removeItem(indCacheKey);
          } else {
            return parsed as {
              translation: string;
              notes?: string;
              level?: string;
            };
          }
        }
      }

      // 3. Fallback to Turkish cache ONLY if nativeLanguage is 'tr'
      if (nativeLanguage === 'tr') {
        const oldCacheJSON = localStorage.getItem('story_word_translations_cache') || '{}';
        const oldCache = JSON.parse(oldCacheJSON);
        if (oldCache[wLower]) {
          return oldCache[wLower] as {
            translation: string;
            notes?: string;
            level?: string;
          };
        }
      }
    } catch (e) {
      console.error("Cache read error:", e);
    }
    return null;
  };

  const handleWordClick = (rawWord: string, index: number) => {
    const cleanW = cleanWord(rawWord);
    if (!cleanW) return;
    
    // Set loading state first using i18n
    setActiveTooltip({
      wordIndex: index,
      word: cleanW,
      translation: t('translating_word', nativeLanguage)
    });

    const cleanWLower = cleanW.toLowerCase();
    
    // 1. Try Cache
    const cached = getCachedTranslation(cleanW);
    if (cached && cached.translation && 
        cached.translation !== t('translating_word', nativeLanguage) &&
        cached.translation !== t('dict_loading_placeholder', nativeLanguage)) {
      setActiveTooltip({
        wordIndex: index,
        word: cleanW,
        translation: cached.translation
      });
      return;
    }

    // 2. Try offline book pretranslations for non-Turkish readers
    if (nativeLanguage !== 'tr') {
      let offlineTr = null;
      for (const bId in pretranslatedStories) {
        const offlineBook = pretranslatedStories[bId as keyof typeof pretranslatedStories];
        if (offlineBook && offlineBook.words && offlineBook.words[cleanWLower as keyof typeof offlineBook.words]) {
          const offlineWord = offlineBook.words[cleanWLower as keyof typeof offlineBook.words];
          if (offlineWord[nativeLanguage as keyof typeof offlineWord]) {
            offlineTr = offlineWord[nativeLanguage as keyof typeof offlineWord] as string;
            break;
          }
        }
      }
      if (offlineTr) {
        setActiveTooltip({
          wordIndex: index,
          word: cleanW,
          translation: offlineTr
        });
        return;
      }
    }

    // 3. Try Offline Dictionary (Turkish only)
    if (nativeLanguage === 'tr' && OFFLINE_DICTIONARY[cleanWLower]) {
      setActiveTooltip({
        wordIndex: index,
        word: cleanW,
        translation: OFFLINE_DICTIONARY[cleanWLower].tr
      });
      return;
    }

    // 4. Try Global Dictionary (Turkish only)
    if (nativeLanguage === 'tr' && GLOBAL_DICTIONARY[cleanWLower]) {
      setActiveTooltip({
        wordIndex: index,
        word: cleanW,
        translation: GLOBAL_DICTIONARY[cleanWLower]
      });
      return;
    }

    // 5. Try Offline Suffixes (Turkish only)
    if (nativeLanguage === 'tr') {
      const tryOfflineSuffixes = (w: string): string | null => {
        const stems = [
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
        for (const stem of stems) {
          const d = OFFLINE_DICTIONARY[stem];
          if (d) return d.tr;
          const g = GLOBAL_DICTIONARY[stem];
          if (g) return g;
        }
        return null;
      };

      const offlineStem = tryOfflineSuffixes(cleanWLower);
      if (offlineStem) {
        setActiveTooltip({
          wordIndex: index,
          word: cleanW,
          translation: offlineStem
        });
        return;
      }
    }

    // 6. Dynamic API Translation
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
      body: JSON.stringify({ word: cleanW, context: activeQuestion?.questionText || '', level: activeQuestion?.level || 'A1', targetLang: nativeLanguage })
    })
    .then(res => {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then((data: any) => {
      if (data && data.translation) {
        // Detect if server returned Turkish translation for non-Turkish readers
        const isTrLeak = nativeLanguage !== 'tr' && (
          (OFFLINE_DICTIONARY[cleanWLower] && OFFLINE_DICTIONARY[cleanWLower].tr.toLowerCase().trim() === data.translation.toLowerCase().trim()) ||
          (GLOBAL_DICTIONARY[cleanWLower] && GLOBAL_DICTIONARY[cleanWLower].toLowerCase().trim() === data.translation.toLowerCase().trim())
        );
        if (isTrLeak) {
          throw new Error('Server leaked Turkish translation');
        }

        // Cache it!
        try {
          const cacheKeyObj = `story_word_translations_cache_${nativeLanguage}`;
          const cacheJSON = localStorage.getItem(cacheKeyObj) || '{}';
          const cache = JSON.parse(cacheJSON);
          cache[cleanWLower] = { translation: data.translation, notes: data.explanation || '', level: data.wordLevel || 'A1' };
          localStorage.setItem(cacheKeyObj, JSON.stringify(cache));

          const indCacheKey = `linguist_dict_word_${cleanWLower}_${nativeLanguage}`;
          localStorage.setItem(indCacheKey, JSON.stringify({ translation: data.translation, notes: data.explanation || '', level: data.wordLevel || 'A1' }));
        } catch (e) {
          console.error("QuizView cache write error:", e);
        }

        setActiveTooltip({
          wordIndex: index,
          word: cleanW,
          translation: data.translation
        });
      } else {
        setActiveTooltip({
          wordIndex: index,
          word: cleanW,
          translation: t('dict_translation_failed', nativeLanguage)
        });
      }
    })
    .catch(err => {
      console.error('Dynamic translation failed in QuizView, trying client fallback:', err);
      translateWithGoogleClient(cleanW, nativeLanguage)
      .then(fallbackTr => {
        try {
          const cacheKeyObj = `story_word_translations_cache_${nativeLanguage}`;
          const cacheJSON = localStorage.getItem(cacheKeyObj) || '{}';
          const cache = JSON.parse(cacheJSON);
          cache[cleanWLower] = { translation: fallbackTr, notes: '', level: 'A1' };
          localStorage.setItem(cacheKeyObj, JSON.stringify(cache));

          const indCacheKey = `linguist_dict_word_${cleanWLower}_${nativeLanguage}`;
          localStorage.setItem(indCacheKey, JSON.stringify({ translation: fallbackTr, notes: '', level: 'A1' }));
        } catch (e) {
          console.error("QuizView cache write error:", e);
        }

        setActiveTooltip({
          wordIndex: index,
          word: cleanW,
          translation: fallbackTr
        });
      })
      .catch(fallbackErr => {
        console.error('Client-side translation fallback failed in QuizView:', fallbackErr);
        setActiveTooltip({
          wordIndex: index,
          word: cleanW,
          translation: t('dict_translation_failed', nativeLanguage)
        });
      });
    });
  };

  const renderClickableSentence = (sentence: string) => {
    if (!sentence) return null;
    const parts = sentence.split(/(\s+)/).filter(Boolean);
    return (
      <span className="inline-block text-center select-none">
        {parts.map((part, idx) => {
          const isWhitespace = /\s/.test(part);
          if (isWhitespace) {
            return <span key={idx}>{part}</span>;
          }
          const isBlank = part.includes('_____');
          if (isBlank) {
            const cleanBlankPart = part.replace(/['’]?[a-zA-Z]+/g, '');
            const replacement = isAnswered && selectedOption !== null ? activeQuestion.options[selectedOption] : '___';
            const renderedText = cleanBlankPart.replace('_____', replacement);
            return (
              <span 
                key={idx} 
                className={`inline-block mx-1 px-3 py-0.5 rounded-lg font-black border-b-2 transition-colors ${
                  !isAnswered ? 'text-violet-500 border-violet-500'
                  : selectedOption !== null && selectedOption === activeQuestion.correctIndex ? 'text-emerald-500 border-emerald-500'
                  : 'text-rose-400 border-rose-400'
                }`}
              >
                {renderedText}
              </span>
            );
          }
          const rawWord = part;
          const cleanW = cleanWord(rawWord);
          if (!cleanW) {
            return <span key={idx}>{part}</span>;
          }
          const wordIdx = idx;
          const isWordClicked = activeTooltip?.wordIndex === wordIdx;
          return (
            <span
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                handleWordClick(rawWord, wordIdx);
              }}
              className={`cursor-pointer inline-block transition-colors px-0.5 rounded ${
                isWordClicked
                  ? 'relative text-[#FF6B6B] bg-[#FFE66D]/30 underline underline-offset-4 decoration-2 decoration-[#FF6B6B]'
                  : isDarkMode
                    ? 'hover:text-[#FF6B6B] text-white'
                    : 'hover:text-[#FF6B6B] text-[#2D3436]'
              }`}
            >
              {isWordClicked && activeTooltip && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-900 text-white text-[11px] font-bold rounded-lg shadow-md whitespace-nowrap z-50 animate-fade-in">
                  {activeTooltip.translation}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </span>
              )}
              {rawWord}
            </span>
          );
        })}
      </span>
    );
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);



  // checkout form states
  const isTrialAvailable = !stats.premiumExpiryDate && localStorage.getItem('linguist_trial_used') !== 'true';
  const [checkoutTier, setCheckoutTier] = useState<'monthly' | 'yearly' | 'trial'>(isTrialAvailable ? 'trial' : 'yearly');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [prices, setPrices] = useState(() => {
    if (nativeLanguage === 'tr') {
      return {
        monthly: '99\u20BA',
        yearlyMonthly: '59\u20BA',
        yearlyTotal: '712\u20BA',
        yearlyOriginalTotal: '1.188\u20BA'
      };
    } else if (['de', 'fr', 'es', 'it', 'pt'].includes(nativeLanguage)) {
      return {
        monthly: '1.79\u20AC',
        yearlyMonthly: '1.09\u20AC',
        yearlyTotal: '12.99\u20AC',
        yearlyOriginalTotal: '21.48\u20AC'
      };
    } else {
      return {
        monthly: '$1.99',
        yearlyMonthly: '$1.25',
        yearlyTotal: '$14.99',
        yearlyOriginalTotal: '$23.88'
      };
    }
  });

  useEffect(() => {
    const updatePrices = () => {
      const localPrices = getLocalizedPrices();
      if (localPrices) {
        setPrices(localPrices);
      } else {
        if (nativeLanguage === 'tr') {
          setPrices({
            monthly: '99\u20BA',
            yearlyMonthly: '59\u20BA',
            yearlyTotal: '712\u20BA',
            yearlyOriginalTotal: '1.188\u20BA'
          });
        } else if (['de', 'fr', 'es', 'it', 'pt'].includes(nativeLanguage)) {
          setPrices({
            monthly: '1.79\u20AC',
            yearlyMonthly: '1.09\u20AC',
            yearlyTotal: '12.99\u20AC',
            yearlyOriginalTotal: '21.48\u20AC'
          });
        } else {
          setPrices({
            monthly: '$1.99',
            yearlyMonthly: '$1.25',
            yearlyTotal: '$14.99',
            yearlyOriginalTotal: '$23.88'
          });
        }
      }
    };
    
    // İlk yükleme
    updatePrices();
    
    // Ürün bilgileri geldikçe (asenkron) fiyatları güncelle
    const unsubscribe = registerPricingListener(updatePrices);
    return () => unsubscribe();
  }, [nativeLanguage]);

  const getDefaultDifficulty = (books: Book[]): 'easy' | 'medium' | 'hard' => {
    const activeBooks = books.filter(b => b.currentPage > 0 || b.percentageCompleted > 0);
    if (activeBooks.length === 0) return 'easy';
    const highestLevel = activeBooks.reduce((acc, book) => {
      const levelOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5 };
      return levelOrder[book.level] > levelOrder[acc] ? book.level : acc;
    }, 'A1' as 'A1' | 'A2' | 'B1' | 'B2' | 'C1');
    if (highestLevel === 'A1' || highestLevel === 'A2') return 'easy';
    if (highestLevel === 'B1' || highestLevel === 'B2') return 'medium';
    return 'hard';
  };

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(() => {
    // Use initialDifficulty if provided (from VocabularyTab level picker), else auto-detect
    if (initialDifficulty && quizMode === 'random') return initialDifficulty;
    return getDefaultDifficulty(books);
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  const prevDifficultyRef = React.useRef<string | null>(null);
  const prevModeRef = React.useRef<string | null>(null);
  const prevLangRef = React.useRef<LanguageCode | null>(null);

  const translateQuestions = async (qs: QuizQuestion[]) => {
    if (nativeLanguage === 'tr' || qs.length === 0) return;
    
    setIsTranslating(true);
    try {
      const wordsToTranslate = new Set<string>();
      const sentencesToTranslate = new Set<string>();
      
      const getCachedWord = (engWord: string) => {
        const cleanW = engWord.toLowerCase().trim();
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
        for (const bId in pretranslatedStories) {
          const offlineBook = pretranslatedStories[bId as keyof typeof pretranslatedStories];
          if (offlineBook && offlineBook.words && offlineBook.words[cleanW as keyof typeof offlineBook.words]) {
            const offlineWord = offlineBook.words[cleanW as keyof typeof offlineBook.words];
            if (offlineWord[nativeLanguage as keyof typeof offlineWord]) {
              return offlineWord[nativeLanguage as keyof typeof offlineWord] as string;
            }
          }
        }
        return null;
      };

      const getCachedSentence = (sentence: string) => {
        const key = sentence.toLowerCase().trim();
        const gameCacheKey = `linguist_trans_sentence_game_${key}_${nativeLanguage}`;
        const gameCached = localStorage.getItem(gameCacheKey);
        if (gameCached) return gameCached;
        const cacheKey = `linguist_trans_sentence_example_${key}_${nativeLanguage}`;
        const cached = localStorage.getItem(cacheKey);
        return cached || null;
      };

      // Collect what needs translation
      qs.forEach(q => {
        if (q.qType === 'en_to_tr' && q.optionsEn) {
          q.optionsEn.forEach(w => {
            if (!getCachedWord(w)) {
              wordsToTranslate.add(w);
            }
          });
        } else if (q.qType === 'tr_to_en') {
          if (!getCachedWord(q.word)) {
            wordsToTranslate.add(q.word);
          }
        } else if (q.qType === 'fill_blank' && q.sentenceEn) {
          if (!getCachedSentence(q.sentenceEn)) {
            sentencesToTranslate.add(q.sentenceEn);
          }
        }
      });

      // 1. Batch Translate Words
      let wordTranslations: Record<string, string> = {};
      if (wordsToTranslate.size > 0) {
        const uniqueWords = Array.from(wordsToTranslate);
        const chunkSize = 30;
        for (let i = 0; i < uniqueWords.length; i += chunkSize) {
          const chunk = uniqueWords.slice(i, i + chunkSize);
          const joined = chunk.join('\n');
          try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${nativeLanguage}&dt=t&q=${encodeURIComponent(joined)}`;
            const response = await fetch(url);
            if (response.ok) {
              const data = await response.json();
              if (data && data[0]) {
                data[0].forEach((segment: any) => {
                  if (segment && segment[0] && segment[1]) {
                    const orig = segment[1].replace(/\n$/, '').trim().toLowerCase();
                    const trans = segment[0].replace(/\n$/, '').trim();
                    wordTranslations[orig] = trans;
                    
                    // Cache it!
                    const indCacheKey = `linguist_dict_word_${orig}_${nativeLanguage}`;
                    localStorage.setItem(indCacheKey, JSON.stringify({
                      translation: trans,
                      notes: '',
                      level: 'A1'
                    }));
                  }
                });
              }
            }
          } catch (e) {
            console.error("Batch translate chunk failed, falling back to individual client translate:", e);
            for (const w of chunk) {
              try {
                const trans = await translateWithGoogleClient(w, nativeLanguage);
                wordTranslations[w.toLowerCase().trim()] = trans;
                const indCacheKey = `linguist_dict_word_${w.toLowerCase().trim()}_${nativeLanguage}`;
                localStorage.setItem(indCacheKey, JSON.stringify({ translation: trans, notes: '', level: 'A1' }));
              } catch (individualErr) {
                console.error("Individual fallback failed for", w, individualErr);
              }
            }
          }
        }
      }

      // 2. Translate Sentences (Cloze hints)
      const sentenceTranslations: Record<string, string> = {};
      if (sentencesToTranslate.size > 0) {
        const sentencePromises = Array.from(sentencesToTranslate).map(async (sentence) => {
          try {
            const trans = await translateWithGoogleClient(sentence, nativeLanguage);
            sentenceTranslations[sentence.toLowerCase().trim()] = trans;
            const gameCacheKey = `linguist_trans_sentence_game_${sentence.toLowerCase().trim()}_${nativeLanguage}`;
            localStorage.setItem(gameCacheKey, trans);
          } catch (e) {
            console.error("Sentence translate failed:", sentence, e);
          }
        });
        await Promise.all(sentencePromises);
      }

      // Apply translations to the questions array
      const updatedQuestions = qs.map(q => {
        const updated = { ...q };
        
        if (updated.qType === 'en_to_tr' && updated.optionsEn) {
          updated.options = updated.optionsEn.map((engWord, optIdx) => {
            const cached = getCachedWord(engWord);
            if (cached) return cached;
            const key = engWord.toLowerCase().trim();
            if (wordTranslations[key]) return wordTranslations[key];
            return updated.options[optIdx];
          });
          const correctVal = getCachedWord(updated.word) || wordTranslations[updated.word.toLowerCase().trim()] || updated.word;
          const newCorrectIndex = updated.options.indexOf(correctVal);
          if (newCorrectIndex !== -1) {
            updated.correctIndex = newCorrectIndex;
          }
          updated.explanation = t('quiz_explanation_en_to_tr', nativeLanguage)
            .replace('{word}', updated.word)
            .replace('{translation}', correctVal);
        } else if (updated.qType === 'tr_to_en') {
          const trans = getCachedWord(updated.word) || wordTranslations[updated.word.toLowerCase().trim()] || updated.word;
          updated.translation = trans;
          updated.questionText = `"${trans}" ${t('quiz_translation_prompt', nativeLanguage)}`;
          updated.explanation = t('quiz_explanation_tr_to_en', nativeLanguage)
            .replace('{translation}', trans)
            .replace('{word}', updated.word);
        } else if (updated.qType === 'fill_blank' && updated.sentenceEn) {
          const trans = getCachedSentence(updated.sentenceEn) || sentenceTranslations[updated.sentenceEn.toLowerCase().trim()];
          if (trans) {
            updated.hint = `${t('translation', nativeLanguage)}: "${trans}"`;
          }
          const correctTrans = getCachedWord(updated.word) || wordTranslations[updated.word.toLowerCase().trim()] || updated.word;
          updated.explanation = t('quiz_explanation_fill_blank', nativeLanguage)
            .replace('{word}', updated.word)
            .replace('{translation}', correctTrans)
            .replace('{sentence}', updated.sentenceEn);
        }
        
        return updated;
      });

      setQuestions(updatedQuestions);
    } catch (err) {
      console.error("translateQuestions error:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  React.useEffect(() => {
    if (
      prevDifficultyRef.current !== difficulty ||
      prevModeRef.current !== quizMode ||
      prevLangRef.current !== nativeLanguage ||
      questions.length === 0
    ) {
      prevDifficultyRef.current = difficulty;
      prevModeRef.current = quizMode;
      prevLangRef.current = nativeLanguage;
      
      let q: QuizQuestion[] = [];
      if (quizMode === 'random') {
        const levelsMap = {
          easy: ['A1', 'A2'],
          medium: ['B1', 'B2'],
          hard: ['C1']
        };
        q = generateRandomQuizForLevels(levelsMap[difficulty] as any, books, nativeLanguage);
      } else {
        q = generateVocabularyQuiz(vocabulary, books, nativeLanguage);
      }

      setCurrentQuestionIdx(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setQuizScore(0);
      setIsCompleted(false);

      if (nativeLanguage !== 'tr' && q.length > 0) {
        setQuestions(q);
        translateQuestions(q);
      } else {
        setQuestions(q);
        setIsTranslating(false);
      }
    }
  }, [difficulty, quizMode, books, vocabulary, nativeLanguage]);

  const activeQuestion = questions[currentQuestionIdx];

  const autoProceedTimeoutRef = React.useRef<any>(null);

  React.useEffect(() => {
    return () => {
      if (autoProceedTimeoutRef.current) {
        clearTimeout(autoProceedTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (initiallyShowPaywall) {
      setShowSubscriptionPanel(true);
    }
  }, [initiallyShowPaywall]);

  // Helper calculation for membership discounts
  const monthlyPrice = 99; // 99 TL
  const yearlyPriceAndDiscount = Math.round((99 * 12) * 0.6); // 40% discount = 712 TL total

  const handleOptionClick = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    const isCorrect = optionIdx === activeQuestion.correctIndex;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      onAnswerCorrect();

      // Proceed to next question automatically after 1200ms
      autoProceedTimeoutRef.current = setTimeout(() => {
        handleNext();
      }, 1200);
    } else {
      onAnswerIncorrect();
    }
    syncTrigger();
  };

  const handleNext = () => {
    // Reset choices state
    setSelectedOption(null);
    setIsAnswered(false);
    setActiveTooltip(null);

    // Navigate to next or review
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Set completed state to render the custom success panel instead of alert
      setIsCompleted(true);
      if (quizScore === questions.length) {
        onUnlockBadge?.('b4');
      }
      onQuizCompleted?.(quizScore, questions.length);
    }
  };

  const handleResetQuiz = () => {
    if (autoProceedTimeoutRef.current) {
      clearTimeout(autoProceedTimeoutRef.current);
    }
    setQuizScore(0);
    setCurrentQuestionIdx(0);
    setIsCompleted(false);
    setActiveTooltip(null);
    onBackToVocabulary();
  };

  const processSecurePayment = (e: React.FormEvent) => {
    e.preventDefault();

    purchasePlayStoreSubscription(checkoutTier, (status, errorMsg) => {
      if (status === 'processing') {
        setIsProcessingPayment(true);
      } else if (status === 'success') {
        setIsProcessingPayment(false);
        setPaymentDone(true);
        if (checkoutTier === 'trial') {
          localStorage.setItem('linguist_trial_used', 'true');
        }
        onSubscribe(checkoutTier);
        syncTrigger();

        setTimeout(() => {
          // Complete checkout fully and close overlay safely
          setShowSubscriptionPanel(false);
          setPaymentDone(false);
        }, 2000);
      } else if (status === 'error') {
        setIsProcessingPayment(false);
        setToastMessage(errorMsg || t('sub_payment_error', nativeLanguage));
        setTimeout(() => setToastMessage(null), 3000);
      }
    });
  };

  const handleRestorePurchases = () => {
    restorePlayStorePurchases((status, errorMsg) => {
      if (status === 'processing') {
        setIsProcessingPayment(true);
      } else if (status === 'success') {
        setIsProcessingPayment(false);
        setToastMessage(t('sub_restore_success', nativeLanguage));
        onSubscribe('yearly'); // varsayılan yıllık premium statüsüne yükselt
        syncTrigger();
        setTimeout(() => {
          setToastMessage(null);
          setShowSubscriptionPanel(false);
        }, 2000);
      } else if (status === 'error') {
        setIsProcessingPayment(false);
        setToastMessage(errorMsg || t('sub_restore_empty', nativeLanguage));
        setTimeout(() => setToastMessage(null), 3000);
      }
    });
  };

  return (
    <div className={`pb-32 max-w-[680px] mx-auto px-5 pt-6 transition-colors ${
      isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
    }`}>
      
      {/* Centered Premium Toast Notification */}
      <AnimatePresence>
        {toastMessage && (() => {
          const isWarning = toastMessage.includes('⚠️') || 
                            toastMessage.toLowerCase().includes('hata') || 
                            toastMessage.toLowerCase().includes('geçersiz') || 
                            toastMessage.toLowerCase().includes('yetersiz') ||
                            toastMessage.toLowerCase().includes('çıkış') ||
                            toastMessage.toLowerCase().includes('başarısız') ||
                            toastMessage.toLowerCase().includes('oluştu');
          
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

      {/* Loading Screen */}
      {isTranslating ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`border rounded-3xl p-12 text-center shadow-lg transition-colors flex flex-col items-center justify-center min-h-[300px] ${
            isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
          }`}
        >
          <RefreshCw className="w-10 h-10 animate-spin text-[#4ECDC4] mb-4" />
          <h3 className={`font-headline-lg text-lg font-bold tracking-tight ${
            isDarkMode ? 'text-white' : 'text-[#2D3436]'
          }`}>
            {t('quiz_loading', nativeLanguage)}
          </h3>
        </motion.div>
      ) : quizMode === 'saved' && questions.length < 3 && !showSubscriptionPanel ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`border rounded-3xl p-8 text-center shadow-lg transition-colors ${
            isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-[#FFE66D] text-[#FF6B6B] flex items-center justify-center mx-auto mb-4 border border-[#FFE66D]/40 shadow-sm">
            <Brain className="w-8 h-8 text-[#FF6B6B]" />
          </div>

          <h3 className={`font-headline-lg text-xl font-bold mb-2 tracking-tight ${
            isDarkMode ? 'text-white' : 'text-[#2D3436]'
          }`}>
            {t('quiz_insufficient_vocab', nativeLanguage)}
          </h3>
          <p className={`text-sm max-w-sm mx-auto mb-6 leading-relaxed ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {t('quiz_min_words_required', nativeLanguage).replace('{current}', String(questions.length)).replace('{total}', String(vocabulary.length))}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto">
            <button
              onClick={onGoToLibrary}
              className="flex-1 px-6 py-3.5 bg-[#FF6B6B] text-white rounded-full font-bold text-sm hover:bg-[#e05a5a] transition-all transform active:scale-95 cursor-pointer shadow-md shadow-[#FF6B6B]/20 font-headline-lg"
            >
              {t('btn_go_to_library', nativeLanguage)}
            </button>
            <button
              onClick={onBackToVocabulary}
              className={`flex-1 px-6 py-3.5 rounded-full font-bold text-sm border transition-all transform active:scale-95 cursor-pointer font-headline-lg ${
                isDarkMode 
                  ? 'text-gray-300 border-gray-700 hover:bg-white/5' 
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t('btn_back', nativeLanguage)}
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <AnimatePresence mode="wait">
          {isCompleted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`border rounded-3xl p-8 text-center shadow-lg transition-colors ${
              isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-[#FFE66D] text-[#FF6B6B] flex items-center justify-center mx-auto mb-4 border border-[#FFE66D]/40 shadow-sm animate-bounce">
              <Award className="w-8 h-8" />
            </div>

            <h3 className={`font-headline-lg text-2xl font-bold mb-2 tracking-tight ${
              isDarkMode ? 'text-white' : 'text-[#2D3436]'
            }`}>
              {t('quiz_completed_title', nativeLanguage)}
            </h3>
            <p className={`text-sm max-w-sm mx-auto mb-6 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {t('quiz_completed_desc', nativeLanguage)}
            </p>

            <div className={`max-w-xs mx-auto mb-8 p-4 rounded-2xl border text-center ${
              isDarkMode ? 'bg-[#121214] border-[#2A2A30]' : 'bg-[#FFFBF0] border-[#FFE66D]/60'
            }`}>
              <div>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider block">{t('quiz_success_rate', nativeLanguage)}</span>
                <span className="text-xl font-extrabold text-[#4ECDC4] font-mono block">
                  {quizScore} / {questions.length}
                </span>
              </div>
            </div>

            <button
              onClick={handleResetQuiz}
              className="px-8 py-3.5 bg-[#FF6B6B] text-white rounded-full font-bold text-sm hover:bg-[#e05a5a] transition-all transform active:scale-95 cursor-pointer shadow-md shadow-[#FF6B6B]/20"
            >
              {t('quiz_back_to_words', nativeLanguage)}
            </button>
          </motion.div>
        ) : (
          /* IN Quiz session content */
          !showSubscriptionPanel && (
            <div className="space-y-6">
              {/* RENDER PROGRESS BAR SOUCE LINE */}
              {activeQuestion && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setActiveTooltip(null)}
                  className={`border rounded-3xl p-6 transition-colors ${
                    isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
                  }`}
                >
                  {/* Exit Quiz Button at the very top of the card */}
                  <div className={`flex ${quizMode === 'random' ? 'justify-center' : 'justify-start'} mb-5`}>
                    <button
                      onClick={onBackToVocabulary}
                      className={`text-xs font-bold px-4 py-2 rounded-xl border tracking-wider font-headline-lg transition-all cursor-pointer ${
                        isDarkMode 
                          ? 'text-gray-300 border-gray-700 hover:bg-white/5' 
                          : 'text-[#FF6B6B] border-[#FFE66D] hover:bg-[#FFE66D]/15'
                      }`}
                    >
                      {t('quiz_end_btn', nativeLanguage)}
                    </button>
                  </div>

                  {/* Header Labels (centered for random, left-aligned for saved) */}
                  <div className={`flex flex-col gap-1 mb-4 ${quizMode === 'random' ? 'items-center text-center' : 'items-start text-left'}`}>
                    <span className="text-[13px] text-gray-400 font-extrabold tracking-wider font-headline-lg">
                      {quizMode === 'random' ? t('quiz_header_random', nativeLanguage).replace('{level}', activeQuestion?.level || '') : t('quiz_header_saved', nativeLanguage)}
                    </span>
                    <span className="text-xs text-[#FF6B6B] font-bold font-headline-lg">
                      {t('quiz_question_count', nativeLanguage).replace('{index}', String(currentQuestionIdx + 1)).replace('{total}', String(questions.length))}
                    </span>
                  </div>

                  <div className={`w-full h-2 rounded-full overflow-hidden mb-6 border ${
                    isDarkMode ? 'bg-gray-800 border-transparent' : 'bg-gray-100 border-[#FFE66D]/40'
                  }`}>
                    <div
                      className="bg-[#4ECDC4] h-full rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                    />
                  </div>



                  {/* Target Quiz Word or Cloze Sentence */}
                  <div className="text-center mb-8">
                    <span className="text-[10px] tracking-widest text-[#4ECDC4] font-bold bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 px-3.5 py-1.5 rounded-full font-headline-lg uppercase">
                      {activeQuestion.qType === 'fill_blank'
                        ? t('quiz_type_fill_blank', nativeLanguage)
                        : activeQuestion.qType === 'tr_to_en'
                          ? t('quiz_type_tr_to_en', nativeLanguage)
                          : t('quiz_type_en_to_tr', nativeLanguage)}
                    </span>
                    <h3 className={`text-2xl sm:text-3xl font-bold font-headline-lg tracking-tight mt-4 px-2 leading-relaxed ${
                      isDarkMode ? 'text-white' : 'text-[#2D3436]'
                    }`}>
                      {activeQuestion.qType === 'fill_blank' ? (
                        renderClickableSentence(activeQuestion.questionText)
                      ) : activeQuestion.qType === 'tr_to_en' ? (
                        <span>&ldquo;{activeQuestion.translation}&rdquo;</span>
                      ) : (
                        <span>&ldquo;{activeQuestion.word}&rdquo;</span>
                      )}
                    </h3>

                    {activeQuestion.qType === 'fill_blank' && activeQuestion.sentenceTr && (
                      <p className={`text-xs leading-relaxed italic border-t pt-3 w-full text-center flex items-center justify-center gap-1.5 mt-4 ${
                        isDarkMode ? 'border-[#2A2A30] text-gray-500' : 'border-gray-100 text-gray-400'
                      }`}>
                        <span>{getLanguageFlag(nativeLanguage)}</span>
                        <span>{activeQuestion.sentenceTr}</span>
                      </p>
                    )}
                    <p 
                      className="text-xs font-semibold mt-3 border inline-block px-3.5 py-1 rounded-full font-headline-lg"
                      style={{
                        color: getLevelColor(activeQuestion.level),
                        borderColor: hexToRgba(getLevelColor(activeQuestion.level), 0.3),
                        backgroundColor: hexToRgba(getLevelColor(activeQuestion.level), 0.1)
                      }}
                    >
                      {t('difficulty_label', nativeLanguage)}: {activeQuestion.level}
                    </p>
                  </div>

                  {/* Question Choices List */}
                  <div className="space-y-3">
                    {activeQuestion.options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrectTarget = idx === activeQuestion.correctIndex;
                      
                      let optionStyle = isDarkMode
                        ? 'border-2 border-[#2A2A30] hover:border-[#FF6B6B] hover:bg-white/5 text-white'
                        : 'border-2 border-[#FFE66D] hover:border-[#FF6B6B] hover:bg-[#FFE66D]/15 text-[#2D3436]';

                      if (isAnswered) {
                        if (isCorrectTarget) {
                          optionStyle = isDarkMode
                            ? 'bg-[#4ECDC4]/15 border-2 border-[#4ECDC4] text-[#4ECDC4] font-bold'
                            : 'bg-[#4ECDC4]/20 border-2 border-[#4ECDC4] text-[#2D3436] font-bold';
                        } else if (isSelected) {
                          optionStyle = 'bg-[#FF6B6B]/15 border-2 border-[#FF6B6B] text-[#FF6B6B] font-bold';
                        } else {
                          optionStyle = 'opacity-40 border-[#2A2A30] text-gray-550 scale-[0.98]';
                        }
                      }

                      return (
                        <button
                          disabled={isAnswered}
                          key={idx}
                          onClick={() => handleOptionClick(idx)}
                          className={`w-full p-4 border rounded-xl text-left text-sm font-semibold transition-all flex justify-between items-center cursor-pointer ${optionStyle}`}
                        >
                          <span>{option}</span>
                          {isAnswered && (
                            isCorrectTarget ? (
                              <CheckCircle2 className="w-5 h-5 text-[#4ECDC4]" />
                            ) : (
                              isSelected && <AlertCircle className="w-5 h-5 text-[#FF6B6B]" />
                            )
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* SPECIAL WRONG ANSWER EXPLANATION / HINT BOX (İpucu & Açıklama Kutusu) */}
                  <AnimatePresence>
                    {isAnswered && selectedOption !== activeQuestion.correctIndex && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-5 border-t border-dashed border-gray-700/30"
                      >
                        <div className={`p-4 rounded-xl border-2 ${
                          isDarkMode ? 'bg-[#FF6B6B]/10 border-[#FF6B6B] text-white' : 'bg-[#FFE66D]/15 border-[#FFE66D] text-[#2D3436]'
                        }`}>
                          <h5 className="font-bold text-xs tracking-wider mb-1.5 flex items-center gap-1.5 font-headline-lg text-[#FF6B6B]">
                            <Sparkles className="w-4.5 h-4.5 text-[#FF6B6B] animate-pulse shrink-0" />
                            <span>{t('quiz_incorrect_explanation', nativeLanguage)}</span>
                          </h5>
                          
                          {/* Detailed explanation detail helper for errors */}
                          <div className={`border-2 border-dashed rounded p-2.5 text-[11px] leading-relaxed font-medium ${
                            isDarkMode ? 'bg-[#121214] border-gray-700 text-gray-300' : 'bg-white border-[#FFE66D]/80 text-[#2D3436]'
                          }`}>
                            <b>{t('quiz_learning_note', nativeLanguage)}</b> {activeQuestion.explanation}
                          </div>
                        </div>

                        {/* Continue button */}
                        <button
                          onClick={handleNext}
                          className="mt-4 w-full py-3.5 bg-[#FF6B6B] hover:bg-[#e05a5a] text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#FF6B6B]/20"
                        >
                          <span>{t('quiz_next_question', nativeLanguage)}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Random Quiz Difficulty selector */}
                  {quizMode === 'random' && (
                    <div className="mt-8 pt-5 border-t border-gray-400/15">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase mb-2.5 text-center select-none tracking-wider font-headline-lg">
                        {t('quiz_difficulty_level', nativeLanguage)}
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['easy', 'medium', 'hard'] as const).map((diff) => {
                          const isSelected = difficulty === diff;
                          const label = diff === 'easy' ? t('difficulty_easy', nativeLanguage) : diff === 'medium' ? t('difficulty_medium', nativeLanguage) : t('difficulty_hard', nativeLanguage);
                          
                          let btnStyle = isDarkMode
                            ? 'bg-[#1E1E22] border-[#2A2A30] text-gray-400 hover:text-white hover:border-gray-500'
                            : 'bg-white border-gray-255 text-gray-555 hover:text-[#FF6B6B] hover:border-gray-300';
                          
                          if (isSelected) {
                            btnStyle = 'bg-[#FF6B6B] border-[#FF6B6B] text-white shadow-md shadow-[#FF6B6B]/20 scale-[1.02]';
                          }

                          return (
                            <button
                              key={diff}
                              onClick={() => {
                                if (difficulty !== diff) {
                                  setDifficulty(diff);
                                  setToastMessage(t('toast_difficulty_changed', nativeLanguage).replace('{level}', label));
                                  setTimeout(() => setToastMessage(null), 2500);
                                }
                              }}
                              className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all border text-center cursor-pointer select-none ${btnStyle}`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )
        )}
      </AnimatePresence>

      {/* DETAILED HIGH-FIDELITY SECURE PREMIUM SUBSCRIPTION CHECKOUT PANEL */}
      <AnimatePresence>
        {showSubscriptionPanel && (
          <div className="fixed inset-0 z-50 bg-[#2D3436]/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full rounded-[28px] overflow-hidden border-2 shadow-2xl flex flex-col max-h-[92dvh] transition-colors ${
                isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
              }`}
            >
              
              {/* Paywall Banner Head */}
              <div className="bg-[#1E1E22] text-white p-6 relative overflow-hidden shrink-0 select-none border-b border-gray-800">
                {/* Background lighting flare */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FF6B6B]/20 rounded-full blur-xl" />
                
                {/* Cancel payload cross */}
                <button
                  onClick={() => setShowSubscriptionPanel(false)}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-2 bg-[#FFE66D] text-gray-950 text-[10px] font-bold px-2.5 py-1 rounded-full w-max shadow-xs font-headline-lg">
                  <Crown className="w-3.5 h-3.5 text-[#FF6B6B] fill-[#FF6B6B]" />
                  <span>{t('premium_benefits_tag', nativeLanguage)}</span>
                </div>
                <h3 className="font-headline-lg text-2xl font-bold tracking-tight mb-1 text-white">
                  {t('premium_access_title', nativeLanguage)}
                </h3>
                 <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                  {t('premium_features_desc', nativeLanguage)}
                </p>
              </div>

              {/* Checkout Body and secure card forms */}
              <div className={`p-6 flex-1 overflow-y-auto space-y-5 transition-colors ${
                isDarkMode ? 'bg-[#1A1A1E]' : 'bg-white'
              }`}>
                {/* Checkout plans selections */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-455 tracking-widest block font-headline-lg">{t('subscription_plans', nativeLanguage)}</span>
                  
                  {/* Monthly plan choice */}
                  <div
                    onClick={() => setCheckoutTier('monthly')}
                    className={`p-4 border-2 rounded-2xl flex justify-between items-center cursor-pointer transition-all ${
                      checkoutTier === 'monthly'
                        ? isDarkMode ? 'border-[#FF6B6B] bg-[#FF6B6B]/10' : 'border-[#FF6B6B] bg-[#FFFBF0]'
                        : isDarkMode ? 'border-[#2A2A30] hover:border-gray-700' : 'border-[#FFE66D] hover:border-[#FF6B6B]/45'
                    }`}
                  >
                    <div>
                      <span className={`font-bold text-sm block font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                        {t('monthly_subscription', nativeLanguage)}
                        {prices.hasMonthlyTrial && (
                          <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-extrabold shadow-sm select-none ml-1.5 inline-block">
                            {prices.monthlyTrialPeriodLabel} Ücretsiz!
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium font-headline-lg">{t('cancel_anytime', nativeLanguage)}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg font-headline-lg text-[#FF6B6B] block">
                        {prices.monthly}{' '}
                        <span className="text-xs font-semibold text-gray-400">
                          {t('unit_per_month', nativeLanguage)}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* 3-Day Free Trial Choice Card */}
                  {isTrialAvailable && (
                    <div
                      onClick={() => setCheckoutTier('trial')}
                      className={`p-4 border-2 rounded-2xl flex justify-between items-center cursor-pointer transition-all relative overflow-hidden ${
                        checkoutTier === 'trial'
                          ? isDarkMode ? 'border-[#E84393] bg-[#E84393]/10' : 'border-[#E84393] bg-[#FFF0F5]'
                          : isDarkMode ? 'border-[#2A2A30] hover:border-gray-700' : 'border-[#FFE66D] hover:border-[#FF6B6B]/45'
                      }`}
                    >
                      <div className="absolute top-0 right-0 bg-[#E84393] text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-bl-lg tracking-wider font-headline-lg shadow-sm">
                        POPÜLER
                      </div>
                      <div>
                        <span className={`font-bold text-sm flex items-center gap-1.5 font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                          {t('trial_subscription_title', nativeLanguage)}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium font-headline-lg">
                          {t('trial_subscription_detail', nativeLanguage).replace('{amount}', prices.monthly)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Yearly discount choices */}
                  <div
                    onClick={() => setCheckoutTier('yearly')}
                    className={`p-4 border-2 rounded-2xl flex justify-between items-center cursor-pointer transition-all relative overflow-hidden ${
                      checkoutTier === 'yearly'
                        ? isDarkMode ? 'border-[#4ECDC4] bg-[#4ECDC4]/10' : 'border-[#4ECDC4] bg-[#4ECDC4]/5'
                        : isDarkMode ? 'border-[#2A2A30] hover:border-gray-700' : 'border-[#FFE66D] hover:border-[#FF6B6B]/45'
                    }`}
                  >
                    {/* Discount badge */}
                    <div className="absolute top-0 right-0 bg-[#4ECDC4] text-[#2D3436] font-extrabold text-[9px] px-2.5 py-0.5 rounded-bl-lg tracking-wider font-headline-lg shadow-sm">
                      {t('percent_discount', nativeLanguage).replace('{percent}', '40')}
                    </div>
                    <div>
                      <span className={`font-bold text-sm flex items-center gap-1.5 font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                        {t('yearly_subscription', nativeLanguage)}
                        {prices.hasYearlyTrial && (
                          <span className="text-[9px] bg-[#E84393] text-white px-1.5 py-0.5 rounded font-extrabold shadow-sm select-none">
                            {prices.yearlyTrialPeriodLabel} Ücretsiz Deneme!
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium font-headline-lg">
                        {t('yearly_payment_detail', nativeLanguage).replace('{amount}', prices.yearlyTotal)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-455 line-through block font-bold">
                        {prices.yearlyOriginalTotal}
                      </span>
                      <span className="font-bold text-lg font-headline-lg text-[#4ECDC4] block">
                        {prices.yearlyMonthly}{' '}
                        <span className="text-xs font-semibold text-gray-400">
                          {t('unit_per_month', nativeLanguage)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Google Play Billing Checkout Box */}
                <form onSubmit={processSecurePayment} className="space-y-5">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-xs font-bold text-gray-400 tracking-widest block font-headline-lg">{t('google_play_payment', nativeLanguage)}</span>
                    <div className="flex items-center gap-1.5 text-xs text-[#4ECDC4] font-bold bg-[#4ECDC4]/10 px-3 py-1 rounded-full border border-[#4ECDC4]/30">
                      <ShieldCheck className="w-4 h-4 text-[#4ECDC4]" />
                      <span>{t('google_play_protected', nativeLanguage)}</span>
                    </div>
                  </div>

                  {/* Checkout Actions & feedback loops */}
                  {!paymentDone ? (
                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-75 font-headline-lg"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-gray-950" />
                          <span>{t('processing_google_play', nativeLanguage)}</span>
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 text-gray-950 fill-gray-950" />
                          <span>
                            {checkoutTier === 'yearly' && prices.hasYearlyTrial
                              ? (nativeLanguage === 'tr' ? `${prices.yearlyTrialPeriodLabel} Ücretsiz Deneme` : `Start ${prices.yearlyTrialPeriodLabel} Free Trial`)
                              : checkoutTier === 'monthly' && prices.hasMonthlyTrial
                              ? (nativeLanguage === 'tr' ? `${prices.monthlyTrialPeriodLabel} Ücretsiz Deneme` : `Start ${prices.monthlyTrialPeriodLabel} Free Trial`)
                              : t('btn_subscribe', nativeLanguage)}
                          </span>
                        </>
                      )}
                    </button>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="w-full py-3.5 bg-emerald-500/10 border border-emerald-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2 select-none"
                    >
                      <Check className="w-5 h-5 text-emerald-500 animate-bounce" />
                      <span className={isDarkMode ? 'text-white' : 'text-[#2D3436]'}>{t('payment_success_premium', nativeLanguage)}</span>
                    </motion.div>
                  )}



                  {/* Legal Play Store warning info */}
                  <p className="text-[10px] leading-relaxed text-gray-400 text-left font-medium select-none">
                    {t('google_play_terms_desc', nativeLanguage).replace('{amount}', checkoutTier === 'yearly' ? prices.yearlyTotal : prices.monthly)}
                  </p>
                </form>

                {/* Satın Almaları Geri Yükle Seçeneği */}
                <div className="flex justify-center pt-2 pb-1">
                  <button
                    type="button"
                    onClick={handleRestorePurchases}
                    disabled={isProcessingPayment}
                    className="text-[11px] text-blue-500 hover:text-blue-600 font-bold tracking-wide transition-colors flex items-center gap-1 select-none disabled:opacity-50"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{t('restore_purchases', nativeLanguage)}</span>
                  </button>
                </div>

                {/* Footer security badges */}
                <div className="flex justify-center items-center gap-1.5 text-[9px] text-gray-400 font-semibold pt-1 select-none text-center leading-normal">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{t('secure_checkout_desc', nativeLanguage)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}
