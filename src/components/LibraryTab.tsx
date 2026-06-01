import React, { useState, useMemo } from 'react';
import { BookOpen, Timer, Plus, ArrowRight, ExternalLink, ChevronRight, X, Sparkles, BookMarked, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Book } from '../types';


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

  // Currently reading is the last active book, or the first one with progress > 0 and < 100, or the first book
  const currentlyReading = useMemo(() => {
    return books.find(b => b.id === lastActiveBookId)
      || books.find(b => b.percentageCompleted > 0 && b.percentageCompleted < 100)
      || books[0];
  }, [books, lastActiveBookId]);

  const filteredBooks = useMemo(() => {
    const list = selectedLevel === 'All'
      ? books
      : books.filter(b => b.level === selectedLevel);

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
  }, [books, selectedLevel]);


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

        {/* CEFR Level Filtering Tabs Bar */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
          {['Tümü', 'A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => {
            const isSelected = lvl === 'Tümü' ? selectedLevel === 'All' : selectedLevel === lvl;
            const levelCode = lvl === 'Tümü' ? 'All' : lvl;
            
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(levelCode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border select-none ${
                  isSelected
                    ? 'bg-[#FF6B6B] border-[#FF6B6B] text-white shadow-md shadow-[#FF6B6B]/20 scale-[1.03]'
                    : isDarkMode
                      ? 'bg-[#1E1E22] border-[#2A2A30] text-gray-400 hover:text-white hover:border-gray-500'
                      : 'bg-white border-gray-200 text-gray-600 hover:text-[#FF6B6B] hover:border-gray-300'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {/* Loop over other books */}
          {filteredBooks.map((book, idx) => {
            const shouldAnimate = idx < 12; // Animating only first screen items to keep mobile scroll FPS locked
            return (
              <motion.div
                initial={shouldAnimate ? { opacity: 0, scale: 0.96 } : false}
                animate={shouldAnimate ? { opacity: 1, scale: 1 } : false}
                transition={shouldAnimate ? { delay: Math.min(idx, 8) * 0.03, duration: 0.25 } : undefined}
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="group cursor-pointer flex flex-col"
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
                  />
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs ${
                    book.level.startsWith('A') ? 'bg-[#4ECDC4]' : book.level.startsWith('B') ? 'bg-[#FF6B6B]' : 'bg-[#2D3436]'
                  }`}>
                    {book.level}
                  </div>
                  {/* Star Button */}
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
                <h4 className={`font-headline-lg text-[15px] font-semibold group-hover:text-[#FF6B6B] transition-colors leading-tight mb-0.5 truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-950'
                }`}>
                  {book.title}
                </h4>
                <p className="text-gray-455 dark:text-gray-400 text-xs truncate">{book.author}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#4ECDC4] font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{book.totalPages || 0} Sayfa</span>
                </div>
              </motion.div>
            );
          })}
        </div>
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
