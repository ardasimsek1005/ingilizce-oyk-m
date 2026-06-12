import React from 'react';
import { BookOpen, BookMarked, User, Star } from 'lucide-react';
import { LanguageCode, t } from '../i18n';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode?: boolean;
  nativeLanguage: LanguageCode;
}

export default function BottomNav({ currentTab, onTabChange, isDarkMode, nativeLanguage }: BottomNavProps) {
  return (
    <nav 
      className={`fixed md:absolute bottom-0 left-0 w-full flex justify-center items-center pt-3 border-t z-50 transition-colors duration-200 backdrop-blur-md ${
        isDarkMode 
          ? 'bg-[#121214]/95 border-[#2A2A30] shadow-[0_-10px_25px_rgba(0,0,0,0.3)]' 
          : 'bg-white/90 border-[#FFE66D]/80 shadow-[0_-10px_25px_rgba(255,107,107,0.04)]'
      }`}
      style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="w-full max-w-[680px] mx-auto grid grid-cols-4 items-center px-2">
        {/* Library Tab */}
        <button
          onClick={() => onTabChange('library')}
          className={`w-full flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            currentTab === 'library'
              ? 'text-[#FF6B6B]'
              : 'text-gray-400 hover:text-[#4ECDC4]'
          }`}
        >
          <BookOpen className={`w-[22px] h-[22px] mb-1 ${currentTab === 'library' ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
          <span className="text-[11px] font-medium tracking-wide">{t('tab_library', nativeLanguage)}</span>
        </button>

        {/* Vocabulary Tab */}
        <button
          onClick={() => onTabChange('vocabulary')}
          className={`w-full flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            currentTab === 'vocabulary' || currentTab === 'quiz'
              ? 'text-[#FF6B6B]'
              : 'text-gray-400 hover:text-[#4ECDC4]'
          }`}
        >
          <BookMarked className={`w-[22px] h-[22px] mb-1 ${currentTab === 'vocabulary' || currentTab === 'quiz' ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
          <span className="text-[11px] font-medium tracking-wide">{t('tab_words', nativeLanguage)}</span>
        </button>

        {/* Favorites Tab */}
        <button
          onClick={() => onTabChange('favorites')}
          className={`w-full flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            currentTab === 'favorites'
              ? 'text-[#F59E0B]'
              : 'text-gray-400 hover:text-[#F59E0B]'
          }`}
        >
          <Star className={`w-[22px] h-[22px] mb-1 ${currentTab === 'favorites' ? 'stroke-[2.5] fill-[#F59E0B]' : 'stroke-[1.5]'}`} />
          <span className="text-[11px] font-medium tracking-wide">{t('tab_favorites', nativeLanguage)}</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onTabChange('profile')}
          className={`w-full flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            currentTab === 'profile'
              ? 'text-[#FF6B6B]'
              : 'text-gray-400 hover:text-[#4ECDC4]'
          }`}
        >
          <User className={`w-[22px] h-[22px] mb-1 ${currentTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
          <span className="text-[11px] font-medium tracking-wide">{t('tab_profile', nativeLanguage)}</span>
        </button>
      </div>
    </nav>
  );
}

