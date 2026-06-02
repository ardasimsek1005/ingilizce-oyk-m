import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import LibraryTab from './components/LibraryTab';
import ReadingView from './components/ReadingView';
import VocabularyTab from './components/VocabularyTab';
import QuizView from './components/QuizView';
import ProfileTab from './components/ProfileTab';
import FavoritesTab from './components/FavoritesTab';
import SplashScreen from './components/SplashScreen';
import { X, Zap, Crown, Heart, Clock, Award, ChevronRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Book, VocabularyWord, UserStats, Badge, LeaderboardUser } from './types';
import { INITIAL_BOOKS, INITIAL_VOCABULARY, INITIAL_BADGES, LEADERBOARD_DATA, LIBRARY_UNIQUE_WORDS_COUNT } from './data';
import { AVATAR_OPTIONS } from './avatar_assets';

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDaysDifference = (dateStr1: string, dateStr2: string) => {
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
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
  weeklyMins: [0, 0, 0, 0, 0, 0, 0]
};

const stripBooksForSync = (booksList: Book[]) => {
  if (!Array.isArray(booksList)) return [];
  return booksList.map(b => ({
    id: b.id,
    currentPage: b.currentPage ?? 0,
    isStarted: !!b.isStarted,
    isCompleted: !!b.isCompleted,
    isFavorited: !!b.isFavorited,
    percentageCompleted: b.percentageCompleted ?? 0,
    pagesLeft: b.pagesLeft ?? 0
  }));
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('library'); // 'library' | 'vocabulary' | 'profile' | 'quiz'
  const [quizMode, setQuizMode] = useState<'saved' | 'random'>('saved');
  const [showPaywallInQuiz, setShowPaywallInQuiz] = useState<boolean>(false);
  const [activeReadingBook, setActiveReadingBook] = useState<Book | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string>('');
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('linguist_user_email') || null;
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
    return saved === 'true';
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const nextVal = !prev;
      localStorage.setItem('linguist_dark_mode', String(nextVal));
      return nextVal;
    });
  };

  // User customize name & avatar persistence states
  const [userName, setUserName] = useState<string>(() => {
    const email = localStorage.getItem('linguist_user_email');
    const ns = email ? email.toLowerCase().trim() : 'guest';
    const local = localStorage.getItem(`linguist_user_name_${ns}`);
    if (local === null && ns === 'guest') {
      return localStorage.getItem('linguist_user_name') || '';
    }
    return local || '';
  });

  const [userAvatar, setUserAvatar] = useState<string>(() => {
    const email = localStorage.getItem('linguist_user_email');
    const ns = email ? email.toLowerCase().trim() : 'guest';
    const local = localStorage.getItem(`linguist_user_avatar_${ns}`);
    if (local === null && ns === 'guest') {
      return localStorage.getItem('linguist_user_avatar') || AVATAR_OPTIONS[0];
    }
    return local || AVATAR_OPTIONS[0];
  });

  const handleUpdateProfile = (name: string, avatar: string) => {
    setUserName(name);
    setUserAvatar(avatar);
    const ns = userEmail ? userEmail.toLowerCase().trim() : 'guest';
    localStorage.setItem(`linguist_user_name_${ns}`, name);
    localStorage.setItem(`linguist_user_avatar_${ns}`, avatar);
    triggerCloudSync();
  };

  // Persistence State Managers (Initialized from LocalStorage or Data.ts fallback templates)
  const [books, setBooks] = useState<Book[]>(() => {
    const email = localStorage.getItem('linguist_user_email');
    const ns = email ? email.toLowerCase().trim() : 'guest';
    let local = localStorage.getItem(`linguist_books_v11_${ns}`);
    if (!local && ns === 'guest') {
      local = localStorage.getItem('linguist_books_v11');
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
    return merged;
  });

  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>(() => {
    const email = localStorage.getItem('linguist_user_email');
    const ns = email ? email.toLowerCase().trim() : 'guest';
    let local = localStorage.getItem(`linguist_vocabulary_v11_${ns}`);
    if (!local && ns === 'guest') {
      local = localStorage.getItem('linguist_vocabulary_v11');
    }
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return Array.isArray(parsed) ? parsed : INITIAL_VOCABULARY;
      } catch (e) {
        return INITIAL_VOCABULARY;
      }
    }
    return INITIAL_VOCABULARY;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const email = localStorage.getItem('linguist_user_email');
    const ns = email ? email.toLowerCase().trim() : 'guest';
    let local = localStorage.getItem(`linguist_badges_v11_${ns}`);
    if (!local && ns === 'guest') {
      local = localStorage.getItem('linguist_badges_v11');
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
    const email = localStorage.getItem('linguist_user_email');
    const ns = email ? email.toLowerCase().trim() : 'guest';
    let local = localStorage.getItem(`linguist_stats_v11_${ns}`);
    if (!local && ns === 'guest') {
      local = localStorage.getItem('linguist_stats_v11');
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

    return DEFAULT_STATS;
  });

  const [lastActiveBookId, setLastActiveBookId] = useState<string | null>(() => {
    const email = localStorage.getItem('linguist_user_email');
    const ns = email ? email.toLowerCase().trim() : 'guest';
    let local = localStorage.getItem(`linguist_last_active_book_id_${ns}`);
    if (!local && ns === 'guest') {
      local = localStorage.getItem('linguist_last_active_book_id');
    }
    return local || null;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');

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
        lastActiveDate: getLocalDateString() // initialize to today
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

      localStorage.setItem('linguist_stats_v11', JSON.stringify(zeroedStats));
      localStorage.setItem('linguist_books_v11', JSON.stringify(stripBooksForSync(zeroedBooks)));
      localStorage.setItem('linguist_vocabulary_v11', JSON.stringify([]));
      localStorage.setItem('linguist_badges_v11', JSON.stringify(zeroedBadges));
      localStorage.setItem('linguist_reset_stats_to_zero_v11', 'true');
      localStorage.setItem('linguist_last_active_book_id', '');

      setStats(zeroedStats);
      setLastActiveBookId(null);
      setBooks(zeroedBooks);
      setVocabulary([]);
      setBadges(zeroedBadges);
    }
  }, []);

  const loadUserData = (email: string | null) => {
    const ns = email ? email.toLowerCase().trim() : 'guest';
    
    // 1. Stats
    let statsLocal = localStorage.getItem(`linguist_stats_v11_${ns}`);
    if (!statsLocal && ns === 'guest') {
      statsLocal = localStorage.getItem('linguist_stats_v11');
    }
    let loadedStats = DEFAULT_STATS;
    if (statsLocal) {
      try {
        loadedStats = JSON.parse(statsLocal);
      } catch (e) {}
    }
    setStats({
      ...DEFAULT_STATS,
      ...loadedStats
    });

    // 2. Books
    let booksLocal = localStorage.getItem(`linguist_books_v11_${ns}`);
    if (!booksLocal && ns === 'guest') {
      booksLocal = localStorage.getItem('linguist_books_v11');
    }
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
    setBooks(merged);

    // 3. Vocabulary
    let vocabLocal = localStorage.getItem(`linguist_vocabulary_v11_${ns}`);
    if (!vocabLocal && ns === 'guest') {
      vocabLocal = localStorage.getItem('linguist_vocabulary_v11');
    }
    let loadedVocab = INITIAL_VOCABULARY;
    if (vocabLocal) {
      try {
        const parsed = JSON.parse(vocabLocal);
        if (Array.isArray(parsed)) loadedVocab = parsed;
      } catch (e) {}
    }
    setVocabulary(loadedVocab);

    // 4. Badges
    let badgesLocal = localStorage.getItem(`linguist_badges_v11_${ns}`);
    if (!badgesLocal && ns === 'guest') {
      badgesLocal = localStorage.getItem('linguist_badges_v11');
    }
    let loadedBadges = INITIAL_BADGES;
    if (badgesLocal) {
      try {
        const parsed = JSON.parse(badgesLocal);
        if (Array.isArray(parsed)) loadedBadges = parsed;
      } catch (e) {}
    }
    setBadges(loadedBadges.map(b => ({
      ...b,
      unlocked: !!b.unlocked
    })));

    // 5. User Name & Avatar
    let nameLocal = localStorage.getItem(`linguist_user_name_${ns}`);
    if (!nameLocal && ns === 'guest') {
      nameLocal = localStorage.getItem('linguist_user_name');
    }
    setUserName(nameLocal || '');

    let avatarLocal = localStorage.getItem(`linguist_user_avatar_${ns}`);
    if (!avatarLocal && ns === 'guest') {
      avatarLocal = localStorage.getItem('linguist_user_avatar');
    }
    setUserAvatar(avatarLocal || AVATAR_OPTIONS[0]);

    // 6. Last Active Book ID
    let activeBookLocal = localStorage.getItem(`linguist_last_active_book_id_${ns}`);
    if (!activeBookLocal && ns === 'guest') {
      activeBookLocal = localStorage.getItem('linguist_last_active_book_id');
    }
    setLastActiveBookId(activeBookLocal || null);
  };

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    loadUserData(userEmail);
  }, [userEmail]);

  // Automatically save to local persistence whenever states modify
  useEffect(() => {
    const ns = userEmail ? userEmail.toLowerCase().trim() : 'guest';
    localStorage.setItem(`linguist_books_v11_${ns}`, JSON.stringify(stripBooksForSync(books)));
  }, [books, userEmail]);

  useEffect(() => {
    const ns = userEmail ? userEmail.toLowerCase().trim() : 'guest';
    localStorage.setItem(`linguist_vocabulary_v11_${ns}`, JSON.stringify(vocabulary));
  }, [vocabulary, userEmail]);

  useEffect(() => {
    const ns = userEmail ? userEmail.toLowerCase().trim() : 'guest';
    localStorage.setItem(`linguist_badges_v11_${ns}`, JSON.stringify(badges));
  }, [badges, userEmail]);

  useEffect(() => {
    const ns = userEmail ? userEmail.toLowerCase().trim() : 'guest';
    localStorage.setItem(`linguist_stats_v11_${ns}`, JSON.stringify(stats));
  }, [stats, userEmail]);

  useEffect(() => {
    const ns = userEmail ? userEmail.toLowerCase().trim() : 'guest';
    localStorage.setItem(`linguist_user_name_${ns}`, userName);
  }, [userName, userEmail]);

  useEffect(() => {
    const ns = userEmail ? userEmail.toLowerCase().trim() : 'guest';
    localStorage.setItem(`linguist_user_avatar_${ns}`, userAvatar);
  }, [userAvatar, userEmail]);

  useEffect(() => {
    const ns = userEmail ? userEmail.toLowerCase().trim() : 'guest';
    if (lastActiveBookId) {
      localStorage.setItem(`linguist_last_active_book_id_${ns}`, lastActiveBookId);
    } else {
      localStorage.removeItem(`linguist_last_active_book_id_${ns}`);
    }
  }, [lastActiveBookId, userEmail]);

  // Show splash screen for 3 seconds on app startup
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch Google Client ID Config on mount
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(cfg => {
        if (cfg.googleClientId) {
          setGoogleClientId(cfg.googleClientId);
        }
      })
      .catch(err => console.error('Failed to load client config:', err));
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
          userName,
          userAvatar,
          loginProvider,
          linkedProviders
        }
      };

      fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
  }, [userEmail, stats, books, vocabulary, badges, userName, userAvatar, loginProvider, linkedProviders]);

  // Daily Streak check useEffect
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
          lastActiveDate: todayStr
        };
      }

      const diff = getDaysDifference(todayStr, lastActive);
      if (diff === 1) {
        return {
          ...current,
          dailyStreak: (current.dailyStreak || 0) + 1,
          lastActiveDate: todayStr
        };
      } else if (diff > 1) {
        return {
          ...current,
          dailyStreak: 1,
          lastActiveDate: todayStr
        };
      } else if (diff < 0) {
        // Clock skew / timezone difference, update active date but keep streak
        return {
          ...current,
          lastActiveDate: todayStr
        };
      }
      return current; // diff === 0, no changes needed
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
  }, [stats?.completedBooksCount, stats?.dailyStreak, stats?.totalTimeMinutes, vocabulary.length, books, badges]);

  // Heart regeneration mechanism: 1 heart every 1 hour (3600000 ms), capped at 5
  useEffect(() => {
    const checkAndRefillHearts = () => {
      if (stats.isPremium) return;
      const ns = userEmail ? userEmail.toLowerCase().trim() : 'guest';
      if (stats.hearts >= 5) {
        localStorage.setItem(`linguist_last_heart_refill_${ns}`, String(Date.now()));
        return;
      }

      const now = Date.now();
      let lastRefillStr = localStorage.getItem(`linguist_last_heart_refill_${ns}`);
      if (!lastRefillStr && ns === 'guest') {
        lastRefillStr = localStorage.getItem('linguist_last_heart_refill');
      }
      const lastRefill = Number(lastRefillStr || now);
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
  }, [stats.hearts, stats.isPremium]);

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
          alert("Premium üyeliğinizin süresi dolmuştur. Devam etmek için lütfen aboneliğinizi yenileyin.");
          triggerCloudSync();
        }
      }
    };
    
    checkPremiumExpiry();
    const interval = setInterval(checkPremiumExpiry, 60000); // check every minute
    return () => clearInterval(interval);
  }, [stats.isPremium, stats.premiumExpiryDate]);

  // Helper to determine the current day index (0 = Monday, 6 = Sunday)
  const getTodayIndex = () => {
    const day = new Date().getDay(); // 0 is Sunday, 1-6 is Mon-Sat
    return day === 0 ? 6 : day - 1;
  };

  // Timer to track active reading time inside stories (Reading Time)
  useEffect(() => {
    const interval = setInterval(() => {
      // Increment only when the window is focused, visible, and the user is actively reading a story
      if (document.hasFocus() && document.visibilityState === 'visible' && activeReadingBook !== null) {
        setStats(prev => {
          const dayIndex = getTodayIndex();
          const updatedWeeklyMins = [...(prev.weeklyMins || [0, 0, 0, 0, 0, 0, 0])];
          updatedWeeklyMins[dayIndex] = (updatedWeeklyMins[dayIndex] || 0) + 1;

          const nextTotalTime = prev.totalTimeMinutes + 1;

          // Target: 20 minutes daily reading goal
          const dailyGoalMins = 20;
          const timePercent = Math.min(Math.round((updatedWeeklyMins[dayIndex] / dailyGoalMins) * 100), 100);

          return {
            ...prev,
            totalTimeMinutes: nextTotalTime,
            timeGoalPercent: timePercent,
            weeklyMins: updatedWeeklyMins
          };
        });
        triggerCloudSync();
      }
    }, 60000); // 60 seconds = 1 minute
    return () => clearInterval(interval);
  }, [activeReadingBook]);

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
        userName: customName !== undefined ? customName : userName,
        userAvatar: customAvatar !== undefined ? customAvatar : userAvatar,
        loginProvider: customLoginProvider !== undefined ? customLoginProvider : loginProvider,
        linkedProviders: customLinkedProviders !== undefined ? customLinkedProviders : linkedProviders
      }
    };

    fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(() => {
      setSyncStatus('synced');
    })
    .catch(err => {
      console.error('Failed to sync to cloud:', err);
      setSyncStatus('synced');
    });
  };

  const handleGoogleLogin = (email: string, name?: string, picture?: string, provider = 'google') => {
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
    fetch(`/api/sync?email=${encodeURIComponent(finalEmail)}`)
      .then(res => res.json())
      .then(resData => {
        setSyncStatus('synced');
        if (resData.found && resData.data) {
          const cloud = resData.data;
          
          if (cloud.stats) {
            const todayStr = getLocalDateString();
            const lastActive = cloud.stats.lastActiveDate;
            let finalStats = { ...cloud.stats };

            if (!lastActive) {
              finalStats.dailyStreak = 1;
              finalStats.lastActiveDate = todayStr;
            } else {
              const diff = getDaysDifference(todayStr, lastActive);
              if (diff === 1) {
                finalStats.dailyStreak = finalStats.dailyStreak + 1;
                finalStats.lastActiveDate = todayStr;
              } else if (diff > 1) {
                finalStats.dailyStreak = 1;
                finalStats.lastActiveDate = todayStr;
              } else if (diff < 0) {
                finalStats.lastActiveDate = todayStr;
              }
            }

            setStats(finalStats);
            localStorage.setItem(`linguist_stats_v11_${finalEmail}`, JSON.stringify(finalStats));
          }
          if (cloud.books) {
            const sanitizedParsed = Array.isArray(cloud.books) ? cloud.books.filter(Boolean).map((b: any) => ({
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
            setBooks(merged);
            localStorage.setItem(`linguist_books_v11_${finalEmail}`, JSON.stringify(stripBooksForSync(merged)));
          }
          if (cloud.vocabulary) {
            setVocabulary(cloud.vocabulary);
            localStorage.setItem(`linguist_vocabulary_v11_${finalEmail}`, JSON.stringify(cloud.vocabulary));
          }
          if (cloud.badges) {
            setBadges(cloud.badges);
            localStorage.setItem(`linguist_badges_v11_${finalEmail}`, JSON.stringify(cloud.badges));
          }
          if (cloud.userName) {
            setUserName(cloud.userName);
            localStorage.setItem(`linguist_user_name_${finalEmail}`, cloud.userName);
          }
          if (cloud.userAvatar) {
            setUserAvatar(cloud.userAvatar);
            localStorage.setItem(`linguist_user_avatar_${finalEmail}`, cloud.userAvatar);
          }
          if (cloud.loginProvider) {
            setLoginProvider(cloud.loginProvider);
            localStorage.setItem('linguist_login_provider', cloud.loginProvider);
          }
          if (cloud.linkedProviders) {
            setLinkedProviders(cloud.linkedProviders);
            localStorage.setItem('linguist_linked_providers', JSON.stringify(cloud.linkedProviders));
          }
        } else {
          // Sync current local state to cloud immediately since it is a new account
          const payload = {
            email: finalEmail,
            data: {
              stats,
              books,
              vocabulary,
              badges,
              userName: finalName,
              userAvatar: finalAvatar,
              loginProvider: provider,
              linkedProviders: initialLinked
            }
          };

          fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(err => console.error('Initial sync error:', err));
        }
      })
      .catch(err => {
        console.error('Error fetching sync data:', err);
        setSyncStatus('synced');
      });
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
          tr: matchHelper ? matchHelper.tr : 'Kelime anlamı yüklendi'
        };
      });

      return {
        id: `custom_p_${index}`,
        textEn: sentence + '.',
        textTr: 'Bu cümlenin Türkçe tercümesi yapay zeka tarafından çıkarıldı.',
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
    const isAlreadySaved = vocabulary.some(w => w.word.toLowerCase() === word.toLowerCase());
    if (isAlreadySaved) return;

    const newWord: VocabularyWord = {
      id: `word_${Date.now()}`,
      word,
      translation,
      level,
      notes: 'Hikaye okumasından kaydedildi.',
      savedAt: new Date().toISOString().split('T')[0],
      exampleEn,
      exampleTr
    };

    setVocabulary(prev => [newWord, ...prev]);
    setStats(prev => {
      const newLearnedVal = (prev.learnedWordsCount || 0) + 1;
      // Word goal percent is calculated dynamically based on total unique interactive words (854)
      const targetPercent = Math.min(Math.round((newLearnedVal / LIBRARY_UNIQUE_WORDS_COUNT) * 100), 100);

      const dayIndex = getTodayIndex();
      const updatedWeeklyWords = [...(prev.weeklyWords || [0, 0, 0, 0, 0, 0, 0])];
      updatedWeeklyWords[dayIndex] = (updatedWeeklyWords[dayIndex] || 0) + 1;

      return {
        ...prev,
        learnedWordsCount: newLearnedVal,
        wordGoalPercent: targetPercent,
        weeklyWords: updatedWeeklyWords
      };
    });

    // Check achievement: "Kelime Avcısı" unlocked if vocab saved count > 4
    if (vocabulary.length + 1 >= 5) {
      unlockBadge('b3');
    }

    triggerCloudSync();
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
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, isStarted: true } : b));
    setActiveReadingBook(prev => {
      if (prev && prev.id === bookId) {
        return { ...prev, isStarted: true };
      }
      return prev;
    });
    triggerCloudSync();
  };

  // Remove a book from "currently reading" list without deleting progress
  const handleRemoveFromReading = (bookId: string) => {
    setBooks(prev => prev.map(b =>
      b.id === bookId ? { ...b, isStarted: false, percentageCompleted: 0, currentPage: 1 } : b
    ));
    triggerCloudSync();
  };

  // Gamified quizzes answers checks
  const handleAnswerCorrect = () => {
    setStats(prev => {
      const currentXp = 1980 + 30; // simulated increment
      return {
        ...prev,
        dailyStreak: prev.dailyStreak + 1, // increase streak
        readingGoalPercent: Math.min(prev.readingGoalPercent + 5, 100)
      };
    });
    triggerCloudSync();
  };

  const handleAnswerIncorrect = () => {
    if (stats.isPremium) return; // infinite lives for premium

    setStats(prev => {
      const nextHearts = Math.max(0, prev.hearts - 1);
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

  const unlockBadge = (badgeId: string) => {
    setBadges(prev =>
      prev.map(b =>
        b.id === badgeId && !b.unlocked
          ? { ...b, unlocked: true, unlockedAt: new Date().toISOString().split('T')[0] }
          : b
      )
    );
  };

  const handleSelectBook = (book: Book) => {
    localStorage.setItem('linguist_last_active_book_id', book.id);
    setLastActiveBookId(book.id);
    setActiveReadingBook(book);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0f0f11]' : 'bg-[#FFF5DF]'
    }`}>
      {/* Sleek Device Mockup Container */}
      <div className={`relative w-full min-h-screen md:min-h-0 md:h-[820px] md:max-w-[400px] md:rounded-[48px] md:border-[12px] md:border-[#1E1E22] md:shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:my-6 md:overflow-hidden md:transform md:translate-z-0 flex flex-col transition-colors duration-200 ${
        isDarkMode ? 'bg-[#121214] text-[#E6E6E6] dark' : 'bg-[#FFFBF0] text-[#2D3436]'
      }`}>
        
        {showSplash ? (
          <SplashScreen />
        ) : (
          <>
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
        <div className="flex-1 overflow-y-visible md:overflow-y-auto flex flex-col relative scrollbar-none pb-20">
          
          {/* Visual Navigation and Status Headers if not in active reading panel */}
          {!activeReadingBook && (
            <Header
              currentTab={currentTab}
              isPremium={stats.isPremium}
              onAvatarClick={() => setCurrentTab('profile')}
              onLogoClick={() => setCurrentTab('library')}
              syncStatus={syncStatus}
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
              userName={userName}
              userAvatar={userAvatar}
            />
          )}

          {/* Main Container viewport */}
          <div className="flex-1 flex flex-col">
            {activeReadingBook ? (
              <ReadingView
                book={activeReadingBook}
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
                  setActiveReadingBook(null);
                  setSearchQuery('');
                  setCurrentTab('quiz');
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
                }}
                onFinishBook={handleFinishBook}
                onStartBook={handleStartBook}
                userEmail={userEmail}
              />
            ) : (
              <>
                {currentTab === 'library' && (
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
                  />
                )}

                {currentTab === 'favorites' && (
                  <FavoritesTab
                    books={books}
                    onSelectBook={handleSelectBook}
                    onToggleFavorite={handleToggleFavorite}
                    onGoToLibrary={() => setCurrentTab('library')}
                    isDarkMode={isDarkMode}
                  />
                )}

                {currentTab === 'vocabulary' && (
                  <VocabularyTab
                    vocabulary={vocabulary}
                    onStartQuiz={(mode) => {
                      setQuizMode(mode);
                      setShowPaywallInQuiz(false);
                      setCurrentTab('quiz');
                    }}
                    onRemoveWord={handleUnsaveWord}
                    syncTrigger={triggerCloudSync}
                    isDarkMode={isDarkMode}
                  />
                )}

                {currentTab === 'quiz' && (
                  <QuizView
                    stats={stats}
                    vocabulary={vocabulary}
                    books={books}
                    quizMode={quizMode}
                    initiallyShowPaywall={showPaywallInQuiz}
                    onAnswerCorrect={handleAnswerCorrect}
                    onAnswerIncorrect={handleAnswerIncorrect}
                    onSubscribe={handleSubscribe}
                    onBackToVocabulary={() => setCurrentTab('vocabulary')}
                    onGoToLibrary={() => setCurrentTab('library')}
                    syncTrigger={triggerCloudSync}
                    isDarkMode={isDarkMode}
                    onUnlockBadge={unlockBadge}
                  />
                )}

                {currentTab === 'profile' && (
                  <ProfileTab
                    stats={stats}
                    badges={badges}
                    onTriggerPremiumPanel={() => {
                      setShowPaywallInQuiz(true);
                      setCurrentTab('quiz');
                    }}
                    syncTrigger={triggerCloudSync}
                    isDarkMode={isDarkMode}
                    userName={userName}
                    userAvatar={userAvatar}
                    onUpdateProfile={handleUpdateProfile}
                    userEmail={userEmail}
                    googleClientId={googleClientId}
                    loginProvider={loginProvider}
                    linkedProviders={linkedProviders}
                    onGoogleLogin={handleGoogleLogin}
                    onGoogleLogout={handleGoogleLogout}
                    onUnlinkProvider={handleUnlinkProvider}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom Layout Navigation triggers */}
        {!activeReadingBook && (
          <BottomNav currentTab={currentTab} onTabChange={(tab) => setCurrentTab(tab)} isDarkMode={isDarkMode} />
        )}
          </>
        )}
      </div>
    </div>
  );
}
