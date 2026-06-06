import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BookOpen, Timer, Plus, ArrowRight, ExternalLink, ChevronRight, X, Sparkles, BookMarked, Star, Skull, Compass, Search, Trash2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, getLevelColor, hexToRgba } from '../types';


const TumuIcon = () => (
  <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
    <defs>
      <filter id="bookGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <linearGradient id="bookCover" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF4757" />
        <stop offset="100%" stopColor="#950B14" />
      </linearGradient>
      <linearGradient id="pageGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#F1F2F6" />
      </linearGradient>
      <linearGradient id="bookmark" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FFC312" />
        <stop offset="100%" stopColor="#EE5A24" />
      </linearGradient>
    </defs>
    <path d="M2 24c4-1 10-1 14 2 4-3 10-3 14-2V6c-4-1-10-1-14 2-4-3-10-3-14-2v18z" fill="url(#bookCover)" />
    <path d="M3 22c3.5-.8 9-.8 13 1.8V5.8c-4-2.6-9.5-2.6-13-1.8v18z" fill="url(#pageGrad)" />
    <path d="M29 22c-3.5-.8-9-.8-13 1.8V5.8c4-2.6 9.5-2.6 13-1.8v18z" fill="url(#pageGrad)" />
    <path d="M5 7h8M5 11h8M5 15h8M5 19h8M19 7h8M19 11h8M19 15h8M19 19h8" stroke="#D1D8E0" strokeWidth="1" strokeLinecap="round" />
    <path d="M15 8h2v15l-1-1-1 1V8z" fill="url(#bookmark)" />
    <circle cx="16" cy="4" r="1.2" fill="#FFC312" filter="url(#bookGlow)" />
    <path d="M9 3l1 1-1 1-1-1 1-1zm14 2l0.8 0.8-0.8 0.8-0.8-0.8 0.8-0.8z" fill="#FFE66D" filter="url(#bookGlow)" />
  </svg>
);

const SpookyIcon = () => (
  <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="moonGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFE66D" />
        <stop offset="60%" stopColor="#FF9F43" />
        <stop offset="100%" stopColor="#FF5252" />
      </linearGradient>
      <linearGradient id="castleGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4B3775" />
        <stop offset="100%" stopColor="#2E1A4E" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="13" fill="url(#moonGrad)" />
    <path d="M7 27h18v-8l-2-2v4h-3v-6l-2-2-2 2v6h-3v-4l-2 2v8z" fill="url(#castleGrad)" />
    <rect x="15" y="7" width="2" height="6" fill="url(#castleGrad)" />
    <path d="M15 7l1-3 1 3h-2zm-6 12l1-3 1 3H9zm12 2l1-3 1 3h-2z" fill="#2E1A4E" />
    <rect x="15" y="16" width="2" height="3" rx="0.5" fill="#FFE66D" />
    <circle cx="10" cy="20" r="0.8" fill="#FFE66D" />
    <circle cx="22" cy="22" r="0.8" fill="#FFE66D" />
    <path d="M6 9c.5.5 1.5.2 2-.5.5.7 1.5 1 2 .5-.5.8-1.5.8-2 .2-.5.6-1.5.6-2-.2z" fill="#2E1A4E" />
    <path d="M22 6c.4.4 1.2.1 1.6-.4.4.5 1.2.8 1.6.4-.4.6-1.2.6-1.6.1-.4.5-1.2.5-1.6-.1z" fill="#2E1A4E" />
  </svg>
);

