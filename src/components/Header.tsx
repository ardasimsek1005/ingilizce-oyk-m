import React, { useState, useEffect } from 'react';
import { Cloud, Check, RefreshCw, Crown, Sun, Moon } from 'lucide-react';
import AppLogo from './AppLogo';

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
}: HeaderProps) {
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
