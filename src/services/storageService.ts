import { Book, VocabularyWord, UserStats, Badge } from '../types';
import { INITIAL_BOOKS, INITIAL_VOCABULARY, INITIAL_BADGES } from '../data';

export const getOrInitializeDeviceUuid = (): string => {
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

export const migrateLegacyNamespace = (keyPrefix: string, deviceUuid: string): string => {
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

export interface LoadedUserData {
  stats: UserStats | null;
  books: Book[] | null;
  vocabulary: VocabularyWord[] | null;
  badges: Badge[] | null;
}

export const loadUserDataFromStorage = (uuid: string, defaultStats: UserStats): LoadedUserData => {
  if (!uuid) return { stats: null, books: null, vocabulary: null, badges: null };

  // 1. Stats
  let stats: UserStats | null = null;
  const statsLocal = localStorage.getItem(`linguist_stats_v11_${uuid}`);
  if (statsLocal) {
    try {
      const parsed = JSON.parse(statsLocal);
      if (parsed && typeof parsed === 'object') {
        stats = {
          ...defaultStats,
          ...parsed,
          weeklyWords: Array.isArray(parsed.weeklyWords) && parsed.weeklyWords.length === 7 
            ? parsed.weeklyWords.map(Number) 
            : [...defaultStats.weeklyWords],
          weeklyMins: Array.isArray(parsed.weeklyMins) && parsed.weeklyMins.length === 7 
            ? parsed.weeklyMins.map(Number) 
            : [...defaultStats.weeklyMins]
        };
      }
    } catch (e) {
      console.error('Failed to parse stats:', e);
    }
  }

  // 2. Books
  let books: Book[] | null = null;
  const booksLocal = localStorage.getItem(`linguist_books_v11_${uuid}`);
  if (booksLocal) {
    try {
      const parsedBooks = JSON.parse(booksLocal);
      const sanitized = Array.isArray(parsedBooks) ? parsedBooks.map(b => ({
        ...b,
        percentageCompleted: typeof b.percentageCompleted === 'number' ? b.percentageCompleted : 0,
        currentPage: typeof b.currentPage === 'number' ? b.currentPage : 0,
        pagesLeft: typeof b.pagesLeft === 'number' ? b.pagesLeft : (b.totalPages || 0),
        totalPages: typeof b.totalPages === 'number' ? b.totalPages : 0,
        isCompleted: !!b.isCompleted,
        isFavorited: !!b.isFavorited,
        isStarted: !!b.isStarted
      })) : [];

      const merged = [...sanitized];
      INITIAL_BOOKS.forEach(initBook => {
        const existingIdx = merged.findIndex(b => b.id === initBook.id);
        if (existingIdx === -1) {
          merged.push(initBook);
        } else {
          merged[existingIdx] = {
            ...initBook,
            ...merged[existingIdx]
          };
        }
      });
      books = merged.filter(b => 
        INITIAL_BOOKS.some(init => init.id === b.id) || 
        (b.title && b.level && b.chapters && b.chapters.length > 0)
      );
    } catch (e) {
      console.error('Failed to parse books:', e);
    }
  }

  // 3. Vocabulary
  let vocabulary: VocabularyWord[] | null = null;
  const vocabLocal = localStorage.getItem(`linguist_vocabulary_v11_${uuid}`);
  if (vocabLocal) {
    try {
      const parsed = JSON.parse(vocabLocal);
      if (Array.isArray(parsed)) {
        vocabulary = parsed;
      }
    } catch (e) {
      console.error('Failed to parse vocabulary:', e);
    }
  }

  // 4. Badges
  let badges: Badge[] | null = null;
  const badgesLocal = localStorage.getItem(`linguist_badges_v11_${uuid}`);
  if (badgesLocal) {
    try {
      const parsed = JSON.parse(badgesLocal);
      if (Array.isArray(parsed)) {
        badges = INITIAL_BADGES.map(initBadge => {
          const match = parsed.find((b: Badge) => b.id === initBadge.id);
          return match ? { ...initBadge, unlocked: !!match.unlocked, unlockedAt: match.unlockedAt } : initBadge;
        });
      }
    } catch (e) {
      console.error('Failed to parse badges:', e);
    }
  }

  return { stats, books, vocabulary, badges };
};
