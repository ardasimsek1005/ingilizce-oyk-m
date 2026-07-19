import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BookOpen, Timer, Plus, ArrowRight, ExternalLink, ChevronRight, X, Sparkles, BookMarked, Star, Skull, Compass, Search, Trash2, ArrowLeft, Crown, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, getLevelColor, hexToRgba } from '../types';
import { SUPPORTED_LANGUAGES, LanguageCode, t, getLocalizedUsername, getLocalizedLevelName } from '../i18n';



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

const HistoryIcon = () => (
  <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="historyGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#b29f70" />
        <stop offset="100%" stopColor="#594a2b" />
      </linearGradient>
    </defs>
    <path d="M4 12 L16 4 L28 12 Z" fill="url(#historyGrad)" />
    <rect x="5" y="12" width="22" height="2" fill="url(#historyGrad)" />
    <rect x="7" y="15" width="2.5" height="9" fill="url(#historyGrad)" />
    <rect x="12" y="15" width="2.5" height="9" fill="url(#historyGrad)" />
    <rect x="17" y="15" width="2.5" height="9" fill="url(#historyGrad)" />
    <rect x="22" y="15" width="2.5" height="9" fill="url(#historyGrad)" />
    <rect x="4" y="24" width="24" height="2" fill="url(#historyGrad)" />
    <rect x="2" y="26" width="28" height="2" fill="url(#historyGrad)" />
  </svg>
);

const MythologyIcon = () => (
  <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="mythGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFE66D" />
        <stop offset="100%" stopColor="#FF9F43" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="13" fill="url(#mythGrad)" />
    <path d="M17 6l-6 10h5l-3 10 11-12h-5z" fill="#FFFFFF" />
  </svg>
);

const TravelIcon = () => (
  <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="travelGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#45AAF2" />
        <stop offset="100%" stopColor="#2D98DA" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="13" fill="url(#travelGrad)" />
    <circle cx="16" cy="16" r="8" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
    <path d="M16 8v16M8 16h16M11.5 10.5a11 11 0 000 11M20.5 10.5a11 11 0 010 11" stroke="#FFFFFF" strokeWidth="1" fill="none" />
  </svg>
);

const NatureSpaceIcon = () => (
  <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="natureGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#10ac84" />
        <stop offset="100%" stopColor="#01a3a4" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="13" fill="url(#natureGrad)" />
    <circle cx="16" cy="15" r="5" fill="#FFFFFF" />
    <path d="M9 18c3-1.5 7.5-3.5 12-3.5s5 1 5.5 1.8-3 3-8.5 3-7-.5-9-1.3z" stroke="#FFE66D" strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="10" r="0.8" fill="#FFE66D" />
    <circle cx="21" cy="20" r="0.6" fill="#FFFFFF" />
  </svg>
);

