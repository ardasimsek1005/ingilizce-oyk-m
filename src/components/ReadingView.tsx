import React, { useState, useRef, useEffect, useMemo, memo, useCallback } from 'react';
import { ArrowLeft, Volume2, Bookmark, BookmarkCheck, Share2, Info, Check, HelpCircle, ChevronRight, BookOpen, Sun, Moon, Heart, Star, X, Loader2, Lock, AlertCircle, RefreshCw, CheckCircle2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Paragraph, VocabularyWord } from '../types';
import { OFFLINE_DICTIONARY } from '../dictionary';
import { GLOBAL_DICTIONARY } from '../data';
import { speakNative, getFemaleVoice } from '../services/tts';

interface ReadingViewProps {
  book: Book;
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
  refillCountdown: string;
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
    "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did"
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
    "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did"
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

import { AVATAR_OPTIONS } from '../avatar_assets';

// Word translation cache to make loading instant (Module Scope)
const getCachedTranslation = (word: string): { translation: string; notes?: string; level?: string } | null => {
  try {
    const wLower = word.toLowerCase().trim();
    
    // 1. Check local storage cache of past dynamic translations FIRST (saved AI annotations)
    const cacheJSON = localStorage.getItem('story_word_translations_cache');
    if (cacheJSON) {
      const cache = JSON.parse(cacheJSON);
      if (cache[wLower]) {
        // If the cached translation is identical to the key (invalid), reject and let it re-fetch contextually
        if (cache[wLower].translation && cache[wLower].translation.toLowerCase().trim() !== wLower) {
          return cache[wLower];
        }
      }
    }

    // 2. Check premium offline dictionary as instant preliminary
    if (OFFLINE_DICTIONARY[wLower]) {
      const dictItem = OFFLINE_DICTIONARY[wLower];
      return {
        translation: dictItem.tr,
        notes: dictItem.notes,
        level: dictItem.level === 'Özel İsim' ? 'Özel İsim' : `${dictItem.level} Seviyesi`
      };
    }

    // 3. Check global common terms dictionary
    if (GLOBAL_DICTIONARY[wLower]) {
      return {
        translation: GLOBAL_DICTIONARY[wLower],
        notes: "Ortak Kelime • Çevrimdışı Sözlük",
        level: "A1 Seviyesi"
      };
    }
  } catch (e) {
    console.error("Cache read error:", e);
  }
  return null;
};

const saveCachedTranslation = (word: string, translation: string, notes?: string, level?: string) => {
  try {
    const wLower = word.toLowerCase().trim();
    const cacheJSON = localStorage.getItem('story_word_translations_cache') || '{}';
    const cache = JSON.parse(cacheJSON);
    cache[wLower] = { translation, notes, level };
    localStorage.setItem('story_word_translations_cache', JSON.stringify(cache));
  } catch (e) {
    console.error("Cache write error:", e);
  }
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
  setSelectedDictWord
}: ParagraphBlockProps) {
  const sentencesEn = useMemo(() => splitSentencesSafe(p.textEn), [p.textEn]);
  const sentencesTr = useMemo(() => splitSentencesSafe(p.textTr), [p.textTr]);
  const tokensEn = useMemo(() => parseParagraphText(p.textEn), [p.textEn]);

  const longPressTimeoutRef = useRef<any>(null);
  const isLongPressActive = useRef<boolean>(false);

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

            const startLongPress = (e: React.MouseEvent | React.TouchEvent) => {
              isLongPressActive.current = false;
              if (longPressTimeoutRef.current) {
                clearTimeout(longPressTimeoutRef.current);
              }
              longPressTimeoutRef.current = setTimeout(() => {
                isLongPressActive.current = true;
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
                if ('vibrate' in navigator) {
                  try {
                    navigator.vibrate(40);
                  } catch (err) {}
                }
              }, 1000);
            };

            const cancelLongPress = () => {
              if (longPressTimeoutRef.current) {
                clearTimeout(longPressTimeoutRef.current);
                longPressTimeoutRef.current = null;
              }
            };

            return (
              <span
                key={tokIdx}
                onMouseDown={startLongPress}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onMouseMove={cancelLongPress}
                onTouchStart={startLongPress}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
                onClick={(e) => {
                  if (isLongPressActive.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    isLongPressActive.current = false;
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
                className={`inline rounded-sm cursor-help ${
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

                  return (
                    <span
                      key={partIdx}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isLongPressActive.current) {
                          isLongPressActive.current = false;
                          return;
                        }
                        if (customMatch) {
                          handleWordClick(e, rawWord, customMatch.tr, p.id, uniqueWordIdx, sIdx, sentEn, sentTr);
                        } else {
                          handleWordClick(e, rawWord, 'Sözlük karşılığı yükleniyor...', p.id, uniqueWordIdx, sIdx, sentEn, sentTr);
                        }
                      }}
                      className={`cursor-pointer inline transition-colors ${
                        isWordClicked
                          ? 'relative text-[#FF6B6B] bg-[#FFE66D]/30 rounded underline underline-offset-4 decoration-2 decoration-[#FF6B6B]'
                          : isWordSpoken
                            ? 'bg-[#FF6B6B] text-white px-1.5 rounded font-extrabold relative z-40 shadow-xs'
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
  refillCountdown,
}: ReadingViewProps) {
  // Navigation & interaction states
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const currentChapter = book.chapters[activeChapterIdx] || { title: 'Ana Metin', paragraphs: [] };
  const [clickedWord, setClickedWord] = useState<{ en: string; tr: string; paragraphId: string; wordIdx: number } | null>(null);
  const [activeSentenceTr, setActiveSentenceTr] = useState<{ paragraphId: string; sentenceIdx: number; textEn: string; textTr: string } | null>(null);
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
  const lastTapRef = useRef<{ time: number; sentenceKey: string }>({ time: 0, sentenceKey: '' });
  const wordClickTimeoutRef = useRef<any>(null);

  const handleClearAllOverlays = () => {
    setClickedWord(null);
    setSelectedDictWord(null);
    setActiveSentenceTr(null);
  };

  // Word translation cache is declared globally at module scope.

  // Pages & Navigation States
  const pages = React.useMemo(() => {
    const list: { paragraphIndices: number[]; wordCount: number }[] = [];
    let currentGroup: number[] = [];
    let currentWordCount = 0;
    
    currentChapter.paragraphs.forEach((p, idx) => {
      const wordsCount = p.textEn.split(/\s+/).filter(Boolean).length;
      
      if (currentGroup.length > 0 && currentWordCount >= 150) {
        list.push({
          paragraphIndices: currentGroup,
          wordCount: currentWordCount
        });
        currentGroup = [idx];
        currentWordCount = wordsCount;
      } else {
        currentGroup.push(idx);
        currentWordCount += wordsCount;
      }
    });
    
    if (currentGroup.length > 0) {
      list.push({
        paragraphIndices: currentGroup,
        wordCount: currentWordCount
      });
    }
    
    return list;
  }, [currentChapter.paragraphs]);

  const [currentPageIdx, setCurrentPageIdx] = useState<number>(0);
  const [maxUnlockedPageIdx, setMaxUnlockedPageIdx] = useState<number>(0);

  // Load saved page progress from localStorage or default to the book's currentPage state
  useEffect(() => {
    if (pages.length > 0) {
      const ns = userEmail ? userEmail.toLowerCase().trim() : 'guest';
      let savedPage = localStorage.getItem(`linguist_current_page_${book.id}_${ns}`);
      if (!savedPage && ns === 'guest') {
        savedPage = localStorage.getItem(`linguist_current_page_${book.id}`);
      }
      const pageVal = savedPage ? parseInt(savedPage, 10) : Math.max(0, book.currentPage - 1);
      setCurrentPageIdx(Math.max(0, Math.min(pageVal, pages.length - 1)));

      let savedMax = localStorage.getItem(`linguist_max_unlocked_page_${book.id}_${ns}`);
      if (!savedMax && ns === 'guest') {
        savedMax = localStorage.getItem(`linguist_max_unlocked_page_${book.id}`);
      }
      const maxVal = savedMax ? parseInt(savedMax, 10) : Math.max(0, book.currentPage - 1);
      setMaxUnlockedPageIdx(Math.max(0, Math.min(maxVal, pages.length - 1)));
    }
  }, [book.id, pages.length, book.currentPage, userEmail]);

  // Save progress dynamically to localStorage and trigger real-time updates in App.tsx
  useEffect(() => {
    if (pages.length > 0) {
      const ns = userEmail ? userEmail.toLowerCase().trim() : 'guest';
      localStorage.setItem(`linguist_current_page_${book.id}_${ns}`, String(currentPageIdx));
      localStorage.setItem(`linguist_max_unlocked_page_${book.id}_${ns}`, String(maxUnlockedPageIdx));
      
      // Only update percentage in App.tsx if user has explicitly started the book
      // This prevents auto-adding to "currently reading" just by opening a story
      if (onPageChange && book.isStarted) {
        const percentage = Math.round(((currentPageIdx + 1) / pages.length) * 100);
        onPageChange(percentage, currentPageIdx + 1, pages.length);
      }
    }
  }, [book.id, book.isStarted, currentPageIdx, maxUnlockedPageIdx, pages.length, onPageChange, userEmail]);

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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Compute sentences on current page
  const pageSentences = useMemo(() => {
    const list: { paragraphId: string; sentenceIdx: number; text: string }[] = [];
    const currentPage = pages[currentPageIdx];
    if (currentPage) {
      currentPage.paragraphIndices.forEach(pIdx => {
        const p = currentChapter.paragraphs[pIdx];
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
  }, [currentPageIdx, pages, currentChapter]);

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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
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
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop audiobook on any global click, touch, or hold down when playing
  useEffect(() => {
    if (!isAudiobookPlaying) return;

    let active = false;
    const timer = setTimeout(() => {
      active = true;
    }, 150);

    const handleGlobalClick = (e: MouseEvent | TouchEvent) => {
      if (!active) return;
      handleStopAudiobook();
      e.stopPropagation();
      e.preventDefault();
    };

    window.addEventListener('click', handleGlobalClick, true);
    window.addEventListener('mousedown', handleGlobalClick, true);
    window.addEventListener('touchstart', handleGlobalClick, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleGlobalClick, true);
      window.removeEventListener('mousedown', handleGlobalClick, true);
      window.removeEventListener('touchstart', handleGlobalClick, true);
    };
  }, [isAudiobookPlaying, handleStopAudiobook]);

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

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const speakTimeout = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(sentence.text);
        utterance.lang = 'en-US';
        utterance.rate = 0.90; // Speeds up/slows down to exactly 0.90!

        const voice = getFemaleVoice('en-US');
        if (voice) {
          utterance.voice = voice;
        }

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

        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            const charIndex = event.charIndex;
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
          }
        };

        utterance.onend = () => {
          setPlayingSentenceIdx(prev => (prev !== null ? prev + 1 : null));
        };

        utterance.onerror = (e) => {
          console.warn("Audiobook sentence synthesis error:", e);
          setPlayingSentenceIdx(prev => (prev !== null ? prev + 1 : null));
        };

        window.speechSynthesis.speak(utterance);
      }, 100);

      return () => {
        clearTimeout(speakTimeout);
      };
    } else {
      handleStopAudiobook();
    }
  }, [isAudiobookPlaying, playingSentenceIdx, pageSentences, handleStopAudiobook]);

  const [activeQuizQuestions, setActiveQuizQuestions] = useState<any[] | null>(null);
  const [activeQuizQuestionIdx, setActiveQuizQuestionIdx] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);
  const [activeQuizCpIndex, setActiveQuizCpIndex] = useState<number | null>(null);
  const [showQuizRoadblockModal, setShowQuizRoadblockModal] = useState(false);

  const [quizTimeLeft, setQuizTimeLeft] = useState<number>(15);
  const timerRef = useRef<any>(null);
  const topRef = useRef<HTMLDivElement>(null);

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
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToTop();
    }, 50);
    return () => clearTimeout(timer);
  }, [currentPageIdx, activeQuizQuestions === null, activeChapterIdx]);

  const handleQuizTimeout = () => {
    if (isQuizAnswered) return;
    setIsQuizAnswered(true);
    setSelectedQuizOption(null);
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
    
    const sectionParagraphs = cpPage.paragraphIndices.map(pIdx => currentChapter.paragraphs[pIdx]);
    
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
          
          vocab.push({
            en: w.en,
            tr: w.tr,
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
      for (const p of currentChapter.paragraphs) {
        if (uniqueVocab.length >= 12) break;
        if (p.words) {
          p.words.forEach(w => {
            const key = w.en.toLowerCase().trim();
            if (!seen.has(key)) {
              seen.add(key);
              
              const sentencesEn = splitSentencesSafe(p.textEn);
              const sentencesTr = splitSentencesSafe(p.textTr);
              const contextEn = sentencesEn[0] || '';
              const contextTr = sentencesTr[0] || p.textTr;
              
              uniqueVocab.push({
                en: w.en,
                tr: w.tr,
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
      { en: 'story', tr: 'hikaye', sentenceEn: 'She read an interesting story.', sentenceTr: 'İlginç bir hikaye okudu.' },
      { en: 'friend', tr: 'arkadaş', sentenceEn: 'He met his best friend.', sentenceTr: 'En iyi arkadaşıyla buluştu.' },
      { en: 'happy', tr: 'mutlu', sentenceEn: 'They lived a happy life.', sentenceTr: 'Mutlu bir hayat yaşadılar.' },
      { en: 'time', tr: 'zaman', sentenceEn: 'Once upon a time.', sentenceTr: 'Bir varmış bir yokmuş.' },
      { en: 'day', tr: 'gün', sentenceEn: 'It was a sunny day.', sentenceTr: 'Güneşli bir gündü.' },
      { en: 'house', tr: 'ev', sentenceEn: 'They walked to the house.', sentenceTr: 'Eve yürüdüler.' },
      { en: 'word', tr: 'kelime', sentenceEn: 'Write down the word.', sentenceTr: 'Kelimeyi yazın.' }
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
      const isFillBlank = !isA1A2
        ? (qIdx % 2 === 1 && item.sentenceEn && item.sentenceEn.toLowerCase().includes(cleanWord(item.en).toLowerCase()))
        : (qIdx === 1 && item.sentenceEn && item.sentenceEn.toLowerCase().includes(cleanWord(item.en).toLowerCase()));
      
      const correctOptionValue = isFillBlank ? item.en : item.tr;
      
      const distractors = uniqueVocab
        .filter(x => x.en.toLowerCase() !== item.en.toLowerCase())
        .map(x => isFillBlank ? x.en : x.tr)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
        
      const defaultTrDistractors = ['koşmak', 'ev', 'yemek', 'gülümsemek', 'ağaç', 'sepet', 'köpek', 'mutlu'];
      const defaultEnDistractors = ['run', 'house', 'eat', 'smile', 'tree', 'basket', 'dog', 'happy'];
      const defaults = isFillBlank ? defaultEnDistractors : defaultTrDistractors;
      
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
        
        return {
          id: `cp_${pageIdx}_q_${qIdx}`,
          type: 'fill_blank',
          question: questionText,
          hint: item.sentenceTr,
          word: item.en,
          options,
          correctIndex
        };
      } else {
        return {
          id: `cp_${pageIdx}_q_${qIdx}`,
          type: 'word_meaning',
          word: item.en,
          options,
          correctIndex,
          hint: item.sentenceEn ? `Cümle: "${item.sentenceEn}"` : ''
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
          const ns = userEmail ? userEmail.toLowerCase().trim() : 'guest';
          localStorage.setItem(`linguist_max_unlocked_page_${book.id}_${ns}`, String(nextUnlocked));
          return nextUnlocked;
        });
        
        setCurrentPageIdx(nextMax);
        const ns = userEmail ? userEmail.toLowerCase().trim() : 'guest';
        localStorage.setItem(`linguist_current_page_${book.id}_${ns}`, String(nextMax));
      }
      setActiveQuizQuestions(null);
      setActiveQuizCpIndex(null);
      setActiveQuizQuestionIdx(0);
      setShowQuizRoadblockModal(false);
      setToastMessage('Tebrikler! Sayfa Geçiş Testini Başarıyla Geçtiniz. 🎉');
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

    if (isCorrect) {
      setStats((prev: any) => ({
        ...prev,
        readingGoalPercent: Math.min(prev.readingGoalPercent + 4, 100)
      }));
      // Auto-advance on correct answers after 800ms
      setTimeout(() => {
        handleQuizNextDirect();
      }, 800);
    } else {
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
      const ns = userEmail ? userEmail.toLowerCase().trim() : 'guest';
      localStorage.setItem(`linguist_max_unlocked_page_${book.id}_${ns}`, String(nextUnlocked));
      return nextUnlocked;
    });
    
    setCurrentPageIdx(nextMax);
    const ns = userEmail ? userEmail.toLowerCase().trim() : 'guest';
    localStorage.setItem(`linguist_current_page_${book.id}_${ns}`, String(nextMax));
    
    setActiveQuizQuestions(null);
    setActiveQuizCpIndex(null);
    setActiveQuizQuestionIdx(0);
    setShowQuizRoadblockModal(false);
    
    setToastMessage('Quizi premium ayrıcalığı ile geçtiniz! Keyifli okumalar. 🚀');
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

      const now = Date.now();
      const DOUBLE_PRESS_DELAY = 300; // ms
      const currentKey = `${paragraphId}_${sentenceIdx}`;

      // If it's a double click (or more) or we have a swift consecutive tap on the same sentence
      const isConsecutiveTap = lastTapRef.current.sentenceKey === currentKey && (now - lastTapRef.current.time) < DOUBLE_PRESS_DELAY;

      if (e.detail >= 2 || isConsecutiveTap) {
        if (wordClickTimeoutRef.current) {
          clearTimeout(wordClickTimeoutRef.current);
          wordClickTimeoutRef.current = null;
        }
        setClickedWord(null);
        setSelectedDictWord(null);
        setActiveSentenceTr({
          paragraphId,
          sentenceIdx,
          textEn: sentEn || '',
          textTr: sentTr || ''
        });
        lastTapRef.current = { time: now, sentenceKey: currentKey };
        
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(40);
          } catch (err) {}
        }
        return;
      }

      lastTapRef.current = { time: now, sentenceKey: currentKey };

      if (wordClickTimeoutRef.current) {
        clearTimeout(wordClickTimeoutRef.current);
      }

      // Delay the single click action slightly to ensure a potential double click takes precedence
      wordClickTimeoutRef.current = setTimeout(() => {
        try {
          const cleanW = cleanWord(wordEn);
          if (!cleanW) return; // Ignore clicking on pure symbols/punctuation

          const isPlaceholder = wordTr === 'Sözlük karşılığı yükleniyor...'
            || !wordTr
            || wordTr.toLowerCase().trim() === cleanW.toLowerCase().trim();

          const looksLikePropName = looksLikeProperNoun(cleanW);

          // Check if word is already translated in cache for maximum speed
          const cached = getCachedTranslation(cleanW);
          
          let initialTr = cached ? cached.translation : (isPlaceholder ? 'Çeviriliyor...' : wordTr);
          if (!cached && looksLikePropName) {
            initialTr = `${cleanW} (Özel İsim)`;
          }

          let initialNotes = cached ? cached.notes : (isPlaceholder ? 'Yapay zeka bağlamsal sözlük...' : undefined);
          if (!cached && looksLikePropName) {
            initialNotes = 'Karakter veya Yer Adı • Özel İsim';
          }
          
          // Determine initial level using our multi-tier cache
          let initialLevel = (book?.level || 'A1') + ' Seviyesi';
          if (cached && cached.level) {
            initialLevel = cached.level;
          } else {
            if (looksLikePropName) {
              initialLevel = 'Özel İsim';
            }
          }

          // Set clicked word to display inline translation above the clicked span
          setClickedWord({ en: wordEn, tr: initialTr, paragraphId, wordIdx });

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
              // Proper nouns are resolved locally, no need to request AI translation
              saveCachedTranslation(cleanW, `${cleanW} (Özel İsim)`, 'Karakter veya Yer Adı • Özel İsim', 'Özel İsim');
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

            const offlineStem = tryOfflineSuffixes(cleanW);
            if (offlineStem) {
              // Found via suffix stripping — use immediately without API call
              saveCachedTranslation(cleanW, offlineStem, 'Çevrimdışı Sözlük • Türetilmiş', `${book?.level || 'A1'} Seviyesi`);
              setClickedWord(prev => prev && prev.paragraphId === paragraphId && prev.wordIdx === wordIdx
                ? { ...prev, tr: offlineStem }
                : prev
              );
              setSelectedDictWord(prev => prev && prev.paragraphId === paragraphId && prev.word.toLowerCase() === cleanW.toLowerCase()
                ? { ...prev, translation: offlineStem, notes: 'Çevrimdışı Sözlük • Türetilmiş', level: `${book?.level || 'A1'} Seviyesi` }
                : prev
              );
            } else {
              // Determine API base URL (works both on web and in Android Capacitor)
              const apiBase = (() => {
                try {
                  if (window.location.protocol === 'capacitor:' || window.location.hostname === 'localhost') {
                    return 'https://ingilizce-oyk-m.onrender.com';
                  }
                  return '';
                } catch { return ''; }
              })();

              fetch(`${apiBase}/api/translate-word`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word: cleanW, context: sentEn || '', level: book?.level || 'A1' })
              })
              .then(res => {
                if (!res.ok) throw new Error('API error');
                return res.json();
              })
              .then((data: any) => {
                if (data && data.translation) {
                  const finalNotes = data.explanation || `${data.partOfSpeech || 'Bağlamsal Sözcük'} • Çeviri API`;
                  const finalLevel = data.isName ? 'Özel İsim' : `${data.wordLevel || book?.level || 'A1'} Seviyesi`;
                  saveCachedTranslation(cleanW, data.translation, finalNotes, finalLevel);
                  setClickedWord(prev => prev && prev.paragraphId === paragraphId && prev.wordIdx === wordIdx
                    ? { ...prev, tr: data.translation }
                    : prev
                  );
                  setSelectedDictWord(prev => prev && prev.paragraphId === paragraphId && prev.word.toLowerCase() === cleanW.toLowerCase()
                    ? { ...prev, translation: data.translation, level: finalLevel, notes: finalNotes }
                    : prev
                  );
                }
              })
              .catch(err => {
                console.error('Dynamic translation failed:', err);
                const looksLikePropName = looksLikeProperNoun(cleanW);
                const finalTr = looksLikePropName ? `${cleanW} (Özel İsim)` : 'Çeviri yüklenemedi';
                const fallbackNotes = looksLikePropName ? 'Özel isim veya Karakter adı' : 'İnternet bağlantısı gerekiyor';
                const fallbackLevel = looksLikePropName ? 'Özel İsim' : `${book?.level || 'A1'} Seviyesi`;
                // Do NOT cache failures — let user retry by clicking again
                setClickedWord(prev => prev && prev.paragraphId === paragraphId && prev.wordIdx === wordIdx
                  ? { ...prev, tr: finalTr }
                  : prev
                );
                setSelectedDictWord(prev => prev && prev.paragraphId === paragraphId && prev.word.toLowerCase() === cleanW.toLowerCase()
                  ? { ...prev, translation: finalTr, notes: fallbackNotes, level: fallbackLevel }
                  : prev
                );
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
  }, [book?.level]);

  // Helpers splitSentencesSafe, parseParagraphText, and cleanWord are declared globally at module scope for static references.

  // Handle double tap / double click for sentence translation (precise sentence bounding)
  const handleSentenceClick = useCallback((
    e: React.MouseEvent,
    paragraphId: string,
    sentenceIdx: number,
    textEn: string,
    textTr: string
  ) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300; // ms
    const currentKey = `${paragraphId}_${sentenceIdx}`;

    const isDoubleClick = e.detail >= 2 || (lastTapRef.current.sentenceKey === currentKey && now - lastTapRef.current.time < DOUBLE_PRESS_DELAY);

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
    lastTapRef.current = { time: now, sentenceKey: currentKey };
  }, []);

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
      onSaveWord(
        wordClean, 
        selectedDictWord.translation, 
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
    const shareText = `"${selectedDictWord.word}" kelimesinin Türkçe karşılığı: "${selectedDictWord.translation}". İngilizce Öyküm ile İngilizce öğreniyorum!`;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(shareText)
          .then(() => {
            setToastMessage('Kelime ve çeviri kopyalandı, artık paylaşabilirsiniz! 🔗');
          })
          .catch((err) => {
            console.warn("Clipboard promise rejected, using fallback:", err);
            setToastMessage('İpucu: Kelimeyi seçip kendiniz kopyalayabilirsiniz.');
          });
      } else {
        setToastMessage('Sözcük kopyalanmadı ama okumaya devam edebilirsiniz.');
      }
    } catch (e) {
      console.error("Clipboard write syntax exception caught:", e);
      setToastMessage('Sözcük kopyalanmadı ama okumaya devam edebilirsiniz.');
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

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
                            toastMessage.toLowerCase().includes('hata') || 
                            toastMessage.toLowerCase().includes('geçersiz') || 
                            toastMessage.toLowerCase().includes('yetersiz') ||
                            toastMessage.toLowerCase().includes('çıkış') ||
                            toastMessage.toLowerCase().includes('kaldırıldı') ||
                            toastMessage.toLowerCase().includes('desteklemiyor');
          
          return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 pointer-events-none select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                className={`w-full max-w-[340px] rounded-3xl p-6 border text-center flex flex-col items-center gap-4 backdrop-blur-lg transition-all duration-300 shadow-2xl ${
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
              className={`p-1 px-2.5 -ml-2 rounded-xl transition-all flex items-center gap-1.5 text-sm font-bold cursor-pointer shrink-0 ${
                isDarkMode ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-[#FFFBF0] text-gray-700'
              }`}
            >
              <ArrowLeft className="w-4 h-4 text-[#FF6B6B]" />
              <span>Geri</span>
            </button>
            <div className={`w-[1px] h-4 shrink-0 ${isDarkMode ? 'bg-gray-700' : 'bg-[#FFE66D]'}`} />
            <h1 className={`text-sm font-bold line-clamp-2 tracking-wider font-headline-lg transition-colors flex-1 leading-snug block overflow-hidden ${
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
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  book.isFavorited
                    ? 'bg-[#F59E0B]/15 border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/25'
                    : isDarkMode
                      ? 'bg-[#1A1A1E] border-[#2A2A30] text-gray-400 hover:text-white hover:border-gray-500'
                      : 'bg-white border-gray-250 text-gray-550 hover:text-[#F59E0B] hover:border-gray-300'
                }`}
                title={book.isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              >
                <Star className={`w-3.5 h-3.5 ${book.isFavorited ? 'fill-[#F59E0B]' : ''}`} />
              </button>
            )}

            {/* Embedded Dark mode switch inside reading view */}
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-[#1A1A1E] border-[#2A2A30] text-[#FFE66D] hover:bg-[#2A2A30]' 
                    : 'bg-white border-[#FFE66D] text-[#FF6B6B] hover:bg-[#FFE66D]/15'
                }`}
                title={isDarkMode ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Cohesive Sub-row for Lives indicator and level badge (User Focus) */}
        <div className="max-w-[680px] mx-auto px-5 pt-1.5 pb-4 flex flex-col items-center gap-2.5">
          <div className="flex items-center justify-center gap-3">
            {/* Lives Indicator */}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-[#FF6B6B]/10 border border-[#FF6B6B]/25 rounded-full font-bold" title="Can Bilgisi">
              <Heart className={`w-4.5 h-4.5 text-[#FF6B6B] ${stats?.isPremium ? 'fill-[#FF6B6B] animate-pulse' : 'fill-[#FF6B6B]'}`} />
              <span className="text-[13px] text-[#FF6B6B] font-mono leading-none">
                {stats?.isPremium ? '∞' : (stats?.hearts ?? 5)}
              </span>
            </div>

            {/* Book Level Badge */}
            <span className="text-xs bg-[#4ECDC4]/10 text-[#4ECDC4] font-bold border border-[#4ECDC4]/30 rounded-full px-4 py-1">
              {book.level}
            </span>
          </div>

          {/* Centered Aesthetic Countdown Timer */}
          {!stats?.isPremium && stats?.hearts !== undefined && stats?.hearts !== null && Number(stats.hearts) < 5 && refillCountdown && (
            <div className="flex items-center gap-1.5 text-[11px] bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 text-[#FF6B6B] px-3.5 py-1 rounded-full font-bold tracking-wide shadow-3xs transition-all">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
              <span>Yeni Can:</span>
              <span className="font-mono font-extrabold">{refillCountdown}</span>
            </div>
          )}
        </div>
      </header>

      {/* Reading Canvas */}
      <main className="flex-1 w-full max-w-[680px] mx-auto px-5 pt-8 select-none">
        
        {/* Story Illustration Image Header */}
        <div className={`w-full h-44 sm:h-56 rounded-3xl overflow-hidden mb-8 shadow-sm border transition-colors ${
          isDarkMode ? 'border-[#2A2A30]' : 'border-[#FFE66D]'
        }`}>
          <img
            alt="Illustrated scenery"
            className="w-full h-full object-cover brightness-90 group-hover:brightness-95"
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
            <b>İpucu:</b> Kelimenin Türkçe anlamı için üzerine <span className="font-bold">tek tıklayın</span>. Cümlenin Türkçe çevirisi için cümleye <span className="font-semibold">çift tıklayın</span> veya kelimeye <span className="font-semibold">1 saniye basılı tutun</span> (sadece ilgili cümleyi açıklar).
          </p>
        </div>

        {/* Audiobook Control Bar */}
        <div className={`p-4 rounded-2xl mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-2 transition-all select-none ${
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
              <h4 className="text-xs font-bold font-headline-lg leading-tight">Sesli Kitap (Audiobook)</h4>
              <p className="text-[10px] text-gray-400 font-semibold leading-normal mt-0.5">
                {isAudiobookPlaying ? 'Sayfa sesli olarak okunuyor...' : 'Bu sayfanın tamamını seslendirin.'}
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
                <span>Durdur</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleStartAudiobook}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#4ECDC4] hover:bg-[#3db8af] text-white rounded-xl text-xs font-bold transition-all transform active:scale-95 cursor-pointer shadow-md shadow-[#4ECDC4]/20 font-headline-lg flex items-center justify-center gap-1.5"
                >
                  <Volume2 className="w-4.5 h-4.5 shrink-0" />
                  <span className="leading-tight text-center">Bütün Sayfayı Dinle</span>
                </button>
                {lastSpokenSentenceIdx !== null && (
                  <button
                    onClick={handleContinueAudiobook}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#FFE66D] hover:bg-[#ebd152] text-gray-900 rounded-xl text-xs font-bold transition-all transform active:scale-95 cursor-pointer shadow-md shadow-[#FFE66D]/20 font-headline-lg flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 text-gray-900 animate-pulse shrink-0" />
                    <span className="leading-tight text-center">Kaldığın Yerden Devam Et</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

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
          {currentChapter.paragraphs.length > 0 ? (
            (() => {
              const currentPage = pages[currentPageIdx];
              if (!currentPage) return null;

              const renderedParagraphs = currentPage.paragraphIndices.map(pIdx => currentChapter.paragraphs[pIdx]);

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
                          Bu Hikayeye Başlayın!
                        </h4>
                        <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Hikayeyi kütüphanedeki <b>"Şu Anda Okunanlar"</b> listenize eklemek ve ilerlemenizi kaydetmek için butona tıklayın.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (onStartBook) {
                            onStartBook(book.id);
                          }
                          setToastMessage('Harika! Hikayeye başarıyla başlandı. Kitap, kitaplığınızdaki "Şu Anda Okunanlar" listenize eklendi. 🎉');
                          setTimeout(() => setToastMessage(null), 3500);
                        }}
                        className="w-full sm:w-auto px-8 py-3 bg-[#4ECDC4] hover:bg-[#3db8af] text-white rounded-full text-xs font-bold transition-all transform active:scale-95 cursor-pointer shadow-md shadow-[#4ECDC4]/20 font-headline-lg flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Kitaba Başla</span>
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
                      setActiveSentenceTr={setActiveSentenceTr}
                      setClickedWord={setClickedWord}
                      setSelectedDictWord={setSelectedDictWord}
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
                          <span>Sonraki Sayfa (Sayfa {currentPageIdx + 2}'ye Geç)</span>
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
                          <span>Sonraki Sayfa</span>
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
                            Bu Kitabı Başarıyla Bitirdiniz! 🎉
                          </h3>
                          <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Tebrikler! Bu hikayeyi tamamladınız. Kütüphaneye geri dönüp yeni hikayeler keşfedebilirsiniz.
                          </p>
                          <button
                            onClick={() => {
                              const percentage = Math.round(((currentPageIdx + 1) / pages.length) * 100);
                              onBack(percentage, currentPageIdx + 1, pages.length);
                            }}
                            className="px-8 py-3 bg-[#FF6B6B] hover:bg-[#e05a5a] text-white rounded-full text-xs font-bold transition-all transform active:scale-95 cursor-pointer shadow-md shadow-[#FF6B6B]/20 font-headline-lg"
                          >
                            Kütüphaneye Dön
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h3 className={`text-lg font-bold font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                            Hikayenin Sonuna Geldiniz! 📖
                          </h3>
                          <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Bu hikayeyi başarıyla tamamladınız. Profilinize işlenmesi ve kitaplıkta bitmiş olarak işaretlenmesi için aşağıdaki butona basın.
                          </p>
                          <button
                            onClick={() => {
                              if (onFinishBook) {
                                onFinishBook(book.id);
                              }
                            }}
                            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 font-headline-lg"
                          >
                            <span>Kitabı Bitir</span>
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
              <p className="font-headline-lg font-bold text-gray-500">Bu kitapta makale bulunamadı</p>
              <button
                onClick={onBack}
                className="mt-4 px-4 py-2 bg-gray-105 hover:bg-gray-200 text-gray-750 rounded-lg text-sm font-semibold cursor-pointer"
              >
                Kütüphaneye Dön
              </button>
            </div>
          )}
        </article>

      </main>

      {/* Chapter Progress Bar Overlay Footer */}
      <footer className={`fixed bottom-0 left-0 w-full border-t z-35 backdrop-blur-md transition-colors ${
        isDarkMode 
          ? 'bg-[#1A1A1E]/95 border-[#2A2A30] shadow-[0_-5px_20px_rgba(0,0,0,0.35)]' 
          : 'bg-white/90 border-[#FFE66D]/80 shadow-[0_-5px_20px_rgba(255,107,107,0.03)]'
      }`}>
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
              <span>← Geri</span>
            </button>
            
            <span className="font-bold font-mono">
              Sayfa {currentPageIdx + 1} / {pages.length}
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
              <span>İleri →</span>
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
                  SEÇİLEN KELİME
                </span>
                <div className="flex items-center gap-2">
                  <h4 className={`text-2xl font-bold font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                    {selectedDictWord.word}
                  </h4>
                  <button
                    onClick={() => speakWordAloud(selectedDictWord.word)}
                    className="p-1 rounded-full text-[#FF6B6B] hover:bg-[#FFE66D]/20 transition-colors cursor-pointer"
                    title="Telaffuzu Dinle"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#4ECDC4]/10 border border-[#4ECDC4]/30 font-bold text-[#4ECDC4] px-2 py-0.5 rounded-md">
                  {selectedDictWord.level}
                </span>
                <button
                  onClick={() => setSelectedDictWord(null)}
                  className={`p-1 px-2.5 rounded-lg font-bold text-xs cursor-pointer ${
                    isDarkMode ? 'bg-[#2A2A30] text-gray-300 hover:bg-[#343A40]' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                  }`}
                >
                  KAPAT
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className={`h-[1px] ${isDarkMode ? 'bg-gray-800' : 'bg-[#FFE66D]/50'}`} />

            {/* Turkish Translation Area */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 tracking-widest block mb-1">
                TÜRKÇE ÇEVİRİSİ
              </span>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold leading-normal font-headline-lg text-[#FF6B6B]">
                  {selectedDictWord.translation}
                </p>
                <button
                  onClick={() => speakTranslationAloud(selectedDictWord.translation)}
                  className="p-1 rounded-full text-[#4ECDC4] hover:bg-[#4ECDC4]/10 transition-colors cursor-pointer"
                  title="Anlamını Dinle"
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
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isWordSaved(selectedDictWord.word)
                    ? 'bg-[#4ECDC4]/15 text-[#4ECDC4] border-2 border-[#4ECDC4] hover:bg-[#4ECDC4]/20'
                    : 'bg-[#FF6B6B] text-white hover:bg-[#e05a5a] shadow-md shadow-[#FF6B6B]/20'
                }`}
              >
                {isWordSaved(selectedDictWord.word) ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-[#4ECDC4] fill-[#4ECDC4]" />
                    <span>Kelimeye Kaydedildi</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Kelime Dağarcığına Kaydet</span>
                  </>
                )}
              </button>

              {/* Share translation without custom alarm dialogs */}
              <button
                onClick={handleShareTranslation}
                className={`w-12 h-12 border-2 rounded-xl flex items-center justify-center text-[#FF6B6B] transition-colors cursor-pointer ${
                  isDarkMode ? 'border-[#2A2A30] hover:bg-white/5' : 'border-[#FFE66D] hover:bg-[#FFFBF0]'
                }`}
                title="Kelimeyi Paylaş"
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
            onClick={() => setActiveSentenceTr(null)}
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
              onClick={() => setActiveSentenceTr(null)}
            >
              {/* Header label */}
              <div className="flex items-center justify-between border-b border-gray-400/15 pb-2 select-none w-full">
                <span className="text-[10px] font-bold text-[#FF6B6B] tracking-wider font-headline-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
                  CÜMLE ÇEVİRİSİ
                </span>
                <span className="text-gray-400 text-[10px] font-bold font-headline-lg">
                  Kapat [✕]
                </span>
              </div>
              
              {/* Body: Translation strictly on top, English sentence below */}
              <div className="space-y-2 text-left">
                {/* Turkish Translation on top */}
                <div className={`text-[13px] sm:text-[14px] font-extrabold leading-relaxed block ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  {activeSentenceTr.textTr}
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
                  <h3 className="text-base font-bold text-red-500">Canınız Kalmadı!</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Okumaya devam etmek için canlarınızın zamanla dolmasını bekleyebilir veya Premium üyeliğe geçerek canınızı anında fulleyebilirsiniz!
                  </p>
                  <div className="text-xs font-mono font-bold bg-[#FF6B6B]/10 text-[#FF6B6B] inline-block px-3 py-1 rounded-full">
                    Bir sonraki can: {refillCountdown || 'Doluyor...'}
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
                      Canları Fulle (Premium Üyelik)
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
                        OKUMA EŞİĞİ • SAYFA {currentPageIdx + 1} KONTROLÜ
                      </h4>
                      <h3 className="font-bold text-base leading-snug">Sonraki Sayfa Geçişi</h3>
                    </div>
                  </div>
                  
                  <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 mb-5">
                    Harika gidiyorsunuz! Bu sayfayı tamamladınız. Bir sonraki sayfaya geçmek ve yeni paragrafları okumak için bu bölüme ait 5 soruluk quizi çözmelisiniz.
                  </p>
                  
                  <div className="flex justify-between items-center bg-[#FFE66D]/15 px-4 py-3 rounded-2xl border border-[#FFE66D]/45 mb-5 select-none">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                       {stats?.isPremium ? (
                         <span>Premium ile <b>sınırsız cana</b> sahipsiniz!</span>
                       ) : (
                         <span>Bilemediğiniz her soru <b>1 can</b> azaltır.</span>
                       )}
                     </span>
                    <div className="flex items-center gap-1 font-bold text-xs text-[#FF6B6B]">
                      <Heart className="w-4 h-4 fill-[#FF6B6B]" />
                      <span>{stats?.isPremium ? '∞' : (stats?.hearts ?? 5)} Can</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartCheckpointQuiz(currentPageIdx)}
                    className="w-full py-3 bg-[#FF6B6B] text-white rounded-xl text-sm font-bold hover:bg-[#e05a5a] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#FF6B6B]/20"
                  >
                    <span>Sonraki Sayfa (Quizi Çöz)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {stats?.isPremium && (
                    <button
                      onClick={handleSkipQuiz}
                      className="w-full mt-3 py-3 bg-[#4ECDC4] text-white rounded-xl text-sm font-bold hover:bg-[#3db8af] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#4ECDC4]/20"
                    >
                      <span>Quizi Atla (Premium)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                /* ACTIVE INTERACTIVE QUIZ CARD */
                <div className="pt-2">
                  {/* Quiz status bar */}
                  <div className="flex justify-between items-center mb-4 select-none">
                    <span className="text-xs font-extrabold tracking-wider text-[#4ECDC4] font-headline-lg">
                      BARAJ SORUSU {activeQuizQuestionIdx + 1} / 5
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF6B6B]">
                      <Heart className="w-3.5 h-3.5 fill-[#FF6B6B]" />
                      <span>{stats?.isPremium ? '∞' : (stats?.hearts ?? 5)} Can</span>
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
                          ⏱️ Kalan Süre: {quizTimeLeft} saniye
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
                        ? 'Cümledeki boşluğu doldurun (Fill in the blank):'
                        : 'Kelimenin Türkçe karşılığı nedir?'}
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
                        💡 {activeQuizQuestions[activeQuizQuestionIdx]?.type === 'fill_blank' ? 'Anlamı:' : 'İpucu:'} {activeQuizQuestions[activeQuizQuestionIdx]?.hint}
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
                          ? '⏱️ Süre Doldu! 1 Can eksildi.'
                          : selectedQuizOption === activeQuizQuestions[activeQuizQuestionIdx].correctIndex
                            ? '🎉 Doğru cevap! İlerleniyor...'
                            : `😔 Yanlış cevap! 1 Can eksildi`}
                      </span>
                      
                      {/* Show next button if answer was incorrect or timed out, correct answers auto-advance */}
                      {(selectedQuizOption === null || selectedQuizOption !== activeQuizQuestions[activeQuizQuestionIdx].correctIndex) && (
                        <button
                          onClick={handleQuizNext}
                          className="py-2.5 px-5 bg-[#4ECDC4] hover:bg-[#3db8af] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>{activeQuizQuestionIdx === 4 ? 'Tamamla' : 'Sonraki Soru'}</span>
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
                      <span>Quizi Atla (Premium)</span>
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
