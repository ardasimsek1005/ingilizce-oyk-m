import React from 'react';
import { BookOpen, BookMarked, User, Heart } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode?: boolean;
}

export default function BottomNav({ currentTab, onTabChange, isDarkMode }: BottomNavProps) {
  return (
    <nav className={`fixed bottom-0 left-0 w-full flex justify-around items-center py-3 border-t z-50 transition-colors duration-200 backdrop-blur-md ${
      isDarkMode 
        ? 'bg-[#121214]/95 border-[#2A2A30] shadow-[0_-10px_25px_rgba(0,0,0,0.3)]' 
        : 'bg-white/90 border-[#FFE66D]/80 shadow-[0_-10px_25px_rgba(255,107,107,0.04)]'
    }`}>
      <div className="w-full max-w-[680px] mx-auto flex justify-around items-center px-2">
        {/* Library Tab */}
        <button
          onClick={() => onTabChange('library')}
          className={`flex flex-col items-center justify-center px-3 py-1 transition-all ${
            currentTab === 'library'
              ? 'text-[#FF6B6B]'
              : 'text-gray-400 hover:text-[#4ECDC4]'
          }`}
        >
          <BookOpen className={`w-[22px] h-[22px] mb-1 ${currentTab === 'library' ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
          <span className="text-[12px] font-medium tracking-wide">Kitaplık</span>
        </button>

        {/* Vocabulary Tab */}
        <button
          onClick={() => onTabChange('vocabulary')}
          className={`flex flex-col items-center justify-center px-3 py-1 transition-all ${
            currentTab === 'vocabulary' || currentTab === 'quiz'
              ? 'text-[#FF6B6B]'
              : 'text-gray-400 hover:text-[#4ECDC4]'
          }`}
        >
          <BookMarked className={`w-[22px] h-[22px] mb-1 ${currentTab === 'vocabulary' || currentTab === 'quiz' ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
          <span className="text-[12px] font-medium tracking-wide">Kelimelerim</span>
        </button>

        {/* Favorites Tab */}
        <button
          onClick={() => onTabChange('favorites')}
          className={`flex flex-col items-center justify-center px-3 py-1 transition-all ${
            currentTab === 'favorites'
              ? 'text-[#FF6B6B]'
              : 'text-gray-400 hover:text-[#4ECDC4]'
          }`}
        >
          <Heart className={`w-[22px] h-[22px] mb-1 ${currentTab === 'favorites' ? 'stroke-[2.5] fill-[#FF6B6B]' : 'stroke-[1.5]'}`} />
          <span className="text-[12px] font-medium tracking-wide">Favoriler</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center px-3 py-1 transition-all ${
            currentTab === 'profile'
              ? 'text-[#FF6B6B]'
              : 'text-gray-400 hover:text-[#4ECDC4]'
          }`}
        >
          <User className={`w-[22px] h-[22px] mb-1 ${currentTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
          <span className="text-[12px] font-medium tracking-wide">Profil</span>
        </button>
      </div>
    </nav>
  );
}