const getBookCategory = (bookId: string): 'horror_mystery' | 'kids_fables' | 'classics_adventure' | 'daily_conversations' | 'sci_fi' | 'detective' | 'history' | 'mythology' | 'travel_culture' | 'nature_space' => {
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
  if (lowerId.startsWith('mythology_') || lowerId.includes('mythology_')) {
    return 'mythology';
  }
  if (lowerId.startsWith('travel_') || lowerId.includes('travel_')) {
    return 'travel_culture';
  }
  if (lowerId.startsWith('nature_') || lowerId.includes('nature_')) {
    return 'nature_space';
  }
  if (lowerId.startsWith('daily_') || lowerId.includes('daily_')) {
    return 'daily_conversations';
  }
  if (lowerId.startsWith('scifi_') || lowerId.includes('scifi_')) {
    return 'sci_fi';
  }
  if (lowerId.startsWith('detective_') || lowerId.includes('detective_')) {
    return 'detective';
  }
  if (lowerId.startsWith('history_') || lowerId.includes('history_')) {
    return 'history';
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
  isPremium: boolean;
  onGoToPremium: () => void;
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
  nativeLanguage: LanguageCode;
  userAvatar: string;
  userName: string;
  onUpdateLanguage: (lang: LanguageCode) => void;
  onTabChange?: (tab: string) => void;
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
  nativeLanguage,
  userAvatar,
  userName,
  onUpdateLanguage,
  onTabChange,
  isPremium,
  onGoToPremium,
}: LibraryTabProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [shuffleSeed] = useState(() => Math.random());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [confirmRemoveBookId, setConfirmRemoveBookId] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
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

    // Helper to get stable hash weight per session
    const getBookWeight = (bookId: string) => {
      let hash = 0;
      const str = bookId + shuffleSeed.toString();
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash % 10000) / 10000;
    };

    return [...list].sort((a, b) => {
      // 1. Sort by premium status (non-premium / free books first)
      const premA = !!a.isPremium;
      const premB = !!b.isPremium;
      if (premA !== premB) {
        return premA ? 1 : -1;
      }

      // 2. Sort by CEFR level (A1 -> A2 -> B1 -> B2 -> C1)
      const orderA = levelOrder[a.level] || 99;
      const orderB = levelOrder[b.level] || 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // 3. Shuffle / Sort by stable random weight
      const weightA = getBookWeight(a.id);
      const weightB = getBookWeight(b.id);
      return weightA - weightB;
    });
  }, [books, selectedLevel, selectedCategory, searchQuery, shuffleSeed, isPremium]);

  const libraryCountLabel = useMemo(() => {
    const count = filteredBooks.length;
    if (selectedCategory === 'All') {
      return t('library_total_stories_all', nativeLanguage).replace('{count}', String(count));
    }
    let catKey = '';
    if (selectedCategory === 'horror_mystery') catKey = 'cat_horror';
    else if (selectedCategory === 'kids_fables') catKey = 'cat_kids';
    else if (selectedCategory === 'classics_adventure') catKey = 'cat_classics';
    else if (selectedCategory === 'daily_conversations') catKey = 'cat_daily';
    else if (selectedCategory === 'sci_fi') catKey = 'cat_scifi';
    else if (selectedCategory === 'detective') catKey = 'cat_detective';
    else if (selectedCategory === 'history') catKey = 'cat_history';
    else if (selectedCategory === 'mythology') catKey = 'cat_mythology';
    else if (selectedCategory === 'travel_culture') catKey = 'cat_travel';
    else if (selectedCategory === 'nature_space') catKey = 'cat_nature';

    const catName = catKey ? t(catKey, nativeLanguage) : selectedCategory;
    return t('library_total_stories_category', nativeLanguage)
      .replace('{count}', String(count))
      .replace('{category}', catName);
  }, [filteredBooks.length, selectedCategory, nativeLanguage]);


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
          if (book.isPremium && !isPremium) {
            setShowPremiumModal(true);
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
            style={{ 
              objectPosition: book.coverPosition || 'center 28%',
              filter: (book.isPremium && !isPremium) ? 'grayscale(55%) brightness(0.92)' : undefined
            }}
            src={book.coverUrl}
            loading="lazy"
          />
          <div 
            className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs flex items-center gap-1"
            style={{ backgroundColor: getLevelColor(book.level) }}
          >
            <span>{book.level || 'A1'}</span>
          </div>
          {book.isPremium && !isPremium && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/55 backdrop-blur-[2px] border border-amber-500/35 px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-1.5 transform scale-100 group-hover:scale-105 transition-transform duration-300">
                <Crown className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
                <span className="text-white text-[11px] font-black tracking-wider uppercase font-headline-lg">PREMIUM</span>
              </div>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(book.id);
            }}
            className="absolute top-2 left-2 p-1.5 bg-black/45 backdrop-blur-md hover:bg-black/60 text-[#F59E0B] rounded-xl border border-white/20 transition-all cursor-pointer shadow-sm scale-95 active:scale-90"
            title={book.isFavorited ? t('fav_remove_tooltip', nativeLanguage) : t('fav_add_tooltip', nativeLanguage)}
          >
            <Star className={`w-3.5 h-3.5 ${book.isFavorited ? 'fill-[#F59E0B]' : ''}`} />
          </button>
          {book.percentageCompleted === 100 && (
            <div className="absolute inset-x-0 bottom-0 bg-[#4ECDC4] text-[#2D3436] py-1 text-center font-bold text-[10px] tracking-wider flex items-center justify-center gap-1 shadow-sm">
              <span>{t('completed_status', nativeLanguage)}</span>
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
          <span>{t('pages_count', nativeLanguage).replace('{count}', String(book.totalPages || 0))}</span>
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
              <span>{t('back_to_library', nativeLanguage)}</span>
            </button>
            
            {/* Category header card with nice aesthetic gradient */}
            {(() => {
              const catData = [
                { id: 'All', name: t('cat_all', nativeLanguage), desc: t('cat_all_desc', nativeLanguage), gradient: 'from-[#FF6B6B] to-[#FFE66D]', text: 'text-white' },
                { id: 'classics_adventure', name: t('cat_classics', nativeLanguage), desc: t('cat_classics_desc', nativeLanguage), gradient: 'from-[#FF7F50] to-[#FF9F43]', text: 'text-white' },
                { id: 'kids_fables', name: t('cat_kids', nativeLanguage), desc: t('cat_kids_desc', nativeLanguage), gradient: 'from-[#4ECDC4] to-[#55EFC4]', text: 'text-slate-900' },
                { id: 'horror_mystery', name: t('cat_horror', nativeLanguage), desc: t('cat_horror_desc', nativeLanguage), gradient: 'from-[#a29bfe] to-[#74b9ff]', text: 'text-white' },
                { id: 'daily_conversations', name: t('cat_daily', nativeLanguage), desc: t('cat_daily_desc', nativeLanguage), gradient: 'from-[#45AAF2] to-[#4B7BEC]', text: 'text-white' },
                { id: 'sci_fi', name: t('cat_scifi', nativeLanguage), desc: t('cat_scifi_desc', nativeLanguage), gradient: 'from-[#00cec9] to-[#0984e3]', text: 'text-white' },
                { id: 'detective', name: t('cat_detective', nativeLanguage), desc: t('cat_detective_desc', nativeLanguage), gradient: 'from-[#2c3e50] to-[#2980b9]', text: 'text-white' },
                { id: 'history', name: t('cat_history', nativeLanguage), desc: t('cat_history_desc', nativeLanguage), gradient: 'from-[#b29f70] to-[#594a2b]', text: 'text-white' },
                { id: 'mythology', name: t('cat_mythology', nativeLanguage), desc: t('cat_mythology_desc', nativeLanguage), gradient: 'from-[#FFE66D] to-[#FF9F43]', text: 'text-slate-900' },
                { id: 'travel_culture', name: t('cat_travel', nativeLanguage), desc: t('cat_travel_desc', nativeLanguage), gradient: 'from-[#FF6B6B] to-[#FF8E53]', text: 'text-white' },
                { id: 'nature_space', name: t('cat_nature', nativeLanguage), desc: t('cat_nature_desc', nativeLanguage), gradient: 'from-[#10ac84] to-[#01a3a4]', text: 'text-white' }
              ].find(c => c.id === focusedCategory) || { id: 'All', name: t('cat_all', nativeLanguage), desc: t('cat_all_desc', nativeLanguage), gradient: 'from-[#FF6B6B] to-[#FFE66D]', text: 'text-white' };
              
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
              {t('difficulty_label', nativeLanguage)}
            </span>
            <div className="flex flex-wrap gap-2">
              {['All', 'A1', 'A2', 'B1', 'B2', 'C1'].map((levelCode) => {
                const isSelected = selectedLevel === levelCode;
                const lvl = levelCode === 'All' ? t('all_levels', nativeLanguage) : t('dict_level_label', nativeLanguage).replace('{level}', levelCode);
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
                <p className="text-xs text-gray-400 font-bold font-headline-lg">{t('no_books_found_filter', nativeLanguage)}</p>
              </div>
            );
          })()}
        </div>
      ) : (
        <>
          {/* User Profile Welcome & Language quick-settings card */}
          <div className={`rounded-3xl p-5 mb-8 border flex items-center justify-between gap-4 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#1A1A1E] border-[#2A2A30] shadow-[0_12px_24px_rgba(0,0,0,0.25)]' 
              : 'bg-white border-[#FFE66D] shadow-[0_12px_24px_-10px_rgba(255,107,107,0.05)]'
          }`}>
            <div className="flex items-center gap-4 text-left">
              {/* Profile Picture */}
              <div className="shrink-0">
                <div 
                  onClick={() => onTabChange && onTabChange('profile')}
                  className="w-14 h-14 rounded-full overflow-hidden border-3 border-[#FFE66D] cursor-pointer hover:scale-105 transition-transform shadow-xs"
                  title="Profilime Git"
                >
                  <img
                    src={userAvatar || 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80'}
                    alt={getLocalizedUsername(userName, nativeLanguage) || 'User'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Welcome text */}
              <div className="text-left">
                <h2 className={`font-headline-lg text-base font-black leading-tight ${
                  isDarkMode ? 'text-white' : 'text-[#2D3436]'
                }`}>
                  {t('welcome_back', nativeLanguage)} {getLocalizedUsername(userName, nativeLanguage) || t('default_reader_name', nativeLanguage)}!
                </h2>
                <p className={`text-[11px] mt-0.5 font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('ready_to_read', nativeLanguage)}
                </p>
              </div>
            </div>
          </div>

          {/* Section: Currently Reading */}
      {currentlyReading && (
        <section className="mb-10">
          <h2 className={`font-headline-lg text-lg font-bold mb-4 tracking-tight transition-colors ${
            isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
          }`}>
            {t('currently_reading', nativeLanguage)}
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
                style={{ objectPosition: currentlyReading.coverPosition || 'center 28%' }}
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
                title={currentlyReading.isFavorited ? t('fav_remove_tooltip', nativeLanguage) : t('fav_add_tooltip', nativeLanguage)}
              >
                <Star className={`w-3.5 h-3.5 ${currentlyReading.isFavorited ? 'fill-[#F59E0B]' : ''}`} />
              </button>
            </div>

            {/* Book Details */}
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-[#4ECDC4]/10 text-[#4ECDC4] border border-[#4ECDC4]/20 rounded-full text-[11px] font-semibold tracking-wide mb-2.5">
                  {getLocalizedLevelName(currentlyReading.level, currentlyReading.levelName, nativeLanguage)}
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
                      {t('percentage_completed', nativeLanguage).replace('{percent}', String(currentlyReading.percentageCompleted))}
                    </span>
                    <span className={`italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {currentlyReading.percentageCompleted === 100 
                        ? t('completed_status', nativeLanguage) 
                        : `${t('page_label', nativeLanguage)} ${currentlyReading.currentPage || 1} / ${currentlyReading.totalPages || 0}`}
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
                  <span>{t('btn_continue', nativeLanguage)}</span>
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
                    title={t('library_remove_reading_list', nativeLanguage)}
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
                {t('library_other_reading_books', nativeLanguage).replace('{count}', String(secondaryCurrentlyReading.length))}
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
                        style={{ objectPosition: book.coverPosition || 'center 28%' }}
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
                          title={t('remove_from_reading_tooltip', nativeLanguage)}
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
                  {t('confirm_remove_book_desc', nativeLanguage)}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmRemoveBookId(null)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${
                      isDarkMode ? 'bg-[#2A2A30] text-gray-300 hover:bg-[#343A40]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('btn_cancel', nativeLanguage)}
                  </button>
                  <button
                    onClick={() => {
                      if (onRemoveFromReading) onRemoveFromReading(confirmRemoveBookId);
                      setConfirmRemoveBookId(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B6B] text-white hover:bg-[#FF5252]"
                  >
                    {t('btn_yes_remove', nativeLanguage)}
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
              placeholder={t('search_placeholder', nativeLanguage)}
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
                title={t('clear_search_tooltip', nativeLanguage)}
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
                {t('library_quick_recommendations', nativeLanguage)}
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
                  <img src={book.coverUrl} className="w-6 h-8 rounded-md object-cover shrink-0 shadow-xs" style={{ objectPosition: book.coverPosition || 'center 28%' }} alt="" />
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

        <div className="flex justify-between items-start mb-5 gap-4">
          <h2 className={`font-headline-lg text-lg font-bold tracking-tight transition-colors shrink-0 ${
            isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
          }`}>
            {t('tab_library', nativeLanguage)}
          </h2>
          <span className={`text-xs font-bold tracking-wider font-headline-lg text-right leading-tight max-w-[65%] break-words ${
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
            {t('categories_title', nativeLanguage)}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'All', name: t('cat_all', nativeLanguage), icon: <TumuIcon /> },
              { id: 'classics_adventure', name: t('cat_classics', nativeLanguage), icon: <CompassIcon /> },
              { id: 'kids_fables', name: t('cat_kids', nativeLanguage), icon: <WandIcon /> },
              { id: 'horror_mystery', name: t('cat_horror', nativeLanguage), icon: <SpookyIcon /> },
              { id: 'daily_conversations', name: t('cat_daily', nativeLanguage), icon: <SpeechIcon /> },
              { id: 'sci_fi', name: t('cat_scifi', nativeLanguage), icon: <SciFiIcon /> },
              { id: 'detective', name: t('cat_detective', nativeLanguage), icon: <DetectiveIcon /> },
              { id: 'history', name: t('cat_history', nativeLanguage), icon: <HistoryIcon /> },
              { id: 'mythology', name: t('cat_mythology', nativeLanguage), icon: <MythologyIcon /> },
              { id: 'travel_culture', name: t('cat_travel', nativeLanguage), icon: <TravelIcon /> },
              { id: 'nature_space', name: t('cat_nature', nativeLanguage), icon: <NatureSpaceIcon /> }
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const isAll = cat.id === 'All';
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryTap(cat.id)}
                  onDoubleClick={() => setFocusedCategory(cat.id)}
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
                  title={`${cat.name} ${t('library_double_click_category', nativeLanguage)}`}
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
            {t('difficulty_label', nativeLanguage)}
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
            {['All', 'A1', 'A2', 'B1', 'B2', 'C1'].map((levelCode) => {
              const isSelected = selectedLevel === levelCode;
              
              return (
                <button
                  key={levelCode}
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
                  {levelCode === 'All' ? t('filter_all_levels', nativeLanguage) : levelCode}
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
            <p className="text-xs text-gray-400 font-bold font-headline-lg">{t('no_books_found_filter', nativeLanguage)}</p>
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
            {t('stats_words_read', nativeLanguage)}
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
            {t('stats_reading_time', nativeLanguage)}
          </p>
          <h5 className={`text-2xl font-bold font-headline-lg tracking-tight mt-0.5 transition-colors ${
            isDarkMode ? 'text-white' : 'text-[#2D3436]'
          }`}>
            {totalReadHours > 0 ? `${totalReadHours} ${t('unit_hours', nativeLanguage)} ` : ''}{remainingMins} {t('unit_minutes', nativeLanguage)}
          </h5>
        </div>
      </section>

      {/* Elegant Premium Invite Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#0A0F1A]/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setShowPremiumModal(false)}
          />
          
          {/* Modal Content */}
          <div 
            className="relative w-full max-w-sm bg-gradient-to-b from-[#1E293B]/90 to-[#0F172A]/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 text-center shadow-2xl scale-100 transition-all duration-300 overflow-hidden"
          >
            {/* Decorative Golden Light/Glow */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Premium Crown Icon Header */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 animate-bounce">
              <Crown className="w-8 h-8 text-white fill-white" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
              Premium İçerik 👑
            </h3>

            {/* Description */}
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-6 px-2">
              700+ hikayeye ulaşmak için lütfen premium alın.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setShowPremiumModal(false);
                  onGoToPremium();
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 active:scale-98 transition-all duration-200 cursor-pointer"
              >
                Premium Al
              </button>
              <button
                onClick={() => setShowPremiumModal(false)}
                className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm rounded-xl active:scale-98 transition-all duration-200 cursor-pointer"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
