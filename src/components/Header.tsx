import React, { useState, useEffect } from 'react';
import { Cloud, Check, RefreshCw, Crown, Sun, Moon, Search, X } from 'lucide-react';
import AppLogo from './AppLogo';
import { Book } from '../types';

interface HeaderProps {
  currentTab: string;
  isPremium: boolean;
  onAvatarClick: () => void;
  onLogoClick: () => void;
  syncStatus: 'synced' | 'syncing';
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  userName: string;
  userAvatar: string;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  books?: Book[];
  onSelectBook?: (book: Book) => void;
}

export default function Header({
  currentTab,
  isPremium,
  onAvatarClick,
  onLogoClick,
  syncStatus,
  isDarkMode,
  onToggleDarkMode,
  userName,
  userAvatar,
  searchQuery = '',
  onSearchQueryChange,
  books = [],
  onSelectBook,
}: HeaderProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const handleBlur = () => {
    setTimeout(() => {
      if (!searchQuery) {
        setIsSearchExpanded(false);
      }
      setShowSuggestions(false);
    }, 180);
  };

  const suggestions = searchQuery && searchQuery.trim().length >= 2
    ? books.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ).slice(0, 5)
    : [];
  const [tabTitle, setTabTitle] = useState('İngilizce Öyküm');

  useEffect(() => {
    switch (currentTab) {
      case 'library':
        setTabTitle('Kitaplık');
        break;
      case 'vocabulary':
        setTabTitle('Kelime Dağarcığı');
        break;
      case 'profile':
        setTabTitle('Profilim');
        break;
      case 'quiz':
        setTabTitle('Gelişim Quizi');
        break;
      case 'favorites':
        setTabTitle('Favorilerim');
        break;
      default:
        setTabTitle('İngilizce Öyküm');
    }
  }, [currentTab]);

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-250 border-b ${
      isDarkMode 
        ? 'bg-[#121214]/85 border-[#2A2A30]' 
        : 'bg-white/70 border-[#FFE66D]/80'
    }`}>
      <div className="max-w-[680px] mx-auto px-5 h-16 flex items-center justify-between">
        {/* Brand/Title */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer group text-left min-w-0"
          title="Kitaplığa Dön"
        >
          <AppLogo size={32} className="shadow-md shadow-[#1A3A5F]/20 group-hover:scale-105 transition-transform rounded-xl shrink-0" />
          <span className={`font-headline-lg text-base font-extrabold tracking-tight transition-colors truncate ${
            isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
          }`}>
            İngilizce Öyküm
          </span>
          {isPremium && (
            <span className="bg-[#FFE66D] text-[#2D3436] text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs border border-[#FFE66D] shrink-0">
              <Crown className="w-2.5 h-2.5 text-[#FF6B6B] fill-[#FF6B6B]" />
              PREMIUM
            </span>
          )}
        </button>

        {/* Dark Mode Toggle & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Search bar visible only in Library tab */}
          {currentTab === 'library' && onSearchQueryChange && (
            <div className="relative flex items-center">
              {isSearchExpanded ? (
                <div className="relative flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Öykü Ara..."
                    value={searchQuery}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={handleBlur}
                    onChange={(e) => {
                      onSearchQueryChange(e.target.value);
                      setShowSuggestions(true);
                    }}
                    className={`pl-8 pr-7 h-[36px] w-[110px] xs:w-[140px] sm:w-[180px] rounded-xl border text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-[#FF6B6B]/40 focus:border-[#FF6B6B] transition-all ${
                      isDarkMode
                        ? 'bg-[#1A1A1E] border-[#2A2A30] text-white placeholder-gray-500'
                        : 'bg-white border-[#FFE66D] text-[#2D3436] placeholder-gray-400'
                    }`}
                  />
                  <Search className={`absolute left-2.5 w-3.5 h-3.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-550'}`} />
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (searchQuery) {
                        onSearchQueryChange('');
                      } else {
                        setIsSearchExpanded(false);
                      }
                    }}
                    className="absolute right-2.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                    title={searchQuery ? "Temizle" : "Kapat"}
                  >
                    <X className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isDarkMode 
                      ? 'bg-[#1A1A1E] border-[#2A2A30] text-gray-300 hover:bg-[#2A2A30]' 
                      : 'bg-white border-[#FFE66D] text-[#FF6B6B] hover:bg-[#FFE66D]/15'
                  }`}
                  title="Öykü Ara"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}

              {/* Autocomplete Suggestions Dropdown */}
              {isSearchExpanded && showSuggestions && searchQuery.trim().length >= 2 && suggestions.length > 0 && (
                <div className={`absolute top-11 right-0 w-[220px] rounded-2xl border shadow-xl z-50 py-2.5 overflow-hidden backdrop-blur-md ${
                  isDarkMode 
                    ? 'bg-[#1A1A1E]/95 border-[#2A2A30] text-white shadow-black/40' 
                    : 'bg-white/95 border-[#FFE66D]/85 text-[#2D3436] shadow-gray-200'
                }`}>
                  <div className="px-3 pb-1.5 pt-1 text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                    HIZLI ÖNERİLER
                  </div>
                  {suggestions.map((book) => (
                    <button
                      key={book.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onSearchQueryChange(book.title);
                        setShowSuggestions(false);
                        if (onSelectBook) {
                          onSelectBook(book);
                        }
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                        isDarkMode ? 'hover:bg-white/5' : 'hover:bg-[#FF6B6B]/5'
                      }`}
                    >
                      <img src={book.coverUrl} className="w-5 h-7 rounded-sm object-cover shrink-0" alt="" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs">{book.title}</div>
                        <div className="text-[9px] text-gray-400">{book.level} • {book.author}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dark Mode Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-[#1A1A1E] border-[#2A2A30] text-[#FFE66D] hover:bg-[#2A2A30]' 
                : 'bg-white border-[#FFE66D] text-[#FF6B6B] hover:bg-[#FFE66D]/15'
            }`}
            title={isDarkMode ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Avatar */}
          <button
            onClick={onAvatarClick}
            className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-colors focus:outline-none shadow-xs ${
              isDarkMode ? 'border-[#FFE66D] hover:border-[#FF6B6B]' : 'border-[#FFE66D] hover:border-[#FF6B6B]'
            }`}
            title="Profilime Git"
          >
            <img
              alt={userName || 'Kullanıcı'}
              className="w-full h-full object-cover"
              src={userAvatar}
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>

      {/* Centered Tab Title Sub-row */}
      <div className="max-w-[680px] mx-auto px-5 pb-3.5 flex justify-center">
        <h1 className={`font-headline-lg text-xl font-black tracking-tight relative transition-all ${
          isDarkMode ? 'text-white' : 'text-[#2D3436]'
        }`}>
          {tabTitle}
          <span className="absolute -bottom-1 left-2 right-2 h-[3px] rounded-full bg-[#FF6B6B]" />
        </h1>
      </div>
    </header>
  );
}