const WandIcon = () => (
  <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="crystalGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#70A1FF" />
        <stop offset="40%" stopColor="#A890FE" />
        <stop offset="70%" stopColor="#E280FF" />
        <stop offset="100%" stopColor="#FF9FF3" />
      </linearGradient>
      <linearGradient id="standGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FFE66D" />
        <stop offset="50%" stopColor="#FFC312" />
        <stop offset="100%" stopColor="#EE5A24" />
      </linearGradient>
    </defs>
    <path d="M9 25h14v2c0 1.5-2 2-7 2s-7-.5-7-2v-2z" fill="url(#standGrad)" />
    <path d="M12 21h8v4h-8v-4z" fill="#EE5A24" />
    <path d="M7 23c2-1 4-2 9-2s7 1 9 2H7z" fill="url(#standGrad)" />
    <circle cx="16" cy="13" r="10" fill="url(#crystalGrad)" stroke="#FFFFFF" strokeWidth="1" />
    <path d="M16 7l0.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8.8-1.8z" fill="#FFFFFF" />
    <circle cx="11" cy="15" r="1" fill="#FFFFFF" />
    <circle cx="21" cy="11" r="1.2" fill="#FFE66D" />
    <circle cx="20" cy="16" r="0.8" fill="#FFFFFF" />
    <path d="M9 8a8 8 0 0110-2" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const CompassIcon = () => (
  <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFE66D" />
        <stop offset="60%" stopColor="#FF7F50" />
        <stop offset="100%" stopColor="#FF6B6B" />
      </linearGradient>
      <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#45AAF2" />
        <stop offset="100%" stopColor="#0B5FA5" />
      </linearGradient>
      <linearGradient id="shipGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#D5A973" />
        <stop offset="100%" stopColor="#6F4E27" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="13" fill="url(#skyGrad)" />
    <path d="M7 19c2 0 4 1.5 6 1.5s4-1.5 6-1.5h2l2-3H10L7 19z" fill="url(#shipGrad)" />
    <rect x="11" y="8" width="1.2" height="9" fill="#3E2711" />
    <rect x="17" y="6" width="1.2" height="11" fill="#3E2711" />
    <rect x="23" y="10" width="1.2" height="7" fill="#3E2711" />
    <path d="M12.2 9c2 .5 2 2.5 0 3h2.5c-.5-1.5-.5-2.5-2.5-3zM18.2 7c3 .5 3 3.5 0 4.5h3c-.5-2.5-.5-3.5-3-4.5zM24.2 11c1.5.5 1.5 2 0 2.5h2c-.2-1.5-.2-2-.2-2.5z" fill="#F1F2F6" />
    <path d="M3 21c3.5-1.5 6.5.5 10 0s6.5-1.5 10 0c3.5 1.5 6 0 6 0v8H3v-8z" fill="url(#seaGrad)" opacity="0.95" />
    <path d="M3 24.5c3.5-1 6.5 1 10 0s6.5-1 10 0c3.5 1 6 0 6 0v4.5H3v-4.5z" fill="#0B5FA5" opacity="0.6" />
    <path d="M13 21a2.5 2.5 0 014-1m6 1a2.5 2.5 0 014-1" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const SpeechIcon = () => (
  <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="bubbleGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#45AAF2" />
        <stop offset="50%" stopColor="#2D98DA" />
        <stop offset="100%" stopColor="#4B7BEC" />
      </linearGradient>
      <linearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#70A1FF" />
        <stop offset="100%" stopColor="#1E90FF" />
      </linearGradient>
    </defs>
    <path d="M16 4C9.37 4 4 8.7 4 14.5c0 3.33 1.77 6.32 4.6 8.23l-1.35 4.05c-.15.46.33.86.72.6l4.63-3.08c1.07.28 2.22.4 3.4.4 6.63 0 12-4.7 12-10.5S22.63 4 16 4z" fill="url(#bubbleGrad)" />
    <circle cx="11" cy="14" r="2" fill="#FFFFFF" opacity="0.9" />
    <circle cx="16" cy="14" r="2" fill="#FFFFFF" opacity="0.9" />
    <circle cx="21" cy="14" r="2" fill="#FFFFFF" opacity="0.9" />
    <path d="M25 21c0-2.2-2-4-4.5-4-.25 0-.5.03-.73.08.7.67 1.13 1.54 1.13 2.5 0 2.2-2 4-4.5 4-.63 0-1.22-.11-1.75-.3 1.1 2.24 3.65 3.72 6.7 3.72.63 0 1.25-.06 1.83-.17l2.87 1.9c.2.14.47-.04.4-.24l-.87-2.61c1.55-1.22 2.5-3.08 2.5-4.9z" fill="url(#glowGrad)" opacity="0.8" />
  </svg>
);

const SciFiIcon = () => (
  <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="spaceGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00cec9" />
        <stop offset="50%" stopColor="#0984e3" />
        <stop offset="100%" stopColor="#6c5ce7" />
      </linearGradient>
      <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#fdcb6e" />
        <stop offset="100%" stopColor="#e17055" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="10" fill="url(#spaceGrad)" />
    <path d="M5 21c3.5-3 10-6.5 17-6.5s7.5 1.5 8 3-4.5 5.5-12 5.5-11-1-13-2z" stroke="url(#ringGrad)" strokeWidth="2.5" opacity="0.9" />
    <circle cx="8" cy="8" r="0.8" fill="#FFFFFF" />
    <circle cx="24" cy="24" r="0.8" fill="#FFFFFF" />
    <path d="M14 11l0.5 1 1 0.5-1 0.5-0.5 1-0.5-1-1-0.5 1-0.5 0.5-1z" fill="#FFE66D" />
  </svg>
);

const DetectiveIcon = () => (
  <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="detectiveGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2c3e50" />
        <stop offset="100%" stopColor="#2980b9" />
      </linearGradient>
      <linearGradient id="lensGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e0f7fa" />
        <stop offset="100%" stopColor="#80deea" />
      </linearGradient>
    </defs>
    <rect x="20" y="20" width="10" height="3" rx="1.5" transform="rotate(45 20 20)" fill="#7f8c8d" />
    <circle cx="14" cy="14" r="8" stroke="url(#detectiveGrad)" strokeWidth="3" fill="none" />
    <circle cx="14" cy="14" r="6.5" fill="url(#lensGrad)" opacity="0.6" />
    <path d="M11 11a4.5 4.5 0 0 1 5 0" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
  </svg>
);

const getBookCategory = (bookId: string): 'horror_mystery' | 'kids_fables' | 'classics_adventure' | 'daily_conversations' | 'sci_fi' | 'detective' => {
  const horrorIds = [
    'sleepy_hollow', 'dr_jekyll_mr_hyde', 'invisible_man', 'crime_punishment', 'frankenstein', 'dracula', 'war_of_worlds'
  ];
  const fableKidsIds = [
    'peter_rabbit', 'bambi', 'velveteen_rabbit', 'nutcracker', 'blue_bird', 'tom_thumb', 'little_match_girl',
    'gingerbread_man', 'chicken_little', 'enormous_turnip', 'three_billy_goats', 'fisherman_wife', 'little_red_hen',
    'frog_prince', 'stone_soup', 'star_money', 'city_musicians', 'crow_pitcher', 'ant_grasshopper', 'lion_mouse',
    'town_country_mouse', 'wind_sun', 'rumpelstiltskin', 'snow_queen', 'pinocchio', 'princess_pea', 'thumbelina',
    'boy_cried_wolf', 'ali_baba', 'hansel_gretel', 'sleeping_beauty', 'rapunzel', 'cinderella', 'jack_beanstalk',
    'aladdin', 'goldilocks', 'red_riding_hood', 'ugly_duckling', 'little_mermaid', 'three_pigs', 'snow_white', 'beauty_beast',
    'peter_wolf', 'tin_soldier', 'magic_pot', 'wolf_kids', 'brave_tailor', 'selfish_giant', 'nightingale', 'tinderbox',
    'wild_swans', 'goose_girl', 'fox_grapes', 'golden_goose', 'elves_shoemaker', 'emperors_clothes', 'happy_prince',
    'reluctant_dragon', 'star_child',
    'magic_flute', 'king_thrushbeard', 'iron_hans', 'water_of_life', 'three_spinners', 'six_swans',
    'birthday_infanta', 'fisherman_soul', 'young_king', 'devoted_friend', 'remarkably_rocket',
    'east_sun_west_moon', 'snow_white_rose_red', 'twelve_dancing_princesses',
    'tortoise_hare', 'puss_boots', 'secret_oak_tree', 'clockwork_town', 'painted_dreams'
  ];

  const lowerId = bookId.toLowerCase();
  if (lowerId.startsWith('daily_') || lowerId.includes('daily_')) {
    return 'daily_conversations';
  }
  if (lowerId.startsWith('scifi_') || lowerId.includes('scifi_')) {
    return 'sci_fi';
  }
  if (lowerId.startsWith('detective_') || lowerId.includes('detective_')) {
    return 'detective';
  }
  if (lowerId.includes('horror') || horrorIds.some(id => lowerId.includes(id))) {
    return 'horror_mystery';
  }
  if (lowerId.includes('fable') || lowerId.includes('kids') || fableKidsIds.some(id => lowerId.includes(id))) {
    return 'kids_fables';
  }
  return 'classics_adventure';
};

interface LibraryTabProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  syncTrigger: () => void;
  isDarkMode?: boolean;
  onToggleFavorite: (bookId: string) => void;
  totalReadMinutes: number;
  lastActiveBookId: string | null;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  onRemoveFromReading?: (bookId: string) => void;
  focusedCategory: string | null;
  setFocusedCategory: (category: string | null) => void;
}

export default function LibraryTab({
  books,
  onSelectBook,
  syncTrigger,
  isDarkMode,
  onToggleFavorite,
  totalReadMinutes,
  lastActiveBookId,
  searchQuery = '',
  onSearchQueryChange,
  onRemoveFromReading,
  focusedCategory,
  setFocusedCategory,
}: LibraryTabProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [confirmRemoveBookId, setConfirmRemoveBookId] = useState<string | null>(null);
  const [lastTap, setLastTap] = useState<{ [key: string]: number }>({});

  const lastTransitionTime = useRef<number>(0);

  useEffect(() => {
    lastTransitionTime.current = Date.now();
  }, [focusedCategory]);

  const handleCategoryTap = (catId: string) => {
    const now = Date.now();
    const prevTap = lastTap[catId] || 0;
    if (now - prevTap < 300) {
      setFocusedCategory(catId);
    } else {
      setSelectedCategory(catId);
    }
    setLastTap(prev => ({ ...prev, [catId]: now }));
  };

  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    return books.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [books, searchQuery]);

  // Currently reading list: books that are started OR match lastActiveBookId, and not completed
  const currentlyReadingList = useMemo(() => {
    return books.filter(b => (b.isStarted || b.id === lastActiveBookId) && !b.isCompleted);
  }, [books, lastActiveBookId]);

  const currentlyReading = useMemo(() => {
    if (currentlyReadingList.length === 0) return null;
    const foundLastActive = currentlyReadingList.find(b => b.id === lastActiveBookId);
    return foundLastActive || currentlyReadingList[0];
  }, [currentlyReadingList, lastActiveBookId]);

  const secondaryCurrentlyReading = useMemo(() => {
    if (!currentlyReading) return [];
    return currentlyReadingList.filter(b => b.id !== currentlyReading.id);
  }, [currentlyReadingList, currentlyReading]);

  const filteredBooks = useMemo(() => {
    let list = selectedLevel === 'All'
      ? books
      : books.filter(b => b.level === selectedLevel);

    if (selectedCategory !== 'All') {
      list = list.filter(b => getBookCategory(b.id) === selectedCategory);
    }

    if (searchQuery && searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q)
      );
    }

    const levelOrder: Record<string, number> = {
      A1: 1,
      A2: 2,
      B1: 3,
      B2: 4,
      C1: 5
    };

    return [...list].sort((a, b) => {
      const orderA = levelOrder[a.level] || 99;
      const orderB = levelOrder[b.level] || 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.title.localeCompare(b.title, 'tr');
    });
  }, [books, selectedLevel, selectedCategory, searchQuery]);

  const libraryCountLabel = useMemo(() => {
    const count = filteredBooks.length;
    if (selectedCategory === 'All') {
      return `Toplam ${count} Hikaye`;
    }
    if (selectedCategory === 'horror_mystery') {
      return `Toplam ${count} Korku ve Gizem Hikayesi`;
    }
    if (selectedCategory === 'kids_fables') {
      return `Toplam ${count} Masal ve Çocuk Hikayesi`;
    }
    if (selectedCategory === 'classics_adventure') {
      return `Toplam ${count} Dünya Klasiği`;
    }
    if (selectedCategory === 'daily_conversations') {
      return `Toplam ${count} Günlük Yaşam Öyküsü`;
    }
    if (selectedCategory === 'sci_fi') {
      return `Toplam ${count} Bilim Kurgu Öyküsü`;
    }
    if (selectedCategory === 'detective') {
      return `Toplam ${count} Polisiye & Gizem Hikayesi`;
    }
    return `Toplam ${count} Eser`;
  }, [filteredBooks.length, selectedCategory]);


  // Calculate unique words read across all books based on progress (currentPage index)
  const totalWordsRead = useMemo(() => {
    const uniqueWordsSet = new Set<string>();
    
    // Helper to chunk paragraphs into pages matching ReadingView logic
    const getBookPagesHelper = (book: Book, wordsPerPage: number = 120): number[][] => {
      if (!book.chapters || book.chapters.length === 0) return [];
      const chapter = book.chapters[0];
      if (!chapter || !chapter.paragraphs) return [];

      const pagesList: number[][] = [];
      let currentGroup: number[] = [];
      let currentWordCount = 0;

      chapter.paragraphs.forEach((p, idx) => {
        const wordsCount = p.textEn.split(/\s+/).filter(Boolean).length;
        if (currentGroup.length > 0 && currentWordCount >= wordsPerPage) {
          pagesList.push(currentGroup);
          currentGroup = [idx];
          currentWordCount = wordsCount;
        } else {
          currentGroup.push(idx);
          currentWordCount += wordsCount;
        }
      });

      if (currentGroup.length > 0) {
        pagesList.push(currentGroup);
      }

      return pagesList;
    };

    books.forEach(b => {
      if (b.currentPage <= 0) return;
      const pagesList = getBookPagesHelper(b, 120);
      const readPageCount = Math.min(b.currentPage, pagesList.length);
      for (let i = 0; i < readPageCount; i++) {
        const paragraphIndices = pagesList[i];
        paragraphIndices.forEach(pIdx => {
          const paragraph = b.chapters[0].paragraphs[pIdx];
          if (paragraph && paragraph.textEn) {
            const words = paragraph.textEn.split(/\s+/);
            words.forEach(rawW => {
              const cleanW = rawW.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”巍‘’\[\]{}<>|\\+]/g, "").trim().toLowerCase();
              if (cleanW && !/^\d+$/.test(cleanW)) {
                uniqueWordsSet.add(cleanW);
              }
            });
          }
        });
      }
    });

    return uniqueWordsSet.size;
  }, [books]);

  const minutes = totalReadMinutes || 0;
  const totalReadHours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  const renderBookCard = (book: Book, idx: number, isHorizontal: boolean = false) => {
    const shouldAnimate = idx < 12;
    return (
      <motion.div
        initial={shouldAnimate ? { opacity: 0, scale: 0.96 } : false}
        animate={shouldAnimate ? { opacity: 1, scale: 1 } : false}
        transition={shouldAnimate ? { delay: Math.min(idx, 8) * 0.03, duration: 0.25 } : undefined}
        key={book.id}
        onClick={() => {
          if (Date.now() - lastTransitionTime.current < 450) {
            // Ignore double-clicks/taps that bleed through from the category navigation transitions
            return;
          }
          onSelectBook(book);
        }}
        className={`group cursor-pointer flex flex-col ${
          isHorizontal ? 'w-[140px] shrink-0 snap-start' : ''
        }`}
      >
        <div className={`aspect-[2/3] rounded-2xl overflow-hidden mb-3 shadow-xs group-hover:shadow-md transition-all relative border ${
          isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]/60'
        }`}>
          <img
            alt={book.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              book.isCompleted ? 'grayscale opacity-60' : ''
            }`}
            src={book.coverUrl}
            loading="lazy"
          />
          <div 
            className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
            style={{ backgroundColor: getLevelColor(book.level) }}
          >
            {book.level || 'A1'}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(book.id);
            }}
            className="absolute top-2 left-2 p-1.5 bg-black/45 backdrop-blur-md hover:bg-black/60 text-[#F59E0B] rounded-xl border border-white/20 transition-all cursor-pointer shadow-sm scale-95 active:scale-90"
            title={book.isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          >
            <Star className={`w-3.5 h-3.5 ${book.isFavorited ? 'fill-[#F59E0B]' : ''}`} />
          </button>
          {book.percentageCompleted === 100 && (
            <div className="absolute inset-x-0 bottom-0 bg-[#4ECDC4] text-[#2D3436] py-1 text-center font-bold text-[10px] tracking-wider flex items-center justify-center gap-1 shadow-sm">
              <span>TAMAMLANDI</span>
            </div>
          )}
        </div>
        <h4 className={`font-headline-lg text-[14px] font-semibold group-hover:text-[#FF6B6B] transition-colors leading-tight mb-0.5 truncate ${
          isDarkMode ? 'text-white' : 'text-gray-950'
        }`}>
          {book.title}
        </h4>
        {book.author && <p className="text-gray-455 dark:text-gray-400 text-[11px] truncate">{book.author}</p>}
        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#4ECDC4] font-bold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{book.totalPages || 0} Sayfa</span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`pb-32 max-w-[680px] mx-auto px-5 pt-6 transition-colors ${
      isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
    }`}>
      {focusedCategory ? (
        <div className="space-y-6">
          {/* Back button and Category title */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setFocusedCategory(null)}
              className={`flex items-center gap-1.5 text-xs font-bold font-headline-lg w-max px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'text-gray-300 border-gray-700 hover:bg-white/5 bg-[#1A1A1E]' 
                  : 'text-gray-600 border-gray-200 hover:bg-gray-50 bg-white shadow-3xs'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kitaplığa Geri Dön</span>
            </button>
            
            {/* Category header card with nice aesthetic gradient */}
            {(() => {
              const catData = [
                { id: 'All', name: 'Tüm Hikayeler', desc: 'Kütüphanedeki tüm eserleri tek bir çatı altında keşfedin.', gradient: 'from-[#FF6B6B] to-[#FFE66D]', text: 'text-white' },
                { id: 'classics_adventure', name: 'Dünya Klasikleri', desc: 'Klasik edebiyatın ölümsüz karakterleriyle dolu macera ve dram dünyası.', gradient: 'from-[#FF7F50] to-[#FF9F43]', text: 'text-white' },
                { id: 'kids_fables', name: 'Masallar & Çocuk', desc: 'Çocuk masalları ve her yaştan dil öğrenenler için eğitici, sihirli fabllar.', gradient: 'from-[#4ECDC4] to-[#55EFC4]', text: 'text-slate-900' },
                { id: 'horror_mystery', name: 'Korku & Gizem', desc: 'Karanlık ormanlar, gizemli şatolar ve merak uyandıran heyecan dolu öyküler.', gradient: 'from-[#a29bfe] to-[#74b9ff]', text: 'text-white' },
                { id: 'daily_conversations', name: 'Günlük Yaşam & Diyaloglar', desc: 'Gerçek yaşam senaryolarına dayalı pratik İngilizce diyaloglar ve kısa günlük anlatılar.', gradient: 'from-[#45AAF2] to-[#4B7BEC]', text: 'text-white' },
                { id: 'sci_fi', name: 'Bilim Kurgu', desc: 'Geleceğin teknolojileri, uzay seyahatleri, robotlar ve alternatif evrenler üzerine sürükleyici öyküler.', gradient: 'from-[#00cec9] to-[#0984e3]', text: 'text-white' },
                { id: 'detective', name: 'Polisiye & Gizem', desc: 'Esrarengiz ipuçları, dahi dedektifler ve gizemli olayların çözüldüğü sürükleyici polisiye öyküler.', gradient: 'from-[#2c3e50] to-[#2980b9]', text: 'text-white' }
              ].find(c => c.id === focusedCategory) || { id: 'All', name: 'Tüm Hikayeler', desc: 'Kütüphanedeki tüm eserler.', gradient: 'from-[#FF6B6B] to-[#FFE66D]', text: 'text-white' };
              
              return (
                <div className={`p-5 rounded-3xl bg-gradient-to-tr ${catData.gradient} ${catData.text} shadow-md`}>
                  <h2 className="font-headline-lg text-xl font-black tracking-tight">{catData.name}</h2>
                  <p className="text-[11px] font-semibold mt-1.5 opacity-90 leading-relaxed max-w-sm">{catData.desc}</p>
                </div>
              );
            })()}
          </div>

          {/* Level selector inside focused category */}
          <div className="flex flex-col gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider block px-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-455'
            }`}>
              Zorluk Seviyesi
            </span>
            <div className="flex flex-wrap gap-2">
              {['All', 'A1', 'A2', 'B1', 'B2', 'C1'].map((levelCode) => {
                const isSelected = selectedLevel === levelCode;
                const lvl = levelCode === 'All' ? 'Tüm Seviyeler' : `${levelCode} Seviyesi`;
                return (
                  <button
                    key={levelCode}
                    onClick={() => setSelectedLevel(levelCode)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 cursor-pointer border select-none ${
                      isSelected
                        ? levelCode === 'All'
                          ? 'bg-[#4ECDC4] border-[#4ECDC4] text-[#2D3436] shadow-md shadow-[#4ECDC4]/20 scale-[1.02]'
                          : 'scale-[1.02]'
                        : isDarkMode
                          ? 'bg-[#1E1E22] border-[#2A2A30] text-gray-400 hover:text-white hover:border-gray-500'
                          : 'bg-white border-gray-200 text-gray-600 hover:text-[#4ECDC4] hover:border-gray-300'
                    }`}
                    style={isSelected && levelCode !== 'All' ? {
                      backgroundColor: getLevelColor(levelCode),
                      borderColor: getLevelColor(levelCode),
                      color: '#ffffff',
                      boxShadow: `0 4px 12px ${hexToRgba(getLevelColor(levelCode), 0.25)}`
                    } : undefined}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Books grid for focused category */}
          {(() => {
            const categoryBooks = books.filter(b => {
              const matchesCat = focusedCategory === 'All' ? true : getBookCategory(b.id) === focusedCategory;
              const matchesLvl = selectedLevel === 'All' ? true : b.level === selectedLevel;
              const matchesSearch = searchQuery.trim().length > 0
                ? b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase())
                : true;
              return matchesCat && matchesLvl && matchesSearch;
            });
            
            return categoryBooks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {categoryBooks.map((book, idx) => renderBookCard(book, idx, false))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-400/20 rounded-[28px]">
                <span role="img" aria-label="empty" className="text-3xl block mb-2">📚</span>
                <p className="text-xs text-gray-400 font-bold font-headline-lg">Bu filtre kombinasyonunda kitap bulunamadı.</p>
              </div>
            );
          })()}
        </div>
      ) : (
        <>
          {/* Section: Currently Reading */}
      {currentlyReading && (
        <section className="mb-10">
          <h2 className={`font-headline-lg text-lg font-bold mb-4 tracking-tight transition-colors ${
            isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
          }`}>
            Şu Anda Okunan
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => onSelectBook(currentlyReading)}
            className={`rounded-3xl p-5 border flex flex-col sm:flex-row gap-5 transition-all duration-300 cursor-pointer ${
              isDarkMode 
                ? 'bg-[#1A1A1E] border-[#2A2A30] hover:border-[#FF6B6B]/45 shadow-[0_12px_24px_rgba(0,0,0,0.25)]' 
                : 'bg-white border-[#FFE66D] shadow-[0_12px_24px_-10px_rgba(255,107,107,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(255,107,107,0.08)] hover:border-[#FF6B6B]/50'
            }`}
          >
            {/* Book Cover */}
            <div className="w-full sm:w-28 space-y-2 aspect-[3/4] rounded-2xl overflow-hidden shadow-sm relative group-hover:shadow-md transition-shadow shrink-0">
              <img
                alt={currentlyReading.title}
                className={`w-full h-full object-cover ${
                  currentlyReading.isCompleted ? 'grayscale opacity-60' : ''
                }`}
                src={currentlyReading.coverUrl}
              />
              <div 
                className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-xs"
                style={{ backgroundColor: getLevelColor(currentlyReading.level) }}
              >
                {currentlyReading.level}
              </div>
              {/* Star Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(currentlyReading.id);
                }}
                className="absolute top-2 left-2 p-1.5 bg-black/45 backdrop-blur-md hover:bg-black/60 text-[#F59E0B] rounded-xl border border-white/20 transition-all cursor-pointer shadow-sm scale-95 active:scale-90"
                title={currentlyReading.isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              >
                <Star className={`w-3.5 h-3.5 ${currentlyReading.isFavorited ? 'fill-[#F59E0B]' : ''}`} />
              </button>
            </div>

            {/* Book Details */}
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-[#4ECDC4]/10 text-[#4ECDC4] border border-[#4ECDC4]/20 rounded-full text-[11px] font-semibold tracking-wide mb-2.5">
                  {currentlyReading.levelName}
                </span>
                <h3 className={`font-headline-lg text-xl font-bold leading-tight mb-1 transition-colors ${
                  isDarkMode ? 'text-white' : 'text-[#2D3436]'
                }`}>
                  {currentlyReading.title}
                </h3>
                {currentlyReading.author && (
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {currentlyReading.author}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mt-2">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-bold text-[#4ECDC4]">
                      %{currentlyReading.percentageCompleted} tamamlandı
                    </span>
                    <span className={`italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {currentlyReading.percentageCompleted === 100 
                        ? 'Bitirildi' 
                        : `Sayfa ${currentlyReading.currentPage || 1} / ${currentlyReading.totalPages || 0}`}
                    </span>
                  </div>
                  <div className={`w-full h-2.5 rounded-full overflow-hidden border ${
                    isDarkMode ? 'bg-[#2A2A30] border-[#343A40]/50' : 'bg-gray-100 border-[#FFE66D]/30'
                  }`}>
                    <div
                      className="bg-[#4ECDC4] h-full rounded-full transition-all duration-300"
                      style={{ width: `${currentlyReading.percentageCompleted}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5 mt-5 w-full sm:w-max">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBook(currentlyReading);
                  }}
                  className="flex-grow sm:flex-grow-0 px-6 py-2.5 bg-[#FF6B6B] text-white rounded-xl text-xs font-bold hover:bg-[#e05a5a] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-[#FF6B6B]/20 cursor-pointer font-headline-lg"
                >
                  <span>Devam Et</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {onRemoveFromReading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmRemoveBookId(currentlyReading.id);
                    }}
                    className={`px-3.5 py-2.5 border rounded-xl transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                      isDarkMode
                        ? 'border-gray-800 text-gray-400 hover:bg-gray-850 hover:text-red-400 bg-[#121214]'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-red-500 bg-white'
                    }`}
                    title="Okunanlar listesinden çıkar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Secondary Currently Reading Books: 3-column grid */}
          {secondaryCurrentlyReading.length > 0 && (
            <div className="mt-8">
              <h3 className={`text-[10px] font-extrabold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Diğer Okunan Kitaplar ({secondaryCurrentlyReading.length})
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {secondaryCurrentlyReading.map((book, idx) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex flex-col items-center cursor-pointer group relative"
                  >
                    {/* Cover */}
                    <div
                      onClick={() => onSelectBook(book)}
                      className={`w-full rounded-xl overflow-hidden shadow-sm relative border transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.03] ${
                        isDarkMode
                          ? 'bg-[#1A1A1E] border-[#2A2A30] group-hover:border-[#FF6B6B]/40 shadow-black/30'
                          : 'bg-white border-[#FFE66D]/60 group-hover:border-[#FF6B6B]/40 shadow-[#FF6B6B]/5'
                      }`}
                      style={{ aspectRatio: '2/3' }}
                    >
                      <img
                        alt={book.title}
                        className="w-full h-full object-cover"
                        src={book.coverUrl}
                        loading="lazy"
                      />
                      {/* Level badge */}
                      <div 
                        className="absolute top-1 right-1 backdrop-blur-xs rounded text-white font-bold leading-none select-none" 
                        style={{ padding: '2px 4px', fontSize: '8px', backgroundColor: getLevelColor(book.level) }}
                      >
                        {book.level || 'A1'}
                      </div>
                      {/* Progress bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                        <div className="h-full bg-[#4ECDC4] transition-all duration-500" style={{ width: `${book.percentageCompleted}%` }} />
                      </div>
                      {/* Remove button */}
                      {onRemoveFromReading && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmRemoveBookId(book.id); }}
                          className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs rounded-full p-1 text-white hover:bg-red-500/80 transition-colors"
                          title="Okunanlar listesinden çıkar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      )}
                    </div>
                    {/* Title */}
                    <h4
                      className={`font-semibold text-center mt-1.5 leading-tight line-clamp-2 w-full text-[10px] group-hover:text-[#FF6B6B] transition-colors ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-800'
                      }`}
                    >
                      {book.title}
                    </h4>
                    {/* Progress % */}
                    <span className="text-[#4ECDC4] font-black leading-none mt-0.5 text-[9px]">
                      %{book.percentageCompleted}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm Remove Dialog */}
          {confirmRemoveBookId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
              <div className={`w-full max-w-xs rounded-2xl shadow-2xl p-6 ${
                isDarkMode ? 'bg-[#1A1A1E] text-white' : 'bg-white text-gray-800'
              }`}>
                <p className="text-sm font-semibold text-center mb-4 leading-relaxed">
                  Bu kitabı okunanlar listenizden çıkarmak istediğinize emin misiniz?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmRemoveBookId(null)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${
                      isDarkMode ? 'bg-[#2A2A30] text-gray-300 hover:bg-[#343A40]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={() => {
                      if (onRemoveFromReading) onRemoveFromReading(confirmRemoveBookId);
                      setConfirmRemoveBookId(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B6B] text-white hover:bg-[#FF5252]"
                  >
                    Evet, Çıkar
                  </button>
                </div>
              </div>
            </div>
          )}

        </section>
      )}

      {/* Section: My Library Grid */}
      <section className="mb-10">
        {/* Search Engine Bar */}
        <div className="relative mb-6">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Öykü veya yazar ara..."
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                setTimeout(() => {
                  setShowSuggestions(false);
                }, 180);
              }}
              onChange={(e) => {
                if (onSearchQueryChange) {
                  onSearchQueryChange(e.target.value);
                }
                setShowSuggestions(true);
              }}
              className={`pl-11 pr-10 h-12 w-full rounded-2xl border-2 text-xs font-semibold focus:outline-none transition-all duration-200 ${
                isDarkMode
                  ? 'bg-[#1A1A1E] border-[#2A2A30] text-white placeholder-gray-500 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20'
                  : 'bg-white border-[#FFE66D]/80 text-[#2D3436] placeholder-gray-400 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/15'
              }`}
            />
            <Search className={`absolute left-4 w-4 h-4 transition-colors ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            {searchQuery && (
              <button
                onClick={() => {
                  if (onSearchQueryChange) {
                    onSearchQueryChange('');
                  }
                }}
                className="absolute right-4 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors"
                title="Aramayı Temizle"
              >
                <X className={`w-3.5 h-3.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && searchQuery.trim().length >= 2 && suggestions.length > 0 && (
            <div className={`absolute left-0 right-0 top-[52px] rounded-2xl border shadow-2xl z-50 py-2.5 overflow-hidden backdrop-blur-md transition-all ${
              isDarkMode 
                ? 'bg-[#1A1A1E]/95 border-[#2A2A30] text-white shadow-black/60' 
                : 'bg-white/95 border-[#FFE66D] text-[#2D3436] shadow-gray-200/80'
            }`}>
              <div className="px-4 pb-2 pt-1 text-[9px] font-extrabold uppercase tracking-wider text-[#FF6B6B]">
                HIZLI ÖNERİLER
              </div>
              {suggestions.map((book) => (
                <button
                  key={book.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (onSearchQueryChange) {
                      onSearchQueryChange(book.title);
                    }
                    setShowSuggestions(false);
                    onSelectBook(book);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                    isDarkMode ? 'hover:bg-white/5' : 'hover:bg-[#FF6B6B]/5'
                  }`}
                >
                  <img src={book.coverUrl} className="w-6 h-8 rounded-md object-cover shrink-0 shadow-xs" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold">{book.title}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {book.level || 'A1'}
                      {book.author ? ` • ${book.author}` : ''}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-5">
          <h2 className={`font-headline-lg text-lg font-bold tracking-tight transition-colors ${
            isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
          }`}>
            Kitaplığım
          </h2>
          <span className={`text-xs font-bold tracking-wider font-headline-lg ${
            isDarkMode ? 'text-gray-400' : 'text-gray-455'
          }`}>
            {libraryCountLabel}
          </span>
        </div>

        {/* Kategoriler (Category) Filter Stack */}
        <div className="mb-5">
          <span className={`text-[10px] font-bold uppercase tracking-wider block mb-2 px-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-455'
          }`}>
            Kategoriler (Bölümler)
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'All', name: 'Tüm Hikayeler', icon: <TumuIcon /> },
              { id: 'classics_adventure', name: 'Dünya Klasikleri', icon: <CompassIcon /> },
              { id: 'kids_fables', name: 'Masallar & Çocuk', icon: <WandIcon /> },
              { id: 'horror_mystery', name: 'Korku & Gizem', icon: <SpookyIcon /> },
              { id: 'daily_conversations', name: 'Günlük Yaşam & Diyaloglar', icon: <SpeechIcon /> },
              { id: 'sci_fi', name: 'Bilim Kurgu', icon: <SciFiIcon /> },
              { id: 'detective', name: 'Polisiye & Gizem', icon: <DetectiveIcon /> }
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const isAll = cat.id === 'All';
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  onDoubleClick={() => setFocusedCategory(cat.id)}
                  onTouchStart={() => handleCategoryTap(cat.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all duration-205 cursor-pointer select-none flex items-center gap-3 ${
                    isAll ? 'col-span-2' : ''
                  } ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-[#FF6B6B]/15 border-[#FF6B6B]/40 text-white shadow-md'
                        : 'bg-[#FF6B6B]/8 border-[#FF6B6B]/35 text-gray-900 shadow-sm'
                      : isDarkMode
                        ? 'bg-[#1A1A1E] border-[#2A2A30] text-gray-300 hover:border-gray-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 shadow-3xs'
                  }`}
                  title={`${cat.name} (Çift tıklayarak sayfasına gidin)`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-all ${
                    isSelected 
                      ? isDarkMode
                        ? 'bg-[#221c20] border-[#FF6B6B]/40 shadow-xs'
                        : 'bg-white border-[#FF6B6B]/25 shadow-xs' 
                      : isDarkMode
                        ? 'bg-[#151518] border-gray-800/80'
                        : 'bg-gray-50 border-gray-100'
                  }`}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="font-extrabold text-[11.5px] leading-tight tracking-tight font-headline-lg flex items-center justify-between">
                      <span className="truncate">{cat.name}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] shrink-0 ml-1" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CEFR Level Filtering Tabs Bar */}
        <div className="mb-6">
          <span className={`text-[10px] font-bold uppercase tracking-wider block mb-2 px-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-455'
          }`}>
            Zorluk Seviyeleri
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
            {['Tümü', 'A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => {
              const isSelected = lvl === 'Tümü' ? selectedLevel === 'All' : selectedLevel === lvl;
              const levelCode = lvl === 'Tümü' ? 'All' : lvl;
              
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(levelCode)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border select-none ${
                    isSelected
                      ? levelCode === 'All'
                        ? 'bg-[#4ECDC4] border-[#4ECDC4] text-[#2D3436] shadow-md shadow-[#4ECDC4]/20 scale-[1.02]'
                        : 'scale-[1.02]'
                      : isDarkMode
                        ? 'bg-[#1E1E22] border-[#2A2A30] text-gray-400 hover:text-white hover:border-gray-500'
                        : 'bg-white border-gray-200 text-gray-600 hover:text-[#4ECDC4] hover:border-gray-300'
                  }`}
                  style={isSelected && levelCode !== 'All' ? {
                    backgroundColor: getLevelColor(levelCode),
                    borderColor: getLevelColor(levelCode),
                    color: '#ffffff',
                    boxShadow: `0 4px 12px ${hexToRgba(getLevelColor(levelCode), 0.25)}`
                  } : undefined}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {filteredBooks.map((book, idx) => renderBookCard(book, idx, false))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-400/20 rounded-[28px]">
            <span role="img" aria-label="empty" className="text-3xl block mb-2">📚</span>
            <p className="text-xs text-gray-400 font-bold font-headline-lg">Bu filtre kombinasyonunda kitap bulunamadı.</p>
          </div>
        )}
      </section>
      </>
      )}

      {/* Aggregate Stats Bento */}
      <section className="grid grid-cols-2 gap-4 mb-4">
        <div className={`border-2 p-5 rounded-[24px] transition-all ${
          isDarkMode 
            ? 'bg-[#1A1A1E] border-[#2A2A30] shadow-[0_8px_16px_rgba(0,0,0,0.15)]' 
            : 'bg-white border-[#FFE66D] shadow-[0_8px_16px_rgba(255,107,107,0.02)]'
        }`}>
          <BookMarked className="w-6 h-6 mb-2.5 text-[#FF6B6B]" />
          <p className={`text-xs font-bold tracking-wider font-headline-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            OKUNAN KELİME
          </p>
          <h5 className={`text-2xl font-bold font-headline-lg tracking-tight mt-0.5 transition-colors ${
            isDarkMode ? 'text-white' : 'text-[#2D3436]'
          }`}>
            {totalWordsRead.toLocaleString('tr-TR')}
          </h5>
        </div>

        <div className={`border-2 p-5 rounded-[24px] transition-all ${
          isDarkMode 
            ? 'bg-[#1A1A1E] border-[#2A2A30] shadow-[0_8px_16px_rgba(0,0,0,0.15)]' 
            : 'bg-white border-[#FFE66D] shadow-[0_8px_16px_rgba(78,205,196,0.02)]'
        }`}>
          <Timer className="w-6 h-6 mb-2.5 text-[#4ECDC4]" />
          <p className={`text-xs font-bold tracking-wider font-headline-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            OKUMA SÜRESİ
          </p>
          <h5 className={`text-2xl font-bold font-headline-lg tracking-tight mt-0.5 transition-colors ${
            isDarkMode ? 'text-white' : 'text-[#2D3436]'
          }`}>
            {totalReadHours > 0 ? `${totalReadHours} sa ` : ''}{remainingMins} dk
          </h5>
        </div>
      </section>
    </div>
  );
}
