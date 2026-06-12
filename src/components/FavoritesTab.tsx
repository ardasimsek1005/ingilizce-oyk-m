import React from 'react';
import { BookOpen, Star, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Book, getLevelColor } from '../types';
import { LanguageCode, t } from '../i18n';

interface FavoritesTabProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onToggleFavorite: (bookId: string) => void;
  onGoToLibrary: () => void;
  isDarkMode?: boolean;
  nativeLanguage: LanguageCode;
}


export default function FavoritesTab({
  books,
  onSelectBook,
  onToggleFavorite,
  onGoToLibrary,
  isDarkMode,
  nativeLanguage,
}: FavoritesTabProps) {
  const favoriteBooks = books.filter(b => b.isFavorited);

  return (
    <div className={`pb-32 max-w-[680px] mx-auto px-5 pt-6 transition-colors ${
      isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
    }`}>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className={`font-headline-lg text-lg font-bold tracking-tight transition-colors ${
          isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
        }`}>
          {t('fav_title', nativeLanguage)}
        </h2>
        <span className={`text-xs font-bold tracking-wider font-headline-lg ${
          isDarkMode ? 'text-gray-400' : 'text-gray-455'
        }`}>
          {t('fav_total_count', nativeLanguage).replace('{count}', String(favoriteBooks.length))}
        </span>
      </div>

      {favoriteBooks.length === 0 ? (
        // Blank fallback illustration
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`border-2 rounded-[32px] p-10 text-center shadow-xs flex flex-col items-center justify-center transition-colors ${
            isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center mb-5 border border-[#F59E0B]/20 animate-pulse">
            <Star className="w-8 h-8 fill-[#F59E0B]/10" />
          </div>

          <h3 className={`font-headline-lg text-xl font-bold mb-2 tracking-tight ${
            isDarkMode ? 'text-white' : 'text-[#2D3436]'
          }`}>
            {t('fav_empty_title', nativeLanguage)}
          </h3>
          
          <p className={`text-xs max-w-sm mx-auto mb-8 leading-relaxed font-semibold ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {t('fav_empty_desc', nativeLanguage)}
          </p>

          <button
            onClick={onGoToLibrary}
            className="px-6 py-3.5 bg-[#FF6B6B] hover:bg-[#e05a5a] text-white rounded-full font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#FF6B6B]/20"
          >
            <span>{t('fav_explore_btn', nativeLanguage)}</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </motion.div>
      ) : (
        // Grid cards list
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {favoriteBooks.map((book, idx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="group cursor-pointer flex flex-col relative"
            >
              <div className={`aspect-[2/3] rounded-2xl overflow-hidden mb-3 shadow-xs group-hover:shadow-md transition-all relative border ${
                isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]/60'
              }`}>
                <img
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={book.coverUrl}
                />
                
                {/* Level Badge */}
                <div 
                  className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: getLevelColor(book.level) }}
                >
                  {book.level}
                </div>

                {/* Star Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(book.id);
                  }}
                  className="absolute top-2 left-2 p-1.5 bg-black/40 backdrop-blur-md hover:bg-black/60 text-[#F59E0B] rounded-xl border border-white/20 transition-all cursor-pointer shadow-sm scale-95 active:scale-90"
                  title={t('fav_remove_tooltip', nativeLanguage)}
                >
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                </button>

                {book.percentageCompleted === 100 && (
                  <div className="absolute inset-x-0 bottom-0 bg-[#4ECDC4] text-[#2D3436] py-1 text-center font-bold text-[10px] tracking-wider flex items-center justify-center gap-1 shadow-sm">
                    <span>{t('completed_status', nativeLanguage)}</span>
                  </div>
                )}
              </div>
              
              <h4 className={`font-headline-lg text-[15px] font-semibold group-hover:text-[#FF6B6B] transition-colors leading-tight mb-0.5 truncate ${
                isDarkMode ? 'text-white' : 'text-gray-955'
              }`}>
                {book.title}
              </h4>
              {book.author && <p className="text-gray-455 dark:text-gray-400 text-xs truncate">{book.author}</p>}
              
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#4ECDC4] font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t('pages_count', nativeLanguage).replace('{count}', String(book.totalPages || 0))}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
