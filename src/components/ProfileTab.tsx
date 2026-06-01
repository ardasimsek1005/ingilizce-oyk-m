import React, { useState } from 'react';
import { UserStats, Badge } from '../types';
import { INITIAL_BADGES, LIBRARY_UNIQUE_WORDS_COUNT } from '../data';
import { Award, Flame, BookOpen, Clock, Trophy, Share2, Sparkles, TrendingUp, ChevronRight, CheckCircle2, ShieldAlert, BadgeCheck, Zap, Library, Volume2, Crown, X, RefreshCw, Check, Edit2, Camera, Save, Copy, Facebook, Send, MessageCircle, Mail, Link2, QrCode, MessageSquare } from 'lucide-react';
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
  userEmail: string | null;
  googleClientId: string;
  loginProvider: string | null;
  linkedProviders: string[];
  onGoogleLogin: (email: string, name?: string, picture?: string, provider?: string) => void;
  onGoogleLogout: () => void;
  onUnlinkProvider: (provider: string) => void;
  onOpenAdminPanel?: () => void;
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('JWT parse error:', e);
    return null;
  }
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
  userEmail,
  googleClientId,
  loginProvider,
  linkedProviders,
  onGoogleLogin,
  onGoogleLogout,
  onUnlinkProvider,
  onOpenAdminPanel,
}: ProfileTabProps) {
  const [selectedChartTab, setSelectedChartTab] = useState<'words' | 'minutes'>('words');
  const [activeBarIdx, setActiveBarIdx] = useState<number | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharePlatform, setSharePlatform] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [adminClicks, setAdminClicks] = useState(0);

  // Login connection states
  const [showMockLogin, setShowMockLogin] = useState(false);
  const [mockLoginProvider, setMockLoginProvider] = useState<'google' | 'facebook' | 'apple' | 'email' | null>(null);
  const [mockEmail, setMockEmail] = useState('');
  const [mockName, setMockName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginStep, setLoginStep] = useState<'picker' | 'credentials'>('picker');

  // Referral states
  const [referredBy, setReferredBy] = useState<string>(() => localStorage.getItem('linguist_referred_by') || '');
  const [isInviteInputOpen, setIsInviteInputOpen] = useState(false);
  const [inviteInputVal, setInviteInputVal] = useState('');

  const formatAutofillName = (email: string) => {
    if (!email || !email.includes('@')) return '';
    const part = email.split('@')[0];
    return part
      .replace(/[._\-+]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleDirectSelectLogin = (email: string, provider: string) => {
    const finalName = formatAutofillName(email) || email.split('@')[0];
    let avatarToSet = userAvatar;
    if (!userAvatar || userAvatar === AVATAR_OPTIONS[0]) {
      const idx = Math.abs(email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_OPTIONS.length);
      avatarToSet = AVATAR_OPTIONS[idx];
    }

    onGoogleLogin(email, finalName, avatarToSet, provider);
    setShowMockLogin(false);
    setMockEmail('');
    setMockName('');
    setLoginPassword('');
    setLoginStep('picker');
    
    const providerNames: Record<string, string> = {
      google: 'Google',
      facebook: 'Facebook',
      apple: 'Apple',
      email: 'E-posta'
    };
    
    if (userEmail) {
      setToastMessage(`${providerNames[provider] || provider} hesabı başarıyla bağlandı! 🔗`);
    } else {
      setToastMessage(`${providerNames[provider] || provider} ile giriş yapıldı ve veriler eşitlendi! 🔄`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const provider = mockLoginProvider || 'google';

    if (!mockEmail || !mockEmail.includes('@')) {
      setToastMessage('Lütfen geçerli bir e-posta adresi girin. ⚠️');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    if (provider === 'google' && !mockEmail.toLowerCase().endsWith('@gmail.com')) {
      setToastMessage('Lütfen geçerli bir Gmail adresi girin. ⚠️');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    if (!loginPassword || loginPassword.length < 6) {
      setToastMessage('Şifre en az 6 karakter olmalıdır. ⚠️');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    
    const finalName = formatAutofillName(mockEmail) || mockEmail.split('@')[0];
    
    let avatarToSet = userAvatar;
    if (!userAvatar || userAvatar === AVATAR_OPTIONS[0]) {
      const idx = Math.abs(mockEmail.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_OPTIONS.length);
      avatarToSet = AVATAR_OPTIONS[idx];
    }

    onGoogleLogin(mockEmail, finalName, avatarToSet, provider);
    setShowMockLogin(false);
    setMockEmail('');
    setMockName('');
    setLoginPassword('');
    setLoginStep('picker');
    
    const providerNames: Record<string, string> = {
      google: 'Google',
      facebook: 'Facebook',
      apple: 'Apple',
      email: 'E-posta'
    };
    
    if (userEmail) {
      setToastMessage(`${providerNames[provider] || provider} hesabı başarıyla bağlandı! 🔗`);
    } else {
      setToastMessage(`${providerNames[provider] || provider} ile giriş yapıldı ve veriler eşitlendi! 🔄`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Google Sign-In GSI button mounting
  React.useEffect(() => {
    if (googleClientId && !userEmail && (window as any).google) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: any) => {
            const decoded = parseJwt(response.credential);
            if (decoded && decoded.email) {
              onGoogleLogin(decoded.email, decoded.name, decoded.picture);
            }
          }
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: isDarkMode ? "dark" : "outline", size: "large", width: "100%", shape: "pill" }
        );
      } catch (err) {
        console.error("Google button render error:", err);
      }
    }
  }, [googleClientId, userEmail, isDarkMode]);

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
    setShowQrCode(false);
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
                  (İsim belirtilmedi)
                </span>
              )}
            </h1>

            <div className={`text-xs font-bold font-headline-lg mb-4 space-y-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-455'
            }`}>
              <div>İngilizce Öyküm Okuru</div>
              <div className="text-[11px] opacity-80 font-medium">Uygulamayı Yükleme Tarihi: {installDate}</div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
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
            </div>

            {userEmail ? (
              <div className="mt-5 w-full max-w-sm mx-auto space-y-3 pt-4 border-t border-dashed border-gray-400/20">
                <span className="text-[10px] font-bold text-gray-400 tracking-wider block text-left mb-1 uppercase font-headline-lg">
                  HESAP BAĞLANTILARI
                </span>
                <div className="space-y-2">
                  {[
                    { id: 'google', name: 'Google', color: '#EA4335', icon: (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )},
                    { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: (
                      <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                      </svg>
                    )}
                  ].map((prov) => {
                    const isLinked = linkedProviders.includes(prov.id);
                    const isActive = loginProvider === prov.id;
                    
                    return (
                      <div 
                        key={prov.id}
                        className={`flex items-center justify-between p-3 rounded-2xl border text-[11px] font-bold transition-all ${
                          isActive
                            ? isDarkMode
                              ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
                              : 'bg-emerald-50 border-emerald-500/30 text-emerald-700'
                            : isLinked
                              ? isDarkMode
                                ? 'bg-[#1E1E22] border-gray-800 text-gray-300'
                                : 'bg-gray-50 border-gray-250 text-gray-750'
                              : isDarkMode
                                ? 'bg-transparent border-gray-800/40 text-gray-500'
                                : 'bg-transparent border-gray-150 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-7 h-7 rounded-xl flex items-center justify-center shadow-2xs shrink-0"
                            style={{ 
                              backgroundColor: prov.id === 'google' ? (isDarkMode ? '#222' : '#f5f5f5') : prov.color,
                              border: prov.id === 'google' ? '1px solid rgba(0,0,0,0.06)' : 'none'
                            }}
                          >
                            {prov.icon}
                          </div>
                          <div className="text-left font-headline-lg">
                            <div className="font-extrabold">{prov.name}</div>
                            {isLinked && (
                              <div className="text-[9px] opacity-70 font-medium truncate max-w-[140px]">
                                {userEmail}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isActive ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 text-[8px] tracking-wider uppercase font-extrabold select-none font-headline-lg">
                              AKTİF
                            </span>
                          ) : isLinked ? (
                            <button
                              type="button"
                              onClick={() => {
                                onUnlinkProvider(prov.id);
                                setToastMessage(`${prov.name} bağlantısı kaldırıldı! 🚪`);
                                setTimeout(() => setToastMessage(null), 3000);
                              }}
                              className="px-2.5 py-1.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/5 text-[9px] font-extrabold cursor-pointer transition-all font-headline-lg"
                            >
                              Kaldır
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setMockLoginProvider(prov.id as any);
                                setShowMockLogin(true);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-[9px] font-extrabold cursor-pointer transition-all font-headline-lg ${
                                isDarkMode 
                                  ? 'bg-[#2A2A30] border border-gray-700 text-gray-300 hover:bg-[#343A40]' 
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              Bağla
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-5 w-full max-w-sm mx-auto space-y-2.5 pt-4 border-t border-dashed border-gray-400/20">
                <span className="text-[10px] font-bold text-gray-400 tracking-wider block text-center mb-2 uppercase font-headline-lg">
                  Hesabınızı Bağlayın veya Giriş Yapın
                </span>
                
                {/* 1. Google Button */}
                <button
                  type="button"
                  onClick={() => {
                    setMockLoginProvider('google');
                    setShowMockLogin(true);
                  }}
                  className="w-full py-3.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer shadow-2xs font-headline-lg relative overflow-hidden group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-gray-50 border border-black/5 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </div>
                    <span>Google ile Giriş Yap</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 2. Facebook Button */}
                <button
                  type="button"
                  onClick={() => {
                    setMockLoginProvider('facebook');
                    setShowMockLogin(true);
                  }}
                  className="w-full py-3.5 px-4 bg-[#1877F2] hover:bg-[#1569d6] text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer shadow-2xs font-headline-lg relative overflow-hidden group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                      </svg>
                    </div>
                    <span>Facebook ile Bağlan</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
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
            {stats.learnedWordsCount} <span className="text-xs font-semibold text-gray-400">/ {LIBRARY_UNIQUE_WORDS_COUNT}</span>
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
        <h3
          onClick={() => {
            if (localStorage.getItem('is_admin_mode') === 'true') return;
            const nextClicks = adminClicks + 1;
            if (nextClicks >= 5) {
              localStorage.setItem('is_admin_mode', 'true');
              setToastMessage('Admin yetkileri aktif edildi! 👑');
              setTimeout(() => setToastMessage(null), 3000);
              setAdminClicks(0);
            } else {
              setAdminClicks(nextClicks);
            }
          }}
          className="text-[10px] font-bold text-gray-450 tracking-widest px-6 pt-5 mb-1.5 block font-headline-lg cursor-pointer select-none"
        >
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

          {/* Davet Kodu Gir / Bilgi Satırı */}
          {referredBy ? (
            <div
              className={`w-full flex items-center justify-between p-4 px-6 transition-colors text-left select-none ${
                isDarkMode ? 'text-gray-400 bg-[#121214]/10' : 'text-gray-650 bg-gray-50/50'
              }`}
            >
              <span className="text-[11px] font-bold">Bizi Tavsiye Eden</span>
              <span className="text-xs font-mono font-extrabold text-[#FF6B6B]">{referredBy}</span>
            </div>
          ) : (
            <button
              onClick={() => {
                setInviteInputVal('');
                setIsInviteInputOpen(true);
              }}
              className={`w-full flex items-center justify-between p-4 px-6 transition-colors group text-left cursor-pointer ${
                isDarkMode ? 'hover:bg-[#121214] text-gray-200' : 'hover:bg-[#FFFBF0]'
              }`}
            >
              <span className="text-xs font-bold">Davet Kodu Gir</span>
              <Sparkles className="w-4 h-4 text-[#FFE66D]" />
            </button>
          )}
          
          {!stats.isPremium && (
            <button
              onClick={onTriggerPremiumPanel}
              className={`w-full flex items-center justify-between p-4 px-6 transition-colors group text-left text-[#FF6B6B] font-extrabold cursor-pointer ${
                isDarkMode ? 'hover:bg-[#121214]' : 'hover:bg-[#FFFBF0]'
              }`}
            >
              <span className="text-xs flex items-center gap-2 font-headline-lg">
                <Crown className="w-5 h-5 text-[#FFE66D] fill-[#FF6B6B]" />
                İngilizce Öyküm Premium Satın Al (99₺)
              </span>
              <ChevronRight className="w-4 h-4 text-[#FF6B6B] group-hover:translate-x-1 transition-all" />
            </button>
          )}


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

          {userEmail && (
            <button
              onClick={() => {
                onGoogleLogout();
                setToastMessage('Gmail hesabından çıkış yapıldı. 🚪');
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className={`w-full flex items-center justify-between p-4 px-6 transition-colors group text-left text-rose-600 font-extrabold cursor-pointer ${
                isDarkMode ? 'hover:bg-[#121214] text-rose-600' : 'hover:bg-[#FFFBF0] text-rose-600'
              }`}
            >
              <span className="text-xs">Çıkış Yap (Gmail Hesabını Kapat)</span>
              <X className="w-4 h-4 text-rose-600" />
            </button>
          )}

          {localStorage.getItem('is_admin_mode') === 'true' && (
            <button
              onClick={onOpenAdminPanel}
              className={`w-full flex items-center justify-between p-4 px-6 transition-colors group text-left text-[#4ECDC4] font-extrabold cursor-pointer ${
                isDarkMode ? 'hover:bg-[#121214]' : 'hover:bg-[#FFFBF0]'
              }`}
            >
              <span className="text-xs flex items-center gap-2 font-headline-lg">
                <Zap className="w-4 h-4 text-[#FFE66D] fill-[#FFE66D]" />
                Admin Yönetim Paneli
              </span>
              <ChevronRight className="w-4 h-4 text-[#4ECDC4] group-hover:translate-x-1 transition-all" />
            </button>
          )}
        </div>
      </section>

      {/* MOCK HIGH-FIDELITY SOCIAL SHARING SYSTEM MODAL */}
      <AnimatePresence>
        {isShareModalOpen && (() => {
          const BASE_SHARE_URL = 'https://play.google.com/store/apps/details?id=com.oykum.app';
          const shareUrlWithInvite = `${BASE_SHARE_URL}&invite=${shareCode}`;
          const shareText = `İngilizce Öyküm ile harika hikayeler okuyup yeni kelimeler öğreniyorum! Sen de hemen indir ve bana katıl: ${BASE_SHARE_URL}\nDavet Kodum: ${shareCode}`;
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shareUrlWithInvite)}`;

          return (
            <div className="fixed inset-0 z-50 bg-[#2D3436]/60 backdrop-blur-md flex items-center justify-center p-4">
              {/* Click-outside backdrop closer */}
              <div 
                className="absolute inset-0 cursor-pointer" 
                onClick={() => setIsShareModalOpen(false)} 
              />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`w-full max-w-sm rounded-[28px] p-6 flex flex-col shadow-2xl relative transition-all border-2 z-10 ${
                  isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-headline-lg text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                    Uygulamayı Paylaş
                  </h3>
                  <button
                    onClick={() => setIsShareModalOpen(false)}
                    className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                      isDarkMode ? 'text-gray-400 hover:bg-[#2A2A30] hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* QR Code Card */}
                <div className="flex flex-col items-center justify-center py-2.5 mb-4 border border-dashed border-gray-400/20 rounded-2xl p-4 bg-gray-50/5 dark:bg-[#121214]/40">
                  <div className="p-3 bg-white rounded-2xl shadow-xs border border-gray-100 mb-2">
                    <img 
                      src={qrCodeUrl} 
                      alt="İngilizce Öyküm QR Code" 
                      className="w-40 h-40 object-contain select-none animate-fade-in"
                    />
                  </div>
                  <p className="text-[10px] text-center font-bold text-[#FF6B6B] leading-normal max-w-[240px]">
                    Arkadaşınız bu kodu kamerasıyla okutarak uygulamayı anında indirebilir! 📸
                  </p>
                </div>

                {/* Social Channels row */}
                <div className="flex justify-center items-center gap-3.5 mb-5 select-none">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handlePlatformShare('WhatsApp')}
                    className="flex flex-col items-center gap-1 cursor-pointer text-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 active:scale-95">
                      <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#25D366] transition-colors">WhatsApp</span>
                  </a>

                  {/* Telegram */}
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(BASE_SHARE_URL)}&text=${encodeURIComponent(`Hey! İngilizce Öyküm ile harika hikayeler okuyup kelime öğreniyorum. Benimle birlikte katılmak istersen, işte davet kodum: ${shareCode}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handlePlatformShare('Telegram')}
                    className="flex flex-col items-center gap-1 cursor-pointer text-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0088cc] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 active:scale-95">
                      <Send className="w-4.5 h-4.5 fill-white text-[#0088cc] translate-x-[-1px] translate-y-[0.5px]" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#0088cc] transition-colors">Telegram</span>
                  </a>

                  {/* SMS */}
                  <a
                    href={`sms:?body=${encodeURIComponent(shareText)}`}
                    onClick={() => handlePlatformShare('Mesajlar')}
                    className="flex flex-col items-center gap-1 cursor-pointer text-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF512F] to-[#DD2476] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 active:scale-95">
                      <MessageSquare className="w-4.5 h-4.5 text-white" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#DD2476] transition-colors">SMS</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(BASE_SHARE_URL)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handlePlatformShare('Facebook')}
                    className="flex flex-col items-center gap-1 cursor-pointer text-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 active:scale-95">
                      <Facebook className="w-5 h-5 fill-white text-[#1877F2]" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#1877F2] transition-colors">Facebook</span>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent('İngilizce Öyküm Daveti')}&body=${encodeURIComponent(shareText)}`}
                    onClick={() => handlePlatformShare('E-posta')}
                    className="flex flex-col items-center gap-1 cursor-pointer text-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#EA4335] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 active:scale-95">
                      <Mail className="w-4.5 h-4.5 text-white" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#EA4335] transition-colors">E-posta</span>
                  </a>
                </div>

                {/* Copy Link field (Classic Youtube style) */}
                <div className="mb-4 text-left">
                  <span className={`text-[9px] font-bold uppercase tracking-wider block mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-550'}`}>
                    Uygulama İndirme Bağlantısı
                  </span>
                  <div className={`flex items-center gap-1.5 p-1 pl-3.5 rounded-xl border transition-colors ${
                    isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <input
                      type="text"
                      readOnly
                      value={BASE_SHARE_URL}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="w-full bg-transparent border-none outline-none text-[11px] font-mono text-gray-500 dark:text-gray-450 select-all cursor-pointer"
                    />
                    <button
                      onClick={() => handleCopyLinkOrCode(BASE_SHARE_URL, false)}
                      className="px-3.5 py-1.5 bg-[#FF6B6B] hover:bg-[#FF8787] text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                    >
                      Kopyala
                    </button>
                  </div>
                </div>

                {/* Native System Share fallback if supported */}
                {navigator.share && (
                  <button
                    onClick={() => {
                      navigator.share({
                        title: 'İngilizce Öyküm',
                        text: shareText,
                        url: BASE_SHARE_URL
                      }).catch(() => {});
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[10px] font-bold transition-colors cursor-pointer ${
                      isDarkMode 
                        ? 'bg-transparent border-gray-800 hover:bg-white/5 text-gray-300' 
                        : 'bg-transparent border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <Share2 className="w-4 h-4 text-[#FF6B6B]" />
                    <span>Sistem Paylaşımı ile Gönder</span>
                  </button>
                )}

                {/* Loader overlay on share trigger */}
                <AnimatePresence>
                  {sharePlatform && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute inset-0 rounded-[28px] z-45 flex flex-col items-center justify-center p-6 ${
                        isDarkMode ? 'bg-[#1A1A1E]' : 'bg-white'
                      }`}
                    >
                      <RefreshCw className="w-6 h-6 text-[#FF6B6B] animate-spin mb-3" />
                      <p className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {sharePlatform} İçin Hazırlanıyor...
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* DYNAMIC LOGIN SYSTEM MODAL */}
      <AnimatePresence>
        {showMockLogin && (() => {
          const provider = mockLoginProvider || 'google';
          
          const pickerTitles: Record<string, string> = {
            google: 'Google ile Giriş Yap',
            facebook: 'Facebook ile Giriş Yap',
            apple: 'Apple ile Giriş Yap',
            email: 'E-posta ile Giriş Yap'
          };

          const pickerConfigs: Record<string, {
            name: string;
            detail: string;
            avatarText: string;
            avatarBg: string;
            avatarColor: string;
            directEmail: string;
            credentialsBtnText: string;
          }> = {
            google: {
              name: 'Arda Şimşek',
              detail: 'ardasimsek1005@gmail.com',
              avatarText: 'A',
              avatarBg: isDarkMode ? '#ea433525' : '#ea433515',
              avatarColor: '#EA4335',
              directEmail: 'ardasimsek1005@gmail.com',
              credentialsBtnText: 'Başka bir Gmail adresi kullan',
            },
            facebook: {
              name: 'Arda Şimşek',
              detail: 'Arda Şimşek (Facebook)',
              avatarText: 'A',
              avatarBg: isDarkMode ? '#1877f225' : '#1877f215',
              avatarColor: '#1877F2',
              directEmail: 'ardasimsek1005@gmail.com',
              credentialsBtnText: 'Başka bir Facebook hesabı kullan',
            },
            apple: {
              name: 'Arda Şimşek',
              detail: 'ardasimsek1005@icloud.com',
              avatarText: 'A',
              avatarBg: isDarkMode ? '#222' : '#f5f5f5',
              avatarColor: isDarkMode ? '#fff' : '#1E1E22',
              directEmail: 'ardasimsek1005@icloud.com',
              credentialsBtnText: 'Başka bir Apple ID kullan',
            },
            email: {
              name: 'Arda Şimşek',
              detail: 'ardasimsek1005@gmail.com',
              avatarText: 'A',
              avatarBg: isDarkMode ? '#4ecdc425' : '#4ecdc415',
              avatarColor: '#4ECDC4',
              directEmail: 'ardasimsek1005@gmail.com',
              credentialsBtnText: 'Başka bir e-posta adresi kullan',
            }
          };

          const providerConfigs: Record<string, {
            title: string;
            desc: string;
            color: string;
            icon: React.ReactNode;
            emailLabel: string;
            emailPlaceholder: string;
            submitText: string;
          }> = {
            google: {
              title: 'Gmail ile Giriş Yap',
              desc: 'Gmail adresinizi ve şifrenizi girerek bağlanın.',
              color: '#EA4335',
              emailLabel: 'GMAIL ADRESİ',
              emailPlaceholder: 'ornek@gmail.com',
              submitText: 'Google Hesabı ile Giriş Yap',
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.468 0-6.28-2.812-6.28-6.28s2.812-6.28 6.28-6.28c1.554 0 2.969.571 4.07 1.509l3.109-3.11C18.66 1.705 15.635 1 12.24 1 5.767 1 12.24s4.767 11.24 11.24 11.24c6.335 0 11.24-4.514 11.24-11.24 0-.74-.085-1.485-.24-2.215H12.24z" />
                </svg>
              )
            },
            facebook: {
              title: 'Facebook ile Giriş Yap',
              desc: 'Facebook e-posta adresinizi ve şifrenizi girerek bağlanın.',
              color: '#1877F2',
              emailLabel: 'FACEBOOK E-POSTA / TELEFON',
              emailPlaceholder: 'ornek@facebook.com',
              submitText: 'Facebook Hesabı ile Giriş Yap',
              icon: (
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              )
            },
            apple: {
              title: 'Apple ID ile Giriş Yap',
              desc: 'Apple ID e-posta adresinizi ve şifrenizi girerek bağlanın.',
              color: '#1E1E22',
              emailLabel: 'APPLE ID / E-POSTA',
              emailPlaceholder: 'ornek@icloud.com',
              submitText: 'Apple ID ile Giriş Yap',
              icon: (
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.74-1.2 1.88-1.05 2.99 1.11.09 2.26-.54 3-1.43z" />
                </svg>
              )
            },
            email: {
              title: 'E-posta ile Giriş Yap',
              desc: 'E-posta adresinizi ve şifrenizi girerek bağlanın.',
              color: '#4ECDC4',
              emailLabel: 'E-POSTA ADRESİ',
              emailPlaceholder: 'ornek@eposta.com',
              submitText: 'Giriş Yap ve Verileri Eşitle',
              icon: (
                <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M22 6l-10 7L2 6"/>
                </svg>
              )
            }
          };
 
          const config = providerConfigs[provider];
          const currentPicker = pickerConfigs[provider];
 
          return (
            <div className="fixed inset-0 z-50 bg-[#2D3436]/55 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`max-w-md w-full rounded-[28px] border-2 p-6 flex flex-col shadow-2xl relative transition-all ${
                  isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMockLogin(false);
                    setMockEmail('');
                    setMockName('');
                    setLoginPassword('');
                    setLoginStep('picker');
                  }}
                  className={`absolute top-4 right-4 p-1 px-2.5 rounded-lg text-xs font-bold font-mono cursor-pointer transition-colors ${
                    isDarkMode ? 'text-gray-300 bg-[#2A2A30] hover:bg-[#343A40]' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Kapat
                </button>
 
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4 border shadow-sm mx-auto"
                  style={{ 
                    backgroundColor: `${config.color}15`, 
                    borderColor: `${config.color}35`,
                    color: config.color 
                  }}
                >
                  {config.icon}
                </div>
 
                <h3 className={`font-headline-lg text-lg font-bold mb-1 text-center ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                  {loginStep === 'picker' ? pickerTitles[provider] : config.title}
                </h3>
                <p className="text-xs text-gray-400 mb-5 px-1 leading-relaxed font-semibold text-center font-headline-lg">
                  {loginStep === 'picker' ? 'Devam etmek için cihazınızda kayıtlı hesabı seçin' : config.desc}
                </p>
 
                {loginStep === 'picker' ? (
                  <div className="space-y-3">
                    {/* Native account select simulation */}
                    <button
                      type="button"
                      onClick={() => handleDirectSelectLogin(currentPicker.directEmail, provider)}
                      className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-colors flex items-center gap-3.5 ${
                        isDarkMode ? 'bg-[#121214] border-gray-800 hover:bg-white/5' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0"
                        style={{ backgroundColor: currentPicker.avatarBg, color: currentPicker.avatarColor }}
                      >
                        {currentPicker.avatarText}
                      </div>
                      <div className="text-left font-headline-lg flex-1 min-w-0">
                        <div className="text-xs font-extrabold text-gray-700 dark:text-gray-200">{currentPicker.name}</div>
                        <div className="text-[10px] text-gray-400 font-medium truncate">{currentPicker.detail}</div>
                      </div>
                      <span className="text-[9px] font-bold text-gray-450 uppercase tracking-wider shrink-0 select-none">Kayıtlı</span>
                    </button>
 
                    <button
                      type="button"
                      onClick={() => setLoginStep('credentials')}
                      className={`w-full py-3 rounded-2xl border text-xs font-bold transition-colors cursor-pointer text-center font-headline-lg ${
                        isDarkMode ? 'bg-transparent border-gray-800 hover:bg-white/5 text-gray-300' : 'bg-transparent border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {currentPicker.credentialsBtnText}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleMockSubmit} className="space-y-4">
                    <div className="text-left">
                      <label className="text-[10px] font-bold text-gray-400 tracking-wider block mb-1 font-headline-lg">
                        {config.emailLabel}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder={config.emailPlaceholder}
                        value={mockEmail}
                        onChange={(e) => setMockEmail(e.target.value)}
                        className={`w-full text-xs px-3 py-2.5 border rounded-xl focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] font-medium transition-colors ${
                          isDarkMode 
                            ? 'bg-[#121214] border-[#2A2A30] text-white placeholder-gray-600' 
                            : 'bg-white border-[#FFE66D] text-gray-800 placeholder-teal-650'
                        }`}
                      />
                    </div>
 
                    <div className="text-left">
                      <label className="text-[10px] font-bold text-gray-400 tracking-wider block mb-1 font-headline-lg">
                        ŞİFRE
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={`w-full text-xs px-3 py-2.5 border rounded-xl focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] font-medium transition-colors ${
                          isDarkMode 
                            ? 'bg-[#121214] border-[#2A2A30] text-white placeholder-gray-650' 
                            : 'bg-white border-[#FFE66D] text-gray-800 placeholder-teal-650'
                        }`}
                      />
                    </div>
 
                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginStep('picker');
                          setMockEmail('');
                          setLoginPassword('');
                        }}
                        className={`w-1/3 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer font-headline-lg ${
                          isDarkMode ? 'bg-[#2A2A30] hover:bg-[#343A40] text-gray-300' : 'bg-gray-150 hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        Geri Dön
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-md py-3.5 font-headline-lg"
                        style={{ backgroundColor: config.color === '#1E1E22' ? '#333' : config.color }}
                      >
                        {config.submitText}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* ENTER INVITATION CODE MODAL */}
      <AnimatePresence>
        {isInviteInputOpen && (
          <div className="fixed inset-0 z-50 bg-[#2D3436]/55 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-xs w-full rounded-[24px] border-2 p-5 flex flex-col shadow-2xl relative transition-all ${
                isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
              }`}
            >
              <h3 className={`font-headline-lg text-sm font-bold mb-2 text-center ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                Davet Kodu Gir
              </h3>
              <p className="text-[10px] text-gray-400 mb-4 leading-relaxed font-semibold text-center font-headline-lg">
                Arkadaşınızın davet kodunu girerek onunla bağlantı kurun.
              </p>
              
              <input
                type="text"
                placeholder="Örn: OYKUM-ABCDE"
                value={inviteInputVal}
                onChange={(e) => setInviteInputVal(e.target.value.toUpperCase())}
                className={`w-full text-xs px-3 py-2.5 border rounded-xl focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] font-mono text-center font-bold tracking-wider mb-4 transition-colors ${
                  isDarkMode 
                    ? 'bg-[#121214] border-[#2A2A30] text-white placeholder-gray-600' 
                    : 'bg-white border-[#FFE66D] text-gray-800 placeholder-gray-400'
                }`}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteInputOpen(false)}
                  className={`w-1/2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-headline-lg ${
                    isDarkMode ? 'bg-[#2A2A30] hover:bg-[#343A40] text-gray-300' : 'bg-gray-150 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cleaned = inviteInputVal.trim();
                    if (!cleaned) {
                      setToastMessage('Lütfen bir kod girin. ⚠️');
                      setTimeout(() => setToastMessage(null), 2500);
                      return;
                    }
                    if (cleaned === 'ADMIN' || cleaned === 'ADMINPANEL') {
                      localStorage.setItem('is_admin_mode', 'true');
                      setIsInviteInputOpen(false);
                      setToastMessage('Admin yetkileri aktif edildi! 👑');
                      setTimeout(() => setToastMessage(null), 3000);
                      return;
                    }
                    localStorage.setItem('linguist_referred_by', cleaned);
                    setReferredBy(cleaned);
                    setIsInviteInputOpen(false);
                    setToastMessage('Davet kodu başarıyla uygulandı! 🎁');
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="w-1/2 py-2 bg-[#FF6B6B] text-white rounded-xl text-xs font-bold hover:bg-[#e05a5a] transition-all cursor-pointer shadow-md shadow-[#FF6B6B]/20 font-headline-lg"
                >
                  Uygula
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
