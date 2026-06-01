import React, { useState } from 'react';
import { Heart, Brain, AlertCircle, CheckCircle2, ChevronRight, Sparkles, ShieldCheck, CreditCard, Lock, RefreshCw, X, Award, Crown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { purchasePlayStoreSubscription } from '../services/billing';
import { Book, QuizQuestion, UserStats, VocabularyWord } from '../types';

interface QuizViewProps {
  stats: UserStats;
  vocabulary: VocabularyWord[];
  books: Book[];
  quizMode: 'saved' | 'random';
  initiallyShowPaywall?: boolean;
  onAnswerCorrect: () => void;
  onAnswerIncorrect: () => void;
  onSubscribe: (tier: 'monthly' | 'yearly') => void;
  onBackToVocabulary: () => void;
  onGoToLibrary: () => void;
  syncTrigger: () => void;
  isDarkMode?: boolean;
  onUnlockBadge?: (id: string) => void;
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
    "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did"
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
            const cleanSent = sent.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”指標‘’\[\]{}<>|\\+]/g, " ");
            const words = cleanSent.split(/\s+/);
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

const getFallbackSentence = (word: string, translation: string): { en: string; tr: string } => {
  return {
    en: `This is a very nice ${word}.`,
    tr: `Bu çok güzel bir ${translation}.`
  };
};

const generateVocabularyQuiz = (vocabList: VocabularyWord[], books: Book[]): QuizQuestion[] => {
  if (!vocabList) return [];
  
  // 1. Filter out proper nouns (names)
  const filteredVocab = vocabList.filter(item => !isProperNoun(item.word, item.level));
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
      const possibleTypes: ('en_to_tr' | 'tr_to_en' | 'fill_blank')[] = ['en_to_tr', 'tr_to_en', 'fill_blank'];
      
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
        const possibleTypes: ('en_to_tr' | 'tr_to_en' | 'fill_blank')[] = ['en_to_tr', 'tr_to_en', 'fill_blank'];
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
        const fallback = getFallbackSentence(item.word, item.translation);
        exampleEn = fallback.en;
        exampleTr = fallback.tr;
      }
    }
    
    // Distractors (wrong options)
    const levelCode = item.level ? item.level.substring(0, 2).toUpperCase() : 'A1'; // e.g. "A1"
    const levelPool: { en: string; tr: string }[] = [];
    const seenWords = new Set<string>();
    
    if (books && books.length > 0) {
      books.forEach(book => {
        if (book.level === levelCode) {
          book.chapters.forEach(chapter => {
            chapter.paragraphs.forEach(p => {
              if (p.words) {
                p.words.forEach(w => {
                  const key = w.en.toLowerCase().trim();
                  if (!seenWords.has(key) && !isProperNoun(w.en) && key !== item.word.toLowerCase().trim()) {
                    seenWords.add(key);
                    levelPool.push({ en: w.en, tr: w.tr });
                  }
                });
              }
            });
          });
        }
      });
    }
    
    if (levelPool.length < 5 && books) {
      books.forEach(book => {
        book.chapters.forEach(chapter => {
          chapter.paragraphs.forEach(p => {
            if (p.words) {
              p.words.forEach(w => {
                const key = w.en.toLowerCase().trim();
                if (!seenWords.has(key) && !isProperNoun(w.en) && key !== item.word.toLowerCase().trim()) {
                  seenWords.add(key);
                  levelPool.push({ en: w.en, tr: w.tr });
                }
              });
            }
          });
        });
      });
    }
    
    const defaultTrDistractors = ['koşmak', 'ev', 'yemek', 'gülümsemek', 'ağaç', 'sepet', 'köpek', 'mutlu', 'zaman', 'gün', 'kitap'];
    const defaultEnDistractors = ['run', 'house', 'eat', 'smile', 'tree', 'basket', 'dog', 'happy', 'time', 'day', 'book'];

    let correctValue = '';
    let questionText = '';
    let hintText = '';
    let explanationText = '';
    let distractors: string[] = [];

    if (qType === 'fill_blank') {
      correctValue = item.word;
      
      const cleanW = item.word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”‘’\[\]{}<>|\\+]/g, "").trim();
      const regex = new RegExp('\\b' + cleanW + '\\b', 'gi');
      questionText = exampleEn.replace(regex, '_____');
      
      if (questionText === exampleEn) {
        const lowerSentence = exampleEn.toLowerCase();
        const cleanLowerWord = cleanW.toLowerCase();
        const idx = lowerSentence.indexOf(cleanLowerWord);
        if (idx !== -1) {
          questionText = exampleEn.substring(0, idx) + '_____' + exampleEn.substring(idx + cleanW.length);
        }
      }
      
      hintText = exampleTr ? `Türkçe Çevirisi: "${exampleTr}"` : 'Cümledeki boşluğu doldurun.';
      explanationText = `"${item.word}" kelimesi "${item.translation}" anlamına gelir. Geçtiği cümle: "${exampleEn}"`;
      
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
      questionText = `"${item.translation}" kelimesinin İngilizce karşılığı nedir?`;
      hintText = `İpucu: Bu kelime "${item.level}" seviyesindedir.`;
      explanationText = `"${item.translation}" kelimesinin İngilizce karşılığı "${item.word}" şeklindedir.`;
      
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
      correctValue = item.translation;
      questionText = `"${item.word}" kelimesinin Türkçe karşılığı nedir?`;
      hintText = exampleEn ? `Cümle içi kullanımı: "${exampleEn}"` : `İpucu: Bu kelime "${item.level}" seviyesindedir.`;
      explanationText = `"${item.word}" kelimesinin Türkçe anlamı "${item.translation}" olarak kaydedilmiştir.`;
      
      // Turkish distractors
      const cleanCorrect = correctValue.trim().toLowerCase();
      const distractorList: string[] = [];
      const distractorSetLower = new Set<string>();
      
      const shuffledPool = [...levelPool].sort(() => 0.5 - Math.random());
      for (const w of shuffledPool) {
        if (!w.tr) continue;
        const d = w.tr.trim();
        const dLower = d.toLowerCase();
        if (dLower !== cleanCorrect && !isTurkishProperNoun(d) && !isProperNoun(w.en) && !distractorSetLower.has(dLower)) {
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
          if (dLower !== cleanCorrect && !distractorSetLower.has(dLower) && !isTurkishProperNoun(dClean)) {
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
      translation: item.translation,
      level: item.level,
      options,
      correctIndex,
      hint: hintText,
      explanation: explanationText,
      questionText,
      qType
    };
  });
};

