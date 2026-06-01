import React, { useState } from 'react';
import { UserStats, Badge } from '../types';
import { INITIAL_BADGES } from '../data';
import { Award, Flame, BookOpen, Clock, Trophy, Share2, Sparkles, TrendingUp, ChevronRight, CheckCircle2, ShieldAlert, BadgeCheck, Zap, Library, Volume2, Crown, X, RefreshCw, Check, Edit2, Camera, Save, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AVATAR_OPTIONS } from '../avatar_assets';

interface ProfileTabProps {
  stats: UserStats;
  badges: Badge[];
  onTriggerPremiumPanel: () => void;
  syncTrigger: () => void;
  isDarkMode?: boolean;
  userName: string;
  userAvatar: string;
  onUpdateProfile: (name: string, avatar: string) => void;
  onEnterAdminMode: () => void;
}

export default function ProfileTab({
  stats,
  badges,
  onTriggerPremiumPanel,
  syncTrigger,
  isDarkMode,
  userName,
  userAvatar,
  onUpdateProfile,
  onEnterAdminMode,
}: ProfileTabProps) {
  const [selectedChartTab, setSelectedChartTab] = useState<'words' | 'minutes'>('words');
  const [activeBarIdx, setActiveBarIdx] = useState<number | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharePlatform, setSharePlatform] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempAvatar, setTempAvatar] = useState(userAvatar);

  // Application Installation Date state
  const [installDate] = useState(() => {
    let saved = localStorage.getItem('linguist_app_install_date');
    if (!saved) {
      const d = new Date();
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      saved = `${dd}.${mm}.${yyyy}`;
      localStorage.setItem('linguist_app_install_date', saved);
    }
    return saved;
  });

  // Unique Share / Invite Code
  const [shareCode] = useState(() => {
    let saved = localStorage.getItem('linguist_share_code');
    if (!saved) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = 'OYKUM-';
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      code += `-${new Date().getFullYear() % 100}`;
      localStorage.setItem('linguist_share_code', code);
      saved = code;
    }
    return saved;
  });

  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopyLinkOrCode = (text: string, isCode: boolean) => {
    navigator.clipboard.writeText(text);
    if (isCode) {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
      setToastMessage('Paylaşım Kodu panoya kopyalandı! 📋');
    } else {
      setToastMessage('Uygulama Paylaşım Bağlantısı kopyalandı! 🔗');
    }
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Construct dynamic chart data from stats
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const chartData = days.map((day, idx) => ({
    day,
    learnedWords: stats.weeklyWords ? stats.weeklyWords[idx] || 0 : 0,
    readMins: stats.weeklyMins ? stats.weeklyMins[idx] || 0 : 0
  }));

  const maxWords = Math.max(...chartData.map(d => d.learnedWords)) || 10;
  const maxMinutes = Math.max(...chartData.map(d => d.readMins)) || 10;

  const [dailyTimeTarget, setDailyTimeTarget] = useState<number>(() => {
    const saved = localStorage.getItem('linguist_target_daily_time');
    const val = saved ? Number(saved) : 20;
    return (val && !isNaN(val) && val > 0) ? val : 20;
  });
  const [weeklyWordTarget, setWeeklyWordTarget] = useState<number>(() => {
    const saved = localStorage.getItem('linguist_target_weekly_words');
    const val = saved ? Number(saved) : 10;
    return (val && !isNaN(val) && val > 0) ? val : 10;
  });

  const todayIdx = new Date().getDay(); // 0 is Sunday, 1-6 is Mon-Sat
  const dayIndex = todayIdx === 0 ? 6 : todayIdx - 1;
  const todayMins = stats.weeklyMins ? stats.weeklyMins[dayIndex] || 0 : 0;
  const weeklyWordsSum = stats.weeklyWords ? stats.weeklyWords.reduce((a, b) => a + b, 0) : 0;

  const rawTimeGoal = Math.round((todayMins / (dailyTimeTarget || 20)) * 100);
  const timeGoalPercent = isNaN(rawTimeGoal) ? 0 : Math.min(rawTimeGoal, 100);

  const rawWordGoal = Math.round((weeklyWordsSum / (weeklyWordTarget || 10)) * 100);
  const wordGoalPercent = isNaN(rawWordGoal) ? 0 : Math.min(rawWordGoal, 100);

  const getBadgeIcon = (iconName: string, unlocked: boolean) => {
    const sizeClass = "w-5 h-5";
    const colorClass = unlocked ? "text-[#FF6B6B]" : "text-gray-400";
    
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className={`${sizeClass} ${colorClass}`} />;
      case 'Flame':
        return <Flame className={`${sizeClass} ${colorClass}`} />;
      case 'Award':
        return <Award className={`${sizeClass} ${colorClass}`} />;
      case 'Sparkles':
        return <Sparkles className={`${sizeClass} ${colorClass}`} />;
      case 'Crown':
        return <Crown className={`${sizeClass} ${colorClass}`} />;
      default:
        return <Trophy className={`${sizeClass} ${colorClass}`} />;
    }
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const handlePlatformShare = (platform: string) => {
    setSharePlatform(platform);
    setTimeout(() => {
      setSharePlatform(null);
      setIsShareModalOpen(false);
      setToastMessage(`${platform} üzerinde ilerlemeniz başarıyla paylaşıldı! 🚀`);
      setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    }, 1200);
  };

  return (
    <div className={`pb-36 max-w-[680px] mx-auto px-5 pt-6 transition-colors ${
      isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
    }`}>
      
      {/* Toast Notification replacing alert() */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 py-3.5 px-6 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-bold leading-none ${
              isDarkMode ? 'bg-[#1E1E22] border-[#4ECDC4] text-[#4ECDC4]' : 'bg-[#eefcfb] border-[#4ECDC4] text-[#2c8d86]'
            }`}
          >
            <Check className="w-5 h-5 text-[#4ECDC4] animate-bounce shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Profile Header Avatar */}
      <section className={`flex flex-col items-center text-center mb-8 border-2 p-6 rounded-[28px] relative select-none transition-colors ${
        isDarkMode 
          ? 'bg-[#1A1A1E] border-[#2A2A30] shadow-[0_8px_16px_rgba(0,0,0,0.2)]' 
          : 'bg-white border-[#FFE66D] shadow-[0_8px_16px_rgba(255,107,107,0.01)]'
      }`}>
        
        {/* Floating badge */}
        {stats.isPremium && (
          <span className="absolute top-4 right-4 bg-[#FFE66D] text-[#2D3436] border border-[#FFE66D]/50 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold shadow-sm flex items-center gap-1 font-headline-lg animate-pulse whitespace-nowrap">
            <Zap className="w-3.5 h-3.5 text-[#FF6B6B] fill-[#FF6B6B]" />
            PREMIUM ÜYE
          </span>
        )}

        {isEditing ? (
          <div className="w-full space-y-6">
            <h3 className={`text-base font-bold font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
              Profili Düzenle
            </h3>
            
            {/* Selected Avatar Preview */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-md border-4 border-[#FFE66D] mb-3 relative bg-slate-50">
                <img
                  alt="Seçilen Avatar"
                  className="w-full h-full object-cover"
                  src={tempAvatar}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <span className="text-[10px] font-bold text-gray-400 tracking-wider mb-2">PROFİL RESMİ SEÇİN</span>
            </div>

            {/* Avatar picker grid */}
            <div className="grid grid-cols-5 gap-2.5 max-w-sm mx-auto">
              {AVATAR_OPTIONS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTempAvatar(url);
                  }}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all cursor-pointer relative ${
                    tempAvatar === url
                      ? 'border-[#FF6B6B] scale-110 shadow-md ring-2 ring-[#FF6B6B]/20'
                      : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Avatar ${i+1}`}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover"
                  />
                  {tempAvatar === url && (
                    <div className="absolute inset-0 bg-[#FF6B6B]/15 flex items-center justify-center">
                      <Check className="w-4 h-4 text-[#FF6B6B] stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Name Input field */}
            <div className="max-w-xs mx-auto w-full">
              <label id="profile-name-label" className="block text-[10px] font-bold text-gray-455 mb-2 text-left font-headline-lg">
                İSMİNİZ
              </label>
              <input
                type="text"
                maxLength={25}
                placeholder="İsim belirtilmemiş (Boş bırakabilirsiniz)"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className={`w-full text-xs px-3 py-2.5 border rounded-xl focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-[#121214] border-[#2A2A30] text-white placeholder-gray-650' 
                    : 'bg-white border-[#FFE66D] text-gray-800 placeholder-teal-600'
                }`}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 max-w-xs mx-auto pt-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateProfile(tempName, tempAvatar);
                  setIsEditing(false);
                  setToastMessage('Profiliniz başarıyla güncellendi! 🎉');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="flex-1 py-2.5 bg-[#4ECDC4] text-gray-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#3cacb0] font-headline-lg shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Kaydet</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempName(userName);
                  setTempAvatar(userAvatar);
                  setIsEditing(false);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer font-headline-lg ${
                  isDarkMode 
                    ? 'border-gray-700 hover:bg-white/5 text-gray-300' 
                    : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                }`}
              >
                Vazgeç
              </button>
            </div>
          </div>
        ) : (
          /* Normal display state (empty by default / custom name check) */
          <>
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border-4 border-[#FFE66D] mb-4 relative bg-slate-50 group">
              <img
                alt={userName || 'Kullanıcı'}
                className="w-full h-full object-cover"
                src={userAvatar}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80';
                }}
              />
              <button
                onClick={() => {
                  setTempName(userName);
                  setTempAvatar(userAvatar);
                  setIsEditing(true);
                }}
                className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white cursor-pointer"
                title="Profil Resmini Değiştir"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-bold">DEĞİŞTİR</span>
              </button>
            </div>
            
            <h1 className={`font-headline-lg text-2xl font-bold mb-1 flex items-center justify-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-[#2D3436]'
            }`}>
              {userName ? (
                userName
              ) : (
                <span className="italic text-gray-400 font-normal text-xl select-none">
                  (No name provided)
                </span>
              )}
            </h1>

            <div className={`text-xs font-bold font-headline-lg mb-4 space-y-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-450'
            }`}>
              <div>İngilizce Öyküm Okuru</div>
              <div className="text-[11px] opacity-80 font-medium">Yükleme Tarihi: {installDate}</div>
            </div>

            <button
              onClick={() => {
                setTempName(userName);
                setTempAvatar(userAvatar);
                setIsEditing(true);
              }}
              className="px-4 py-1.5 bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/15 text-[#FF6B6B] text-[11px] font-bold rounded-full border border-[#FF6B6B]/20 transition-all flex items-center gap-1.5 cursor-pointer font-headline-lg"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>İsmini Değiştir</span>
            </button>
          </>
        )}
      </section>

      {/* Bento Grid Core Statistics Panel */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className={`p-5 rounded-2xl flex flex-col items-center justify-center border-2 text-center transition-colors ${
          isDarkMode 
            ? 'bg-[#1A1A1E] border-[#2A2A30] text-white shadow-md' 
            : 'bg-white border-[#FFE66D] text-[#2D3436] shadow-[0_8px_16px_rgba(255,107,107,0.01)]'
        }`}>
          <Library className="w-6 h-6 text-[#FF6B6B] mb-2" />
          <span className={`font-headline-lg text-2xl font-bold transition-colors ${
            isDarkMode ? 'text-white' : 'text-[#2D3436]'
          }`}>
            {stats.learnedWordsCount} <span className="text-xs font-semibold text-gray-400">/ 854</span>
          </span>
          <span className={`text-[10px] font-extrabold tracking-widest mt-1 ${
            isDarkMode ? 'text-gray-400' : 'text-[#2D3436]/60'
          }`}>
            KAYITLI KELİME
          </span>
        </div>

        <div className={`p-5 rounded-2xl flex flex-col items-center justify-center border-2 text-center transition-colors ${
          isDarkMode 
            ? 'bg-[#1A1A1E] border-[#2A2A30] text-white shadow-md' 
            : 'bg-white border-[#FFE66D] text-[#2D3436] shadow-[0_8px_16px_rgba(255,107,107,0.01)]'
        }`}>
          <BookOpen className="w-6 h-6 text-[#FF6B6B] mb-2" />
          <span className={`font-headline-lg text-2xl font-bold transition-colors ${
            isDarkMode ? 'text-white' : 'text-[#2D3436]'
          }`}>
            {stats.completedBooksCount}
          </span>
          <span className={`text-[10px] font-extrabold tracking-widest mt-1 ${
            isDarkMode ? 'text-gray-400' : 'text-[#2D3436]/60'
          }`}>
            OKUNAN KİTAP
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#FF6B6B] to-[#FFE66D] text-[#FFFBF0] p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center border-2 border-[#FF6B6B]/40">
          <Flame className="w-6 h-6 text-yellow-300 fill-yellow-300 mb-2 animate-bounce" />
          <span className="font-headline-lg text-2xl font-extrabold">
            {stats.dailyStreak} Gün
          </span>
          <span className="text-[10px] font-extrabold tracking-widest mt-1 opacity-95">
            GÜNLÜK SERİ 🔥
          </span>
        </div>
      </section>

      {/* Kişiselleştirilmiş ve Kullanıcı Dostu Haftalık Hedefler */}
      <section className={`border-2 rounded-[28px] p-6 mb-8 transition-colors ${
        isDarkMode 
          ? 'bg-[#1A1A1E] border-[#2A2A30] shadow-[0_8px_16px_rgba(0,0,0,0.2)]' 
          : 'bg-white border-[#FFE66D] shadow-[0_8px_16px_rgba(255,107,107,0.01)]'
      }`}>
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FFE66D]/20 text-[#FF6B6B]">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className={`font-headline-lg text-base font-bold tracking-tight ${
              isDarkMode ? 'text-white' : 'text-[#2D3436]'
            }`}>
              Kişisel Hedeflerim
            </h2>
          </div>
          <span className="text-[10px] font-bold text-[#4ECDC4] bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse font-headline-lg">
            Dinamik Hedef
          </span>
        </div>

        <p className={`text-xs mb-5 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          İngilizce öğrenme hızını artırmak için günlük ve haftalık hedeflerini özelleştir. İlerledikçe rozetler kazanırsı!
        </p>

        <div className="space-y-4">
          
          {/* Kart 1: Okuma Sınavı Hedefi */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#121214]/60 border-[#2A2A30] hover:border-[#FF6B6B]/40' 
              : 'bg-gray-50/50 border-gray-150 hover:border-[#FF6B6B]/30'
          }`}>
            <div className="flex justify-between items-start mb-2.5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#FF6B6B]/15 text-[#FF6B6B]">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className={`text-xs font-bold font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                    Okuma Sınav Başarısı
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Sınavlardan kazandığın başarı oranı.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-[#FF6B6B] font-headline-lg">
                  %{stats.readingGoalPercent}
                </span>
                <p className="text-[9px] text-gray-400 font-medium">Başarı</p>
              </div>
            </div>
            
            {/* İlerleme Çubuğu */}
            <div className="mt-3.5 flex items-center gap-4">
              <div className="flex-1">
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FFE66D] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.readingGoalPercent}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  stats.readingGoalPercent >= 100 
                    ? 'bg-[#4ECDC4]/10 text-[#4ECDC4]' 
                    : isDarkMode ? 'bg-[#1A1A1E] text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  {stats.readingGoalPercent >= 100 ? 'Başarıldı! 🎉' : 'Devam Ediyor'}
                </span>
              </div>
            </div>
          </div>

          {/* Kart 2: Kelime Hedefi */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#121214]/60 border-[#2A2A30] hover:border-[#4ECDC4]/40' 
              : 'bg-gray-50/50 border-gray-150 hover:border-[#4ECDC4]/30'
          }`}>
            <div className="flex justify-between items-start mb-2.5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#4ECDC4]/15 text-[#4ECDC4]">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className={`text-xs font-bold font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                    Haftalık Kelime Kaydı
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Bu hafta kaydedilen kelime sayısı.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-[#4ECDC4] font-headline-lg">
                  {weeklyWordsSum} / {weeklyWordTarget}
                </span>
                <p className="text-[9px] text-gray-400 font-medium">Kelime</p>
              </div>
            </div>
            
            {/* İlerleme Çubuğu ve Ayarlayıcılar */}
            <div className="mt-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#4ECDC4] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${wordGoalPercent}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              
              {/* Hedef Değiştirme Butonları */}
              <div className="flex items-center gap-1.5 shrink-0 select-none">
                <button 
                  onClick={() => {
                    const next = Math.max(5, weeklyWordTarget - 5);
                    setWeeklyWordTarget(next);
                    localStorage.setItem('linguist_target_weekly_words', String(next));
                    syncTrigger();
                  }}
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-extrabold text-xs border hover:bg-gray-100 active:scale-90 transition-all cursor-pointer ${
                    isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-[#1A1A1E]' : 'border-gray-300 text-gray-600'
                  }`}
                  title="Hedefi Azalt"
                >
                  -
                </button>
                <span className={`text-[9px] font-bold w-12 text-center py-0.5 rounded ${
                  isDarkMode ? 'bg-[#1A1A1E] text-gray-300' : 'bg-gray-100 text-gray-750'
                }`}>
                  Hedef: {weeklyWordTarget}
                </span>
                <button 
                  onClick={() => {
                    const next = Math.min(100, weeklyWordTarget + 5);
                    setWeeklyWordTarget(next);
                    localStorage.setItem('linguist_target_weekly_words', String(next));
                    syncTrigger();
                  }}
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-extrabold text-xs border hover:bg-gray-100 active:scale-90 transition-all cursor-pointer ${
                    isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-[#1A1A1E]' : 'border-gray-300 text-gray-600'
                  }`}
                  title="Hedefi Artır"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Kart 3: Günlük Süre Hedefi */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#121214]/60 border-[#2A2A30] hover:border-[#FFE66D]/40' 
              : 'bg-gray-50/50 border-gray-150 hover:border-[#FFE66D]/30'
          }`}>
            <div className="flex justify-between items-start mb-2.5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#FFE66D]/15 text-[#FFE66D]">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className={`text-xs font-bold font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                    Günlük Okuma Süresi
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Bugün hikayelerde geçirdiğin aktif süre.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-[#FFE66D] font-headline-lg">
                  {todayMins} / {dailyTimeTarget} dk
                </span>
                <p className="text-[9px] text-gray-400 font-medium">Süre</p>
              </div>
            </div>
            
            {/* İlerleme Çubuğu ve Ayarlayıcılar */}
            <div className="mt-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#FFE66D] to-[#FF6B6B] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${timeGoalPercent}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              
              {/* Hedef Değiştirme Butonları */}
              <div className="flex items-center gap-1.5 shrink-0 select-none">
                <button 
                  onClick={() => {
                    const next = Math.max(5, dailyTimeTarget - 5);
                    setDailyTimeTarget(next);
                    localStorage.setItem('linguist_target_daily_time', String(next));
                    syncTrigger();
                  }}
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-extrabold text-xs border hover:bg-gray-100 active:scale-90 transition-all cursor-pointer ${
                    isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-[#1A1A1E]' : 'border-gray-300 text-gray-600'
                  }`}
                  title="Hedefi Azalt"
                >
                  -
                </button>
                <span className={`text-[9px] font-bold w-12 text-center py-0.5 rounded ${
                  isDarkMode ? 'bg-[#1A1A1E] text-gray-300' : 'bg-gray-100 text-gray-750'
                }`}>
                  Hedef: {dailyTimeTarget}d
                </span>
                <button 
                  onClick={() => {
                    const next = Math.min(120, dailyTimeTarget + 5);
                    setDailyTimeTarget(next);
                    localStorage.setItem('linguist_target_daily_time', String(next));
                    syncTrigger();
                  }}
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-extrabold text-xs border hover:bg-gray-100 active:scale-90 transition-all cursor-pointer ${
                    isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-[#1A1A1E]' : 'border-gray-300 text-gray-600'
                  }`}
                  title="Hedefi Artır"
                >
                  +
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Kişiselleştirilmiş ve Kullanıcı Dostu Haftalık İlerleme Grafiği */}
      <section className={`border-2 rounded-[28px] p-6 mb-8 select-none transition-colors ${
        isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
      }`}>
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#4ECDC4]/20 text-[#4ECDC4]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className={`font-headline-lg text-base font-bold tracking-tight ${
                isDarkMode ? 'text-white' : 'text-[#2D3436]'
              }`}>
                Haftalık İlerleme
              </h2>
            </div>
          </div>
          <p className={`text-xs -mt-2.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Günlük aktivitelerini görmek için grafik barlarına dokun.
          </p>

          {/* Kolay tıklanabilir geniş filtreleme butonları */}
          <div className={`flex p-1 rounded-2xl w-full text-xs font-bold font-headline-lg shadow-2xs transition-colors ${
            isDarkMode ? 'bg-[#121214] border border-[#2A2A30]' : 'bg-[#FFFBF0] border border-[#FFE66D]'
          }`}>
            <button
              onClick={() => {
                setSelectedChartTab('words');
                setActiveBarIdx(null);
              }}
              className={`flex-1 py-3.5 rounded-xl transition-all cursor-pointer text-center ${
                selectedChartTab === 'words' ? 'bg-[#FF6B6B] text-white shadow-xs font-bold' : 'text-gray-400 hover:text-[#FF6B6B]'
              }`}
            >
              Kelimeler
            </button>
            <button
              onClick={() => {
                setSelectedChartTab('minutes');
                setActiveBarIdx(null);
              }}
              className={`flex-1 py-3.5 rounded-xl transition-all cursor-pointer text-center ${
                selectedChartTab === 'minutes' ? 'bg-[#FF6B6B] text-white shadow-xs font-bold' : 'text-gray-400 hover:text-[#FF6B6B]'
              }`}
            >
              Süre (Dakika)
            </button>
          </div>
        </div>

        {/* Geniş ve kolay tıklanabilir grafik barları */}
        <div className="h-40 flex items-end justify-between px-2 pt-2 relative mb-6">
          <div className="absolute inset-x-0 top-6 bottom-0 flex flex-col justify-between pointer-events-none opacity-10">
            <div className="border-b border-current w-full" />
            <div className="border-b border-current w-full" />
            <div className="border-b border-current w-full" />
          </div>

          {chartData.map((d, idx) => {
            const isFeatured = idx === (activeBarIdx !== null ? activeBarIdx : dayIndex);
            const targetVal = selectedChartTab === 'words' ? d.learnedWords : d.readMins;
            const maxVal = selectedChartTab === 'words' ? maxWords : maxMinutes;

            const heightPercent = maxVal > 0 ? (targetVal / maxVal) * 82 : 8;

            return (
              <div
                key={d.day}
                onClick={() => setActiveBarIdx(idx)}
                className="flex flex-col items-center flex-1 cursor-pointer group py-2"
              >
                <div className={`w-[60%] xs:w-[45%] max-w-[28px] rounded-lg h-28 flex items-end overflow-hidden mb-2 border transition-all ${
                  isFeatured
                    ? isDarkMode 
                      ? 'bg-[#1E1E22] border-[#FF6B6B]' 
                      : 'bg-white border-[#FF6B6B] shadow-sm'
                    : isDarkMode 
                      ? 'bg-[#121214] border-transparent' 
                      : 'bg-gray-100 border-transparent'
                }`}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ type: 'spring', stiffness: 85, delay: idx * 0.03 }}
                    className={`w-full rounded-t-lg transition-colors ${
                      isFeatured
                        ? 'bg-[#FF6B6B]'
                        : 'bg-[#4ECDC4] group-hover:bg-[#3cacb0]'
                    }`}
                  />
                </div>

                <span className={`text-[11px] font-bold ${isFeatured ? 'text-[#FF6B6B] font-extrabold scale-110' : 'text-gray-400'} transition-transform`}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Detay Kartı */}
        {(() => {
          const activeIdx = activeBarIdx !== null ? activeBarIdx : dayIndex;
          const activeData = chartData[activeIdx];
          const isToday = activeIdx === dayIndex;
          
          if (!activeData) return null;

          const targetVal = selectedChartTab === 'words' ? activeData.learnedWords : activeData.readMins;
          const unit = selectedChartTab === 'words' ? 'kelime' : 'dakika';
          const title = selectedChartTab === 'words' ? 'Öğrenilen Kelime' : 'Okuma Süresi';

          return (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl flex items-center gap-3 border transition-colors ${
                isDarkMode 
                  ? 'bg-[#121214] border-[#2A2A30] text-gray-300' 
                  : 'bg-gray-50 border-gray-150 text-gray-700'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${
                isDarkMode ? 'bg-[#FF6B6B]/15 text-[#FF6B6B]' : 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
              }`}>
                {selectedChartTab === 'words' ? <Sparkles className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-headline-lg">
                    {activeData.day} Günü Özeti {isToday && '(Bugün)'}
                  </span>
                  <span className={`text-xs font-bold text-gray-450 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {title}
                  </span>
                </div>
                <p className={`text-xs font-bold mt-0.5 ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>
                  {targetVal > 0 
                    ? `Harika! O gün tam ${targetVal} ${unit} tamamladın. 🚀` 
                    : `O gün henüz ${unit} kaydı bulunmuyor.`}
                </p>
              </div>
            </motion.div>
          );
        })()}
      </section>

      {/* GAMIFICATION BADGES CONTAINER (Rozetler) - Mobile list layout */}
      <section className={`border-2 rounded-[28px] p-6 mb-8 transition-colors ${
        isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
      }`}>
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FF6B6B]/20 text-[#FF6B6B]">
              <Award className="w-5 h-5" />
            </div>
            <h2 className={`font-headline-lg text-base font-bold tracking-tight ${
              isDarkMode ? 'text-white' : 'text-[#2D3436]'
            }`}>
              Başarı Rozetlerim
            </h2>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-headline-lg ${
            isDarkMode ? 'bg-[#121214] text-[#FFE66D]' : 'bg-[#FFFBF0] text-[#FF6B6B]'
          }`}>
            {badges.filter(b => b.unlocked).length} / {badges.length} Açıldı
          </span>
        </div>

        <div className="space-y-3.5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${
                badge.unlocked
                  ? isDarkMode 
                    ? 'bg-[#FF6B6B]/5 border-[#FF6B6B]/40 hover:border-[#FF6B6B]' 
                    : 'bg-[#FFFBF0]/60 border-[#FFE66D] hover:border-[#FF6B6B]/50'
                  : isDarkMode 
                    ? 'bg-[#121214]/40 border-[#2A2A30] opacity-60' 
                    : 'bg-gray-50/50 border-gray-150 opacity-70'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`p-3 rounded-2xl shrink-0 transition-transform duration-300 ${
                  badge.unlocked 
                    ? 'bg-[#FFE66D]/35 shadow-xs scale-105' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {getBadgeIcon(badge.iconName, badge.unlocked)}
                </div>
                
                <div>
                  <h4 className={`font-bold text-xs leading-tight mb-0.5 ${
                    badge.unlocked 
                      ? isDarkMode ? 'text-white' : 'text-gray-900 font-extrabold' 
                      : 'text-gray-500'
                  }`}>
                    {badge.title}
                  </h4>
                  <p className="text-[10px] text-gray-400 leading-snug">
                    {badge.description}
                  </p>
                  {badge.unlocked && badge.unlockedAt && (
                    <span className="text-[9px] font-bold text-[#4ECDC4] font-mono mt-1 block">
                      Kazanıldı: {badge.unlockedAt}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                {badge.unlocked ? (
                  <div className="p-1 rounded-full bg-[#4ECDC4]/10 text-[#4ECDC4] border border-[#4ECDC4]/20">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SETTINGS AND ACTION STRIP LISTS */}
      <section className={`border-2 rounded-[28px] overflow-hidden shadow-3xs select-none transition-colors ${
        isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
      }`}>
        <h3 className="text-[10px] font-bold text-gray-450 tracking-widest px-6 pt-5 mb-1.5 block font-headline-lg">
          GENEL AYARLAR
        </h3>

        <div className={`divide-y transition-colors ${
          isDarkMode ? 'divide-[#2A2A30]' : 'divide-[#FFE66D]/60'
        }`}>
          <button
            onClick={handleShareClick}
            className={`w-full flex items-center justify-between p-4 px-6 transition-colors group text-left cursor-pointer ${
              isDarkMode ? 'hover:bg-[#121214] text-gray-200' : 'hover:bg-[#FFFBF0]'
            }`}
          >
            <span className="text-xs font-bold">Uygulamayı Paylaş</span>
            <Share2 className="w-4 h-4 text-[#FF6B6B]" />
          </button>
          
          {!stats.isPremium && (
            <button
              onClick={onTriggerPremiumPanel}
              className={`w-full flex items-center justify-between p-4 px-6 transition-colors group text-left text-[#FF6B6B] font-extrabold cursor-pointer ${
                isDarkMode ? 'hover:bg-[#121214]' : 'hover:bg-[#FFFBF0]'
              }`}
            >
              <span className="text-xs flex items-center gap-2 font-headline-lg">
                <Crown className="w-5 h-5 text-[#FFE66D] fill-[#FF6B6B]" />
                İngilizce Öyküm Premium Satın Al (200₺)
              </span>
              <ChevronRight className="w-4 h-4 text-[#FF6B6B] group-hover:translate-x-1 transition-all" />
            </button>
          )}

          <button
            onClick={onEnterAdminMode}
            className={`w-full flex items-center justify-between p-4 px-6 transition-colors group text-left cursor-pointer ${
              isDarkMode ? 'hover:bg-[#121214] text-[#4ECDC4]' : 'hover:bg-[#FFFBF0] text-[#3cacb0]'
            }`}
          >
            <span className="text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#FF6B6B]" />
              Yönetici Paneli (Admin Girişi)
            </span>
            <ChevronRight className="w-4.5 h-4.5 text-[#FF6B6B] group-hover:translate-x-1 transition-all" />
          </button>

          {stats.isPremium && (
            <button
              onClick={() => {
                const localStatsStr = localStorage.getItem('linguist_stats_v11');
                if (localStatsStr) {
                  const currentStats = JSON.parse(localStatsStr);
                  currentStats.isPremium = false;
                  currentStats.hearts = 5;
                  localStorage.setItem('linguist_stats_v11', JSON.stringify(currentStats));
                }
                window.location.reload();
              }}
              className={`w-full flex items-center justify-between p-4 px-6 transition-colors group text-left text-amber-500 font-extrabold cursor-pointer ${
                isDarkMode ? 'hover:bg-amber-950/20' : 'hover:bg-amber-50/50'
              }`}
            >
              <span className="text-xs">Premium Üyeliği Kapat (Test Amaçlı)</span>
              <Crown className="w-4 h-4 text-amber-500" />
            </button>
          )}

          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className={`w-full flex items-center justify-between p-4 px-6 transition-colors group text-left text-red-500 font-extrabold cursor-pointer ${
              isDarkMode ? 'hover:bg-red-950/20' : 'hover:bg-red-50/50'
            }`}
          >
            <span className="text-xs">Uygulamayı ve Verileri Sıfırla (İlk Yükleme)</span>
            <RefreshCw className="w-4 h-4 text-red-500 group-hover:rotate-180 transition-all duration-500" />
          </button>

          <button className={`w-full flex items-center justify-between p-4 px-6 transition-colors group text-left text-rose-600 font-extrabold cursor-pointer ${
            isDarkMode ? 'hover:bg-[#121214]' : 'hover:bg-[#FFFBF0]'
          }`}>
            <span className="text-xs">Çıkış Yap</span>
          </button>
        </div>
      </section>

      {/* MOCK HIGH-FIDELITY SOCIAL SHARING SYSTEM MODAL */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#2D3436]/55 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full rounded-[28px] border-2 p-6 flex flex-col items-center text-center shadow-2xl relative transition-all ${
                isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
              }`}
            >
              <button
                onClick={() => setIsShareModalOpen(false)}
                className={`absolute top-4 right-4 p-1 px-2.5 rounded-lg text-xs font-bold font-mono cursor-pointer transition-colors ${
                  isDarkMode ? 'text-gray-300 bg-[#2A2A30] hover:bg-[#343A40]' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Kapat
              </button>

              <div className="w-12 h-12 rounded-full bg-[#FFE66D]/20 text-[#FF6B6B] flex items-center justify-center mb-4 border border-[#FF6B6B]/20 shadow-sm">
                <Share2 className="w-6 h-6" />
              </div>

              <h3 className={`font-headline-lg text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                Uygulamayı Arkadaşlarınla Paylaş!
              </h3>
              <p className="text-xs text-gray-400 mb-5 px-1 leading-relaxed font-semibold">
                İngilizce Öyküm'ü sevdiklerinize önerin, birlikte harika hikayeler okuyarak kelime dağarcığınızı geliştirin!
              </p>

              {/* Unique Invitation Code Area */}
              <div className={`w-full p-4 rounded-2xl border-2 border-dashed mb-5 transition-colors ${
                isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-[#FFFBF0] border-[#FFE66D]'
              }`}>
                <span className="text-[10px] font-bold text-gray-400 tracking-widest block mb-1">
                  PAYLAŞIM VE DAVET KODUNUZ
                </span>
                <div className="flex items-center justify-between gap-2 bg-black/5 dark:bg-white/5 p-2 px-3 rounded-xl border border-gray-400/20">
                  <span className="font-mono text-sm font-extrabold tracking-wider text-[#FF6B6B]">
                    {shareCode}
                  </span>
                  <button
                    onClick={() => handleCopyLinkOrCode(shareCode, true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#FF6B6B] hover:bg-[#ff5252] text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  >
                    {codeCopied ? (
                      <span>Kopyalandı! ✓</span>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Kodu Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Channels List */}
              <div className="w-full space-y-2 mb-4">
                <span className="text-[10px] font-bold text-gray-400 tracking-widest block text-left mb-2">
                  TÜM SOSYAL MEDYALARDA PAYLAŞIN
                </span>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey! İngilizce Öyküm ile harika İngilizce hikayeler okuyup yeni kelimeler öğreniyorum. Benimle birlikte katılmak istersen, işte davet kodum: ${shareCode} - Sen de hemen dene: https://ingilizceoykum.com`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handlePlatformShare('WhatsApp')}
                    className="py-2.5 px-3 bg-[#25D366] text-white rounded-xl text-[11px] font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent('https://ingilizceoykum.com')}&text=${encodeURIComponent(`Hey! İngilizce Öyküm ile harika İngilizce hikayeler okuyup yeni kelimeler öğreniyorum. Benimle birlikte katılmak istersen, işte davet kodum: ${shareCode}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handlePlatformShare('Telegram')}
                    className="py-2.5 px-3 bg-[#0088cc] text-white rounded-xl text-[11px] font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Telegram</span>
                  </a>

                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Hey! İngilizce Öyküm ile harika İngilizce hikayeler okuyup yeni kelimeler öğreniyorum. Benimle birlikte katılmak istersen, işte davet kodum: ${shareCode} - Sen de hemen dene: https://ingilizceoykum.com`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handlePlatformShare('X / Twitter')}
                    className="py-2.5 px-3 bg-[#2D3436] text-white rounded-xl text-[11px] font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-xs border border-gray-700"
                  >
                    <span>X / Twitter</span>
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://ingilizceoykum.com')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handlePlatformShare('Facebook')}
                    className="py-2.5 px-3 bg-[#1877F2] text-white rounded-xl text-[11px] font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Facebook</span>
                  </a>
                </div>

                {/* Copy whole invitation message text */}
                <button
                  onClick={() => handleCopyLinkOrCode(`Hey! İngilizce Öyküm ile harika İngilizce hikayeler okuyup yeni kelimeler öğreniyorum. Benimle birlikte katılmak istersen, işte davet kodum: ${shareCode} - Sen de hemen indir ve dene: https://ingilizceoykum.com`, false)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2 ${
                    isDarkMode 
                      ? 'border-gray-700 hover:bg-white/5 text-gray-300' 
                      : 'border-[#FFE66D] hover:bg-gray-50 text-gray-700 bg-white'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5 text-[#FF6B6B]" />
                  <span>Davet Mesajını Kopyala</span>
                </button>
              </div>

              {/* Loader overlay on share trigger */}
              <AnimatePresence>
                {sharePlatform && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 rounded-3xl z-40 flex flex-col items-center justify-center p-6 ${
                      isDarkMode ? 'bg-[#1A1A1E]' : 'bg-white'
                    }`}
                  >
                    <RefreshCw className="w-8 h-8 text-[#FF6B6B] animate-spin mb-3" />
                    <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {sharePlatform} İçin Hazırlanıyor...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
