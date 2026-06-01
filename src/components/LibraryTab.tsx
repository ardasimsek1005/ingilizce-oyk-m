import React, { useState, useMemo } from 'react';
import { BookOpen, Timer, Plus, ArrowRight, ExternalLink, ChevronRight, X, Sparkles, BookMarked, Star, Skull, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Book } from '../types';


const TumuIcon = () => (
  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="14" width="16" height="4" rx="1" fill="url(#bookGrad1)" />
    <path d="M19 14h2v4h-2z" fill="#D2D6DC" />
    <rect x="5" y="9" width="16" height="4" rx="1" fill="url(#bookGrad2)" />
    <path d="M21 9h2v4h-2z" fill="#D2D6DC" />
    <rect x="4" y="4" width="15" height="4" rx="1" fill="url(#bookGrad3)" />
    <path d="M19 4h2v4h-2z" fill="#D2D6DC" />
    <defs>
      <linearGradient id="bookGrad1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="100%" stopColor="#EE5253" />
      </linearGradient>
      <linearGradient id="bookGrad2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4ECDC4" />
        <stop offset="100%" stopColor="#1DD1A1" />
      </linearGradient>
      <linearGradient id="bookGrad3" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFE66D" />
        <stop offset="100%" stopColor="#FF9F43" />
      </linearGradient>
    </defs>
  </svg>
);