const generateRandomQuizForLevels = (levels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1')[], books: Book[]): QuizQuestion[] => {
  // 1. Gather all words from all books of the specified levels
  const wordPool: { en: string; tr: string; level: string; exampleEn?: string; exampleTr?: string }[] = [];
  const seenWords = new Set<string>();
  
  const booksAtLevels = books.filter(b => levels.includes(b.level as any));
  booksAtLevels.forEach(book => {
    book.chapters.forEach(chapter => {
      chapter.paragraphs.forEach(p => {
        if (p.words) {
          p.words.forEach(w => {
            const key = w.en.toLowerCase().trim();
            if (!seenWords.has(key) && !isProperNoun(w.en) && w.en.length > 2) {
              seenWords.add(key);
              
              // Try to find a context sentence from the paragraph without lookbehinds (safari friendly)
              let contextEn = '';
              let contextTr = '';
              const sentencesEn = p.textEn.split(/[.!?]/).map(s => s.trim()).filter(Boolean);
              const sentencesTr = p.textTr.split(/[.!?]/).map(s => s.trim()).filter(Boolean);
              
              for (let i = 0; i < sentencesEn.length; i++) {
                const cleanSent = sentencesEn[i].toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”]/g, " ");
                const words = cleanSent.split(/\s+/);
                if (words.includes(key)) {
                  contextEn = sentencesEn[i] + '.';
                  contextTr = sentencesTr[i] || p.textTr;
                  break;
                }
              }
              
              if (!contextEn && sentencesEn.length > 0) {
                contextEn = sentencesEn[0] + '.';
                contextTr = sentencesTr[0] || p.textTr;
              }
              
              wordPool.push({
                en: w.en,
                tr: w.tr,
                level: `${book.level} Seviyesi`,
                exampleEn: contextEn,
                exampleTr: contextTr
              });
            }
          });
        }
      });
    });
  });
  
  // If the pool is too small, fallback to other levels
  if (wordPool.length < 15) {
    books.forEach(book => {
      book.chapters.forEach(chapter => {
        chapter.paragraphs.forEach(p => {
          if (p.words) {
            p.words.forEach(w => {
              const key = w.en.toLowerCase().trim();
              if (!seenWords.has(key) && !isProperNoun(w.en) && w.en.length > 2) {
                seenWords.add(key);
                wordPool.push({
                  en: w.en,
                  tr: w.tr,
                  level: `${book.level} Seviyesi`
                });
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
  
  return generateVocabularyQuiz(vocabWords, books);
};

export default function QuizView({
  stats,
  vocabulary,
  books,
  quizMode,
  initiallyShowPaywall = false,
  onAnswerCorrect,
  onAnswerIncorrect,
  onSubscribe,
  onBackToVocabulary,
  onGoToLibrary,
  syncTrigger,
  isDarkMode,
  onUnlockBadge,
}: QuizViewProps) {
  // Questions navigation & status structures
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showSubscriptionPanel, setShowSubscriptionPanel] = useState(initiallyShowPaywall);
  const [isCompleted, setIsCompleted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // checkout form states
  const [checkoutTier, setCheckoutTier] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

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

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(() => getDefaultDifficulty(books));

  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    if (quizMode === 'random') {
      const initialDiff = getDefaultDifficulty(books);
      const levelsMap = {
        easy: ['A1', 'A2'],
        medium: ['B1', 'B2'],
        hard: ['C1']
      };
      return generateRandomQuizForLevels(levelsMap[initialDiff] as any, books);
    } else {
      return generateVocabularyQuiz(vocabulary, books);
    }
  });

  const prevDifficultyRef = React.useRef(difficulty);
  const prevModeRef = React.useRef(quizMode);

  React.useEffect(() => {
    if (prevDifficultyRef.current !== difficulty || prevModeRef.current !== quizMode) {
      prevDifficultyRef.current = difficulty;
      prevModeRef.current = quizMode;
      
      if (quizMode === 'random') {
        const levelsMap = {
          easy: ['A1', 'A2'],
          medium: ['B1', 'B2'],
          hard: ['C1']
        };
        const q = generateRandomQuizForLevels(levelsMap[difficulty] as any, books);
        setQuestions(q);
      } else {
        const q = generateVocabularyQuiz(vocabulary, books);
        setQuestions(q);
      }
      setCurrentQuestionIdx(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setQuizScore(0);
      setIsCompleted(false);
    }
  }, [difficulty, quizMode, books, vocabulary]);

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
    if (initiallyShowPaywall || stats.hearts <= 0) {
      setShowSubscriptionPanel(true);
    }
  }, [initiallyShowPaywall, stats.hearts]);

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

    // Navigate to next or review
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Set completed state to render the custom success panel instead of alert
      setIsCompleted(true);
      if (quizScore === questions.length) {
        onUnlockBadge?.('b4');
      }
    }
  };

  const handleResetQuiz = () => {
    if (autoProceedTimeoutRef.current) {
      clearTimeout(autoProceedTimeoutRef.current);
    }
    setQuizScore(0);
    setCurrentQuestionIdx(0);
    setIsCompleted(false);
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
        onSubscribe(checkoutTier);
        syncTrigger();

        setTimeout(() => {
          // Complete checkout fully and close overlay safely
          setShowSubscriptionPanel(false);
          setPaymentDone(false);
        }, 2000);
      } else if (status === 'error') {
        setIsProcessingPayment(false);
        setToastMessage(errorMsg || 'Ödeme sırasında bir hata oluştu.');
        setTimeout(() => setToastMessage(null), 3000);
      }
    });
  };

  return (
    <div className={`pb-32 max-w-[680px] mx-auto px-5 pt-6 transition-colors ${
      isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
    }`}>
      
      {/* Toast Notification replacing alert() */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-55 py-3.5 px-6 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-bold leading-none ${
              isDarkMode ? 'bg-[#1E1E22] border-[#2A2A30] text-red-400' : 'bg-rose-50 border-rose-100 text-rose-600'
            }`}
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUIZ COMPLETED VIEW RESULTS SCREEN replaces standard browser alert() */}
      {quizMode === 'saved' && questions.length < 3 && !showSubscriptionPanel ? (
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
            Yetersiz Kelime Dağarcığı! 📚
          </h3>
          <p className={`text-sm max-w-sm mx-auto mb-6 leading-relaxed ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Kelime Dağarcığı pratik testlerini çözebilmek için en az <strong>3 adet isim/özel isim olmayan kelime</strong> kaydetmiş olmanız gerekmektedir. Şu anda geçerli kelime sayınız: <strong>{questions.length}</strong> (Toplam: {vocabulary.length})
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto">
            <button
              onClick={onGoToLibrary}
              className="flex-1 px-6 py-3.5 bg-[#FF6B6B] text-white rounded-full font-bold text-sm hover:bg-[#e05a5a] transition-all transform active:scale-95 cursor-pointer shadow-md shadow-[#FF6B6B]/20 font-headline-lg"
            >
              Kütüphaneye Git
            </button>
            <button
              onClick={onBackToVocabulary}
              className={`flex-1 px-6 py-3.5 rounded-full font-bold text-sm border transition-all transform active:scale-95 cursor-pointer font-headline-lg ${
                isDarkMode 
                  ? 'text-gray-300 border-gray-700 hover:bg-white/5' 
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Geri Dön
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
              Harika! Testi Tamamladın! 🎉
            </h3>
            <p className={`text-sm max-w-sm mx-auto mb-6 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Kelime dağarcığı pekiştirme testini başarıyla bitirdiniz. İlerledikçe yeni rozetler açılmaya devam edecektir.
            </p>

            <div className={`grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8 p-4 rounded-2xl border ${
              isDarkMode ? 'bg-[#121214] border-[#2A2A30]' : 'bg-[#FFFBF0] border-[#FFE66D]/60'
            }`}>
              <div>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider block">BAŞARI ORANI</span>
                <span className="text-xl font-extrabold text-[#4ECDC4] font-mono block">
                  {quizScore} / {questions.length}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider block">KAZANILAN PUAN</span>
                <span className="text-xl font-extrabold text-[#FF6B6B] font-mono block">
                  +{quizScore * 15} XP
                </span>
              </div>
            </div>

            <button
              onClick={handleResetQuiz}
              className="px-8 py-3.5 bg-[#FF6B6B] text-white rounded-full font-bold text-sm hover:bg-[#e05a5a] transition-all transform active:scale-95 cursor-pointer shadow-md shadow-[#FF6B6B]/20"
            >
              Kelime Odasına Geri Dön
            </button>
          </motion.div>
        ) : (
          /* IN Quiz session content */
          !showSubscriptionPanel && (
            <div className="space-y-6">
              {/* Quiz Screen Header HUD */}
              <div className={`flex justify-start items-center border rounded-2xl p-4 shadow-3xs transition-colors ${
                isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
              }`}>
                <button
                  onClick={onBackToVocabulary}
                  className={`text-xs font-bold px-4 py-2 rounded-xl border tracking-wider font-headline-lg transition-all cursor-pointer ${
                    isDarkMode 
                      ? 'text-gray-300 border-gray-700 hover:bg-white/5' 
                      : 'text-[#FF6B6B] border-[#FFE66D] hover:bg-[#FFE66D]/15'
                  }`}
                >
                  ÇÖZÜMDEN ÇIK
                </button>
              </div>

              {/* RENDER PROGRESS BAR SOUCE LINE */}
              {activeQuestion && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`border rounded-3xl p-6 transition-colors ${
                    isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
                  }`}
                >
                  {/* Question Index Progress Label */}
                  <div className="flex justify-between items-center text-xs text-gray-400 font-bold tracking-wider mb-3 font-headline-lg">
                    <span>{quizMode === 'random' ? `RASTGELE PRATİK (${activeQuestion?.level || ''})` : 'KELİMELERİMLE PRATİK'}</span>
                    <span className="text-[#FF6B6B]">SORU {currentQuestionIdx + 1} / {questions.length}</span>
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
                        ? 'CÜMLE DOLDURMA (CLOZE)'
                        : activeQuestion.qType === 'tr_to_en'
                          ? 'TÜRKÇE -> İNGİLİZCE ÇEVİRİ'
                          : 'İNGİLİZCE -> TÜRKÇE ANLAM'}
                    </span>
                    <h3 className={`text-2xl sm:text-3xl font-bold font-headline-lg tracking-tight mt-4 px-2 leading-relaxed ${
                      isDarkMode ? 'text-white' : 'text-[#2D3436]'
                    }`}>
                      {activeQuestion.qType === 'fill_blank' ? (
                        activeQuestion.questionText
                      ) : activeQuestion.qType === 'tr_to_en' ? (
                        <span>&ldquo;{activeQuestion.translation}&rdquo;</span>
                      ) : (
                        <span>&ldquo;{activeQuestion.word}&rdquo;</span>
                      )}
                    </h3>
                    <p className={`text-xs font-medium italic mt-3 border inline-block px-3 py-1 rounded-full font-headline-lg ${
                      isDarkMode ? 'bg-gray-855 border-gray-700 text-gray-300' : 'bg-[#FFFBF0] border-[#FFE66D]/50 text-gray-500'
                    }`}>
                      Zorluk: {activeQuestion.level}
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
                            <span>YANLIŞ CEVAP İPUCU & AÇIKLAMASI</span>
                          </h5>
                          <p className={`text-xs leading-relaxed font-semibold ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            {activeQuestion.hint}
                          </p>
                          
                          {/* Detailed explanation detail helper for errors */}
                          <div className={`border-2 border-dashed rounded p-2.5 mt-2.5 text-[11px] leading-relaxed font-medium ${
                            isDarkMode ? 'bg-[#121214] border-gray-700 text-gray-300' : 'bg-white border-[#FFE66D]/80 text-[#2D3436]'
                          }`}>
                            <b>Öğrenim Notu:</b> {activeQuestion.explanation}
                          </div>
                        </div>

                        {/* Continue button */}
                        <button
                          onClick={handleNext}
                          className="mt-4 w-full py-3.5 bg-[#FF6B6B] hover:bg-[#e05a5a] text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#FF6B6B]/20"
                        >
                          <span>Sonraki Soruya Geç</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Random Quiz Difficulty selector */}
                  {quizMode === 'random' && (
                    <div className="mt-8 pt-5 border-t border-gray-400/15">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase mb-2.5 text-center select-none tracking-wider font-headline-lg">
                        Quiz Zorluk Seviyesi
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['easy', 'medium', 'hard'] as const).map((diff) => {
                          const isSelected = difficulty === diff;
                          const label = diff === 'easy' ? 'Kolay (A1-A2)' : diff === 'medium' ? 'Orta (B1-B2)' : 'Zor (C1-C2)';
                          
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
                                  setToastMessage(`Zorluk seviyesi değiştirildi: ${label} 🎉`);
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
                
                {/* Cancel payload cross only if they still have hearts */}
                {stats.hearts > 0 && (
                  <button
                    onClick={() => setShowSubscriptionPanel(false)}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                <div className="flex items-center gap-2 mb-2 bg-[#FFE66D] text-gray-950 text-[10px] font-bold px-2.5 py-1 rounded-full w-max shadow-xs font-headline-lg">
                  <Crown className="w-3.5 h-3.5 text-[#FF6B6B] fill-[#FF6B6B]" />
                  <span>SINIRSIZ CAN VE PREMIUM AVANTAJLAR</span>
                </div>
                <h3 className="font-headline-lg text-2xl font-bold tracking-tight mb-1 text-white">
                  {stats.hearts <= 0 ? 'Canınız Kalmadı!' : 'İngilizce Öyküm Premium Erişimi'}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                  Sınırsız can, interaktif kelime pratikleri, ssl şifreli ödeme altyapısı ve düşük gecikmeli veri senkronizasyonu sizi bekliyor!
                </p>
              </div>

              {/* Checkout Body and secure card forms */}
              <div className={`p-6 flex-1 overflow-y-auto space-y-5 transition-colors ${
                isDarkMode ? 'bg-[#1A1A1E]' : 'bg-white'
              }`}>
                {/* Checkout plans selections */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-455 tracking-widest block font-headline-lg">ÜYELİK ABONELİK PAKETLERİ</span>
                  
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
                      <span className={`font-bold text-sm block font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>Aylık Abonelik</span>
                      <span className="text-[11px] text-gray-400 font-medium font-headline-lg">İstediğin zaman iptal et.</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg font-headline-lg text-[#FF6B6B] block">99₺ <span className="text-xs font-semibold text-gray-400">/ ay</span></span>
                    </div>
                  </div>

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
                      %40 İNDİRİMLİ
                    </div>
                    <div>
                      <span className={`font-bold text-sm flex items-center gap-1.5 font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                        Yıllık Abonelik
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium font-headline-lg">Toplam 712₺ tek çekim ödeme.</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-455 line-through block font-bold">1.188₺</span>
                      <span className="font-bold text-lg font-headline-lg text-[#4ECDC4] block">59₺ <span className="text-xs font-semibold text-gray-400">/ ay</span></span>
                    </div>
                  </div>
                </div>

                {/* Google Play Billing Checkout Box */}
                <form onSubmit={processSecurePayment} className="space-y-5">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-xs font-bold text-gray-400 tracking-widest block font-headline-lg">GOOGLE PLAY ÖDEMESİ</span>
                    <div className="flex items-center gap-1.5 text-xs text-[#4ECDC4] font-bold bg-[#4ECDC4]/10 px-3 py-1 rounded-full border border-[#4ECDC4]/30">
                      <ShieldCheck className="w-4 h-4 text-[#4ECDC4]" />
                      <span>Google Play Korumalı</span>
                    </div>
                  </div>

                  {/* Checkout Actions & feedback loops */}
                  {!paymentDone ? (
                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-75 font-headline-lg"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-gray-950" />
                          <span>Google Play ile İşleniyor...</span>
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 text-gray-950 fill-gray-950" />
                          <span>Abone Ol</span>
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
                      <span className={isDarkMode ? 'text-white' : 'text-[#2D3436]'}>Ödeme Başarılı! Premium Aktive Edildi. 🎉</span>
                    </motion.div>
                  )}

                  {/* Google Play Account Information HUD */}
                  <div className={`p-4 rounded-2xl border flex flex-col gap-2.5 transition-colors ${
                    isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-green-500 to-yellow-500 p-0.5 flex items-center justify-center text-white text-[10px] font-extrabold shadow-sm shrink-0 select-none">
                        ▶️
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-gray-400 font-bold block">GOOGLE PLAY HESABI</span>
                        <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                          {stats.hearts <= 0 ? 'kullanici@gmail.com' : 'acer@gmail.com'}
                        </span>
                      </div>
                    </div>

                    <div className={`h-[1px] ${isDarkMode ? 'bg-gray-800' : 'bg-gray-250'}`} />

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-0.5 bg-blue-600 rounded text-white text-[9px] font-bold tracking-widest shrink-0">
                          GPAY
                        </div>
                        <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Visa •••• 9876 (Tanımlı Kart)
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold font-headline-lg select-none">Varsayılan</span>
                    </div>
                  </div>

                  {/* Legal Play Store warning info */}
                  <p className="text-[10px] leading-relaxed text-gray-400 text-left font-medium select-none">
                    Satın Al butonuna tıklayarak Google Play Hizmet Şartları'nı kabul etmiş olursunuz. Aboneliğiniz, son faturalandırma döneminden en az 24 saat önce iptal edilmediği sürece otomatik olarak yenilenir ve seçtiğiniz tutar üzerinden ({checkoutTier === 'monthly' ? '99,00 TL' : '712,00 TL'}) Google Play tanımlı kartınızdan tahsil edilir. Aboneliklerinizi dilediğiniz zaman Google Play Store ayarlarınızdan yönetebilir veya iptal edebilirsiniz.
                  </p>
                </form>

                {/* Footer security badges */}
                <div className="flex justify-center items-center gap-1.5 text-[9px] text-gray-400 font-semibold pt-2 select-none text-center leading-normal">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span>256-Bit SSL Enkripsiyonlu Güvenli Stripe Ödeme Altyapısı</span>
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
