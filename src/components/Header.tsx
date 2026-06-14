import React, { useState, useEffect } from 'react';
import { Cloud, RefreshCw, Crown, Sun, Moon, Heart } from 'lucide-react';
import AppLogo from './AppLogo';
import { SUPPORTED_LANGUAGES, LanguageCode, t, getLocalizedUsername } from '../i18n';

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
  refillCountdown?: string;
  nativeLanguage: LanguageCode;
  onUpdateLanguage: (lang: LanguageCode) => void;
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
  refillCountdown = '',
  nativeLanguage,
  onUpdateLanguage,
}: HeaderProps) {
  const [tabTitle, setTabTitle] = useState(nativeLanguage === 'tr' ? 'İngilizce Öyküm' : 'My English Story');

  useEffect(() => {
    switch (currentTab) {
      case 'library':
        setTabTitle(t('tab_library', nativeLanguage));
        break;
      case 'vocabulary':
        setTabTitle(t('tab_words', nativeLanguage));
        break;
      case 'profile':
        setTabTitle(t('tab_profile', nativeLanguage));
        break;
      case 'quiz':
        setTabTitle(t('tab_quiz', nativeLanguage));
        break;
      case 'favorites':
        setTabTitle(t('tab_favorites', nativeLanguage));
        break;
      default:
        setTabTitle(nativeLanguage === 'tr' ? 'İngilizce Öyküm' : 'My English Story');
    }
  }, [currentTab, nativeLanguage]);

  const activeLang = SUPPORTED_LANGUAGES.find(l => l.code === nativeLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <header 
      className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-250 border-b ${
        isDarkMode 
          ? 'bg-[#121214]/85 border-[#2A2A30]' 
          : 'bg-white/70 border-[#FFE66D]/80'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="max-w-[680px] mx-auto px-5 h-16 flex items-center justify-between">
        {/* Brand/Title */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer group text-left min-w-0"
          title={t('btn_back_library', nativeLanguage)}
        >
          <div className="flex flex-col items-center justify-center shrink-0">
            <AppLogo size={isPremium ? 26 : 32} className="shadow-md shadow-[#1A3A5F]/20 group-hover:scale-105 transition-transform rounded-xl" />
            {isPremium && (
              <span className="bg-[#FFE66D] text-[#2D3436] text-[7px] font-extrabold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow-3xs border border-[#FFE66D] mt-0.5 scale-90">
                <Crown className="w-2 h-2 text-[#FF6B6B] fill-[#FF6B6B] shrink-0" />
                PREMIUM
              </span>
            )}
          </div>
          <span className={`font-headline-lg text-base font-extrabold tracking-tight transition-colors truncate ${
            isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
          }`}>
            {nativeLanguage === 'tr' ? 'İngilizce Öyküm' : 'My English Story'}
          </span>
        </button>

        {/* Dark Mode Toggle & User Profile & Language Selector */}
        <div className="flex items-center gap-2.5">

          {/* Language Selector Dropdown (below profile picture / next to it) */}
          <div className="relative">
            <button
              className={`p-2 h-10 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 shadow-3xs ${
                isDarkMode 
                  ? 'bg-[#1A1A1E] border-[#2A2A30] text-[#FFE66D] hover:bg-[#2A2A30]' 
                  : 'bg-white border-[#FFE66D] text-[#FF6B6B] hover:bg-[#FFE66D]/15'
              }`}
              title={t('header_select_language', nativeLanguage)}
            >
              <span className="text-base leading-none select-none">{activeLang.flag}</span>
              <span className="text-[9px] font-extrabold font-mono uppercase tracking-wide">
                {activeLang.code}
              </span>
            </button>
            <select
              value={nativeLanguage}
              onChange={(e) => onUpdateLanguage(e.target.value as LanguageCode)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* Dark Mode Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className={`p-2 w-10 h-10 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              isDarkMode 
                ? 'bg-[#1A1A1E] border-[#2A2A30] text-[#FFE66D] hover:bg-[#2A2A30]' 
                : 'bg-white border-[#FFE66D] text-[#FF6B6B] hover:bg-[#FFE66D]/15'
            }`}
            title={t(isDarkMode ? 'theme_light' : 'theme_dark', nativeLanguage)}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Avatar */}
          <button
            onClick={onAvatarClick}
            className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-colors focus:outline-none shadow-xs ${
              isDarkMode ? 'border-[#FFE66D] hover:border-[#FF6B6B]' : 'border-[#FFE66D] hover:border-[#FF6B6B]'
            }`}
            title={t('header_go_to_profile', nativeLanguage)}
          >
            <img
              alt={getLocalizedUsername(userName, nativeLanguage) || t('user_profile', nativeLanguage)}
              className="w-full h-full object-cover"
              src={userAvatar}
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>

      {/* Centered Tab Title Sub-row */}
      <div className="max-w-[680px] mx-auto px-5 pb-3.5 flex justify-center items-center relative">
        <h1 className={`font-headline-lg text-xl font-black tracking-tight relative transition-all ${
          isDarkMode ? 'text-white' : 'text-[#2D3436]'
        }`}>
          {tabTitle}
          <span className="absolute -bottom-1 left-2 right-2 h-[3px] rounded-full bg-[#FF6B6B]" />
        </h1>

        {/* Lives / Refill Countdown Widget on the Right */}
        {(currentTab === 'library' || currentTab === 'vocabulary') && !isPremium && refillCountdown && (
          <div className="absolute right-5 flex items-center gap-1.5 text-[11px] bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 text-[#FF6B6B] px-2.5 py-1 rounded-full font-bold tracking-wide shadow-3xs transition-all select-none">
            <Heart className="w-3.5 h-3.5 fill-[#FF6B6B] text-[#FF6B6B] animate-pulse" />
            <span className="font-mono font-extrabold">{refillCountdown}</span>
          </div>
        )}
      </div>
    </header>
  );
}