const SpookyIcon = () => (
  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8 2 5 5 5 9v9c0 .6.4 1 1 1s1-.4 1-1v-2h10v2c0 .6.4 1 1 1s1-.4 1-1V9c0-4-3-7-7-7z" fill="url(#ghostGrad)" />
    <circle cx="9" cy="8" r="1.5" fill="#1A1A1E" />
    <circle cx="15" cy="8" r="1.5" fill="#1A1A1E" />
    <path d="M11 11.5c.5.5 1.5.5 2 0" stroke="#1A1A1E" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="6" cy="14" r="1" fill="#FFE66D" />
    <circle cx="18" cy="11" r="0.8" fill="#FFE66D" />
    <defs>
      <linearGradient id="ghostGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#a55eea" />
        <stop offset="100%" stopColor="#8854d0" />
      </linearGradient>
    </defs>
  </svg>
);

const WandIcon = () => (
  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M19 19L9 9" stroke="url(#wandStick)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5L3.5 5.5l3.5-.5L8 2z" fill="url(#starGrad)" />
    <circle cx="13" cy="4" r="1" fill="#FF6B6B" />
    <circle cx="3" cy="11" r="0.8" fill="#FFE66D" />
    <circle cx="12" cy="12" r="1.2" fill="#4ECDC4" />
    <defs>
      <linearGradient id="wandStick" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFE66D" />
        <stop offset="100%" stopColor="#FF6B6B" />
      </linearGradient>
      <linearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF9F43" />
        <stop offset="100%" stopColor="#FFE66D" />
      </linearGradient>
    </defs>
  </svg>
);

const CompassIcon = () => (
  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="url(#compassGold)" strokeWidth="2.2" />
    <circle cx="12" cy="12" r="7.5" fill="url(#compassBlue)" />
    <path d="M12 7l2.5 5L12 17l-2.5-5L12 7z" fill="url(#needleGrad)" />
    <circle cx="12" cy="12" r="1.5" fill="#FFE66D" />
    <defs>
      <linearGradient id="compassGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFE66D" />
        <stop offset="100%" stopColor="#FF9F43" />
      </linearGradient>
      <linearGradient id="compassBlue" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#45aaf2" />
        <stop offset="100%" stopColor="#2d98da" />
      </linearGradient>
      <linearGradient id="needleGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="50%" stopColor="#EE5253" />
        <stop offset="51%" stopColor="#f5f6fa" />
        <stop offset="100%" stopColor="#dcdde1" />
      </linearGradient>
    </defs>
  </svg>
);

const getBookCategory = (bookId: string): 'horror_mystery' | 'kids_fables' | 'classics_adventure' => {
  const horrorIds = [
    'sleepy_hollow', 'dr_jekyll_mr_hyde', 'invisible_man', 'crime_punishment', 'frankenstein', 'dracula', 'war_of_worlds'
  ];
  const fableKidsIds = [
    'peter_rabbit', 'bambi', 'velveteen_rabbit', 'nutcracker', 'blue_bird', 'tom_thumb', 'little_match_girl',
    'gingerbread_man', 'chicken_little', 'enormous_turnip', 'three_billy_goats', 'fisherman_wife', 'little_red_hen',
    'frog_prince', 'stone_soup', 'star_money', 'city_musicians', 'crow_pitcher', 'ant_grasshopper', 'lion_mouse',
    'town_country_mouse', 'wind_sun', 'rumpelstiltskin', 'snow_queen', 'pinocchio', 'princess_pea', 'thumbelina',
    'boy_cried_wolf', 'ali_baba', 'hansel_gretel', 'sleeping_beauty', 'rapunzel', 'cinderella', 'jack_beanstalk',
    'aladdin', 'goldilocks', 'red_riding_hood', 'ugly_duckling', 'little_mermaid', 'three_pigs', 'snow_white', 'beauty_beast'
  ];

  const lowerId = bookId.toLowerCase();
  if (horrorIds.some(id => lowerId.includes(id))) {
    return 'horror_mystery';
  }
  if (fableKidsIds.some(id => lowerId.includes(id))) {
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
}

export default function LibraryTab({ books, onSelectBook, syncTrigger, isDarkMode, onToggleFavorite, totalReadMinutes, lastActiveBookId }: LibraryTabProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Currently reading is the last active book, or the first one with progress > 0 and < 100, or the first book
  const currentlyReading = useMemo(() => {
    return books.find(b => b.id === lastActiveBookId)
      || books.find(b => b.percentageCompleted > 0 && b.percentageCompleted < 100)
      || books[0];
  }, [books, lastActiveBookId]);

  const filteredBooks = useMemo(() => {
    let list = selectedLevel === 'All'
      ? books
      : books.filter(b => b.level === selectedLevel);

    if (selectedCategory !== 'All') {
      list = list.filter(b => getBookCategory(b.id) === selectedCategory);
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
  }, [books, selectedLevel, selectedCategory]);


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
        onClick={() => onSelectBook(book)}
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
          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs ${
            book.level.startsWith('A') ? 'bg-[#4ECDC4]' : book.level.startsWith('B') ? 'bg-[#FF6B6B]' : 'bg-[#2D3436]'
          }`}>
            {book.level}
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
        <p className="text-gray-455 dark:text-gray-400 text-[11px] truncate">{book.author}</p>
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
              <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#FFE66D] rounded text-[9px] font-bold text-[#2D3436] shadow-xs">
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
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentlyReading.author}
                </p>

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
                      className="h-full bg-[#4ECDC4] rounded-full transition-all duration-500"
                      style={{ width: `${currentlyReading.percentageCompleted}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectBook(currentlyReading)}
                className="mt-5 w-full sm:w-max px-6 py-2.5 bg-[#FF6B6B] text-white rounded-xl text-sm font-bold hover:bg-[#e05a5a] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-[#FF6B6B]/20 cursor-pointer"
              >
                <span>Devam Et</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </section>
      )}

      {/* Section: My Library Grid */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className={`font-headline-lg text-lg font-bold tracking-tight transition-colors ${
            isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
          }`}>
            Kitaplığım
          </h2>
          <span className={`text-xs font-bold tracking-wider font-headline-lg ${
            isDarkMode ? 'text-gray-400' : 'text-gray-450'
          }`}>
            Toplam {filteredBooks.length} Eser
          </span>
        </div>

        {/* Kategoriler (Category) Filter Stack */}
        <div className="mb-5">
          <span className={`text-[10px] font-bold uppercase tracking-wider block mb-2.5 px-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-455'
          }`}>
            Kategoriler (Bölümler)
          </span>
          <div className="flex flex-col gap-2.5">
            {[
              { id: 'All', name: 'Tüm Hikayeler', desc: 'Klasikler, masallar ve korku hikayelerinin tamamı', icon: <TumuIcon /> },
              { id: 'horror_mystery', name: 'Korku & Gizem', desc: 'Gizemli, korkunç ve heyecan dolu gotik hikayeler', icon: <SpookyIcon /> },
              { id: 'kids_fables', name: 'Masallar & Çocuk', desc: 'Çocuk masalları, hayal dünyası ve eğitici fabllar', icon: <WandIcon /> },
              { id: 'classics_adventure', name: 'Dünya Klasikleri', desc: 'Büyük yazarların ölümsüz macera ve dram eserleri', icon: <CompassIcon /> }
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer select-none flex items-center gap-4 ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-[#FF6B6B]/15 border-[#FF6B6B]/40 text-white shadow-md'
                        : 'bg-[#FF6B6B]/8 border-[#FF6B6B]/35 text-gray-900 shadow-sm'
                      : isDarkMode
                        ? 'bg-[#1A1A1E] border-[#2A2A30] text-gray-300 hover:border-gray-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 shadow-3xs'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${
                    isSelected 
                      ? 'bg-white border-black/5 dark:bg-[#121214] dark:border-white/5 shadow-2xs' 
                      : 'bg-gray-50 border-gray-100 dark:bg-[#121214] dark:border-gray-800'
                  }`}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="font-extrabold text-[13px] tracking-tight font-headline-lg flex items-center justify-between">
                      <span>{cat.name}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{cat.desc}</div>
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
                      ? 'bg-[#4ECDC4] border-[#4ECDC4] text-[#2D3436] shadow-md shadow-[#4ECDC4]/20 scale-[1.02]'
                      : isDarkMode
                        ? 'bg-[#1E1E22] border-[#2A2A30] text-gray-400 hover:text-white hover:border-gray-500'
                        : 'bg-white border-gray-200 text-gray-600 hover:text-[#4ECDC4] hover:border-gray-300'
                  }`}
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
