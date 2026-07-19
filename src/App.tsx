import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { App as CapacitorApp } from '@capacitor/app';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import LibraryTab from './components/LibraryTab';
import ReadingView from './components/ReadingView';
import VocabularyTab from './components/VocabularyTab';
import QuizView from './components/QuizView';
import ProfileTab from './components/ProfileTab';
import FavoritesTab from './components/FavoritesTab';
import SplashScreen from './components/SplashScreen';
import { PremiumPaywall } from './components/PremiumPaywall';
import { X, Zap, Crown, Heart, Clock, Award, ChevronRight, BookOpen, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Book, VocabularyWord, UserStats, Badge, LeaderboardUser } from './types';
import { INITIAL_BOOKS, INITIAL_VOCABULARY, INITIAL_BADGES, LEADERBOARD_DATA, LIBRARY_UNIQUE_WORDS_COUNT, GLOBAL_DICTIONARY } from './data';
import { OFFLINE_DICTIONARY } from './dictionary';
import { AVATAR_OPTIONS } from './avatar_assets';
import { scheduleDailyReminder, scheduleHeartsRefilledNotification, cancelHeartsNotification } from './services/notifications';
import { initializeBillingStore } from './services/billing';
import { LanguageCode, SUPPORTED_LANGUAGES, t, PLACEHOLDER_STRINGS } from './i18n';

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const healVocabulary = (vocab: VocabularyWord[]): VocabularyWord[] => {
  if (!Array.isArray(vocab)) return [];
  
  // Resolve active language
  const savedLang = (localStorage.getItem('linguist_native_language') || 'tr') as LanguageCode;
  
  return vocab.map(item => {
    if (!item || !item.word) return item;
    const cleanW = item.word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”‘’\[\]{}<>|\\+]/g, "").trim();
    const isPlaceholder = !item.translation
      || PLACEHOLDER_STRINGS.has(item.translation.trim())
      || item.translation.toLowerCase().trim() === cleanW;

    if (isPlaceholder) {
      const offlineEntry = OFFLINE_DICTIONARY[cleanW];
      if (offlineEntry && offlineEntry.tr && !PLACEHOLDER_STRINGS.has(offlineEntry.tr.trim())) {
        return { ...item, translation: offlineEntry.tr, notes: offlineEntry.notes || item.notes };
      }
      
      const globalEntry = GLOBAL_DICTIONARY[cleanW];
      if (globalEntry && !PLACEHOLDER_STRINGS.has(globalEntry.trim())) {
        return { ...item, translation: globalEntry, notes: t('notes_offline_fixed', savedLang) };
      }

      const capitalized = item.word.charAt(0).toUpperCase() + item.word.slice(1);
      return { ...item, translation: capitalized, notes: t('notes_temp_fixed', savedLang) };
    }
    return item;
  });
};

