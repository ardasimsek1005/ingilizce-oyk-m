import React, { useState, useEffect, useRef } from 'react';
import { Cloud, Check, RefreshCw, Crown, Sun, Moon, Heart } from 'lucide-react';
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
  const [tabTitle, setTabTitle] = useState('İngilizce Öyküm');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        setTabTitle(t('tab_quiz', nativeLanguage) || 'Gelişim Quizi');
        break;
      case 'favorites':
        setTabTitle(t('tab_favorites', nativeLanguage));
        break;
      default:
        setTabTitle('İngilizce Öyküm');
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

        {/* Dark Mode Toggle & User Profile & Language Selector */}
        <div className="flex items-center gap-2.5">

          {/* Language Selector Dropdown (below profile picture / next to it) */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
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

            {isLangMenuOpen && (
              <div className={`absolute right-0 top-12 w-48 rounded-2xl border shadow-xl z-50 py-2 overflow-y-auto max-h-80 backdrop-blur-md transition-all ${
                isDarkMode 
                  ? 'bg-[#1A1A1E]/95 border-[#2A2A30] text-white shadow-black/60' 
                  : 'bg-white/95 border-[#FFE66D] text-[#2D3436] shadow-gray-200/85'
              }`}>
                <div className="px-4 pb-1.5 pt-1 text-[9px] font-extrabold uppercase tracking-wider text-[#FF6B6B]">
                  {t('header_native_lang', nativeLanguage)}
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onUpdateLanguage(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      nativeLanguage === lang.code
                        ? isDarkMode
                          ? 'bg-[#FF6B6B]/20 text-[#FF6B6B]'
                          : 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
                        : isDarkMode
                          ? 'hover:bg-white/5'
                          : 'hover:bg-[#FF6B6B]/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </div>
                    {nativeLanguage === lang.code && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
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