const getDaysDifference = (dateStr1: string, dateStr2: string) => {
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

const isDifferentCalendarWeek = (dateStr1: string, dateStr2: string): boolean => {
  try {
    const d1 = new Date(dateStr1 + 'T00:00:00');
    const d2 = new Date(dateStr2 + 'T00:00:00');
    
    // Find Monday of the week for d1
    const day1 = d1.getDay();
    const diffToMonday1 = day1 === 0 ? 6 : day1 - 1;
    const monday1 = new Date(d1.getTime() - diffToMonday1 * 24 * 60 * 60 * 1000);
    monday1.setHours(0, 0, 0, 0);

    // Find Monday of the week for d2
    const day2 = d2.getDay();
    const diffToMonday2 = day2 === 0 ? 6 : day2 - 1;
    const monday2 = new Date(d2.getTime() - diffToMonday2 * 24 * 60 * 60 * 1000);
    monday2.setHours(0, 0, 0, 0);

    return monday1.getTime() !== monday2.getTime();
  } catch {
    return true;
  }
};
const getApiBase = () => {
  try {
    if (window.location.protocol === 'capacitor:') {
      return 'https://ingilizce-oyk-m.onrender.com';
    }
    return '';
  } catch {
    return '';
  }
};


const DEFAULT_STATS: UserStats = {
  learnedWordsCount: 0,
  completedBooksCount: 0,
  dailyStreak: 0,
  totalTimeMinutes: 0,
  readingGoalPercent: 0,
  wordGoalPercent: 0,
  timeGoalPercent: 0,
  hearts: 5,
  isPremium: false,
  premiumExpiryDate: null,
  premiumType: null,
  weeklyWords: [0, 0, 0, 0, 0, 0, 0],
  weeklyMins: [0, 0, 0, 0, 0, 0, 0],
  dailyQuizzesSolvedCount: 0,
  dailyQuizzesScoreSum: 0,
  dailyQuizzesQuestionsSum: 0,
  synonymGamesCompletedCount: 0,
  fillBlankGamesCompletedCount: 0
};

const stripBooksForSync = (booksList: Book[]) => {
  if (!Array.isArray(booksList)) return [];
  return booksList.map(b => {
    if (b.id && b.id.startsWith('custom_book_')) {
      return b;
    }
    return {
      id: b.id,
      currentPage: b.currentPage ?? 0,
      isStarted: !!b.isStarted,
      isCompleted: !!b.isCompleted,
      isFavorited: !!b.isFavorited,
      percentageCompleted: b.percentageCompleted ?? 0,
      pagesLeft: b.pagesLeft ?? 0
    };
  });
};

const getOrInitializeDeviceUuid = (): string => {
  try {
    let uuid = localStorage.getItem('linguist_device_uuid') || '';
    if (!uuid) {
      uuid = 'web-' + Math.random().toString(36).substring(2, 15) + '-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('linguist_device_uuid', uuid);
    }
    return uuid;
  } catch (e) {
    return 'web-fallback';
  }
};

const migrateLegacyNamespace = (keyPrefix: string, deviceUuid: string): string => {
  try {
    const targetKey = `${keyPrefix}_${deviceUuid}`;
    const existingTarget = localStorage.getItem(targetKey);
    
    if (existingTarget !== null) {
      return existingTarget;
    }
    
    const legacyKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${keyPrefix}_`)) {
        if (key !== targetKey) {
          legacyKeys.push(key);
        }
      }
    }
    
    let sourceKey: string | null = null;
    
    const emailKey = legacyKeys.find(k => k.includes('@'));
    if (emailKey) {
      sourceKey = emailKey;
    } else {
      const guestKey = legacyKeys.find(k => k.endsWith('_guest'));
      if (guestKey) {
        sourceKey = guestKey;
      } else {
        if (localStorage.getItem(keyPrefix) !== null) {
          sourceKey = keyPrefix;
        } else if (legacyKeys.length > 0) {
          sourceKey = legacyKeys[0];
        }
      }
    }
    
    if (sourceKey) {
      const value = localStorage.getItem(sourceKey);
      if (value !== null) {
        console.log(`[Migration] Copying data from legacy key "${sourceKey}" to "${targetKey}"`);
        localStorage.setItem(targetKey, value);
        return value;
      }
    }
  } catch (e) {
    console.error('Migration error:', e);
  }
  return '';
};

const detectBrowserLanguage = (): LanguageCode => {
  const code = navigator.language?.toLowerCase() || '';
  if (code.startsWith('tr')) return 'tr';
  if (code.startsWith('es')) return 'es';
  if (code.startsWith('fr')) return 'fr';
  if (code.startsWith('de')) return 'de';
  if (code.startsWith('it')) return 'it';
  if (code.startsWith('pt')) return 'pt';
  if (code.startsWith('ru')) return 'ru';
  if (code.startsWith('ar')) return 'ar';
  if (code.startsWith('zh')) return 'zh';
  if (code.startsWith('hi')) return 'hi';
  if (code.startsWith('ja')) return 'ja';
  return 'en';
};

export default function App() {
  const [nativeLanguage, setNativeLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('linguist_native_language') as LanguageCode;
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
      return saved;
    }
    return detectBrowserLanguage();
  });

  const handleUpdateLanguage = (lang: LanguageCode) => {
    setNativeLanguage(lang);
    localStorage.setItem('linguist_native_language', lang);
  };

  const [currentTab, setCurrentTab] = useState<string>(() => {
    const oauthInProgress = localStorage.getItem('linguist_oauth_in_progress');
    if (oauthInProgress === 'true') {
      localStorage.removeItem('linguist_oauth_in_progress');
      return localStorage.getItem('linguist_current_tab') || 'library';
    }
    localStorage.removeItem('linguist_current_tab');
    return 'library';
  }); // 'library' | 'vocabulary' | 'profile' | 'quiz'
  const [quizMode, setQuizMode] = useState<'saved' | 'random'>('saved');
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [showPaywallInQuiz, setShowPaywallInQuiz] = useState<boolean>(false);
  const [showGlobalPaywall, setShowGlobalPaywall] = useState<boolean>(false);
  const [activeReadingBook, setActiveReadingBook] = useState<Book | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string>('');
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const lastBackPressRef = useRef<number>(0);
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('linguist_user_email') || null;
  });
  const [unlockedBadgeNotify, setUnlockedBadgeNotify] = useState<{ title: string; message: string } | null>(null);
  const [deviceUuid, setDeviceUuid] = useState<string>(() => {
    return localStorage.getItem('linguist_device_uuid') || '';
  });
  const [loginProvider, setLoginProvider] = useState<string | null>(() => {
    return localStorage.getItem('linguist_login_provider') || null;
  });
  const [linkedProviders, setLinkedProviders] = useState<string[]>(() => {
    const local = localStorage.getItem('linguist_linked_providers');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    const current = localStorage.getItem('linguist_login_provider');
    return current ? [current] : [];
  });
  
  // Cloud database simulation indicator State
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing'>('synced');

  // Time state for mock mobile header
  const [timeStr, setTimeStr] = useState<string>('09:41');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('clear') === '1' || params.get('reset') === '1') {
      localStorage.clear();
      window.location.href = window.location.origin + window.location.pathname;
      return;
    }

    const invite = params.get('invite');
    if (invite) {
      const code = invite.toUpperCase().trim();
      localStorage.setItem('linguist_referred_by', code);
      // Clean query parameter from URL to maintain a clean display
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Dark Mode Toggle State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('linguist_dark_mode');
    if (saved === null) return true;
    return saved === 'true';
  });

  const [showConsent, setShowConsent] = useState<boolean>(() => localStorage.getItem('linguist_tos_accepted_v11') !== 'true');
  const [consentChecked, setConsentChecked] = useState<boolean>(false);
  const [showForceUpdate, setShowForceUpdate] = useState<boolean>(false);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const nextVal = !prev;
      localStorage.setItem('linguist_dark_mode', String(nextVal));
      return nextVal;
    });
  };

  // User customize name & avatar persistence states
  const [userName, setUserName] = useState<string>(() => {
    const uuid = getOrInitializeDeviceUuid();
    const local = migrateLegacyNamespace('linguist_user_name', uuid);
    if (local) return local;
    return localStorage.getItem('linguist_user_name') || '';
  });

  const [userAvatar, setUserAvatar] = useState<string>(() => {
    const uuid = getOrInitializeDeviceUuid();
    const local = migrateLegacyNamespace('linguist_user_avatar', uuid);
    if (local) return local;
    return localStorage.getItem('linguist_user_avatar') || AVATAR_OPTIONS[0];
  });

  const handleUpdateProfile = (name: string, avatar: string) => {
    setUserName(name);
    setUserAvatar(avatar);
    const ns = deviceUuid || 'guest';
    localStorage.setItem(`linguist_user_name_${ns}`, name);
    localStorage.setItem(`linguist_user_avatar_${ns}`, avatar);
    triggerCloudSync();
  };

  // Persistence State Managers (Initialized from LocalStorage or Data.ts fallback templates)
  const [books, setBooks] = useState<Book[]>(() => {
    const uuid = getOrInitializeDeviceUuid();
    let local = migrateLegacyNamespace('linguist_books_v11', uuid);
    if (!local) {
      local = localStorage.getItem('linguist_books_v11') || '';
    }
    let parsedBooks: Book[] = [];
    if (local) {
      try {
        parsedBooks = JSON.parse(local);
      } catch (e) {
        parsedBooks = [];
      }
    }
    
    // Ensure all parsed books have necessary fields
    const sanitizedParsed = Array.isArray(parsedBooks) ? parsedBooks.map(b => ({
      ...b,
      percentageCompleted: typeof b.percentageCompleted === 'number' ? b.percentageCompleted : 0,
      currentPage: typeof b.currentPage === 'number' ? b.currentPage : 0,
      pagesLeft: typeof b.pagesLeft === 'number' ? b.pagesLeft : (b.totalPages || 0),
      totalPages: typeof b.totalPages === 'number' ? b.totalPages : 0,
      isCompleted: !!b.isCompleted,
      isFavorited: !!b.isFavorited,
      isStarted: !!b.isStarted
    })) : [];
    
    const merged: Book[] = [...sanitizedParsed];
    INITIAL_BOOKS.forEach(initBook => {
      const existingIdx = merged.findIndex(b => b.id === initBook.id);
      if (existingIdx === -1) {
        merged.push(initBook);
      } else {
        // Keep user progress but update static content structures
        merged[existingIdx] = {
          ...initBook,
          percentageCompleted: merged[existingIdx].percentageCompleted ?? 0,
          currentPage: merged[existingIdx].currentPage ?? 0,
          pagesLeft: merged[existingIdx].pagesLeft ?? initBook.totalPages,
          isCompleted: !!merged[existingIdx].isCompleted,
          isFavorited: !!merged[existingIdx].isFavorited,
          isStarted: !!merged[existingIdx].isStarted
        };
      }
    });
    return merged.filter(b => 
      INITIAL_BOOKS.some(init => init.id === b.id) || 
      (b.title && b.level && b.chapters && b.chapters.length > 0)
    );
  });

  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>(() => {
    const uuid = getOrInitializeDeviceUuid();
    let local = migrateLegacyNamespace('linguist_vocabulary_v11', uuid);
    if (!local) {
      local = localStorage.getItem('linguist_vocabulary_v11') || '';
    }
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return healVocabulary(Array.isArray(parsed) ? parsed : INITIAL_VOCABULARY);
      } catch (e) {
        return healVocabulary(INITIAL_VOCABULARY);
      }
    }
    return healVocabulary(INITIAL_VOCABULARY);
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const uuid = getOrInitializeDeviceUuid();
    let local = migrateLegacyNamespace('linguist_badges_v11', uuid);
    if (!local) {
      local = localStorage.getItem('linguist_badges_v11') || '';
    }
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return INITIAL_BADGES.map(initBadge => {
            const match = parsed.find((b: Badge) => b.id === initBadge.id);
            return match ? { ...initBadge, unlocked: !!match.unlocked, unlockedAt: match.unlockedAt } : initBadge;
          });
        }
      } catch (e) {
        // Fallback below
      }
    }
    return INITIAL_BADGES;
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const uuid = getOrInitializeDeviceUuid();
    let local = migrateLegacyNamespace('linguist_stats_v11', uuid);
    if (!local) {
      local = localStorage.getItem('linguist_stats_v11') || '';
    }
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_STATS,
            ...parsed,
            weeklyWords: Array.isArray(parsed.weeklyWords) && parsed.weeklyWords.length === 7 
              ? parsed.weeklyWords.map(Number) 
              : [...DEFAULT_STATS.weeklyWords],
            weeklyMins: Array.isArray(parsed.weeklyMins) && parsed.weeklyMins.length === 7 
              ? parsed.weeklyMins.map(Number) 
              : [...DEFAULT_STATS.weeklyMins]
          };
        }
      } catch (err) {
        // Fallback below
      }
    }

    return {
      ...DEFAULT_STATS,
      dailyStreak: 1,
      lastActiveDate: getLocalDateString()
    };
  });

  const [lastActiveBookId, setLastActiveBookId] = useState<string | null>(() => {
    const uuid = getOrInitializeDeviceUuid();
    let local = migrateLegacyNamespace('linguist_last_active_book_id', uuid);
    if (!local) {
      local = localStorage.getItem('linguist_last_active_book_id') || '';
    }
    return local || null;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refillCountdown, setRefillCountdown] = useState<string>('');
  const [focusedCategory, setFocusedCategory] = useState<string | null>(null);

  // Dynamic reset effect: ensures all statistics of old visitors are strictly cleared and reset to 0
  useEffect(() => {
    const isResetDone = localStorage.getItem('linguist_reset_stats_to_zero_v11');
    if (!isResetDone) {
      const zeroedStats: UserStats = {
        learnedWordsCount: 0,
        completedBooksCount: 0,
        dailyStreak: 1, // initialize to 1 on first active day
        totalTimeMinutes: 0,
        readingGoalPercent: 0,
        wordGoalPercent: 0,
        timeGoalPercent: 0,
        hearts: 5,
        isPremium: false,
        weeklyWords: [0, 0, 0, 0, 0, 0, 0],
        weeklyMins: [0, 0, 0, 0, 0, 0, 0],
        lastActiveDate: getLocalDateString(), // initialize to today
        synonymGamesCompletedCount: 0,
        fillBlankGamesCompletedCount: 0
      };
      
      const zeroedBooks = INITIAL_BOOKS.map(b => ({
        ...b,
        percentageCompleted: 0,
        currentPage: 0,
        pagesLeft: b.totalPages
      }));

      const zeroedBadges = INITIAL_BADGES.map(b => ({
        ...b,
        unlocked: false,
        unlockedAt: undefined
      }));

      const uuid = getOrInitializeDeviceUuid();
      localStorage.setItem('linguist_stats_v11', JSON.stringify(zeroedStats));
      localStorage.setItem('linguist_books_v11', JSON.stringify(stripBooksForSync(zeroedBooks)));
      localStorage.setItem('linguist_vocabulary_v11', JSON.stringify([]));
      localStorage.setItem('linguist_badges_v11', JSON.stringify(zeroedBadges));
      localStorage.setItem('linguist_reset_stats_to_zero_v11', 'true');
      localStorage.setItem('linguist_last_active_book_id', '');

      if (uuid) {
        localStorage.setItem(`linguist_stats_v11_${uuid}`, JSON.stringify(zeroedStats));
        localStorage.setItem(`linguist_books_v11_${uuid}`, JSON.stringify(stripBooksForSync(zeroedBooks)));
        localStorage.setItem(`linguist_vocabulary_v11_${uuid}`, JSON.stringify([]));
        localStorage.setItem(`linguist_badges_v11_${uuid}`, JSON.stringify(zeroedBadges));
        localStorage.setItem(`linguist_last_active_book_id_${uuid}`, '');
      }

      setStats(zeroedStats);
      setLastActiveBookId(null);
      setBooks(zeroedBooks);
      setVocabulary([]);
      setBadges(zeroedBadges);
    }
  }, []);

  const loadUserData = (uuid: string) => {
    if (!uuid) return;
    
    // 1. Stats
    let statsLocal = localStorage.getItem(`linguist_stats_v11_${uuid}`);
    if (statsLocal) {
      try {
        const loadedStats = JSON.parse(statsLocal);
        if (loadedStats && typeof loadedStats === 'object') {
          setStats(prev => ({
            ...DEFAULT_STATS,
            ...prev,
            ...loadedStats
          }));
        }
      } catch (e) {}
    }

    // 2. Books
    let booksLocal = localStorage.getItem(`linguist_books_v11_${uuid}`);
    let parsedBooks: Book[] = [];
    if (booksLocal) {
      try {
        parsedBooks = JSON.parse(booksLocal);
      } catch (e) {}
    }
    const sanitizedParsed = Array.isArray(parsedBooks) ? parsedBooks.map(b => ({
      ...b,
      percentageCompleted: typeof b.percentageCompleted === 'number' ? b.percentageCompleted : 0,
      currentPage: typeof b.currentPage === 'number' ? b.currentPage : 0,
      pagesLeft: typeof b.pagesLeft === 'number' ? b.pagesLeft : (b.totalPages || 0),
      totalPages: typeof b.totalPages === 'number' ? b.totalPages : 0,
      isCompleted: !!b.isCompleted,
      isFavorited: !!b.isFavorited,
      isStarted: !!b.isStarted
    })) : [];
    
    const merged: Book[] = [...sanitizedParsed];
    INITIAL_BOOKS.forEach(initBook => {
      const existingIdx = merged.findIndex(b => b.id === initBook.id);
      if (existingIdx === -1) {
        merged.push(initBook);
      } else {
        merged[existingIdx] = {
          ...initBook,
          percentageCompleted: merged[existingIdx].percentageCompleted ?? 0,
          currentPage: merged[existingIdx].currentPage ?? 0,
          pagesLeft: merged[existingIdx].pagesLeft ?? initBook.totalPages,
          isCompleted: !!merged[existingIdx].isCompleted,
          isFavorited: !!merged[existingIdx].isFavorited,
          isStarted: !!merged[existingIdx].isStarted
        };
      }
    });
    const filteredMerged = merged.filter(b => 
      INITIAL_BOOKS.some(init => init.id === b.id) || 
      (b.title && b.level && b.chapters && b.chapters.length > 0)
    );
    setBooks(filteredMerged);

    // 3. Vocabulary
    let vocabLocal = localStorage.getItem(`linguist_vocabulary_v11_${uuid}`);
    let loadedVocab = INITIAL_VOCABULARY;
    if (vocabLocal) {
      try {
        const parsed = JSON.parse(vocabLocal);
        if (Array.isArray(parsed)) loadedVocab = parsed;
      } catch (e) {}
    }
    setVocabulary(healVocabulary(loadedVocab));

    // 4. Badges
    let badgesLocal = localStorage.getItem(`linguist_badges_v11_${uuid}`);
    let loadedBadges = INITIAL_BADGES;
    if (badgesLocal) {
      try {
        const parsed = JSON.parse(badgesLocal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedBadges = INITIAL_BADGES.map(ib => {
            const match = parsed.find((p: any) => p.id === ib.id);
            return match ? { ...ib, unlocked: !!match.unlocked, unlockedAt: match.unlockedAt } : ib;
          });
        }
      } catch (e) {}
    }
    setBadges(loadedBadges.map(b => ({
      ...b,
      unlocked: !!b.unlocked
    })));

    // 5. User Name & Avatar
    let nameLocal = localStorage.getItem(`linguist_user_name_${uuid}`);
    setUserName(nameLocal || '');

    let avatarLocal = localStorage.getItem(`linguist_user_avatar_${uuid}`);
    setUserAvatar(avatarLocal || AVATAR_OPTIONS[0]);

    // 6. Last Active Book ID
    let activeBookLocal = localStorage.getItem(`linguist_last_active_book_id_${uuid}`);
    setLastActiveBookId(activeBookLocal || null);
  };

  const isFirstMount = useRef(true);
  const mainScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    scrollToTop();
  }, [currentTab, focusedCategory]);

  useEffect(() => {
    if (deviceUuid) {
      loadUserData(deviceUuid);
    }
  }, [deviceUuid]);

  // Automatically save to local persistence whenever states modify
  useEffect(() => {
    if (!deviceUuid) return;
    localStorage.setItem(`linguist_books_v11_${deviceUuid}`, JSON.stringify(stripBooksForSync(books)));
  }, [books, deviceUuid]);

  useEffect(() => {
    if (!deviceUuid) return;
    localStorage.setItem(`linguist_vocabulary_v11_${deviceUuid}`, JSON.stringify(vocabulary));
  }, [vocabulary, deviceUuid]);

  useEffect(() => {
    if (!deviceUuid) return;
    localStorage.setItem(`linguist_badges_v11_${deviceUuid}`, JSON.stringify(badges));
  }, [badges, deviceUuid]);

  useEffect(() => {
    if (!deviceUuid) return;
    localStorage.setItem(`linguist_stats_v11_${deviceUuid}`, JSON.stringify(stats));
  }, [stats, deviceUuid]);

  useEffect(() => {
    if (!deviceUuid) return;
    localStorage.setItem(`linguist_user_name_${deviceUuid}`, userName);
  }, [userName, deviceUuid]);

  useEffect(() => {
    if (!deviceUuid) return;
    localStorage.setItem(`linguist_user_avatar_${deviceUuid}`, userAvatar);
  }, [userAvatar, deviceUuid]);

  useEffect(() => {
    if (!deviceUuid) return;
    if (lastActiveBookId) {
      localStorage.setItem(`linguist_last_active_book_id_${deviceUuid}`, lastActiveBookId);
    } else {
      localStorage.removeItem(`linguist_last_active_book_id_${deviceUuid}`);
    }
  }, [lastActiveBookId, deviceUuid]);

  // Show splash screen for 3 seconds on app startup
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Synchronize stats.learnedWordsCount to vocabulary.length on mount and when vocabulary changes
  useEffect(() => {
    if (stats && vocabulary) {
      if (stats.learnedWordsCount !== vocabulary.length) {
        setStats(prev => ({
          ...prev,
          learnedWordsCount: vocabulary.length,
          wordGoalPercent: Math.min(Math.round((vocabulary.length / LIBRARY_UNIQUE_WORDS_COUNT) * 100), 100)
        }));
      }
    }
  }, [vocabulary.length]);

  const activeReadingBookRef = useRef(activeReadingBook);
  const currentTabRef = useRef(currentTab);
  const showExitConfirmRef = useRef(showExitConfirm);
  const focusedCategoryRef = useRef(focusedCategory);
  const readingViewBackRef = useRef<(() => boolean) | null>(null);

  useEffect(() => {
    activeReadingBookRef.current = activeReadingBook;
  }, [activeReadingBook]);

  useEffect(() => {
    currentTabRef.current = currentTab;
    localStorage.setItem('linguist_current_tab', currentTab);
  }, [currentTab]);

  useEffect(() => {
    showExitConfirmRef.current = showExitConfirm;
  }, [showExitConfirm]);

  useEffect(() => {
    focusedCategoryRef.current = focusedCategory;
  }, [focusedCategory]);

  const statsRef = useRef(stats);
  const booksRef = useRef(books);
  const vocabularyRef = useRef(vocabulary);
  const badgesRef = useRef(badges);
  const deviceUuidRef = useRef(deviceUuid);
  const userNameRef = useRef(userName);
  const userAvatarRef = useRef(userAvatar);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    booksRef.current = books;
  }, [books]);

  useEffect(() => {
    vocabularyRef.current = vocabulary;
  }, [vocabulary]);

  useEffect(() => {
    badgesRef.current = badges;
  }, [badges]);

  useEffect(() => {
    deviceUuidRef.current = deviceUuid;
  }, [deviceUuid]);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    userAvatarRef.current = userAvatar;
  }, [userAvatar]);

  // Android hardware back button handler (Single registration, ref-based to avoid leaks)
  useEffect(() => {
    const handleBackButton = () => {
      // 1. If exit confirm dialog is open → close it
      if (showExitConfirmRef.current) {
        setShowExitConfirm(false);
        return;
      }

      // 1.5 If reading a book, check if ReadingView wants to handle the back button (e.g. close modals)
      if (activeReadingBookRef.current && readingViewBackRef.current) {
        const handled = readingViewBackRef.current();
        if (handled) return;
      }

      // 2. If reading a book → go back to library
      if (activeReadingBookRef.current) {
        setActiveReadingBook(null);
        setSearchQuery('');
        return;
      }

      // 2.5 If inside a focused category → close the category view (go back to main library)
      if (focusedCategoryRef.current) {
        setFocusedCategory(null);
        return;
      }

      // 3. If on a non-library tab → go to library tab
      if (currentTabRef.current !== 'library') {
        setCurrentTab('library');
        return;
      }

      // 4. On main screen (library) → double-back to exit
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        // Second press within 2 seconds → show confirm dialog
        setShowExitConfirm(true);
      } else {
        lastBackPressRef.current = now;
      }
    };

    const listenerPromise = CapacitorApp.addListener('backButton', handleBackButton);

    return () => {
      listenerPromise.then(handle => {
        handle.remove();
      });
    };
  }, []);

  // Initialize Device UUID and perform Auto-Login on startup
  useEffect(() => {
    const initDeviceAndAutoLogin = async () => {
      let uuid = localStorage.getItem('linguist_device_uuid') || '';
      
      if (!uuid) {
        if (Capacitor.isNativePlatform()) {
          try {
            const info = await Device.getId();
            uuid = info.identifier;
          } catch (e) {
            console.error('Failed to get Native Device ID:', e);
          }
        }
        if (!uuid) {
          uuid = 'web-' + Math.random().toString(36).substring(2, 15) + '-' + Math.random().toString(36).substring(2, 15);
        }
        localStorage.setItem('linguist_device_uuid', uuid);
      }
      
      setDeviceUuid(uuid);

      // Schedule daily reminder on startup
      scheduleDailyReminder();

      // Check for mandatory updates on startup
      try {
        const configRes = await fetch(`${getApiBase()}/api/config`);
        if (configRes.ok) {
          const configData = await configRes.json();
          const minVersionCode = configData.minVersionCode;
          
          if (minVersionCode && Capacitor.isNativePlatform()) {
            try {
              const appInfo = await CapacitorApp.getInfo();
              const currentBuildNum = parseInt(appInfo.build, 10);
              if (currentBuildNum < minVersionCode) {
                console.log(`Force update required! Device version code: ${currentBuildNum}, Min required: ${minVersionCode}`);
                setShowForceUpdate(true);
                return; // Stop initialization
              }
            } catch (e) {
              console.error('Failed to get App info for update check:', e);
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch config for update check:', e);
      }

      // Perform auto-login if the user is not logged in yet
      const currentEmail = localStorage.getItem('linguist_user_email') || userEmail;
      if (!currentEmail && uuid) {
        console.log('Attempting device auto-login with UUID:', uuid);
        setSyncStatus('syncing');
        try {
          const res = await fetch(`${getApiBase()}/api/auto-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ deviceUuid: uuid })
          });
          
          if (res.ok) {
            const result = await res.json();
            if (result.success && result.token) {
              console.log('Auto-login successful for user:', result.username);
              handleGoogleLogin(result.email, result.username, result.data?.userAvatar || undefined, 'device', result.token);
            }
          } else {
            console.warn('Auto-login endpoint returned error status:', res.status);
            setSyncStatus('synced');
          }
        } catch (err) {
          console.error('Error during auto-login:', err);
          setSyncStatus('synced');
        }
      }
    };

    initDeviceAndAutoLogin();
  }, []);

  // Debounced cloud synchronization whenever user data changes and logged in
  useEffect(() => {
    if (!userEmail) return;

    setSyncStatus('syncing');
    const delayDebounce = setTimeout(() => {
      const payload = {
        email: userEmail,
        data: {
          stats,
          books: stripBooksForSync(books),
          vocabulary,
          badges,
          userAvatar,
          loginProvider,
          linkedProviders
        }
      };

      const syncToken = localStorage.getItem('linguist_session_token_' + userEmail.toLowerCase().trim());

      fetch(`${getApiBase()}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(syncToken ? { 'Authorization': `Bearer ${syncToken}` } : {})
        },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(() => {
        setSyncStatus('synced');
      })
      .catch(err => {
        console.error('Auto cloud sync failed:', err);
        setSyncStatus('synced');
      });
    }, 1500); // 1.5 seconds debounce

    return () => clearTimeout(delayDebounce);
  }, [userEmail, stats, books, vocabulary, badges, userAvatar, loginProvider, linkedProviders]);

  // Daily Streak and Weekly Progress check useEffect
  useEffect(() => {
    const isResetDone = localStorage.getItem('linguist_reset_stats_to_zero_v11');
    if (!isResetDone) return; 

    setStats(prev => {
      const todayStr = getLocalDateString();
      const current = prev || DEFAULT_STATS;
      const lastActive = current.lastActiveDate;

      if (!lastActive) {
        return {
          ...current,
          dailyStreak: 1,
          lastActiveDate: todayStr,
          weeklyWords: [0, 0, 0, 0, 0, 0, 0],
          weeklyMins: [0, 0, 0, 0, 0, 0, 0]
        };
      }

      const diff = getDaysDifference(todayStr, lastActive);
      
      let newWeeklyWords = current.weeklyWords ? [...current.weeklyWords] : [0, 0, 0, 0, 0, 0, 0];
      let newWeeklyMins = current.weeklyMins ? [...current.weeklyMins] : [0, 0, 0, 0, 0, 0, 0];

      if (isDifferentCalendarWeek(todayStr, lastActive) || diff >= 7) {
        // Clear all weekly stats for a new calendar week
        newWeeklyWords = [0, 0, 0, 0, 0, 0, 0];
        newWeeklyMins = [0, 0, 0, 0, 0, 0, 0];
      } else if (diff > 0) {
        // Same week but new day, clear stats for elapsed days since lastActive
        const d1 = new Date(lastActive + 'T00:00:00');
        const day1 = d1.getDay();
        const lastIdx = day1 === 0 ? 6 : day1 - 1;

        const d2 = new Date(todayStr + 'T00:00:00');
        const day2 = d2.getDay();
        const todayIdx = day2 === 0 ? 6 : day2 - 1;

        // Clear all days starting from the day after lastIdx up to todayIdx
        let tempIdx = lastIdx;
        while (tempIdx !== todayIdx) {
          tempIdx = (tempIdx + 1) % 7;
          newWeeklyWords[tempIdx] = 0;
          newWeeklyMins[tempIdx] = 0;
        }
      }

      if (diff === 1) {
        return {
          ...current,
          dailyStreak: (current.dailyStreak || 0) + 1,
          lastActiveDate: todayStr,
          weeklyWords: newWeeklyWords,
          weeklyMins: newWeeklyMins,
          dailyQuizzesSolvedCount: 0,
          dailyQuizzesScoreSum: 0,
          dailyQuizzesQuestionsSum: 0
        };
      } else if (diff > 1) {
        return {
          ...current,
          dailyStreak: 1,
          lastActiveDate: todayStr,
          weeklyWords: newWeeklyWords,
          weeklyMins: newWeeklyMins,
          dailyQuizzesSolvedCount: 0,
          dailyQuizzesScoreSum: 0,
          dailyQuizzesQuestionsSum: 0
        };
      } else if (diff < 0) {
        // Clock skew / timezone difference, update active date but keep streak
        return {
          ...current,
          lastActiveDate: todayStr,
          dailyStreak: Math.max(1, current.dailyStreak || 0)
        };
      }
      return {
        ...current,
        dailyStreak: Math.max(1, current.dailyStreak || 0),
        weeklyWords: newWeeklyWords,
        weeklyMins: newWeeklyMins
      }; // diff === 0, no changes needed
    });
  }, []);

  // Automatic achievement badge unlocking observer
  useEffect(() => {
    if (!stats) return;
    const checkAndUnlock = (id: string, condition: boolean) => {
      if (condition) {
        const badge = badges.find(b => b.id === id);
        if (badge && !badge.unlocked) {
          unlockBadge(id);
        }
      }
    };

    // b1: Kitap Kurdu (En az 5 farklı İngilizce hikaye oku)
    checkAndUnlock('b1', (stats.completedBooksCount || 0) >= 5);
    // b2: Azimli Sebat (Günlük hedefini üst üste 15 gün tamamla)
    checkAndUnlock('b2', (stats.dailyStreak || 0) >= 15);
    // b3: Kelime Avcısı (Kelime haznesine 100 yeni kelime kaydet)
    checkAndUnlock('b3', vocabulary.length >= 100);
    // b6: İlk Adım (İlk hikayeni başarıyla tamamla)
    checkAndUnlock('b6', (stats.completedBooksCount || 0) >= 1);
    // b7: Kelime Meraklısı (Kelime haznesine 20 yeni kelime kaydet)
    checkAndUnlock('b7', vocabulary.length >= 20);
    // b8: Zaman Bükücü (Toplam 100 dakika okuma süresine ulaş)
    checkAndUnlock('b8', (stats.totalTimeMinutes || 0) >= 100);
    // b9: Kütüphaneci (En az 10 farklı hikayeye başla)
    checkAndUnlock('b9', books.filter(b => b.isStarted).length >= 10);
    // b10: Bilge Gezgin (C1 seviyesinde en az bir hikaye bitir)
    checkAndUnlock('b10', books.some(b => b.level === 'C1' && b.isCompleted));
    // b11: Okumaya Alışmak (Toplam 10 dakika okuma süresine ulaş)
    checkAndUnlock('b11', (stats.totalTimeMinutes || 0) >= 10);
    // b12: Kelime Koleksiyoneri (Kelime haznesine 50 yeni kelime kaydet)
    checkAndUnlock('b12', vocabulary.length >= 50);
    // b13: Dil Kaşifi (3 farklı zorluk seviyesinden hikayeler bitir)
    const completedLevels = new Set(books.filter(b => b.isCompleted).map(b => b.level));
    checkAndUnlock('b13', completedLevels.size >= 3);
    // b14: Çelik İrade (Günlük hedefini üst üste 5 gün tamamla)
    checkAndUnlock('b14', (stats.dailyStreak || 0) >= 5);
    // b15: Efsanevi Okur (Toplam 500 dakika okuma süresine ulaş)
    checkAndUnlock('b15', (stats.totalTimeMinutes || 0) >= 500);
    // b5: Premium Üye — retroactively unlock if user already has premium
    checkAndUnlock('b5', !!stats.isPremium);
    // b16: Eşleme Çırağı (İlk eş bulma oyununu başarıyla tamamla)
    checkAndUnlock('b16', (stats.synonymGamesCompletedCount || 0) >= 1);
    // b17: Eşleme Ustası (5 kez eş bulma oyununu başarıyla tamamla)
    checkAndUnlock('b17', (stats.synonymGamesCompletedCount || 0) >= 5);
    // b18: Kelime Dedektifi (İlk boşluk doldurma oyununu başarıyla tamamla)
    checkAndUnlock('b18', (stats.fillBlankGamesCompletedCount || 0) >= 1);
    // b19: Boşluk Bükücü (5 kez boşluk doldurma oyununu başarıyla tamamla)
    checkAndUnlock('b19', (stats.fillBlankGamesCompletedCount || 0) >= 5);
  }, [stats?.completedBooksCount, stats?.dailyStreak, stats?.totalTimeMinutes, stats?.isPremium, stats?.synonymGamesCompletedCount, stats?.fillBlankGamesCompletedCount, vocabulary.length, books, badges]);

  // Heart regeneration mechanism: 1 heart every 1 hour (3600000 ms), capped at 5
  useEffect(() => {
    const checkAndRefillHearts = () => {
      if (stats.isPremium) return;
      const ns = deviceUuid || 'guest';
      if (stats.hearts >= 5) {
        localStorage.setItem(`linguist_last_heart_refill_${ns}`, String(Date.now()));
        return;
      }

      const now = Date.now();
      let lastRefillStr = localStorage.getItem(`linguist_last_heart_refill_${ns}`);
      if (!lastRefillStr && ns === 'guest') {
        lastRefillStr = localStorage.getItem('linguist_last_heart_refill');
      }
      if (!lastRefillStr) {
        lastRefillStr = String(now);
        localStorage.setItem(`linguist_last_heart_refill_${ns}`, lastRefillStr);
      }
      const lastRefill = Number(lastRefillStr);
      const oneHour = 60 * 60 * 1000;
      const elapsedTime = now - lastRefill;

      if (elapsedTime >= oneHour) {
        const heartsToRestore = Math.floor(elapsedTime / oneHour);
        const restoredHearts = Math.min(5, stats.hearts + heartsToRestore);
        const leftover = elapsedTime % oneHour;
        
        // Update refill timestamp to keep consistency
        localStorage.setItem(`linguist_last_heart_refill_${ns}`, String(now - leftover));
        
        setStats(prev => ({
          ...prev,
          hearts: restoredHearts
        }));
      }
    };

    // Run on mount
    checkAndRefillHearts();

    // Run every 10 seconds to check regeneration countdown
    const interval = setInterval(checkAndRefillHearts, 10000);
    return () => clearInterval(interval);
  }, [stats.hearts, stats.isPremium, deviceUuid]);

  // Check premium subscription expiry periodically
  useEffect(() => {
    const checkPremiumExpiry = () => {
      if (stats.isPremium && stats.premiumExpiryDate) {
        const expiryTime = new Date(stats.premiumExpiryDate).getTime();
        if (Date.now() > expiryTime) {
          setStats(prev => ({
            ...prev,
            isPremium: false,
            premiumExpiryDate: null,
            premiumType: null,
            hearts: 5
          }));
          alert(t('alert_premium_expired', nativeLanguage));
          triggerCloudSync();
        }
      }
    };
    
    checkPremiumExpiry();
    const interval = setInterval(checkPremiumExpiry, 60000); // check every minute
    return () => clearInterval(interval);
  }, [stats.isPremium, stats.premiumExpiryDate]);

  // Heart refill countdown calculation (namespace-aware)
  useEffect(() => {
    if (stats.isPremium || stats.hearts === undefined || stats.hearts === null || Number(stats.hearts) >= 5) {
      setRefillCountdown('');
      return;
    }

    const ns = deviceUuid || 'guest';
    let lastRefillStr = localStorage.getItem(`linguist_last_heart_refill_${ns}`);
    if (!lastRefillStr && ns === 'guest') {
      lastRefillStr = localStorage.getItem('linguist_last_heart_refill');
    }
    if (!lastRefillStr) {
      lastRefillStr = String(Date.now());
      localStorage.setItem(`linguist_last_heart_refill_${ns}`, lastRefillStr);
    }
    const lastRefill = Number(lastRefillStr);

    const updateCountdown = () => {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      const elapsedTime = now - lastRefill;
      const timeRemaining = Math.max(0, oneHour - elapsedTime);

      const minutes = Math.floor(timeRemaining / 60000);
      const seconds = Math.floor((timeRemaining % 60000) / 1000);
      setRefillCountdown(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [stats.hearts, stats.isPremium, deviceUuid]);

  // Schedule or cancel hearts refilled notification based on current state
  useEffect(() => {
    if (stats.isPremium) {
      cancelHeartsNotification();
      return;
    }

    const ns = deviceUuid || 'guest';
    let lastRefillStr = localStorage.getItem(`linguist_last_heart_refill_${ns}`);
    if (!lastRefillStr && ns === 'guest') {
      lastRefillStr = localStorage.getItem('linguist_last_heart_refill');
    }
    const lastRefill = lastRefillStr ? Number(lastRefillStr) : Date.now();
    scheduleHeartsRefilledNotification(stats.hearts, lastRefill);
  }, [stats.hearts, stats.isPremium, deviceUuid]);

  // Auto-close unlocked badge notification after 2 seconds
  useEffect(() => {
    if (unlockedBadgeNotify) {
      const timer = setTimeout(() => {
        setUnlockedBadgeNotify(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [unlockedBadgeNotify]);

  // Check daily goals completion and trigger notifications (once per day per goal)
  useEffect(() => {
    const day = new Date().getDay();
    const dayIndex = day === 0 ? 6 : day - 1;
    const todayStr = new Date().toISOString().split('T')[0];

    const todayMins = stats.weeklyMins ? stats.weeklyMins[dayIndex] || 0 : 0;
    const todayWords = stats.weeklyWords ? stats.weeklyWords[dayIndex] || 0 : 0;
    const solvedQuizzes = stats.dailyQuizzesSolvedCount || 0;
    const scoreSum = stats.dailyQuizzesScoreSum || 0;
    const questionsSum = stats.dailyQuizzesQuestionsSum || 0;

    // 1. Reading Time Goal (20 minutes)
    if (todayMins >= 20) {
      const key = `linguist_goal_notify_time_${todayStr}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, 'true');
        setUnlockedBadgeNotify({
          title: t('daily_goal_completed_title', nativeLanguage),
          message: t('daily_goal_read_desc', nativeLanguage)
        });
      }
    }

    // 2. Word Saving Goal (10 words)
    if (todayWords >= 10) {
      const key = `linguist_goal_notify_word_${todayStr}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, 'true');
        setUnlockedBadgeNotify({
          title: t('daily_goal_completed_title', nativeLanguage),
          message: t('daily_goal_vocab_desc', nativeLanguage)
        });
      }
    }

    // 3. Quiz Success Goal (5 quizzes solved)
    if (solvedQuizzes >= 5) {
      const key = `linguist_goal_notify_quiz_${todayStr}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, 'true');
        const avg = questionsSum > 0 ? Math.round((scoreSum / questionsSum) * 100) : 0;
        setUnlockedBadgeNotify({
          title: t('daily_goal_completed_title', nativeLanguage),
          message: t('daily_goal_quiz_desc', nativeLanguage).replace('{avg}', String(avg))
        });
      }
    }
  }, [stats.weeklyMins, stats.weeklyWords, stats.dailyQuizzesSolvedCount, stats.dailyQuizzesScoreSum, stats.dailyQuizzesQuestionsSum]);

  // Helper to determine the current day index (0 = Monday, 6 = Sunday)
  const getTodayIndex = () => {
    const day = new Date().getDay(); // 0 is Sunday, 1-6 is Mon-Sat
    return day === 0 ? 6 : day - 1;
  };

  const activeReadingSecondsRef = useRef(0);

  // Timer to track active reading time inside stories (Reading Time)
  useEffect(() => {
    const interval = setInterval(() => {
      // Increment only when the page is visible and user is actively reading a story.
      // We check activeReadingBookRef.current to avoid resetting the timer on page transitions or word clicks.
      if (document.visibilityState === 'visible' && activeReadingBookRef.current !== null) {
        activeReadingSecondsRef.current += 1;

        if (activeReadingSecondsRef.current >= 60) {
          activeReadingSecondsRef.current = 0; // Reset seconds accumulator

          setStats(prev => {
            const dayIndex = getTodayIndex();
            const updatedWeeklyMins = [...(prev.weeklyMins || [0, 0, 0, 0, 0, 0, 0])];
            updatedWeeklyMins[dayIndex] = (updatedWeeklyMins[dayIndex] || 0) + 1;

            const nextTotalTime = (prev.totalTimeMinutes || 0) + 1;

            // Target: 20 minutes daily reading goal
            const dailyGoalMins = 20;
            const timePercent = Math.min(Math.round((updatedWeeklyMins[dayIndex] / dailyGoalMins) * 100), 100);

            const nextStats = {
              ...prev,
              totalTimeMinutes: nextTotalTime,
              timeGoalPercent: timePercent,
              weeklyMins: updatedWeeklyMins
            };

            // Sync to the cloud immediately with the correct updated stats payload to avoid race conditions.
            setTimeout(() => {
              triggerCloudSync(nextStats);
            }, 0);

            return nextStats;
          });
        }
      }
    }, 1000); // Check every 1 second
    return () => clearInterval(interval);
  }, []);

  const triggerCloudSync = (
    customStats?: UserStats,
    customBooks?: Book[],
    customVocabulary?: VocabularyWord[],
    customBadges?: Badge[],
    customName?: string,
    customAvatar?: string,
    customLoginProvider?: string | null,
    customLinkedProviders?: string[]
  ) => {
    setSyncStatus('syncing');
    
    const emailToSync = userEmail;
    if (!emailToSync) {
      setTimeout(() => setSyncStatus('synced'), 300);
      return;
    }

    const payload = {
      email: emailToSync,
      data: {
        stats: customStats || stats,
        books: stripBooksForSync(customBooks || books),
        vocabulary: customVocabulary || vocabulary,
        badges: customBadges || badges,
        userAvatar: customAvatar !== undefined ? customAvatar : userAvatar,
        loginProvider: customLoginProvider !== undefined ? customLoginProvider : loginProvider,
        linkedProviders: customLinkedProviders !== undefined ? customLinkedProviders : linkedProviders
      }
    };

    const syncToken = localStorage.getItem('linguist_session_token_' + emailToSync.toLowerCase().trim());

    fetch(`${getApiBase()}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(syncToken ? { 'Authorization': `Bearer ${syncToken}` } : {})
      },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (res.status === 401) {
        handleGoogleLogout();
        throw new Error(t('session_terminated', nativeLanguage));
      }
      return res.json();
    })
    .then(() => {
      setSyncStatus('synced');
    })
    .catch(err => {
      console.error('Failed to sync to cloud:', err);
      setSyncStatus('synced');
    });
  };

  const handleGoogleLogin = (email: string, name?: string, picture?: string, provider = 'google', token?: string) => {
    const finalEmail = email.toLowerCase().trim();
    
    // Check if already logged in - if so, this is a link action
    if (userEmail) {
      setLinkedProviders(prev => {
        if (prev.includes(provider)) return prev;
        const next = [...prev, provider];
        localStorage.setItem('linguist_linked_providers', JSON.stringify(next));
        triggerCloudSync(undefined, undefined, undefined, undefined, undefined, undefined, undefined, next);
        return next;
      });
      return;
    }

    const finalName = name || finalEmail.split('@')[0];
    const finalAvatar = picture || AVATAR_OPTIONS[0];

    const completeLoginWithToken = (activeToken: string) => {
      localStorage.setItem('linguist_session_token_' + finalEmail, activeToken);

      setUserEmail(finalEmail);
      localStorage.setItem('linguist_user_email', finalEmail);

      setLoginProvider(provider);
      localStorage.setItem('linguist_login_provider', provider);

      const initialLinked = [provider];
      setLinkedProviders(initialLinked);
      localStorage.setItem('linguist_linked_providers', JSON.stringify(initialLinked));

      setUserName(finalName);
      localStorage.setItem('linguist_user_name', finalName);

      setUserAvatar(finalAvatar);
      localStorage.setItem('linguist_user_avatar', finalAvatar);

      // Fetch progress from server
      setSyncStatus('syncing');

      fetch(`${getApiBase()}/api/sync?email=${encodeURIComponent(finalEmail)}`, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      })
        .then(res => {
          if (res.status === 401) {
            handleGoogleLogout();
            throw new Error(t('session_terminated', nativeLanguage));
          }
          return res.json();
        })
        .then(resData => {
          setSyncStatus('synced');
          
          let mergedStats = { ...statsRef.current };
          let mergedBooks = [...booksRef.current];
          let mergedVocabulary = [...vocabularyRef.current];
          let mergedBadges = [...badgesRef.current];
          let mergedName = userNameRef.current || finalName;
          let mergedAvatar = userAvatarRef.current && userAvatarRef.current !== AVATAR_OPTIONS[0] ? userAvatarRef.current : finalAvatar;

          if (resData.found && resData.data) {
            const cloud = resData.data;
            
            // 1. Stats
            if (cloud.stats) {
              const cloudStats = { ...cloud.stats };
              const todayStr = getLocalDateString();
              const lastActive = cloudStats.lastActiveDate;

              if (!lastActive) {
                cloudStats.dailyStreak = 1;
                cloudStats.lastActiveDate = todayStr;
              } else {
                const diff = getDaysDifference(todayStr, lastActive);
                if (diff === 1) {
                  cloudStats.dailyStreak = (cloudStats.dailyStreak || 0) + 1;
                  cloudStats.lastActiveDate = todayStr;
                } else if (diff > 1) {
                  cloudStats.dailyStreak = 1;
                  cloudStats.lastActiveDate = todayStr;
                } else if (diff < 0) {
                  cloudStats.lastActiveDate = todayStr;
                }
              }

              const mergeWeekly = (arr1: number[] = [], arr2: number[] = []): number[] => {
                const mergedArr = [];
                for (let i = 0; i < 7; i++) {
                  mergedArr.push(Math.max(Number(arr1[i] || 0), Number(arr2[i] || 0)));
                }
                return mergedArr;
              };

              let lastActiveDate = statsRef.current.lastActiveDate || cloudStats.lastActiveDate || todayStr;
              if (statsRef.current.lastActiveDate && cloudStats.lastActiveDate) {
                lastActiveDate = new Date(statsRef.current.lastActiveDate).getTime() > new Date(cloudStats.lastActiveDate).getTime()
                  ? statsRef.current.lastActiveDate
                  : cloudStats.lastActiveDate;
              }

              const isPremium = !!(statsRef.current.isPremium || cloudStats.isPremium);
              let premiumExpiryDate = statsRef.current.premiumExpiryDate || cloudStats.premiumExpiryDate;
              if (statsRef.current.premiumExpiryDate && cloudStats.premiumExpiryDate) {
                premiumExpiryDate = new Date(statsRef.current.premiumExpiryDate).getTime() > new Date(cloudStats.premiumExpiryDate).getTime()
                  ? statsRef.current.premiumExpiryDate
                  : cloudStats.premiumExpiryDate;
              }

              const isJustReset = localStorage.getItem('linguist_just_reset_app') === 'true';
              if (isJustReset) {
                localStorage.removeItem('linguist_just_reset_app');
              }

              const isFreshInstall = (statsRef.current.completedBooksCount || 0) === 0 && 
                                     (statsRef.current.totalTimeMinutes || 0) === 0 && 
                                     (statsRef.current.learnedWordsCount || 0) === 0;

              mergedStats = {
                ...DEFAULT_STATS,
                ...cloudStats,
                ...statsRef.current,
                isPremium,
                premiumExpiryDate,
                premiumType: statsRef.current.premiumType || cloudStats.premiumType || null,
                dailyStreak: Math.max(1, isJustReset ? (statsRef.current.dailyStreak || 1) : Math.max(statsRef.current.dailyStreak || 0, cloudStats.dailyStreak || 0)),
                completedBooksCount: isJustReset ? (statsRef.current.completedBooksCount || 0) : Math.max(statsRef.current.completedBooksCount || 0, cloudStats.completedBooksCount || 0),
                totalTimeMinutes: isJustReset ? (statsRef.current.totalTimeMinutes || 0) : Math.max(statsRef.current.totalTimeMinutes || 0, cloudStats.totalTimeMinutes || 0),
                learnedWordsCount: isJustReset ? (statsRef.current.learnedWordsCount || 0) : Math.max(statsRef.current.learnedWordsCount || 0, cloudStats.learnedWordsCount || 0),
                hearts: isPremium ? 5 : (isJustReset ? (statsRef.current.hearts ?? 5) : (isFreshInstall ? (cloudStats.hearts ?? 5) : Math.max(statsRef.current.hearts ?? 5, cloudStats.hearts ?? 5))),
                weeklyWords: isJustReset ? [...statsRef.current.weeklyWords] : mergeWeekly(statsRef.current.weeklyWords, cloudStats.weeklyWords),
                weeklyMins: isJustReset ? [...statsRef.current.weeklyMins] : mergeWeekly(statsRef.current.weeklyMins, cloudStats.weeklyMins),
                lastActiveDate: isJustReset ? statsRef.current.lastActiveDate : lastActiveDate
              };
            }

            // 2. Books
            if (cloud.books) {
              const sanitizedCloudBooks = Array.isArray(cloud.books) ? cloud.books.filter(Boolean).map((b: any) => ({
                ...b,
                percentageCompleted: typeof b.percentageCompleted === 'number' ? b.percentageCompleted : 0,
                currentPage: typeof b.currentPage === 'number' ? b.currentPage : 0,
                pagesLeft: typeof b.pagesLeft === 'number' ? b.pagesLeft : (b.totalPages || 0),
                totalPages: typeof b.totalPages === 'number' ? b.totalPages : 0,
                isCompleted: !!b.isCompleted,
                isFavorited: !!b.isFavorited,
                isStarted: !!b.isStarted
              })) : [];

              const mergedList = [...booksRef.current];
              sanitizedCloudBooks.forEach(cb => {
                const idx = mergedList.findIndex(b => b.id === cb.id);
                if (idx === -1) {
                  mergedList.push(cb);
                } else {
                  const lb = mergedList[idx];
                  const isCompleted = lb.isCompleted || cb.isCompleted;
                  const isStarted = lb.isStarted || cb.isStarted;
                  const isFavorited = lb.isFavorited || cb.isFavorited;
                  const currentPage = Math.max(lb.currentPage || 0, cb.currentPage || 0);
                  const percentageCompleted = Math.max(lb.percentageCompleted || 0, cb.percentageCompleted || 0);
                  const totalPages = lb.totalPages || cb.totalPages || 0;
                  const pagesLeft = totalPages ? Math.max(0, totalPages - currentPage) : 0;

                  mergedList[idx] = {
                    ...lb,
                    ...cb,
                    isCompleted,
                    isStarted,
                    isFavorited,
                    currentPage,
                    percentageCompleted,
                    totalPages,
                    pagesLeft
                  };
                }
              });
              mergedBooks = mergedList;
            }

            // 3. Vocabulary
            if (cloud.vocabulary && Array.isArray(cloud.vocabulary)) {
              const vocabMap = new Map<string, VocabularyWord>();
              vocabularyRef.current.forEach(w => vocabMap.set(w.word.toLowerCase().trim(), w));
              cloud.vocabulary.forEach(w => {
                if (w && w.word) {
                  const key = w.word.toLowerCase().trim();
                  if (!vocabMap.has(key)) {
                    vocabMap.set(key, w);
                  }
                }
              });
              mergedVocabulary = Array.from(vocabMap.values());
            }

            // 4. Badges
            if (cloud.badges && Array.isArray(cloud.badges)) {
              mergedBadges = INITIAL_BADGES.map(ib => {
                const localMatch = badgesRef.current.find(b => b.id === ib.id);
                const cloudMatch = cloud.badges.find((p: any) => p.id === ib.id);
                const unlocked = !!(localMatch?.unlocked || cloudMatch?.unlocked);
                const unlockedAt = localMatch?.unlockedAt || cloudMatch?.unlockedAt;
                return { ...ib, unlocked, unlockedAt };
              });
            }

            // 5. Avatar only (userName is local-only, not synced)
            // mergedName stays as the locally stored name
            if (cloud.userAvatar) {
              mergedAvatar = cloud.userAvatar;
            }
          }

          // Force stats.learnedWordsCount sync with vocabulary.length
          mergedVocabulary = healVocabulary(mergedVocabulary);
          mergedStats.learnedWordsCount = mergedVocabulary.length;
          mergedStats.wordGoalPercent = Math.min(Math.round((mergedVocabulary.length / LIBRARY_UNIQUE_WORDS_COUNT) * 100), 100);

          // Save merged data in state
          setStats(mergedStats);
          setBooks(mergedBooks);
          setVocabulary(mergedVocabulary);
          setBadges(mergedBadges);
          setUserName(mergedName);
          setUserAvatar(mergedAvatar);

          // Save merged data under deviceUuid namespace in localStorage
          if (deviceUuidRef.current) {
            localStorage.setItem(`linguist_stats_v11_${deviceUuidRef.current}`, JSON.stringify(mergedStats));
            localStorage.setItem(`linguist_books_v11_${deviceUuidRef.current}`, JSON.stringify(stripBooksForSync(mergedBooks)));
            localStorage.setItem(`linguist_vocabulary_v11_${deviceUuidRef.current}`, JSON.stringify(mergedVocabulary));
            localStorage.setItem(`linguist_badges_v11_${deviceUuidRef.current}`, JSON.stringify(mergedBadges));
            localStorage.setItem(`linguist_user_name_${deviceUuidRef.current}`, mergedName);
            localStorage.setItem(`linguist_user_avatar_${deviceUuidRef.current}`, mergedAvatar);
          }

          const activeProvider = provider || localStorage.getItem('linguist_login_provider') || (resData.found && resData.data?.loginProvider);
          if (activeProvider) {
            setLoginProvider(activeProvider);
            localStorage.setItem('linguist_login_provider', activeProvider);
          }
          let mergedLinked = [activeProvider];
          if (resData.found && resData.data?.linkedProviders && Array.isArray(resData.data.linkedProviders)) {
            const unique = new Set([activeProvider, ...resData.data.linkedProviders]);
            mergedLinked = Array.from(unique);
          }
          setLinkedProviders(mergedLinked);
          localStorage.setItem('linguist_linked_providers', JSON.stringify(mergedLinked));

          // Sync merged data back to cloud database immediately
          // Note: userName is NOT synced to server (local-only)
          const payload = {
            email: finalEmail,
            data: {
              stats: mergedStats,
              books: stripBooksForSync(mergedBooks),
              vocabulary: mergedVocabulary,
              badges: mergedBadges,
              userAvatar: mergedAvatar,
              loginProvider: activeProvider,
              linkedProviders: mergedLinked
            }
          };

          fetch(`${getApiBase()}/api/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${activeToken}`
            },
            body: JSON.stringify(payload)
          }).catch(err => console.error('Cloud sync callback error:', err));
        })
        .catch(err => {
          console.error('Error fetching sync data:', err);
          setSyncStatus('synced');
        });
    };

    if (token) {
      completeLoginWithToken(token);
    } else {
      // External sign-in: request a session token from the server
      setSyncStatus('syncing');
      fetch(`${getApiBase()}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: finalEmail,
          provider: provider,
          isExternal: true
        })
      })
        .then(res => {
          if (!res.ok) throw new Error(t('auth_external_failed', nativeLanguage));
          return res.json();
        })
        .then(data => {
          if (data.success && data.token) {
            completeLoginWithToken(data.token);
          } else {
            throw new Error(t('auth_invalid_token', nativeLanguage));
          }
        })
        .catch(err => {
          console.error('External login bridge error:', err);
          setSyncStatus('synced');
          handleGoogleLogout();
        });
    }
  };

  const handleUnlinkProvider = (provider: string) => {
    setLinkedProviders(prev => {
      const next = prev.filter(p => p !== provider);
      localStorage.setItem('linguist_linked_providers', JSON.stringify(next));
      
      let nextPrimary = loginProvider;
      if (loginProvider === provider) {
        nextPrimary = next[0] || null;
        setLoginProvider(nextPrimary);
        if (nextPrimary) {
          localStorage.setItem('linguist_login_provider', nextPrimary);
        } else {
          localStorage.removeItem('linguist_login_provider');
        }
      }
      
      triggerCloudSync(undefined, undefined, undefined, undefined, undefined, undefined, nextPrimary, next);
      return next;
    });
  };

  const handleGoogleLogout = () => {
    const prevEmail = userEmail || localStorage.getItem('linguist_user_email');
    if (prevEmail) {
      localStorage.removeItem('linguist_session_token_' + prevEmail.toLowerCase().trim());
    }

    setUserEmail(null);
    localStorage.removeItem('linguist_user_email');

    setLoginProvider(null);
    localStorage.removeItem('linguist_login_provider');

    setLinkedProviders([]);
    localStorage.removeItem('linguist_linked_providers');
    
    setUserName('');
    setUserAvatar(AVATAR_OPTIONS[0]);
    localStorage.setItem('linguist_user_name', '');
    localStorage.setItem('linguist_user_avatar', AVATAR_OPTIONS[0]);
  };

  const handleDeleteAccount = async () => {
    const emailToDelete = userEmail || 
                          localStorage.getItem('linguist_user_email') || 
                          (deviceUuid ? `device-${deviceUuid.toLowerCase().trim()}` : '');
    if (emailToDelete) {
      const syncToken = localStorage.getItem('linguist_session_token_' + emailToDelete.toLowerCase().trim());
      try {
        await fetch(`${getApiBase()}/api/delete-account`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(syncToken ? { 'Authorization': `Bearer ${syncToken}` } : {})
          },
          body: JSON.stringify({ email: emailToDelete })
        });
      } catch (err) {
        console.error('Failed to delete account on the server:', err);
      }
    }
    
    // 1. Backup critical configuration and stats that shouldn't reset
    const savedUuid = localStorage.getItem('linguist_device_uuid');
    const savedTos = localStorage.getItem('linguist_tos_accepted_v11');
    const savedDarkMode = localStorage.getItem('linguist_dark_mode');
    const savedHearts = stats.hearts !== undefined ? stats.hearts : 5;
    
    // Backup daily limits and caches
    const savedDailyDate = localStorage.getItem('linguist_daily_date');
    const savedWordLookups = localStorage.getItem('linguist_word_lookups_today');
    const savedSentenceTrans = localStorage.getItem('linguist_sentence_trans_today');
    const savedLookedUpWords = localStorage.getItem('linguist_today_looked_up_words');
    const savedTranslatedSentences = localStorage.getItem('linguist_today_translated_sentences');
    
    const ns = deviceUuid || 'guest';
    const savedRefillTime = localStorage.getItem(`linguist_last_heart_refill_${ns}`);
    
    // 2. Clear all localStorage keys
    localStorage.clear();
    
    // 3. Restore backups to prevent exploit and keep key preferences
    if (savedUuid !== null) {
      localStorage.setItem('linguist_device_uuid', savedUuid);
    }
    if (savedTos !== null) {
      localStorage.setItem('linguist_tos_accepted_v11', savedTos);
    }
    if (savedDarkMode !== null) {
      localStorage.setItem('linguist_dark_mode', savedDarkMode);
    }
    
    // Restore daily limits and caches
    if (savedDailyDate !== null) {
      localStorage.setItem('linguist_daily_date', savedDailyDate);
    }
    if (savedWordLookups !== null) {
      localStorage.setItem('linguist_word_lookups_today', savedWordLookups);
    }
    if (savedSentenceTrans !== null) {
      localStorage.setItem('linguist_sentence_trans_today', savedSentenceTrans);
    }
    if (savedLookedUpWords !== null) {
      localStorage.setItem('linguist_today_looked_up_words', savedLookedUpWords);
    }
    if (savedTranslatedSentences !== null) {
      localStorage.setItem('linguist_today_translated_sentences', savedTranslatedSentences);
    }
    
    // Save preserved hearts into fresh initial stats
    const freshStats = {
      ...DEFAULT_STATS,
      hearts: savedHearts,
      lastActiveDate: getLocalDateString()
    };
    
    const activeUuid = savedUuid || 'guest';
    localStorage.setItem(`linguist_stats_v11_${activeUuid}`, JSON.stringify(freshStats));
    localStorage.setItem('linguist_reset_stats_to_zero_v11', 'true');
    localStorage.setItem('linguist_just_reset_app', 'true');
    
    if (savedRefillTime !== null) {
      localStorage.setItem(`linguist_last_heart_refill_${activeUuid}`, savedRefillTime);
    }
    
    // Reload page to start fresh
    window.location.reload();
  };

  // Add customized essay input into fully interactive read-to-translate stories
  const handleAddCustomBook = (
    title: string,
    author: string,
    text: string,
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  ) => {
    // Generate simple sentence tokens from the raw input text
    const rawSentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    
    // Auto translate mockup words dictionary
    const dictHelpers = [
      { en: 'very', tr: 'çok' },
      { en: 'great', tr: 'muazzam' },
      { en: 'book', tr: 'kitap' },
      { en: 'learning', tr: 'öğrenme' },
      { en: 'english', tr: 'İngilizce' },
      { en: 'journey', tr: 'yolculuk' },
      { en: 'student', tr: 'öğrenci' },
      { en: 'happy', tr: 'mutlu' },
      { en: 'world', tr: 'dünya' },
      { en: 'success', tr: 'başarı' }
    ];

    const builtParagraphs = rawSentences.map((sentence, index) => {
      // Split sentence into words and map mock translation helpers
      const wordsArray = sentence.split(' ').map(word => {
        const clean = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
        const matchHelper = dictHelpers.find(h => h.en === clean);
        return {
          en: word,
          tr: matchHelper ? matchHelper.tr : t('custom_word_loaded', nativeLanguage)
        };
      });

      return {
        id: `custom_p_${index}`,
        textEn: sentence + '.',
        textTr: t('custom_sentence_ai_desc', nativeLanguage),
        words: wordsArray
      };
    });

    const newBook: Book = {
      id: `custom_book_${Date.now()}`,
      title,
      author,
      level,
      levelName: `${level} Level Custom`,
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80',
      percentageCompleted: 0,
      pagesLeft: 12,
      totalPages: 12,
      currentPage: 0,
      statsWords: builtParagraphs.length * 15,
      statsTime: '1dk',
      chapters: [
        {
          id: 'ch1',
          title: '',
          paragraphs: builtParagraphs
        }
      ]
    };

    setBooks(prev => [newBook, ...prev]);
    triggerCloudSync();
  };

  const handleSaveWord = (word: string, translation: string, level: string, exampleEn?: string, exampleTr?: string) => {
    const existingIndex = vocabulary.findIndex(w => w.word.toLowerCase() === word.toLowerCase());
    const cleanW = word.toLowerCase().trim();

    // Look up true level in OFFLINE_DICTIONARY if available
    const dictItem = OFFLINE_DICTIONARY[cleanW];
    // Always normalize to clean CEFR code ("B1" not "B1 Seviyesi")
    const rawLevel = dictItem ? dictItem.level : (level || 'A1');
    const resolvedLevel = rawLevel.replace(/\s*seviyesi$/i, '').trim().substring(0, 10) || 'A1';

    if (existingIndex !== -1) {
      const existingWord = vocabulary[existingIndex];
      const isExistingPlaceholder =
        !existingWord.translation ||
        PLACEHOLDER_STRINGS.has(existingWord.translation.trim()) ||
        existingWord.translation.toLowerCase().trim() === cleanW;

      const isNewValid =
        translation &&
        !PLACEHOLDER_STRINGS.has(translation.trim()) &&
        translation.toLowerCase().trim() !== cleanW;

      if (isExistingPlaceholder && isNewValid) {
        const nextVocab = vocabulary.map(w => w.word.toLowerCase() === cleanW ? {
          ...w,
          translation,
          level: resolvedLevel,
          exampleEn: exampleEn || w.exampleEn,
          exampleTr: exampleTr || w.exampleTr,
          notes: 'vocab_saved_from_story_updated',
          lang: nativeLanguage
        } : w);

        setVocabulary(nextVocab);
        
        setTimeout(() => {
          triggerCloudSync(undefined, undefined, nextVocab);
        }, 0);
      }
      return;
    }

    const newWord: VocabularyWord = {
      id: `word_${Date.now()}`,
      word,
      translation,
      level: resolvedLevel,
      notes: 'vocab_saved_from_story',
      savedAt: new Date().toISOString().split('T')[0],
      exampleEn,
      exampleTr,
      lang: nativeLanguage
    };

    const nextVocab = [newWord, ...vocabulary];
    setVocabulary(nextVocab);
    
    let updatedStats: UserStats | undefined;
    setStats(prev => {
      const newLearnedVal = (prev.learnedWordsCount || 0) + 1;
      const targetPercent = Math.min(Math.round((newLearnedVal / LIBRARY_UNIQUE_WORDS_COUNT) * 100), 100);

      const dayIndex = getTodayIndex();
      const updatedWeeklyWords = [...(prev.weeklyWords || [0, 0, 0, 0, 0, 0, 0])];
      updatedWeeklyWords[dayIndex] = (updatedWeeklyWords[dayIndex] || 0) + 1;

      updatedStats = {
        ...prev,
        learnedWordsCount: newLearnedVal,
        wordGoalPercent: targetPercent,
        weeklyWords: updatedWeeklyWords
      };
      return updatedStats;
    });

    setTimeout(() => {
      triggerCloudSync(updatedStats, undefined, nextVocab);
    }, 0);
  };

  const handleUnsaveWord = (wordId: string) => {
    setVocabulary(prev => prev.filter(w => w.id !== wordId));
    setStats(prev => {
      const nextLearnedCount = Math.max(0, (prev.learnedWordsCount || 0) - 1);
      const targetPercent = Math.min(Math.round((nextLearnedCount / LIBRARY_UNIQUE_WORDS_COUNT) * 100), 100);

      const dayIndex = getTodayIndex();
      const updatedWeeklyWords = [...(prev.weeklyWords || [0, 0, 0, 0, 0, 0, 0])];
      updatedWeeklyWords[dayIndex] = Math.max(0, (updatedWeeklyWords[dayIndex] || 0) - 1);

      return {
        ...prev,
        learnedWordsCount: nextLearnedCount,
        wordGoalPercent: targetPercent,
        weeklyWords: updatedWeeklyWords
      };
    });
    triggerCloudSync();
  };

  const handleToggleFavorite = (bookId: string) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, isFavorited: !b.isFavorited } : b));
    setActiveReadingBook(prev => {
      if (prev && prev.id === bookId) {
        return { ...prev, isFavorited: !prev.isFavorited };
      }
      return prev;
    });
    triggerCloudSync();
  };

  const handleFinishBook = (bookId: string) => {
    let wasAlreadyCompleted = false;
    
    setBooks(prev => {
      wasAlreadyCompleted = prev.some(b => b.id === bookId && b.isCompleted);
      if (wasAlreadyCompleted) return prev;
      return prev.map(b => b.id === bookId ? { ...b, isCompleted: true, percentageCompleted: 100 } : b);
    });

    if (wasAlreadyCompleted) return;

    setActiveReadingBook(prev => {
      if (prev && prev.id === bookId) {
        return { ...prev, isCompleted: true, percentageCompleted: 100 };
      }
      return prev;
    });

    setStats(prev => ({
      ...prev,
      completedBooksCount: prev.completedBooksCount + 1
    }));

    triggerCloudSync();
  };

  const handleStartBook = (bookId: string) => {
    let nextBooks: Book[] = [];
    setBooks(prev => {
      nextBooks = prev.map(b => b.id === bookId ? { ...b, isStarted: true } : b);
      return nextBooks;
    });
    setActiveReadingBook(prev => {
      if (prev && prev.id === bookId) {
        return { ...prev, isStarted: true };
      }
      return prev;
    });
    setTimeout(() => {
      triggerCloudSync(undefined, nextBooks);
    }, 0);
  };

  // Remove a book from "currently reading" list and clear local progress
  const handleRemoveFromReading = (bookId: string) => {
    let nextBooks: Book[] = [];
    setBooks(prev => {
      nextBooks = prev.map(b =>
        b.id === bookId ? { ...b, isStarted: false, percentageCompleted: 0, currentPage: 1 } : b
      );
      return nextBooks;
    });
    const ns = deviceUuid || 'guest';
    localStorage.removeItem(`linguist_current_page_${bookId}_${ns}`);
    localStorage.removeItem(`linguist_current_page_${bookId}`);
    
    if (lastActiveBookId === bookId) {
      setLastActiveBookId(null);
      localStorage.removeItem(`linguist_last_active_book_id_${ns}`);
      localStorage.removeItem(`linguist_last_active_book_id`);
    }
    
    setTimeout(() => {
      triggerCloudSync(undefined, nextBooks);
    }, 0);
  };

  // Gamified quizzes answers checks
  const handleAnswerCorrect = () => {
    setStats(prev => {
      return {
        ...prev,
        readingGoalPercent: Math.min(prev.readingGoalPercent + 5, 100)
      };
    });
    triggerCloudSync();
  };

  const handleAnswerIncorrect = () => {
    if (stats.isPremium) return; // infinite lives for premium

    setStats(prev => {
      const nextHearts = Math.max(0, prev.hearts - 1);
      if (prev.hearts === 5 && nextHearts === 4) {
        const ns = deviceUuid || 'guest';
        localStorage.setItem(`linguist_last_heart_refill_${ns}`, String(Date.now()));
      }
      return {
        ...prev,
        hearts: nextHearts
      };
    });
    triggerCloudSync();
  };

  const handleSubscribe = (tier: 'monthly' | 'yearly') => {
    const d = new Date();
    if (tier === 'monthly') {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setFullYear(d.getFullYear() + 1);
    }
    const expiry = d.toISOString();

    setStats(prev => ({
      ...prev,
      isPremium: true,
      premiumExpiryDate: expiry,
      premiumType: tier,
      hearts: 5 // full lives if restored but infinite indicator
    }));

    // Unlock Premium Badge instantly
    unlockBadge('b5');
    triggerCloudSync();
    setCurrentTab('profile');
  };

  // Initialize In-App Purchases (Google Play Billing)
  useEffect(() => {
    initializeBillingStore((tier) => {
      handleSubscribe(tier || 'yearly');
    });
  }, []);

  const unlockBadge = (badgeId: string) => {
    setBadges(prev => {
      let isUnlockedNow = false;
      const nextBadges = prev.map(b => {
        if (b.id === badgeId && !b.unlocked) {
          isUnlockedNow = true;
          return { ...b, unlocked: true, unlockedAt: new Date().toISOString().split('T')[0] };
        }
        return b;
      });

      if (isUnlockedNow) {
        const badge = prev.find(b => b.id === badgeId);
        if (badge) {
          let message = t('badge_unlocked_msg', nativeLanguage).replace('{title}', t(`badge_title_${badgeId}` as any, nativeLanguage));
          if (badgeId === 'b5') {
            message = t('premium_unlocked_msg', nativeLanguage);
          }
          setUnlockedBadgeNotify({
            title: t(`badge_title_${badgeId}` as any, nativeLanguage),
            message: message
          });
        }
      }
      return nextBadges;
    });
  };

  const handleSelectBook = (book: Book) => {
    if (book.isPremium && !stats.isPremium) {
      setShowGlobalPaywall(true);
      return;
    }
    const ns = deviceUuid || 'guest';
    localStorage.setItem(`linguist_last_active_book_id_${ns}`, book.id);
    localStorage.setItem('linguist_last_active_book_id', book.id);
    setLastActiveBookId(book.id);
    
    // Automatically start the book (mark as started) when entering it!
    let nextBooks: Book[] = [];
    setBooks(prev => {
      nextBooks = prev.map(b => b.id === book.id && !b.isCompleted ? { ...b, isStarted: true } : b);
      return nextBooks;
    });
    
    setActiveReadingBook(book.isCompleted ? book : { ...book, isStarted: true });
    
    setTimeout(() => {
      triggerCloudSync(undefined, nextBooks);
    }, 0);
  };

  // Memoized components to prevent redundant rerenders (specifically when the heart countdown ticks every second)
  const memoizedHeader = React.useMemo(() => (
    <Header
      currentTab={currentTab}
      isPremium={stats.isPremium}
      onAvatarClick={() => setCurrentTab('profile')}
      onLogoClick={() => {
        setCurrentTab('library');
        setSearchQuery('');
        setFocusedCategory(null);
      }}
      syncStatus={syncStatus}
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
      userName={userName}
      userAvatar={userAvatar}
      refillCountdown={refillCountdown}
      nativeLanguage={nativeLanguage}
      onUpdateLanguage={handleUpdateLanguage}
    />
  ), [currentTab, stats.isPremium, refillCountdown, syncStatus, isDarkMode, toggleDarkMode, userName, userAvatar, nativeLanguage]);

  const memoizedLibraryTab = React.useMemo(() => (
    <LibraryTab
      books={books}
      onSelectBook={handleSelectBook}
      syncTrigger={triggerCloudSync}
      isDarkMode={isDarkMode}
      onToggleFavorite={handleToggleFavorite}
      totalReadMinutes={stats.totalTimeMinutes}
      lastActiveBookId={lastActiveBookId}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      onRemoveFromReading={handleRemoveFromReading}
      focusedCategory={focusedCategory}
      setFocusedCategory={setFocusedCategory}
      nativeLanguage={nativeLanguage}
      userAvatar={userAvatar}
      userName={userName}
      onUpdateLanguage={handleUpdateLanguage}
      onTabChange={setCurrentTab}
      isPremium={stats.isPremium}
      onGoToPremium={() => setShowGlobalPaywall(true)}
    />
  ), [books, isDarkMode, stats.totalTimeMinutes, stats.isPremium, lastActiveBookId, searchQuery, focusedCategory, handleSelectBook, handleToggleFavorite, handleRemoveFromReading, triggerCloudSync, nativeLanguage, userAvatar, userName, handleUpdateLanguage]);

  const memoizedFavoritesTab = React.useMemo(() => (
    <FavoritesTab
      books={books}
      onSelectBook={handleSelectBook}
      onToggleFavorite={handleToggleFavorite}
      onGoToLibrary={() => setCurrentTab('library')}
      isDarkMode={isDarkMode}
      nativeLanguage={nativeLanguage}
      isPremium={stats.isPremium}
      onGoToPremium={() => setShowGlobalPaywall(true)}
    />
  ), [books, isDarkMode, stats.isPremium, handleSelectBook, handleToggleFavorite, nativeLanguage]);

  const handleCompleteGame = useCallback((gameType: 'synonym' | 'fillblank') => {
    setStats(prev => {
      const current = prev || DEFAULT_STATS;
      if (gameType === 'synonym') {
        const val = (current.synonymGamesCompletedCount || 0) + 1;
        return { ...current, synonymGamesCompletedCount: val };
      } else {
        const val = (current.fillBlankGamesCompletedCount || 0) + 1;
        return { ...current, fillBlankGamesCompletedCount: val };
      }
    });
    setTimeout(() => {
      triggerCloudSync();
    }, 500);
  }, [triggerCloudSync]);

  const memoizedVocabularyTab = React.useMemo(() => (
    <VocabularyTab
      vocabulary={vocabulary}
      books={books}
      onStartQuiz={(mode) => {
        setQuizMode(mode);
        setShowPaywallInQuiz(false);
        setCurrentTab('quiz');
      }}
      onStartRandomQuizWithDifficulty={(difficulty) => {
        setQuizMode('random');
        setQuizDifficulty(difficulty);
        setShowPaywallInQuiz(false);
        setCurrentTab('quiz');
      }}
      onRemoveWord={handleUnsaveWord}
      onSaveWord={handleSaveWord}
      syncTrigger={triggerCloudSync}
      isDarkMode={isDarkMode}
      onCompleteGame={handleCompleteGame}
      nativeLanguage={nativeLanguage}
    />
  ), [vocabulary, books, isDarkMode, handleUnsaveWord, handleSaveWord, triggerCloudSync, handleCompleteGame, nativeLanguage]);

  const memoizedBottomNav = React.useMemo(() => (
    <BottomNav currentTab={currentTab} onTabChange={(tab) => setCurrentTab(tab)} isDarkMode={isDarkMode} nativeLanguage={nativeLanguage} />
  ), [currentTab, isDarkMode, nativeLanguage]);

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0f0f11]' : 'bg-[#FFF5DF]'
    }`}>
      {/* Sleek Device Mockup Container */}
      <div className={`relative w-full min-h-screen md:min-h-0 md:h-[820px] md:max-w-[400px] md:rounded-[48px] md:border-[12px] md:border-[#1E1E22] md:shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:my-6 md:overflow-hidden md:transform md:translate-z-0 flex flex-col transition-colors duration-200 ${
        isDarkMode ? 'bg-[#121214] text-[#E6E6E6] dark' : 'bg-[#FFFBF0] text-[#2D3436]'
      }`}>
        
        {showForceUpdate ? (
          <div className="absolute inset-0 z-[10000] bg-gradient-to-b from-[#0F172A] to-[#1E293B] flex flex-col items-center justify-center p-6 text-center text-white">
            {/* Decorative backgrounds */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-sm flex flex-col items-center">
              {/* Animated Crown/Rocket Header */}
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/20 mb-6 animate-bounce">
                <Crown className="w-10 h-10 text-white fill-white" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-black tracking-tight mb-3">
                Güncelleme Gerekli 🚀
              </h2>

              {/* Description */}
              <p className="text-[#94A3B8] text-sm leading-relaxed mb-8 px-4">
                Sizlere daha iyi bir deneyim sunabilmek için uygulamamızı yeniledik. Devam edebilmek için lütfen Google Play Store'dan son sürümü indirin.
              </p>

              {/* Action Button */}
              <button
                onClick={() => {
                  window.open("market://details?id=com.ingilizceoykum.app", "_system");
                  // Fallback for browser testing or if market protocol fails
                  setTimeout(() => {
                    window.open("https://play.google.com/store/apps/details?id=com.ingilizceoykum.app", "_system");
                  }, 500);
                }}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-base rounded-2xl shadow-lg shadow-amber-500/25 active:scale-98 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Şimdi Güncelle
              </button>
              
              <p className="text-[10px] text-gray-500 mt-6 tracking-wider uppercase font-bold">
                İngilizce Öyküm Sürüm 2.13 (v16)
              </p>
            </div>
          </div>
        ) : showSplash ? (
          <SplashScreen nativeLanguage={nativeLanguage} />
        ) : (
          <>
            {/* Android Exit Confirmation Dialog */}
            {showExitConfirm && (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                onClick={() => setShowExitConfirm(false)}
              >
                <div
                  className={`w-full max-w-xs rounded-2xl shadow-2xl p-6 ${
                    isDarkMode ? 'bg-[#1A1A1E] text-white' : 'bg-white text-gray-800'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-full bg-[#FF6B6B]/15 flex items-center justify-center">
                      <X className="w-6 h-6 text-[#FF6B6B]" />
                    </div>
                    <h3 className="text-base font-bold text-center">{t('exit_app_title', nativeLanguage)}</h3>
                    <p className={`text-sm text-center leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('exit_app_desc', nativeLanguage)}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowExitConfirm(false)}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${
                        isDarkMode
                          ? 'bg-[#2A2A30] text-gray-300 hover:bg-[#343A40]'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t('btn_no', nativeLanguage)}
                    </button>
                    <button
                      onClick={() => CapacitorApp.exitApp()}
                      className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#FF6B6B] text-white hover:bg-[#FF5252] transition-colors"
                    >
                      {t('btn_yes_exit', nativeLanguage)}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mock Status Bar (Desktop-only) */}
            <div className={`hidden md:flex h-8 px-6 items-center justify-between text-[11px] font-bold z-50 select-none shrink-0 ${
              isDarkMode ? 'bg-[#121214] text-gray-400' : 'bg-[#FFFBF0] text-gray-600'
            }`}>
          <span>{timeStr}</span>
          {/* Dynamic Island / Speaker notch */}
          <div className="w-28 h-4.5 bg-[#1E1E22] rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2 border-b border-[#2A2A30]/30" />
          <div className="flex items-center gap-1.5">
            {/* Cellular signal */}
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M2 22h20V2z"/>
            </svg>
            {/* Wifi */}
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 21l-12-18h24z"/>
            </svg>
            {/* Battery */}
            <span className="text-[9px]">100%</span>
            <div className={`w-5.5 h-3 border rounded-xs p-0.5 flex items-center ${
              isDarkMode ? 'border-gray-500' : 'border-gray-600'
            }`}>
              <div className="h-full w-full bg-current rounded-3xs" />
            </div>
          </div>
        </div>

        {/* Scrollable Main Area */}
        <div ref={mainScrollRef} className="flex-1 overflow-y-visible md:overflow-y-auto flex flex-col relative scrollbar-none pb-20">
          
          {!activeReadingBook && memoizedHeader}

          {/* Main Container viewport */}
          <div className="flex-1 flex flex-col">
            {activeReadingBook ? (
              <ReadingView
                book={activeReadingBook}
                backRef={readingViewBackRef}
                nativeLanguage={nativeLanguage}
                onBack={(percentage, currentPage, totalPages) => {
                  if (percentage !== undefined) {
                    setBooks(prev =>
                      prev.map(b =>
                        b.id === activeReadingBook.id
                          ? { 
                              ...b, 
                              percentageCompleted: percentage, 
                              currentPage: currentPage || 1,
                              totalPages: totalPages || 1,
                              pagesLeft: totalPages ? totalPages - (currentPage || 1) : 0,
                              // isStarted is only set by handleStartBook — do NOT change it here
                            }
                          : b
                      )
                    );
                  }
                  setActiveReadingBook(null);
                  setSearchQuery('');
                }}
                savedWords={vocabulary}
                onSaveWord={handleSaveWord}
                onUnsaveWord={handleUnsaveWord}
                syncTrigger={triggerCloudSync}
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                stats={stats}
                setStats={setStats}
                onAnswerIncorrect={handleAnswerIncorrect}
                onGoToPremium={(percentage, currentPage, totalPages) => {
                  if (percentage !== undefined) {
                    setBooks(prev =>
                      prev.map(b =>
                        b.id === activeReadingBook.id
                          ? { 
                              ...b, 
                              percentageCompleted: percentage, 
                              currentPage: currentPage || 1,
                              totalPages: totalPages || 1,
                              pagesLeft: totalPages ? totalPages - (currentPage || 1) : 0,
                            }
                          : b
                      )
                    );
                  }
                  setSearchQuery('');
                  setShowGlobalPaywall(true);
                }}
                onToggleFavorite={handleToggleFavorite}
                onPageChange={(percentage, currentPage, totalPages) => {
                  setBooks(prev =>
                    prev.map(b =>
                      b.id === activeReadingBook.id
                        ? { 
                            ...b, 
                            percentageCompleted: percentage, 
                            currentPage: currentPage || 1,
                            totalPages: totalPages || 1,
                            pagesLeft: totalPages ? totalPages - (currentPage || 1) : 0,
                            // isStarted is only set by handleStartBook — do NOT change it here
                          }
                        : b
                    )
                  );
                  setActiveReadingBook(prev => {
                    if (prev && prev.id === activeReadingBook.id) {
                      return {
                        ...prev,
                        percentageCompleted: percentage,
                        currentPage: currentPage || 1,
                        totalPages: totalPages || 1,
                        pagesLeft: totalPages ? totalPages - (currentPage || 1) : 0,
                      };
                    }
                    return prev;
                  });
                }}
                onFinishBook={handleFinishBook}
                onStartBook={handleStartBook}
                userEmail={userEmail}
                deviceUuid={deviceUuid}
                refillCountdown={refillCountdown}
              />
            ) : (
              <>
                {currentTab === 'library' && memoizedLibraryTab}

                {currentTab === 'favorites' && memoizedFavoritesTab}

                {currentTab === 'vocabulary' && memoizedVocabularyTab}

                {currentTab === 'quiz' && (
                  <QuizView
                    stats={stats}
                    vocabulary={vocabulary}
                    books={books}
                    quizMode={quizMode}
                    initialDifficulty={quizDifficulty}
                    initiallyShowPaywall={showPaywallInQuiz}
                    nativeLanguage={nativeLanguage}
                    onAnswerCorrect={handleAnswerCorrect}
                    onAnswerIncorrect={() => {}} // Vocabulary practice incorrect answers do not decrease hearts
                    onSubscribe={handleSubscribe}
                    onBackToVocabulary={() => setCurrentTab('vocabulary')}
                    onGoToLibrary={() => setCurrentTab('library')}
                    syncTrigger={triggerCloudSync}
                    isDarkMode={isDarkMode}
                    onUnlockBadge={unlockBadge}
                    refillCountdown={refillCountdown}
                    onQuizCompleted={(score, totalQuestions) => {
                      setStats(prev => {
                        const nextSolved = (prev.dailyQuizzesSolvedCount || 0) + 1;
                        const nextScoreSum = (prev.dailyQuizzesScoreSum || 0) + score;
                        const nextQuestionsSum = (prev.dailyQuizzesQuestionsSum || 0) + totalQuestions;
                        return {
                          ...prev,
                          dailyQuizzesSolvedCount: nextSolved,
                          dailyQuizzesScoreSum: nextScoreSum,
                          dailyQuizzesQuestionsSum: nextQuestionsSum
                        };
                      });
                      triggerCloudSync();
                    }}
                  />
                )}

                {currentTab === 'profile' && (
                  <ProfileTab
                    stats={stats}
                    badges={badges}
                    onTriggerPremiumPanel={() => {
                      setShowGlobalPaywall(true);
                    }}
                    syncTrigger={triggerCloudSync}
                    isDarkMode={isDarkMode}
                    userName={userName}
                    userAvatar={userAvatar}
                    onUpdateProfile={handleUpdateProfile}
                    userEmail={userEmail}
                    loginProvider={loginProvider}
                    onAuthSuccess={handleGoogleLogin}
                    onLogout={handleGoogleLogout}
                    onDeleteAccount={handleDeleteAccount}
                    deviceUuid={deviceUuid}
                    vocabulary={vocabulary}
                    refillCountdown={refillCountdown}
                    nativeLanguage={nativeLanguage}
                    onUpdateLanguage={handleUpdateLanguage}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom Layout Navigation triggers */}
        {!activeReadingBook && memoizedBottomNav}
          </>
        )}
      </div>

      {/* Top Banner Notification for Achievement Unlock */}
      <AnimatePresence>
        {unlockedBadgeNotify && (
          <>
            {/* Transparent click catcher to dismiss anywhere instantly */}
            <div 
              className="fixed inset-0 z-[9998] bg-transparent cursor-default" 
              onClick={() => setUnlockedBadgeNotify(null)} 
            />
            {/* Centering wrapper */}
            <div className="absolute top-16 left-0 right-0 z-[9999] flex justify-center pointer-events-none px-4">
              <motion.div
                initial={{ opacity: 0, y: -80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -80 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                onClick={() => setUnlockedBadgeNotify(null)}
                className={`w-full max-w-[340px] pointer-events-auto flex items-center gap-3 p-3.5 rounded-2xl border shadow-2xl cursor-pointer select-none backdrop-blur-md transition-all ${
                  isDarkMode 
                    ? 'bg-[#1E1E22]/95 border-[#2A2A30] text-white shadow-black/50' 
                    : 'bg-white/95 border-[#FFE66D]/80 text-[#2D3436] shadow-gray-400/25'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-500 shrink-0 animate-bounce">
                  <Crown className="w-5.5 h-5.5 fill-amber-500" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider font-headline-lg mb-0.5">
                    {t('congratulations', nativeLanguage)}
                  </h4>
                  <p className="text-xs font-bold leading-normal font-headline-lg">
                    {unlockedBadgeNotify.message}
                  </p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Startup Consent (ToS & Privacy Policy) Agreement Modal */}
      {showConsent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
          <div className={`w-full max-w-md p-6 rounded-2xl border text-center shadow-2xl transition-all ${
            isDarkMode 
              ? 'bg-[#1E1E22]/95 border-[#2A2A30] text-gray-100' 
              : 'bg-white/95 border-[#FFE66D]/80 text-gray-900'
          }`}>
            <div className="w-16 h-16 bg-[#4ECDC4]/20 text-[#4ECDC4] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8" />
            </div>

            {/* Onboarding Native Language Selection */}
            <div className="mb-5 text-left">
              <label className={`block text-[10px] font-extrabold uppercase tracking-widest mb-2 px-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {t('header_select_language', nativeLanguage)}
              </label>
              <select
                value={nativeLanguage}
                onChange={(e) => handleUpdateLanguage(e.target.value as LanguageCode)}
                className={`w-full h-11 px-3 rounded-xl border text-xs font-bold focus:outline-none transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-[#1E1E22] border-[#2A2A30] text-white focus:border-[#FF6B6B]' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-[#FF6B6B]'
                }`}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
            
            <h3 className="text-xl font-bold font-headline mb-2">{t('tos_title', nativeLanguage)}</h3>
            <p className={`text-sm mb-6 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tos_text', nativeLanguage)}
            </p>
            
            <label className="flex items-start gap-3 text-left mb-6 cursor-pointer select-none">
              <input 
                type="checkbox" 
                id="tos-checkbox"
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#4ECDC4] focus:ring-[#4ECDC4] cursor-pointer"
                onChange={(e) => setConsentChecked(e.target.checked)}
              />
              <span className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tos_checkbox', nativeLanguage)}
              </span>
            </label>
            
            <button
              onClick={() => {
                if (consentChecked) {
                  localStorage.setItem('linguist_tos_accepted_v11', 'true');
                  setShowConsent(false);
                }
              }}
              disabled={!consentChecked}
              className={`w-full py-3 rounded-xl font-bold transition-all shadow-sm ${
                consentChecked
                  ? 'bg-[#4ECDC4] text-gray-950 hover:bg-[#3cacb0] cursor-pointer'
                  : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t('tos_btn', nativeLanguage)}
            </button>
          </div>
        </div>
      )}

      {/* Global Premium Paywall Overlay */}
      <AnimatePresence>
        {showGlobalPaywall && (
          <PremiumPaywall
            stats={stats}
            refillCountdown={refillCountdown}
            nativeLanguage={nativeLanguage}
            isDarkMode={isDarkMode}
            onClose={() => setShowGlobalPaywall(false)}
            onSubscribe={handleSubscribe}
            syncTrigger={triggerCloudSync}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
