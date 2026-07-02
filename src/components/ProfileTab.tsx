import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { UserStats, Badge, VocabularyWord } from '../types';
import { INITIAL_BADGES, LIBRARY_UNIQUE_WORDS_COUNT } from '../data';
import { Award, Flame, BookOpen, Clock, Trophy, Share2, Sparkles, TrendingUp, ChevronRight, CheckCircle2, ShieldAlert, BadgeCheck, Zap, Library, Volume2, Crown, X, RefreshCw, Check, Edit2, Camera, Save, Copy, Facebook, Send, MessageCircle, Mail, Link2, QrCode, MessageSquare, Eye, EyeOff, Plus, Heart, Trash2, Shield, Puzzle, Search, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AVATAR_OPTIONS } from '../avatar_assets';
import { SUPPORTED_LANGUAGES, LanguageCode, t, getDayTranslation, getLocalizedUsername } from '../i18n';

interface ProfileTabProps {
  stats: UserStats;
  badges: Badge[];
  vocabulary: VocabularyWord[];
  onTriggerPremiumPanel: () => void;
  syncTrigger: () => void;
  isDarkMode?: boolean;
  userName: string;
  userAvatar: string;
  onUpdateProfile: (name: string, avatar: string) => void;
  userEmail: string | null;
  loginProvider: string | null;
  onAuthSuccess: (email: string, name?: string, picture?: string, provider?: string, token?: string) => void;
  onLogout: () => void;
  onDeleteAccount: () => Promise<void>;
  deviceUuid: string;
  refillCountdown?: string;
  nativeLanguage: LanguageCode;
  onUpdateLanguage: (lang: LanguageCode) => void;
}

const getApiBase = () => {
  try {
    if (window.location.protocol === 'capacitor:') {
      return 'https://ingilizce-oyk-m.onrender.com';
    }
    return '';
  } catch {
    return '';
  }
};

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

// Robust Profanity and Argo detection helper
function checkIsProfane(name: string): boolean {
  if (!name) return false;
  
  const text = name.toLowerCase().trim();
  
  const replacements: Record<string, string> = {
    '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b',
    'ı': 'i', 'ö': 'o', 'ü': 'u', 'ş': 's', 'ç': 'c', 'ğ': 'g',
    'â': 'a', 'î': 'i', 'û': 'u', 'é': 'e'
  };
  
  let normalized = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    normalized += replacements[char] || char;
  }
  
  // Remove non-alphanumeric character sequences and repeated characters
  let cleanText = '';
  for (let i = 0; i < normalized.length; i++) {
    if (i === 0 || normalized[i] !== normalized[i - 1]) {
      cleanText += normalized[i];
    }
  }
  
  const noSpaces = normalized.replace(/[^a-z0-9]/g, '');
  const cleanNoSpaces = cleanText.replace(/[^a-z0-9]/g, '');
  
  const badWords = [
    // Severe Turkish profanity & argo
    "orospu", "siktir", "sikti", "siker", "amcik", "yarrak", "yarak", "pezevenk",
    "kahpe", "pic", "dalyarak", "amına", "amina", "amını", "amini", "ibne",
    "tassak", "taşşak", "yarag", "yarağ", "göt", "got", "gote", "göte", "gotu",
    "götü", "götlek", "gotlek", "yavsak", "yavşak", "pust", "puşt", "amk", "aq",
    "sik", "siki", "sikiş", "sikis", "koyayim", "koyayım", "koyarim", "koyarım",
    "meme", "gogus", "göğüs", "kalta", "kaltak", "osur", "osurd", "osuruk",
    "bok", "boki", "boku", "bokye", "boklu", "dild", "dildo", "seks", "sex",
    "porno", "pipi", "vagina", "vajin", "vajina", "penis", "hıyar", "hiyar",
    "aptal", "salak", "gerizekali", "gerizekalı", "gerizek", "manyak", "kopek", "köpek",
    // English profanity
    "fuck", "bitch", "asshole", "fucker", "cunt", "dick", "cock", "pussy", "bastard",
    "slut", "whore", "nigga", "nigger",
    // System words
    "admin", "yonetici", "moderator", "destek", "support", "sistem", "system",
    "kurucu", "owner", "staff", "ekip", "team", "yetkili", "developer", "gelistirici"
  ];
  
  // Check substrings for longer bad words
  const hasLongWord = badWords.some(word => {
    if (word.length <= 3) return false;
    return noSpaces.includes(word) || cleanNoSpaces.includes(word);
  });
  if (hasLongWord) return true;
  
  // Check exact words for short words (with boundaries)
  const words = normalized.split(/[^a-z0-9]+/);
  const cleanWords = cleanText.split(/[^a-z0-9]+/);
  
  const hasShortWord = badWords.some(word => {
    if (word.length > 3) return false;
    return words.includes(word) || cleanWords.includes(word) || noSpaces === word || cleanNoSpaces === word;
  });
  
  return hasShortWord;
}

const localeMap: Record<LanguageCode, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-PT',
  ru: 'ru-RU',
  ar: 'ar-SA',
  zh: 'zh-CN',
  hi: 'hi-IN',
  ja: 'ja-JP'
};

export default function ProfileTab({
  stats,
  badges,
  vocabulary,
  onTriggerPremiumPanel,
  syncTrigger,
  isDarkMode,
  userName,
  userAvatar,
  onUpdateProfile,
  userEmail,
  loginProvider,
  onAuthSuccess,
  onLogout,
  onDeleteAccount,
  deviceUuid,
  refillCountdown,
  nativeLanguage,
  onUpdateLanguage,
}: ProfileTabProps) {
  const [selectedChartTab, setSelectedChartTab] = useState<'words' | 'minutes'>('words');
  const [activeBarIdx, setActiveBarIdx] = useState<number | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharePlatform, setSharePlatform] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);
  const [showPremiumBenefitsModal, setShowPremiumBenefitsModal] = useState(false);
  const [showPremiumFeaturesModal, setShowPremiumFeaturesModal] = useState(false);

  // Login connection states
  const [showMockLogin, setShowMockLogin] = useState(false);
  const [mockLoginProvider, setMockLoginProvider] = useState<'google' | 'facebook' | 'apple' | 'email' | null>(null);
  const [mockEmail, setMockEmail] = useState('');
  const [mockName, setMockName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginStep, setLoginStep] = useState<'picker' | 'credentials' | 'register'>('picker');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Simulated OAuth states
  const [oauthStep, setOauthStep] = useState<'none' | 'loading' | 'select_account' | 'consent' | 'redirecting'>('none');
  const [oauthProvider, setOauthProvider] = useState<'google' | 'facebook' | null>(null);
  const [oauthEmail, setOauthEmail] = useState('ardasimsek1005@gmail.com');
  const [oauthCustomEmail, setOauthCustomEmail] = useState('');
  const [oauthShowCustomInput, setOauthShowCustomInput] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Referral states
  const [referredBy, setReferredBy] = useState<string>(() => localStorage.getItem('linguist_referred_by') || '');
  const [isInviteInputOpen, setIsInviteInputOpen] = useState(false);
  const [inviteInputVal, setInviteInputVal] = useState('');

  const sortedBadges = [...badges].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return 0;
  });



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
    const cleanEmail = email.toLowerCase().trim();
    const savedToken = localStorage.getItem('linguist_session_token_' + cleanEmail);
    
    if (savedToken) {
      setMockEmail(email);
      setIsSubmitting(true);

      // Verify session token on the server
      fetch(`${getApiBase()}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          token: savedToken,
          provider: provider,
          deviceUuid: deviceUuid
        })
      })
        .then(res => {
          if (!res.ok) {
            return res.json().then(errData => {
              throw new Error(errData.error || t('auth_error_auth_failed', nativeLanguage));
            });
          }
          return res.json();
        })
        .then(data => {
          const finalName = formatAutofillName(email) || email.split('@')[0];
          
          let avatarToSet = userAvatar;
          if (!userAvatar || userAvatar === AVATAR_OPTIONS[0]) {
            const idx = Math.abs(email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_OPTIONS.length);
            avatarToSet = AVATAR_OPTIONS[idx];
          }

          onAuthSuccess(email, finalName, avatarToSet, provider, data.token);
          setShowMockLogin(false);
          setMockEmail('');
          setMockName('');
          setLoginPassword('');
          setLoginStep('picker');
          setShowPassword(false);
          
          const providerNames: Record<string, string> = {
            google: 'Google',
            facebook: 'Facebook',
            apple: 'Apple',
            email: 'E-posta'
          };
          
          if (userEmail) {
            setToastMessage(t('auth_provider_connected', nativeLanguage).replace('{provider}', providerNames[provider] || provider));
          } else {
            setToastMessage(t('auth_provider_logged_in', nativeLanguage).replace('{provider}', providerNames[provider] || provider));
          }
          setTimeout(() => setToastMessage(null), 3000);
        })
        .catch(err => {
          console.error('Saved token auth failed:', err);
          localStorage.removeItem('linguist_session_token_' + cleanEmail);
          setLoginPassword('');
          setLoginStep('credentials');
          setToastMessage(t('auth_saved_session_invalid', nativeLanguage));
          setTimeout(() => setToastMessage(null), 3000);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } else {
      setMockEmail(email);
      setLoginStep('credentials');
    }
  };

  const handleMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const provider = mockLoginProvider || 'email';

    if (!mockEmail || mockEmail.trim().length < 3) {
      setToastMessage(t('auth_invalid_username_toast', nativeLanguage));
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    if (!loginPassword || loginPassword.length < 6) {
      setToastMessage(t('auth_invalid_password_toast', nativeLanguage));
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsSubmitting(true);

    fetch(`${getApiBase()}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: mockEmail,
        password: loginPassword,
        provider: provider,
        deviceUuid: deviceUuid
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            throw new Error(errData.error || t('auth_error_auth_failed', nativeLanguage));
          });
        }
        return res.json();
      })
      .then(data => {
        // Save the successful session token locally for future logins
        localStorage.setItem('linguist_session_token_' + mockEmail.toLowerCase().trim(), data.token);
        // Clear legacy plain-text password from storage if it exists
        localStorage.removeItem('linguist_password_' + mockEmail.toLowerCase().trim());

        const finalName = formatAutofillName(mockEmail) || mockEmail.split('@')[0];
        
        let avatarToSet = userAvatar;
        if (!userAvatar || userAvatar === AVATAR_OPTIONS[0]) {
          const idx = Math.abs(mockEmail.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_OPTIONS.length);
          avatarToSet = AVATAR_OPTIONS[idx];
        }

        onAuthSuccess(mockEmail, finalName, avatarToSet, provider, data.token);
        setShowMockLogin(false);
        setMockEmail('');
        setMockName('');
        setLoginPassword('');
        setLoginStep('picker');
        setShowPassword(false);
        
        const providerNames: Record<string, string> = {
          google: 'Google',
          facebook: 'Facebook',
          apple: 'Apple',
          email: 'E-posta'
        };
        
        if (userEmail) {
          setToastMessage(t('auth_account_connected', nativeLanguage));
        } else {
          setToastMessage(data.isNew 
            ? t('auth_new_account_welcome', nativeLanguage).replace('{name}', finalName) 
            : t('auth_login_welcome', nativeLanguage).replace('{name}', finalName)
          );
        }
        setTimeout(() => setToastMessage(null), 3000);
      })
      .catch(err => {
        console.error('Auth request failed:', err);
        setToastMessage(err.message || t('auth_error_generic', nativeLanguage));
        setTimeout(() => setToastMessage(null), 3000);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!mockName || mockName.trim().length < 3) {
      setToastMessage(t('profile_name_length_error', nativeLanguage));
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    if (!loginPassword || loginPassword.length < 6) {
      setToastMessage(t('auth_invalid_password_toast', nativeLanguage));
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsSubmitting(true);

    fetch(`${getApiBase()}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: mockName,
        password: loginPassword,
        deviceUuid: deviceUuid
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            throw new Error(errData.error || t('auth_error_register_failed', nativeLanguage));
          });
        }
        return res.json();
      })
      .then(data => {
        const usernameLower = mockName.toLowerCase().trim();
        localStorage.setItem('linguist_session_token_' + usernameLower, data.token);

        let avatarToSet = userAvatar;
        if (!userAvatar || userAvatar === AVATAR_OPTIONS[0]) {
          const idx = Math.abs(usernameLower.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_OPTIONS.length);
          avatarToSet = AVATAR_OPTIONS[idx];
        }

        onAuthSuccess(usernameLower, mockName.trim(), avatarToSet, 'email', data.token);
        
        setShowMockLogin(false);
        setMockEmail('');
        setMockName('');
        setLoginPassword('');
        setLoginStep('picker');
        setShowPassword(false);
        
        setToastMessage(t('auth_register_success', nativeLanguage).replace('{name}', mockName.trim()));
        setTimeout(() => setToastMessage(null), 4000);
      })
      .catch(err => {
        console.error('Registration failed:', err);
        setToastMessage(err.message || t('auth_error_register_failed', nativeLanguage));
        setTimeout(() => setToastMessage(null), 4000);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleOauthSubmit = (email: string, name: string, provider: string) => {
    setOauthStep('redirecting');
    
    // Simulate redirect delay
    setTimeout(() => {
      fetch(`${getApiBase()}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          provider: provider,
          isExternal: true,
          deviceUuid: deviceUuid
        })
      })
        .then(res => {
          if (!res.ok) {
            return res.json().then(errData => {
              throw new Error(errData.error || t('auth_error_login_failed', nativeLanguage));
            });
          }
          return res.json();
        })
        .then(data => {
          // Save the successful session token locally
          localStorage.setItem('linguist_session_token_' + email.toLowerCase().trim(), data.token);

          // Format name and set avatar
          const finalName = name || formatAutofillName(email) || email.split('@')[0];
          let avatarToSet = userAvatar;
          if (!userAvatar || userAvatar === AVATAR_OPTIONS[0]) {
            const idx = Math.abs(email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_OPTIONS.length);
            avatarToSet = AVATAR_OPTIONS[idx];
          }

          onAuthSuccess(email, finalName, avatarToSet, provider, data.token);
          
          setOauthStep('none');
          setOauthProvider(null);
          
          const pName = provider === 'google' ? 'Google' : 'Facebook';
          if (userEmail) {
            setToastMessage(t('auth_oauth_linked', nativeLanguage).replace('{provider}', pName));
          } else {
            setToastMessage(data.isNew 
              ? t('auth_oauth_new_account', nativeLanguage).replace('{provider}', pName) 
              : t('auth_oauth_synced', nativeLanguage).replace('{provider}', pName)
            );
          }
          setTimeout(() => setToastMessage(null), 3000);
        })
        .catch(err => {
          console.error('OAuth Auth request failed:', err);
          setToastMessage(err.message || t('auth_error_login_generic', nativeLanguage));
          setTimeout(() => setToastMessage(null), 3000);
          setOauthStep('none');
          setOauthProvider(null);
        });
    }, 1500);
  };



  // Profile Edit states
  const [editMode, setEditMode] = useState<'none' | 'name' | 'avatar'>('none');
  const [tempName, setTempName] = useState(() => getLocalizedUsername(userName, nativeLanguage));
  const [tempAvatar, setTempAvatar] = useState(userAvatar);
  const [nameInputFocused, setNameInputFocused] = useState(false);

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
      setToastMessage(t('share_toast_code_copied', nativeLanguage));
    } else {
      setToastMessage(t('share_toast_link_copied', nativeLanguage));
    }
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Construct dynamic chart data from stats
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const chartData = days.map((day, idx) => ({
    day: getDayTranslation(day, nativeLanguage),
    learnedWords: stats.weeklyWords ? stats.weeklyWords[idx] || 0 : 0,
    readMins: stats.weeklyMins ? stats.weeklyMins[idx] || 0 : 0
  }));

  const maxWords = Math.max(...chartData.map(d => d.learnedWords)) || 10;
  const maxMinutes = Math.max(...chartData.map(d => d.readMins)) || 10;

  const dailyTimeTarget = 20;
  const dailyWordTarget = 10;

  const todayIdx = new Date().getDay(); // 0 is Sunday, 1-6 is Mon-Sat
  const dayIndex = todayIdx === 0 ? 6 : todayIdx - 1;
  const todayMins = stats.weeklyMins ? stats.weeklyMins[dayIndex] || 0 : 0;
  const todayWords = stats.weeklyWords ? stats.weeklyWords[dayIndex] || 0 : 0;

  const rawTimeGoal = Math.round((todayMins / 20) * 100);
  const timeGoalPercent = isNaN(rawTimeGoal) ? 0 : Math.min(rawTimeGoal, 100);

  const rawWordGoal = Math.round((todayWords / 10) * 100);
  const wordGoalPercent = isNaN(rawWordGoal) ? 0 : Math.min(rawWordGoal, 100);

  const solvedQuizzes = stats.dailyQuizzesSolvedCount || 0;
  const scoreSum = stats.dailyQuizzesScoreSum || 0;
  const questionsSum = stats.dailyQuizzesQuestionsSum || 0;
  const avgSuccessPercent = questionsSum > 0 ? Math.min(Math.round((scoreSum / questionsSum) * 100), 100) : 0;


  const getBadgeIcon = (iconName: string, unlocked: boolean) => {
    const sizeClass = "w-4.5 h-4.5";
    const colorClass = unlocked ? "text-[#FF6B6B]" : "text-gray-400 dark:text-gray-500";
    
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
      case 'Zap':
        return <Zap className={`${sizeClass} ${colorClass}`} />;
      case 'BadgeCheck':
        return <BadgeCheck className={`${sizeClass} ${colorClass}`} />;
      case 'Clock':
        return <Clock className={`${sizeClass} ${colorClass}`} />;
      case 'Library':
        return <Library className={`${sizeClass} ${colorClass}`} />;
      case 'Volume2':
        return <Volume2 className={`${sizeClass} ${colorClass}`} />;
      case 'Trophy':
        return <Trophy className={`${sizeClass} ${colorClass}`} />;
      case 'Puzzle':
        return <Puzzle className={`${sizeClass} ${colorClass}`} />;
      case 'Search':
        return <Search className={`${sizeClass} ${colorClass}`} />;
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
      setToastMessage(t('share_toast_success', nativeLanguage).replace('{platform}', platform));
      setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    }, 1200);
  };

  return (
    <div className={`w-full overflow-x-hidden pb-36 max-w-[680px] mx-auto px-5 pt-6 transition-colors ${
      isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
    }`}>
      
      {/* Centered Premium Toast Notification */}
      <AnimatePresence>
        {toastMessage && (() => {
          const isWarning = toastMessage.includes('⚠️') || 
                            toastMessage.includes('?') || 
                            /error|fail|invalid|unauthorized|exception|hata|gecersiz|basarisiz|olustu|yetersiz/i.test(toastMessage);
          
          return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 pointer-events-none select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                onClick={() => setToastMessage(null)}
                className={`w-full max-w-[340px] rounded-3xl p-6 border text-center flex flex-col items-center gap-4 backdrop-blur-lg transition-all duration-300 shadow-2xl pointer-events-auto cursor-pointer ${
                  isDarkMode 
                    ? 'bg-[#1E1E22]/95 border-[#2A2A30] text-white shadow-black/60' 
                    : 'bg-white/95 border-[#FFE66D]/80 text-[#2D3436] shadow-gray-400/20'
                }`}
              >
                {isWarning ? (
                  <div className="w-12 h-12 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center border border-[#FF6B6B]/30 shrink-0">
                    <X className="w-6 h-6 text-[#FF6B6B] animate-pulse" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#4ECDC4]/10 flex items-center justify-center border border-[#4ECDC4]/30 shrink-0">
                    <Check className="w-6 h-6 text-[#4ECDC4] animate-bounce" />
                  </div>
                )}
                <span className="text-sm font-bold leading-relaxed">{toastMessage}</span>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
      
      {/* Profile Header Avatar */}
      <section className={`flex flex-col items-center text-center mb-8 border-2 p-6 rounded-[28px] relative select-none transition-colors ${
        isDarkMode 
          ? 'bg-[#1A1A1E] border-[#2A2A30] shadow-[0_8px_16px_rgba(0,0,0,0.2)]' 
          : 'bg-white border-[#FFE66D] shadow-[0_8px_16px_rgba(255,107,107,0.01)]'
      }`}>

        {editMode !== 'none' ? (
          <div className="w-full space-y-6">
            <h3 className={`text-base font-bold font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
              {editMode === 'avatar' 
                ? t('profile_avatar_change_title', nativeLanguage) 
                : t('profile_change_name_btn', nativeLanguage)}
            </h3>
            
            {editMode === 'avatar' && (
              <>
                {/* Selected Avatar Preview */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden shadow-md border-4 border-[#FFE66D] mb-3 relative bg-slate-50">
                    <img
                      alt={t('profile_avatar_selected', nativeLanguage)}
                      className="w-full h-full object-cover"
                      src={tempAvatar}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider mb-2">{t('profile_avatar_select', nativeLanguage)}</span>
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
              </>
            )}

            {editMode === 'name' && (
              /* Name Input field */
              <div className="max-w-xs mx-auto w-full">
                <label id="profile-name-label" className="block text-[10px] font-bold text-gray-455 mb-2 text-left font-headline-lg">
                  {t('profile_name_label', nativeLanguage)}
                </label>
                <div className="relative w-full">
                  <input
                    type="password"
                    maxLength={25}
                    placeholder={t('profile_name_placeholder', nativeLanguage)}
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onFocus={() => setNameInputFocused(true)}
                    onBlur={() => setNameInputFocused(false)}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-text"
                  />
                  <div
                    className={`w-full text-xs px-3 py-2.5 border rounded-xl font-medium transition-colors flex items-center min-h-[38px] ${
                      nameInputFocused ? 'border-[#FF6B6B] ring-1 ring-[#FF6B6B]' : ''
                    } ${
                      isDarkMode 
                        ? 'bg-[#121214] border-[#2A2A30] text-white' 
                        : 'bg-white border-[#FFE66D] text-gray-800'
                    }`}
                  >
                    {tempName ? (
                      <span className="truncate">{tempName}</span>
                    ) : nameInputFocused ? (
                      null
                    ) : (
                      <span className={isDarkMode ? 'text-gray-650' : 'text-teal-650'}>
                        {t('profile_name_placeholder', nativeLanguage)}
                      </span>
                    )}
                    {nameInputFocused && (
                      <span className="w-[1.5px] h-3.5 bg-[#FF6B6B] animate-pulse ml-0.5 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2.5 max-w-xs mx-auto pt-2">
              <button
                type="button"
                onClick={() => {
                  if (editMode === 'name') {
                    const cleanName = tempName.trim();
                    
                    if (cleanName.length < 3 || cleanName.length > 25) {
                      setToastMessage(t('profile_name_length_error', nativeLanguage));
                      setTimeout(() => setToastMessage(null), 3000);
                      return;
                    }

                    const validNameRegex = /^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]+$/;
                    if (!validNameRegex.test(cleanName)) {
                      setToastMessage(t('profile_name_chars_error', nativeLanguage));
                      setTimeout(() => setToastMessage(null), 3000);
                      return;
                    }

                    if (checkIsProfane(cleanName)) {
                      setToastMessage(t('profile_name_inappropriate_error', nativeLanguage));
                      setTimeout(() => setToastMessage(null), 3000);
                      return;
                    }

                    onUpdateProfile(cleanName, userAvatar);
                  } else if (editMode === 'avatar') {
                    onUpdateProfile(userName, tempAvatar);
                  }
                  
                  setEditMode('none');
                  setToastMessage(t('profile_updated_toast', nativeLanguage));
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="flex-1 py-2.5 bg-[#4ECDC4] text-gray-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#3cacb0] font-headline-lg shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{t('btn_save', nativeLanguage)}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempName(getLocalizedUsername(userName, nativeLanguage));
                  setTempAvatar(userAvatar);
                  setEditMode('none');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer font-headline-lg ${
                  isDarkMode 
                    ? 'border-gray-700 hover:bg-white/5 text-gray-300' 
                    : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                }`}
              >
                {t('btn_cancel', nativeLanguage)}
              </button>
            </div>
          </div>
        ) : (
          /* Normal display state (empty by default / custom name check) */
          <>
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border-4 border-[#FFE66D] mb-4 relative bg-slate-50 group">
              <img
                alt={getLocalizedUsername(userName, nativeLanguage) || 'User'}
                className="w-full h-full object-cover"
                src={userAvatar}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80';
                }}
              />
              <button
                onClick={() => {
                  setTempName(getLocalizedUsername(userName, nativeLanguage));
                  setTempAvatar(userAvatar);
                  setEditMode('avatar');
                }}
                className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white cursor-pointer"
                title={t('profile_avatar_change_title', nativeLanguage)}
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-bold">{t('profile_avatar_change_btn', nativeLanguage)}</span>
              </button>
            </div>
            
            <h1 className={`font-headline-lg text-2xl font-bold mb-1 flex items-center justify-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-[#2D3436]'
            }`}>
              {userName ? (
                getLocalizedUsername(userName, nativeLanguage)
              ) : (
                <span className="italic text-gray-400 font-normal text-xl select-none">
                  {t('profile_name_not_specified', nativeLanguage)}
                </span>
              )}
            </h1>

            <div className={`text-xs font-bold font-headline-lg mb-4 space-y-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-455'
            }`}>
              <div>{t('profile_user_title', nativeLanguage)}</div>
              <div className="text-[11px] opacity-80 font-medium">
                {t('profile_install_date', nativeLanguage).replace('{date}', (() => {
                  if (!installDate) return '';
                  const parts = installDate.split('.');
                  if (parts.length === 3) {
                    const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    if (!isNaN(d.getTime())) {
                      return d.toLocaleDateString(localeMap[nativeLanguage] || 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
                    }
                  }
                  return installDate;
                })())}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5 items-center">
              <button
                onClick={() => {
                  setTempName(getLocalizedUsername(userName, nativeLanguage));
                  setTempAvatar(userAvatar);
                  setEditMode('name');
                }}
                className="px-4 py-1.5 bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/15 text-[#FF6B6B] text-[11px] font-bold rounded-full border border-[#FF6B6B]/20 transition-all flex items-center gap-1.5 cursor-pointer font-headline-lg"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{t('profile_change_name_btn', nativeLanguage)}</span>
              </button>

              {/* Quick Language Switcher Dropdown */}
              <div className="relative">
                <select
                  value={nativeLanguage}
                  onChange={(e) => onUpdateLanguage(e.target.value as LanguageCode)}
                  className={`px-4 py-1.5 text-[11px] font-bold rounded-full border cursor-pointer focus:outline-none transition-all appearance-none font-headline-lg ${
                    isDarkMode 
                      ? 'bg-[#1E1E22] border-gray-700 text-gray-300 hover:text-white' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${isDarkMode ? '%239ca3af' : '%234b5563'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '10px',
                    paddingRight: '28px'
                  }}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {stats.isPremium && (
              <div className="mt-4 flex flex-col items-center justify-center select-none text-center">
                <span className="bg-[#FFE66D] text-[#2D3436] border border-[#FFE66D]/50 px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm flex items-center justify-center gap-1 font-headline-lg animate-pulse whitespace-nowrap">
                  <Zap className="w-3.5 h-3.5 text-[#FF6B6B] fill-[#FF6B6B]" />
                  {t('profile_premium_member', nativeLanguage)}
                </span>
                
                {stats.premiumExpiryDate && (() => {
                  const expiryDate = new Date(stats.premiumExpiryDate);
                  const diffMs = expiryDate.getTime() - Date.now();
                  const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
                  
                  // Calculate purchase date
                  const purchaseDate = new Date(expiryDate);
                  if (stats.premiumType === 'yearly') {
                    purchaseDate.setFullYear(purchaseDate.getFullYear() - 1);
                  } else {
                    purchaseDate.setMonth(purchaseDate.getMonth() - 1);
                  }
                  
                  const formatOption: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
                  const currentLocale = localeMap[nativeLanguage] || 'en-US';
                  const purchaseStr = purchaseDate.toLocaleDateString(currentLocale, formatOption);
                  const expiryStr = expiryDate.toLocaleDateString(currentLocale, formatOption);

                  const purchaseTemplate = t('profile_premium_purchase_date', nativeLanguage);
                  const purchaseParts = purchaseTemplate.split('{date}');
                  const remainingTemplate = t('profile_premium_remaining_time', nativeLanguage);
                  const remainingParts = remainingTemplate.split('{days}');
                  const expiryTemplate = t('profile_premium_expiry', nativeLanguage);
                  const expiryParts = expiryTemplate.split('{date}');

                  return (
                    <div className={`mt-2 text-[11px] font-bold font-headline-lg flex flex-col gap-0.5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span>{purchaseParts[0]}<span className="font-black">{purchaseStr}</span>{purchaseParts[1]}</span>
                      <span>
                        {remainingParts[0]}
                        <span className="font-black text-[#FF6B6B]">{diffDays} {t('unit_days', nativeLanguage)}</span>
                        {remainingParts[1]}
                        {expiryParts[0]}
                        <span className="font-black">{expiryStr}</span>
                        {expiryParts[1]}
                      </span>
                    </div>
                  );
                })()}
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
            {vocabulary.length} <span className="text-xs font-semibold text-gray-400">/ {LIBRARY_UNIQUE_WORDS_COUNT}</span>
          </span>
          <span className={`text-[10px] font-extrabold tracking-widest mt-1 ${
            isDarkMode ? 'text-gray-400' : 'text-[#2D3436]/60'
          }`}>
            {t('profile_stat_saved_words', nativeLanguage)}
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
            {t('profile_stat_completed_books', nativeLanguage)}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#FF6B6B] to-[#FFE66D] text-[#FFFBF0] p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center border-2 border-[#FF6B6B]/40">
          <Flame className="w-6 h-6 text-yellow-300 fill-yellow-300 mb-2 animate-bounce" />
          <span className="font-headline-lg text-2xl font-extrabold">
            {t('profile_stat_streak_day_format', nativeLanguage).replace('{count}', String(stats.dailyStreak))}
          </span>
          <span className="text-[10px] font-extrabold tracking-widest mt-1 opacity-95">
            {t('profile_stat_daily_streak', nativeLanguage)}
          </span>
        </div>
      </section>

      {/* Günlük Hedefler */}
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
                            {t('daily_goals_title', nativeLanguage)}
            </h2>
          </div>
          <span className="text-[10px] font-bold text-[#4ECDC4] bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-headline-lg">
            {t('daily_goals_reset', nativeLanguage)}
          </span>
        </div>

        <p className={`text-xs mb-5 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {t('daily_goals_desc', nativeLanguage)}
        </p>

        <div className="space-y-4">
          
          {/* Kart 1: Günlük Süre Hedefi */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#121214]/60 border-[#2A2A30] hover:border-[#FFE66D]/40' 
              : 'bg-gray-50/50 border-gray-150 hover:border-[#FFE66D]/30'
          }`}>
            <div className="flex justify-between items-start gap-4 mb-2.5">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 rounded-xl bg-[#FFE66D]/15 text-[#FFE66D] shrink-0">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-xs font-bold font-headline-lg truncate ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                    {t('daily_goal_time', nativeLanguage)}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                    {t('daily_goal_time_desc', nativeLanguage)}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-extrabold text-[#FFE66D] font-headline-lg whitespace-nowrap">
                  {t('daily_goal_unit_mins', nativeLanguage).replace('{count}', String(todayMins))}
                </span>
                <p className="text-[9px] text-gray-400 font-medium">{t('weekly_minutes', nativeLanguage)}</p>
              </div>
            </div>
            
            {/* İlerleme Çubuğu */}
            <div className="mt-3.5 flex items-center gap-4">
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
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  todayMins >= 20 
                    ? 'bg-[#4ECDC4]/10 text-[#4ECDC4]' 
                    : isDarkMode ? 'bg-[#1A1A1E] text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  {todayMins >= 20 ? t('daily_goal_success', nativeLanguage) : t('daily_goal_in_progress', nativeLanguage)}
                </span>
              </div>
            </div>
          </div>

          {/* Kart 2: Günlük Kelime Kaydı */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#121214]/60 border-[#2A2A30] hover:border-[#4ECDC4]/40' 
              : 'bg-gray-50/50 border-gray-150 hover:border-[#4ECDC4]/30'
          }`}>
            <div className="flex justify-between items-start gap-4 mb-2.5">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 rounded-xl bg-[#4ECDC4]/15 text-[#4ECDC4] shrink-0">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-xs font-bold font-headline-lg truncate ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                    {t('daily_goal_words', nativeLanguage)}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                    {t('daily_goal_words_desc', nativeLanguage)}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-extrabold text-[#4ECDC4] font-headline-lg whitespace-nowrap">
                  {t('daily_goal_unit_words', nativeLanguage).replace('{count}', String(todayWords))}
                </span>
                <p className="text-[9px] text-gray-400 font-medium">{t('weekly_words', nativeLanguage)}</p>
              </div>
            </div>
            
            {/* İlerleme Çubuğu */}
            <div className="mt-3.5 flex items-center gap-4">
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
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  todayWords >= 10 
                    ? 'bg-[#4ECDC4]/10 text-[#4ECDC4]' 
                    : isDarkMode ? 'bg-[#1A1A1E] text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  {todayWords >= 10 ? t('daily_goal_success', nativeLanguage) : t('daily_goal_in_progress', nativeLanguage)}
                </span>
              </div>
            </div>
          </div>

          {/* Kart 3: Günlük Sınav Başarısı */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#121214]/60 border-[#2A2A30] hover:border-[#FF6B6B]/40' 
              : 'bg-gray-50/50 border-gray-150 hover:border-[#FF6B6B]/30'
          }`}>
            <div className="flex justify-between items-start gap-4 mb-2.5">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 rounded-xl bg-[#FF6B6B]/15 text-[#FF6B6B] shrink-0">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-xs font-bold font-headline-lg truncate ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                    {t('daily_goal_quizzes', nativeLanguage)}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                    {solvedQuizzes < 5 
                      ? t('daily_goal_quizzes_desc_locked', nativeLanguage) 
                      : t('daily_goal_quizzes_desc_unlocked', nativeLanguage)}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-extrabold text-[#FF6B6B] font-headline-lg whitespace-nowrap">
                  {solvedQuizzes < 5 
                    ? t('daily_goal_unit_quizzes', nativeLanguage).replace('{count}', String(solvedQuizzes)) 
                    : t('daily_goal_unit_percent', nativeLanguage).replace('{percent}', String(avgSuccessPercent))}
                </span>
                <p className="text-[9px] text-gray-400 font-medium">{t('quiz_difficulty_level', nativeLanguage).split(' ')[0]}</p>
              </div>
            </div>
            
            {/* İlerleme Çubuğu */}
            <div className="mt-3.5 flex items-center gap-4">
              <div className="flex-1">
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FFE66D] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${solvedQuizzes < 5 ? Math.round((solvedQuizzes / 5) * 100) : avgSuccessPercent}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  solvedQuizzes >= 5 
                    ? 'bg-[#4ECDC4]/10 text-[#4ECDC4]' 
                    : isDarkMode ? 'bg-[#1A1A1E] text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  {solvedQuizzes >= 5 ? t('daily_goal_success', nativeLanguage) : t('daily_goal_locked', nativeLanguage)}
                </span>
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
                {t('weekly_progress_title', nativeLanguage)}
              </h2>
            </div>
          </div>
          <p className={`text-xs -mt-2.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('weekly_progress_desc', nativeLanguage)}
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
              {t('weekly_words', nativeLanguage)}
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
              {t('weekly_minutes', nativeLanguage)}
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
          const unit = selectedChartTab === 'words' ? t('chart_unit_word', nativeLanguage) : t('chart_unit_minute', nativeLanguage);
          const title = selectedChartTab === 'words' ? t('chart_title_words', nativeLanguage) : t('chart_title_minutes', nativeLanguage);

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
                    {t('chart_summary', nativeLanguage)
                      .replace('{day}', activeData.day)
                      .replace('{today}', isToday ? t('chart_today', nativeLanguage) : '')}
                  </span>
                  <span className={`text-xs font-bold text-gray-450 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {title}
                  </span>
                </div>
                <p className={`text-xs font-bold mt-0.5 ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>
                  {targetVal > 0 
                    ? t('chart_desc_success', nativeLanguage).replace('{val}', String(targetVal)).replace('{unit}', unit) 
                    : t('chart_desc_empty', nativeLanguage).replace('{unit}', unit)}
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
              {t('badges_title', nativeLanguage)}
            </h2>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-headline-lg ${
            isDarkMode ? 'bg-[#121214] text-[#FFE66D]' : 'bg-[#FFFBF0] text-[#FF6B6B]'
          }`}>
            {t('badges_unlocked_count', nativeLanguage)
              .replace('{unlocked}', String(badges.filter(b => b.unlocked).length))
              .replace('{total}', String(badges.length))}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {sortedBadges.map((badge) => {
            const localizedTitle = t(`badge_title_${badge.id}`, nativeLanguage) || badge.title;
            const localizedDesc = t(`badge_desc_${badge.id}`, nativeLanguage) || badge.description;
            
            return (
              <div
                key={badge.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-4 transition-all duration-300 ${
                  badge.unlocked
                    ? isDarkMode 
                      ? 'bg-[#FF6B6B]/5 border-[#FF6B6B]/30 hover:border-[#FF6B6B]/50' 
                      : 'bg-[#FFFBF0]/60 border-[#FFE66D] hover:border-[#FF6B6B]/40'
                    : isDarkMode 
                      ? 'bg-[#121214]/40 border-[#2A2A30] opacity-55' 
                      : 'bg-gray-50/40 border-gray-150 opacity-65'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`p-1.5 rounded-lg shrink-0 transition-transform duration-300 ${
                    badge.unlocked 
                      ? 'bg-[#FFE66D]/25' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {getBadgeIcon(badge.iconName, badge.unlocked)}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h4 className={`font-bold text-xs leading-tight mb-0.5 ${
                      badge.unlocked 
                        ? isDarkMode ? 'text-white' : 'text-gray-900 font-black' 
                        : 'text-gray-500'
                    }`}>
                      {localizedTitle}
                    </h4>
                    <p className="text-[9.5px] text-gray-400 dark:text-gray-500 leading-snug truncate">
                      {localizedDesc}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {badge.unlocked ? (
                    <span className="text-[8px] font-bold text-[#4ECDC4] font-mono block">
                      {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString(nativeLanguage) : t('badge_status_unlocked', nativeLanguage)}
                    </span>
                  ) : (
                    <span className="text-[8px] font-semibold text-gray-400 dark:text-gray-600 block">
                      {t('badge_status_locked', nativeLanguage)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SETTINGS AND ACTION STRIP LISTS */}
      <section className={`border-2 rounded-[28px] overflow-hidden shadow-3xs select-none transition-colors ${
        isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
      }`}>
        <h3 className="text-[10px] font-bold text-gray-450 tracking-widest px-6 pt-5 mb-1.5 block font-headline-lg select-none">
          {t('settings_title', nativeLanguage)}
        </h3>

        <div className={`divide-y transition-colors ${
          isDarkMode ? 'divide-[#2A2A30]' : 'divide-[#FFE66D]/60'
        }`}>
          {/* Native Language Selector Row */}
          <div
            className={`w-full flex items-center justify-between p-4 px-6 select-none transition-colors ${
              isDarkMode ? 'text-gray-250' : 'text-gray-700'
            }`}
          >
            <span className="text-xs font-bold flex items-center gap-2 font-headline-lg">
              <Globe className="w-4.5 h-4.5 text-[#4ECDC4]" />
              {t('settings_language', nativeLanguage)}
            </span>
            <select
              value={nativeLanguage}
              onChange={(e) => onUpdateLanguage(e.target.value as LanguageCode)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#1E1E22] border-[#2A2A30] text-white focus:border-[#FF6B6B]' 
                  : 'bg-white border-gray-250 text-gray-900 focus:border-[#FF6B6B]'
              }`}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* Can (Enerji) Durumu Göstergesi */}
          {!stats.isPremium && (
            <div className={`w-full flex items-center justify-between p-4 px-6 select-none transition-colors ${
              isDarkMode ? 'text-gray-250' : 'text-gray-700'
            }`}>
              <span className="text-xs font-bold flex items-center gap-2 font-headline-lg">
                <Heart className="w-4.5 h-4.5 text-[#FF6B6B] fill-[#FF6B6B]" />
                {t('settings_energy', nativeLanguage)}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-extrabold text-[#FF6B6B]">{(stats.hearts ?? 5)} / 5</span>
                {(stats.hearts ?? 5) < 5 && refillCountdown && (
                  <span className="text-[10.5px] font-mono font-black bg-[#FF6B6B]/15 text-[#FF6B6B] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
                    {refillCountdown}
                  </span>
                )}
              </div>
            </div>
          )}
          <button
            onClick={handleShareClick}
            className={`w-full flex items-center justify-between p-4 px-6 transition-colors group text-left cursor-pointer ${
              isDarkMode ? 'hover:bg-[#121214] text-gray-200' : 'hover:bg-[#FFFBF0]'
            }`}
          >
            <span className="text-xs font-bold">{t('settings_share', nativeLanguage)}</span>
            <Share2 className="w-4 h-4 text-[#FF6B6B]" />
          </button>

          <button
            onClick={() => setIsAboutModalOpen(true)}
            className={`w-full flex items-center justify-between p-4 px-6 transition-colors group text-left cursor-pointer ${
              isDarkMode ? 'hover:bg-[#121214] text-gray-200' : 'hover:bg-[#FFFBF0]'
            }`}
          >
            <span className="text-xs font-bold">{t('settings_about', nativeLanguage)}</span>
            <MessageSquare className="w-4 h-4 text-[#4ECDC4]" />
          </button>

          <button
            onClick={() => setIsPrivacyModalOpen(true)}
            className={`w-full flex items-center justify-between p-4 px-6 transition-colors group text-left cursor-pointer ${
              isDarkMode ? 'hover:bg-[#121214] text-gray-200' : 'hover:bg-[#FFFBF0]'
            }`}
          >
            <span className="text-xs font-bold">{t('settings_privacy', nativeLanguage)}</span>
            <Shield className="w-4 h-4 text-emerald-500" />
          </button>



          {/* Davet Kodu Gir / Bilgi Satırı - Kaldırıldı */}
          {/*
          referredBy ? (
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
          )
          */}

          {stats.isPremium && (
            <button
              onClick={() => setShowPremiumBenefitsModal(true)}
              className={`w-full flex items-center justify-between py-3 px-5 transition-colors group text-left text-emerald-500 font-extrabold cursor-pointer ${
                isDarkMode ? 'hover:bg-[#121214]' : 'hover:bg-[#FFFBF0]'
              }`}
            >
              <span className="text-xs flex items-center gap-1.5 font-headline-lg">
                <Crown className="w-4.5 h-4.5 text-[#FFE66D] fill-[#FFE66D]" />
                {t('settings_premium_benefits', nativeLanguage)}
              </span>
              <div className="flex items-center gap-1 text-[9.5px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span>{t('btn_view', nativeLanguage)}</span>
                <ChevronRight className="w-3 h-3 text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          )}
          
          {!stats.isPremium && (
            <>
              <button
                onClick={onTriggerPremiumPanel}
                className={`w-full flex items-center justify-between p-4 px-6 transition-colors group text-left text-[#FF6B6B] font-extrabold cursor-pointer ${
                  isDarkMode ? 'hover:bg-[#121214]' : 'hover:bg-[#FFFBF0]'
                }`}
              >
                <span className="text-xs flex items-center gap-2 font-headline-lg">
                  <Crown className="w-5 h-5 text-[#FFE66D] fill-[#FF6B6B]" />
                  {t('settings_premium_buy', nativeLanguage)}
                </span>
                <ChevronRight className="w-4 h-4 text-[#FF6B6B] group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => setShowPremiumFeaturesModal(true)}
                className={`w-full flex items-center justify-between p-4 px-6 transition-colors group text-left text-[#F59E0B] font-extrabold cursor-pointer border-t ${
                  isDarkMode ? 'hover:bg-[#121214] border-gray-800' : 'hover:bg-[#FFFBF0] border-gray-100'
                }`}
              >
                <span className="text-xs flex items-center gap-2 font-headline-lg">
                  <Sparkles className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]/20" />
                  {t('profile_premium_features', nativeLanguage)}
                </span>
                <ChevronRight className="w-4 h-4 text-[#F59E0B] group-hover:translate-x-1 transition-all" />
              </button>
            </>
          )}

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className={`w-full flex items-center justify-between p-4 px-6 transition-colors group text-left text-rose-500 font-extrabold cursor-pointer ${
              isDarkMode ? 'hover:bg-[#121214]' : 'hover:bg-[#FFFBF0]'
            }`}
          >
            <span className="text-xs flex items-center gap-2 font-headline-lg">
              <Trash2 className="w-4.5 h-4.5 text-rose-500" />
              {t('settings_delete', nativeLanguage)}
            </span>
            <ChevronRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-all" />
          </button>



        </div>
      </section>

      {/* PREMIUM BENEFITS MODAL */}
      <AnimatePresence>
        {showPremiumBenefitsModal && (
          <div className="fixed inset-0 z-50 bg-[#2D3436]/60 backdrop-blur-md flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => setShowPremiumBenefitsModal(false)} 
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className={`w-full max-w-sm rounded-3xl p-4.5 shadow-2xl relative transition-all border-2 z-10 ${
                isDarkMode 
                  ? 'bg-[#1A1A1E] border-[#2A2A30] text-white shadow-black/80' 
                  : 'bg-white border-[#FFE66D] text-gray-800 shadow-slate-200'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPremiumBenefitsModal(false)}
                className={`absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200/20 transition-all cursor-pointer ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-555'
                }`}
                title={t('btn_close', nativeLanguage)}
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="flex flex-col items-center text-center pt-1.5">
                <div className="w-11 h-11 bg-[#FFE66D]/15 rounded-full flex items-center justify-center border border-[#FFE66D]/45 mb-2.5 animate-pulse">
                  <Crown className="w-6 h-6 text-[#FFE66D] fill-[#FFE66D]" />
                </div>
                
                <h3 className="font-bold text-base font-headline-lg mb-0.5">
                  {t('premium_benefits_title', nativeLanguage)}
                </h3>
                <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mb-4">
                  {t('premium_benefits_tag', nativeLanguage)}
                </p>

                {/* Benefits List */}
                <div className="w-full text-left space-y-2.5 mb-4.5">
                  {/* Benefit 1: Sınırsız Enerji & Can */}
                  <div className={`p-2.5 rounded-xl border-2 flex items-start gap-2.5 transition-all ${
                    isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-[#FFFDF5] border-[#FFE66D]/45'
                  }`}>
                    <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500 shrink-0 border border-orange-500/20">
                      <Flame className="w-4.5 h-4.5 fill-orange-500/20" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[11px] text-orange-500">{t('premium_benefit_1_title', nativeLanguage)}</h4>
                      <p className="text-[9.5px] text-gray-400 font-semibold mt-0.5 leading-snug">{t('premium_benefit_1_desc', nativeLanguage)}</p>
                    </div>
                  </div>

                  {/* Benefit 2: Sınırsız Kelime Bakma */}
                  <div className={`p-2.5 rounded-xl border-2 flex items-start gap-2.5 transition-all ${
                    isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-[#FFFDF5] border-[#FFE66D]/45'
                  }`}>
                    <div className="w-8 h-8 bg-pink-500/10 rounded-lg flex items-center justify-center text-pink-500 shrink-0 border border-pink-500/20">
                      <Sparkles className="w-4.5 h-4.5 fill-pink-500/20" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[11px] text-pink-500">{t('premium_benefit_3_title', nativeLanguage)}</h4>
                      <p className="text-[9.5px] text-gray-400 font-semibold mt-0.5 leading-snug">{t('premium_benefit_3_desc', nativeLanguage)}</p>
                    </div>
                  </div>

                  {/* Benefit 3: Sınırsız Cümle Bakma */}
                  <div className={`p-2.5 rounded-xl border-2 flex items-start gap-2.5 transition-all ${
                    isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-[#FFFDF5] border-[#FFE66D]/45'
                  }`}>
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500 shrink-0 border border-purple-500/20">
                      <BookOpen className="w-4.5 h-4.5 fill-purple-500/20" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[11px] text-purple-500">{t('premium_benefit_4_title', nativeLanguage)}</h4>
                      <p className="text-[9.5px] text-gray-400 font-semibold mt-0.5 leading-snug">{t('premium_benefit_4_desc', nativeLanguage)}</p>
                    </div>
                  </div>

                  {/* Benefit 4: Quiz Barajlarını Anında Atla */}
                  <div className={`p-2.5 rounded-xl border-2 flex items-start gap-2.5 transition-all ${
                    isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-[#FFFDF5] border-[#FFE66D]/45'
                  }`}>
                    <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center text-yellow-500 shrink-0 border border-yellow-500/20">
                      <Zap className="w-4.5 h-4.5 fill-yellow-500/20" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[11px] text-yellow-600 dark:text-yellow-400">{t('premium_benefit_2_title', nativeLanguage)}</h4>
                      <p className="text-[9.5px] text-gray-400 font-semibold mt-0.5 leading-snug">{t('premium_benefit_2_desc', nativeLanguage)}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowPremiumBenefitsModal(false)}
                  className="w-full bg-[#FF6B6B] hover:bg-[#e05a5a] text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer shadow-[#FF6B6B]/20"
                >
                  {t('premium_benefits_thanks', nativeLanguage)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* PREMIUM FEATURES MODAL */}
      <AnimatePresence>
        {showPremiumFeaturesModal && (
          <div className="fixed inset-0 z-50 bg-[#2D3436]/60 backdrop-blur-md flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => setShowPremiumFeaturesModal(false)} 
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className={`w-full max-w-sm rounded-3xl p-4.5 shadow-2xl relative transition-all border-2 z-10 ${
                isDarkMode 
                  ? 'bg-[#1A1A1E] border-[#2A2A30] text-white shadow-black/80' 
                  : 'bg-white border-[#FFE66D] text-gray-800 shadow-slate-200'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPremiumFeaturesModal(false)}
                className={`absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200/20 transition-all cursor-pointer ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-555'
                }`}
                title={t('btn_close', nativeLanguage)}
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="flex flex-col items-center text-center pt-1.5">
                <div className="w-11 h-11 bg-[#FFE66D]/15 rounded-full flex items-center justify-center border border-[#FFE66D]/45 mb-2.5 animate-pulse">
                  <Crown className="w-6 h-6 text-[#FFE66D] fill-[#FFE66D]" />
                </div>
                
                <h3 className="font-bold text-base font-headline-lg mb-0.5">
                  {t('profile_premium_features', nativeLanguage)}
                </h3>
                <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mb-4">
                  {t('premium_benefits_tag', nativeLanguage)}
                </p>

                {/* Benefits List */}
                <div className="w-full text-left space-y-2.5 mb-4.5">
                  {/* Benefit 1: Sınırsız Enerji & Can */}
                  <div className={`p-2.5 rounded-xl border-2 flex items-start gap-2.5 transition-all ${
                    isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-[#FFFDF5] border-[#FFE66D]/45'
                  }`}>
                    <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500 shrink-0 border border-orange-500/20">
                      <Flame className="w-4.5 h-4.5 fill-orange-500/20" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[11px] text-orange-500">{t('premium_benefit_1_title', nativeLanguage)}</h4>
                      <p className="text-[9.5px] text-gray-400 font-semibold mt-0.5 leading-snug">{t('premium_benefit_1_desc', nativeLanguage)}</p>
                    </div>
                  </div>

                  {/* Benefit 2: Sınırsız Kelime Bakma */}
                  <div className={`p-2.5 rounded-xl border-2 flex items-start gap-2.5 transition-all ${
                    isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-[#FFFDF5] border-[#FFE66D]/45'
                  }`}>
                    <div className="w-8 h-8 bg-pink-500/10 rounded-lg flex items-center justify-center text-pink-500 shrink-0 border border-pink-500/20">
                      <Sparkles className="w-4.5 h-4.5 fill-pink-500/20" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[11px] text-pink-500">{t('premium_benefit_3_title', nativeLanguage)}</h4>
                      <p className="text-[9.5px] text-gray-400 font-semibold mt-0.5 leading-snug">{t('premium_benefit_3_desc', nativeLanguage)}</p>
                    </div>
                  </div>

                  {/* Benefit 3: Sınırsız Cümle Bakma */}
                  <div className={`p-2.5 rounded-xl border-2 flex items-start gap-2.5 transition-all ${
                    isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-[#FFFDF5] border-[#FFE66D]/45'
                  }`}>
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500 shrink-0 border border-purple-500/20">
                      <BookOpen className="w-4.5 h-4.5 fill-purple-500/20" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[11px] text-purple-500">{t('premium_benefit_4_title', nativeLanguage)}</h4>
                      <p className="text-[9.5px] text-gray-400 font-semibold mt-0.5 leading-snug">{t('premium_benefit_4_desc', nativeLanguage)}</p>
                    </div>
                  </div>

                  {/* Benefit 4: Quiz Barajlarını Anında Atla */}
                  <div className={`p-2.5 rounded-xl border-2 flex items-start gap-2.5 transition-all ${
                    isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-[#FFFDF5] border-[#FFE66D]/45'
                  }`}>
                    <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center text-yellow-500 shrink-0 border border-yellow-500/20">
                      <Zap className="w-4.5 h-4.5 fill-yellow-500/20" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[11px] text-yellow-600 dark:text-yellow-400">{t('premium_benefit_2_title', nativeLanguage)}</h4>
                      <p className="text-[9.5px] text-gray-400 font-semibold mt-0.5 leading-snug">{t('premium_benefit_2_desc', nativeLanguage)}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowPremiumFeaturesModal(false);
                    onTriggerPremiumPanel();
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-amber-500/20 animate-pulse uppercase tracking-wider font-headline-lg"
                >
                  <Crown className="w-4 h-4 fill-white text-white" />
                  {t('btn_buy_premium', nativeLanguage)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HAKKIMIZDA & PUAN VER MODAL */}
      <AnimatePresence>
        {isAboutModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#2D3436]/60 backdrop-blur-md flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => setIsAboutModalOpen(false)} 
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`w-full max-w-sm rounded-[28px] p-6 flex flex-col shadow-2xl relative transition-all border-2 z-10 ${
                isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30] text-white' : 'bg-white border-[#FFE66D] text-[#2D3436]'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-lg text-base font-extrabold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#FF6B6B]" />
                  {t('about_title', nativeLanguage)}
                </h3>
                <button
                  onClick={() => setIsAboutModalOpen(false)}
                  className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:bg-[#2A2A30] hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content Container */}
              <div className="space-y-5">
                {/* About Us Card */}
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2.5 ${
                  isDarkMode ? 'bg-[#121214]/60 border-[#2A2A30]' : 'bg-[#FFFBF0] border-[#FFE66D]/60'
                }`}>
                  <p className="font-bold text-[#FF6B6B]">{t('about_dear_reader', nativeLanguage)}</p>
                  <p className="font-medium">
                    {t('about_text_1', nativeLanguage)}
                  </p>
                  <p className="font-medium text-[#4ECDC4] font-bold">
                    {t('about_text_2', nativeLanguage)}
                  </p>
                </div>

                {/* Google Play Rating Button */}
                <a
                  href="https://play.google.com/store/apps/details?id=com.ingilizceoykum.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsAboutModalOpen(false)}
                  className="w-full bg-[#FF6B6B] text-white text-xs font-bold py-3.5 rounded-xl shadow-md hover:bg-[#e05a5a] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[#FF6B6B]/20"
                >
                  <Crown className="w-4 h-4 text-[#FFE66D] fill-[#FFE66D]" />
                  {t('about_rate_btn', nativeLanguage)}
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOCK HIGH-FIDELITY SOCIAL SHARING SYSTEM MODAL */}
      <AnimatePresence>
        {isShareModalOpen && (() => {
          const BASE_SHARE_URL = 'https://play.google.com/store/apps/details?id=com.ingilizceoykum.app';
          const shareText = `${t('share_desc', nativeLanguage)} ${BASE_SHARE_URL}`;
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(BASE_SHARE_URL)}`;

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
                className={`w-full max-w-sm rounded-[28px] p-5.5 flex flex-col shadow-2xl relative transition-all border-2 z-10 ${
                  isDarkMode 
                    ? 'bg-gradient-to-b from-[#141419] to-[#0A0A0F] border-[#FF6B6B]/30 text-white shadow-black/80' 
                    : 'bg-gradient-to-b from-[#FFFDF9] to-[#FFF9F0] border-[#FF6B6B]/40 text-[#2D3436] shadow-slate-200'
                }`}
              >
                {/* Header Banner with App Logo */}
                <div className="flex items-center gap-3 mb-4 p-2.5 rounded-2xl bg-[#FF6B6B]/10 dark:bg-[#FF6B6B]/15 border border-[#FF6B6B]/20 relative">
                  <div className="w-11 h-11 bg-white rounded-xl shadow-sm border border-gray-150 flex items-center justify-center p-1.5 overflow-hidden shrink-0">
                    <img 
                      src="icon-192.png" 
                      alt={nativeLanguage === 'tr' ? "İngilizce Öyküm Logo" : "My English Story Logo"} 
                      className="w-full h-full object-contain select-none rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'icon-192.png';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-headline-lg text-sm font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                      {nativeLanguage === 'tr' ? 'İngilizce Öyküm' : 'My English Story'}
                    </h3>
                    <p className={`text-[10px] font-bold ${isDarkMode ? 'text-[#FF8787]' : 'text-[#FF6B6B]'}`}>
                      {nativeLanguage === 'tr' ? 'Öykülerle Dil Öğrenimi' : 'Language Learning with Stories'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsShareModalOpen(false)}
                    className={`p-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                      isDarkMode 
                        ? 'text-gray-400 hover:bg-[#2A2A30] hover:text-white hover:rotate-90' 
                        : 'text-gray-555 hover:bg-gray-200/50 hover:text-gray-900 hover:rotate-90'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* QR Code Scanner Card */}
                <div className={`flex flex-col items-center justify-center p-4 mb-4 border border-dashed rounded-2xl select-none ${
                  isDarkMode 
                    ? 'bg-[#181822] border-[#FF6B6B]/20' 
                    : 'bg-[#FFFBF5] border-[#FF6B6B]/20'
                }`}>
                  <div className="relative p-3 bg-white rounded-2xl shadow-xs border border-gray-150 mb-2.5 flex items-center justify-center hover:scale-102 transition-transform duration-300">
                    {/* Scanner corners */}
                    <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#FF6B6B]" />
                    <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#FF6B6B]" />
                    <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#FF6B6B]" />
                    <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#FF6B6B]" />
                    
                    <img 
                      src={qrCodeUrl} 
                      alt={nativeLanguage === 'tr' ? "İngilizce Öyküm QR Code" : "My English Story QR Code"} 
                      className="w-36 h-36 object-contain select-none animate-fade-in"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 justify-center max-w-[250px]">
                    <Camera className="w-4 h-4 text-[#FF6B6B] shrink-0" />
                    <p className={`text-[10.5px] text-center font-extrabold leading-normal ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {t('share_qr_desc', nativeLanguage)}
                    </p>
                  </div>
                </div>

                {/* Social Channels row */}
                <div className="flex justify-center items-center gap-3.5 mb-4.5 select-none">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handlePlatformShare('WhatsApp')}
                    className="flex flex-col items-center gap-1 cursor-pointer text-center group"
                  >
                    <div className="w-9.5 h-9.5 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 active:scale-95">
                      <MessageCircle className="w-4.5 h-4.5 fill-white text-[#25D366]" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#25D366] transition-colors">WhatsApp</span>
                  </a>

                  {/* Telegram */}
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(BASE_SHARE_URL)}&text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handlePlatformShare('Telegram')}
                    className="flex flex-col items-center gap-1 cursor-pointer text-center group"
                  >
                    <div className="w-9.5 h-9.5 rounded-full bg-[#0088cc] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 active:scale-95">
                      <Send className="w-4 h-4 fill-white text-[#0088cc] translate-x-[-0.5px] translate-y-[0.5px]" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#0088cc] transition-colors">Telegram</span>
                  </a>

                  {/* SMS */}
                  <a
                    href={`sms:?body=${encodeURIComponent(shareText)}`}
                    onClick={() => handlePlatformShare('Mesajlar')}
                    className="flex flex-col items-center gap-1 cursor-pointer text-center group"
                  >
                    <div className="w-9.5 h-9.5 rounded-full bg-gradient-to-tr from-[#FF512F] to-[#DD2476] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 active:scale-95">
                      <MessageSquare className="w-4 h-4 text-white" />
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
                    <div className="w-9.5 h-9.5 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 active:scale-95">
                      <Facebook className="w-4.5 h-4.5 fill-white text-[#1877F2]" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#1877F2] transition-colors">Facebook</span>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent(nativeLanguage === 'tr' ? 'İngilizce Öyküm Daveti' : 'Invitation to My English Story')}&body=${encodeURIComponent(shareText)}`}
                    onClick={() => handlePlatformShare('E-posta')}
                    className="flex flex-col items-center gap-1 cursor-pointer text-center group"
                  >
                    <div className="w-9.5 h-9.5 rounded-full bg-[#EA4335] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 active:scale-95">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#EA4335] transition-colors">E-posta</span>
                  </a>
                </div>

                {/* Copy Link field (Classic Youtube style) */}
                <div className="mb-4 text-left">
                  <span className={`text-[9px] font-bold uppercase tracking-wider block mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-550'}`}>
                    {t('share_download_link', nativeLanguage)}
                  </span>
                  <div className={`flex items-center gap-1.5 p-1 pl-3.5 rounded-xl border transition-colors ${
                    isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <input
                      type="text"
                      readOnly
                      value={BASE_SHARE_URL}
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="w-full bg-transparent border-none outline-none text-[10.5px] font-mono text-gray-500 dark:text-gray-450 select-all cursor-pointer"
                    />
                    <button
                      onClick={() => handleCopyLinkOrCode(BASE_SHARE_URL, false)}
                      className="px-3.5 py-1.5 bg-[#FF6B6B] hover:bg-[#FF8787] text-white rounded-lg text-[9.5px] font-bold transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                    >
                      {t('btn_copy', nativeLanguage)}
                    </button>
                  </div>
                </div>

                {/* Native System Share fallback if supported */}
                {navigator.share && (
                  <button
                    onClick={() => {
                      navigator.share({
                        title: nativeLanguage === 'tr' ? 'İngilizce Öyküm' : 'My English Story',
                        text: shareText,
                        url: BASE_SHARE_URL
                      }).catch(() => {});
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-[9.5px] font-bold transition-colors cursor-pointer ${
                      isDarkMode 
                        ? 'bg-transparent border-gray-800 hover:bg-white/5 text-gray-300' 
                        : 'bg-transparent border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <Share2 className="w-4 h-4 text-[#FF6B6B]" />
                    <span>{t('share_system_btn', nativeLanguage)}</span>
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
                      <RefreshCw className="w-5 h-5 text-[#FF6B6B] animate-spin mb-3" />
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
            google: t('auth_login_google_title', nativeLanguage),
            facebook: t('auth_login_facebook_title', nativeLanguage),
            apple: t('auth_login_apple_title', nativeLanguage),
            email: t('auth_login_email_title', nativeLanguage)
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
              credentialsBtnText: t('auth_use_other_gmail', nativeLanguage),
            },
            facebook: {
              name: 'Arda Şimşek',
              detail: 'Arda Şimşek (Facebook)',
              avatarText: 'A',
              avatarBg: isDarkMode ? '#1877f225' : '#1877f215',
              avatarColor: '#1877F2',
              directEmail: 'ardasimsek1005@gmail.com',
              credentialsBtnText: t('auth_use_other_fb', nativeLanguage),
            },
            apple: {
              name: 'Arda Şimşek',
              detail: 'ardasimsek1005@icloud.com',
              avatarText: 'A',
              avatarBg: isDarkMode ? '#222' : '#f5f5f5',
              avatarColor: isDarkMode ? '#fff' : '#1E1E22',
              directEmail: 'ardasimsek1005@icloud.com',
              credentialsBtnText: t('auth_use_other_apple', nativeLanguage),
            },
            email: {
              name: 'Arda Şimşek',
              detail: 'ardasimsek1005@gmail.com',
              avatarText: 'A',
              avatarBg: isDarkMode ? '#4ecdc425' : '#4ecdc415',
              avatarColor: '#4ECDC4',
              directEmail: 'ardasimsek1005@gmail.com',
              credentialsBtnText: t('auth_use_other_email', nativeLanguage),
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
              title: t('auth_login_google_title', nativeLanguage),
              desc: t('auth_gmail_desc', nativeLanguage),
              color: '#EA4335',
              emailLabel: t('auth_gmail_address', nativeLanguage),
              emailPlaceholder: 'ornek@gmail.com',
              submitText: t('auth_login_google_btn', nativeLanguage),
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.468 0-6.28-2.812-6.28-6.28s2.812-6.28 6.28-6.28c1.554 0 2.969.571 4.07 1.509l3.109-3.11C18.66 1.705 15.635 1 12.24 1 5.767 1 12.24s4.767 11.24 11.24 11.24c6.335 0 11.24-4.514 11.24-11.24 0-.74-.085-1.485-.24-2.215H12.24z" />
                </svg>
              )
            },
            facebook: {
              title: t('auth_login_facebook_title', nativeLanguage),
              desc: t('auth_fb_desc', nativeLanguage),
              color: '#1877F2',
              emailLabel: t('auth_fb_email', nativeLanguage),
              emailPlaceholder: 'ornek@facebook.com',
              submitText: t('auth_login_facebook_btn', nativeLanguage),
              icon: (
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              )
            },
            apple: {
              title: t('auth_login_apple_title', nativeLanguage),
              desc: t('auth_apple_desc', nativeLanguage),
              color: '#1E1E22',
              emailLabel: t('auth_apple_id', nativeLanguage),
              emailPlaceholder: 'ornek@icloud.com',
              submitText: t('auth_login_apple_btn', nativeLanguage),
              icon: (
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.74-1.2 1.88-1.05 2.99 1.11.09 2.26-.54 3-1.43z" />
                </svg>
              )
            },
            email: {
              title: t('auth_login_link', nativeLanguage),
              desc: t('auth_email_desc', nativeLanguage),
              color: '#4ECDC4',
              emailLabel: t('auth_username_label', nativeLanguage),
              emailPlaceholder: t('auth_username_placeholder', nativeLanguage),
              submitText: t('auth_login_btn', nativeLanguage),
              icon: (
                <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
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
                    setShowPassword(false);
                  }}
                  className={`absolute top-4 right-4 p-1 px-2.5 rounded-lg text-xs font-bold font-mono cursor-pointer transition-colors ${
                    isDarkMode ? 'text-gray-300 bg-[#2A2A30] hover:bg-[#343A40]' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {t('auth_btn_close', nativeLanguage)}
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
                  {loginStep === 'picker' ? t('auth_select_saved_account_desc', nativeLanguage) : config.desc}
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
                      <span className="text-[9px] font-bold text-gray-450 uppercase tracking-wider shrink-0 select-none">
                        {localStorage.getItem('linguist_session_token_' + currentPicker.directEmail.toLowerCase().trim()) 
                          ? t('auth_login_saved_session', nativeLanguage) 
                          : t('auth_saved_tag', nativeLanguage)}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLoginStep('credentials')}
                      className={`w-full py-3 rounded-2xl border text-xs font-bold transition-colors cursor-pointer text-center font-headline-lg ${
                        isDarkMode ? 'bg-transparent border-gray-800 hover:bg-white/5 text-gray-300' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-650'
                      }`}
                    >
                      {t(provider === 'google' ? 'auth_google_use_other' : provider === 'facebook' ? 'auth_facebook_use_other' : provider === 'apple' ? 'auth_apple_use_other' : 'auth_email_use_other', nativeLanguage)}
                    </button>
                  </div>
                ) : loginStep === 'register' ? (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="text-left">
                      <label className="text-[10px] font-bold text-gray-400 tracking-wider block mb-1 font-headline-lg">
                        {t('auth_register_username_label', nativeLanguage)}
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting}
                        placeholder={t('auth_register_name_placeholder', nativeLanguage)}
                        value={mockName}
                        onChange={(e) => setMockName(e.target.value)}
                        className={`w-full text-xs px-3 py-2.5 border rounded-xl focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] font-medium transition-colors ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          isDarkMode 
                            ? 'bg-[#121214] border-[#2A2A30] text-white placeholder-gray-650' 
                            : 'bg-white border-[#FFE66D] text-gray-800 placeholder-teal-650'
                        }`}
                      />
                    </div>

                    <div className="text-left">
                      <label className="text-[10px] font-bold text-gray-400 tracking-wider block mb-1 font-headline-lg">
                        {t('auth_password_min_label', nativeLanguage)}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          disabled={isSubmitting}
                          placeholder="••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className={`w-full text-xs pl-3 pr-10 py-2.5 border rounded-xl focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] font-medium transition-colors ${
                            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                          } ${
                            isDarkMode 
                              ? 'bg-[#121214] border-[#2A2A30] text-white placeholder-gray-650' 
                              : 'bg-white border-[#FFE66D] text-gray-800 placeholder-teal-650'
                          }`}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword(prev => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-450 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          setLoginStep('picker');
                          setMockEmail('');
                          setMockName('');
                          setLoginPassword('');
                          setShowPassword(false);
                        }}
                        className={`w-1/3 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer font-headline-lg ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          isDarkMode ? 'bg-[#2A2A30] hover:bg-[#343A40] text-gray-300' : 'bg-gray-150 hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        {t('auth_back_btn', nativeLanguage)}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-2/3 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-md py-3.5 font-headline-lg flex items-center justify-center gap-1.5 ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        style={{ backgroundColor: '#4ECDC4' }}
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{t('auth_registering_toast', nativeLanguage)}</span>
                          </>
                        ) : (
                          <span>{t('auth_register_btn', nativeLanguage)}</span>
                        )}
                      </button>
                    </div>
                    <div className="text-center pt-3 text-[10px]">
                      <span className="text-gray-400 font-semibold font-headline-lg">{t('auth_have_account', nativeLanguage)}</span>
                      <button
                        type="button"
                        onClick={() => setLoginStep('credentials')}
                        className="text-[#4ECDC4] font-extrabold hover:underline cursor-pointer font-headline-lg"
                      >
                        {t('auth_login_link', nativeLanguage)}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleMockSubmit} className="space-y-4">
                    <div className="text-left">
                      <label className="text-[10px] font-bold text-gray-400 tracking-wider block mb-1 font-headline-lg">
                        {config.emailLabel}
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting}
                        placeholder={config.emailPlaceholder}
                        value={mockEmail}
                        onChange={(e) => setMockEmail(e.target.value)}
                        className={`w-full text-xs px-3 py-2.5 border rounded-xl focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] font-medium transition-colors ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          isDarkMode 
                            ? 'bg-[#121214] border-[#2A2A30] text-white placeholder-gray-600' 
                            : 'bg-white border-[#FFE66D] text-gray-800 placeholder-teal-650'
                        }`}
                      />
                    </div>
 
                    <div className="text-left">
                      <label className="text-[10px] font-bold text-gray-400 tracking-wider block mb-1 font-headline-lg">
                        {t('auth_password_label', nativeLanguage)}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          disabled={isSubmitting}
                          placeholder="••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className={`w-full text-xs pl-3 pr-10 py-2.5 border rounded-xl focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] font-medium transition-colors ${
                            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                          } ${
                            isDarkMode 
                              ? 'bg-[#121214] border-[#2A2A30] text-white placeholder-gray-650' 
                              : 'bg-white border-[#FFE66D] text-gray-800 placeholder-teal-650'
                          }`}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword(prev => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-450 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
 
                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          setLoginStep('picker');
                          setMockEmail('');
                          setLoginPassword('');
                          setShowPassword(false);
                        }}
                        className={`w-1/3 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer font-headline-lg ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          isDarkMode ? 'bg-[#2A2A30] hover:bg-[#343A40] text-gray-300' : 'bg-gray-150 hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        {t('auth_back_btn', nativeLanguage)}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-2/3 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-md py-3.5 font-headline-lg flex items-center justify-center gap-1.5 ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        style={{ backgroundColor: config.color === '#1E1E22' ? '#333' : config.color }}
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{t('auth_logging_in_toast', nativeLanguage)}</span>
                          </>
                        ) : (
                          <span>{config.submitText}</span>
                        )}
                      </button>
                    </div>
                    <div className="text-center pt-3 text-[10px]">
                      <span className="text-gray-400 font-semibold font-headline-lg">{t('auth_new_user_prompt', nativeLanguage)}</span>
                      <button
                        type="button"
                        onClick={() => setLoginStep('register')}
                        className="text-[#4ECDC4] font-extrabold hover:underline cursor-pointer font-headline-lg"
                      >
                        {t('auth_create_account_link', nativeLanguage)}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* SIMULATED OAUTH MODAL (GOOGLE / FACEBOOK) */}
      <AnimatePresence>
        {oauthStep !== 'none' && oauthProvider && (() => {
          const isGoogle = oauthProvider === 'google';
          
          return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="max-w-md w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-white border border-gray-200 text-gray-800"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {/* 1. Browser Chrome Header */}
                <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
                  {/* Window Controls */}
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                  </div>
                  {/* Address Bar */}
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1 flex items-center gap-2 text-[10px] text-gray-500 font-mono select-none overflow-hidden truncate">
                    <span className="text-emerald-600 font-bold shrink-0">🔒 {t('oauth_secure_tag', nativeLanguage)}</span>
                    <span className="truncate">
                      {isGoogle 
                        ? 'https://accounts.google.com/o/oauth2/v2/auth?client_id=987216-oykum.apps.googleusercontent.com&redirect_uri=capacitor://localhost' 
                        : 'https://www.facebook.com/v12.0/dialog/oauth?client_id=274910385912&redirect_uri=capacitor://localhost'
                      }
                    </span>
                  </div>
                  {/* Close Window */}
                  <button
                    type="button"
                    onClick={() => {
                      setOauthStep('none');
                      setOauthProvider(null);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-650 cursor-pointer font-bold transition-colors text-xs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 2. Main content based on state */}
                <div className="p-8 flex flex-col items-center min-h-[360px] justify-center bg-white relative">
                  
                  {/* STEP: LOADING */}
                  {oauthStep === 'loading' && (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      {isGoogle ? (
                        <div className="flex space-x-1.5">
                          <span className="w-3 h-3 bg-[#4285F4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-3 h-3 bg-[#EA4335] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-3 h-3 bg-[#FBBC05] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          <span className="w-3 h-3 bg-[#34A853] rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 border-4 border-[#1877F2]/20 border-t-[#1877F2] rounded-full animate-spin" />
                      )}
                      <p className="text-xs text-gray-500 font-semibold font-headline-lg animate-pulse">
                        {t('auth_provider_loading', nativeLanguage).replace('{provider}', isGoogle ? 'Google Accounts' : 'Facebook Login')}
                      </p>
                    </div>
                  )}

                  {/* STEP: SELECT ACCOUNT (Google Only) */}
                  {oauthStep === 'select_account' && isGoogle && (
                    <div className="w-full flex flex-col">
                      {/* Google Multi-colored Logo */}
                      <div className="flex justify-center mb-6 font-bold text-2xl tracking-tight select-none">
                        <span className="text-[#4285F4]">G</span>
                        <span className="text-[#EA4335]">o</span>
                        <span className="text-[#FBBC05]">o</span>
                        <span className="text-[#4285F4]">g</span>
                        <span className="text-[#34A853]">l</span>
                        <span className="text-[#EA4335]">e</span>
                      </div>

                      <h3 className="text-base font-bold text-center text-gray-900 mb-1 font-headline-lg">
                        {t('oauth_choose_account', nativeLanguage)}
                      </h3>
                      <p className="text-xs text-center text-gray-500 mb-6 font-semibold font-headline-lg">
                        {t('oauth_to_continue', nativeLanguage)}
                      </p>

                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {/* Default Preloaded Account */}
                        <button
                          type="button"
                          onClick={() => {
                            setOauthEmail('ardasimsek1005@gmail.com');
                            setOauthStep('consent');
                          }}
                          className="w-full p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-left transition-colors flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#EA4335]/10 text-[#EA4335] flex items-center justify-center font-bold text-xs select-none">
                            A
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-gray-800">Arda Şimşek</div>
                            <div className="text-[10px] text-gray-500 font-medium truncate">ardasimsek1005@gmail.com</div>
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#EA4335] transition-colors" />
                        </button>

                        {/* Custom Account Selection */}
                        {oauthShowCustomInput ? (
                          <div className="p-3.5 rounded-xl border border-[#4285F4] bg-white space-y-3">
                            <label className="text-[9px] font-bold text-[#4285F4] tracking-wider block font-headline-lg">
                              {t('auth_gmail_address', nativeLanguage)}
                            </label>
                            <input
                              type="email"
                              placeholder="ornek@gmail.com"
                              value={oauthCustomEmail}
                              onChange={(e) => setOauthCustomEmail(e.target.value)}
                              className="w-full text-xs px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4285F4] font-medium"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setOauthShowCustomInput(false)}
                                className="w-1/2 py-2 border border-gray-205 rounded-lg text-[10px] font-bold text-gray-500 hover:bg-gray-50 cursor-pointer"
                              >
                                {t('btn_cancel', nativeLanguage)}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const trimmed = oauthCustomEmail.trim().toLowerCase();
                                  if (!trimmed || !trimmed.endsWith('@gmail.com') || trimmed.length < 13) {
                                    setToastMessage(t('auth_error_gmail_format', nativeLanguage));
                                    setTimeout(() => setToastMessage(null), 3000);
                                    return;
                                  }
                                  setOauthEmail(trimmed);
                                  setOauthStep('consent');
                                }}
                                className="w-1/2 py-2 bg-[#4285F4] text-white rounded-lg text-[10px] font-bold hover:bg-[#357ae8] cursor-pointer shadow-sm"
                              >
                                {t('btn_next', nativeLanguage)}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setOauthShowCustomInput(true)}
                            className="w-full p-3.5 rounded-xl border border-dashed border-gray-300 hover:border-[#4285F4] hover:bg-[#4285F4]/5 text-center transition-colors flex items-center justify-center gap-2 cursor-pointer group"
                          >
                            <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#4285F4]" />
                            <span className="text-xs font-bold text-gray-500 group-hover:text-[#4285F4]">{t('auth_google_use_other', nativeLanguage)}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP: CONSENT (Google / Facebook) */}
                  {oauthStep === 'consent' && (
                    <div className="w-full flex flex-col">
                      {isGoogle ? (
                        /* Google Consent */
                        <>
                          <div className="flex justify-center mb-5 font-bold text-xl tracking-tight select-none">
                            <span className="text-[#4285F4]">G</span>
                            <span className="text-[#EA4335]">o</span>
                            <span className="text-[#FBBC05]">o</span>
                            <span className="text-[#4285F4]">g</span>
                            <span className="text-[#34A853]">l</span>
                            <span className="text-[#EA4335]">e</span>
                          </div>
                          
                          <h3 className="text-base font-bold text-center text-gray-800 mb-1 font-headline-lg">
                            {t('oauth_title_google', nativeLanguage)}
                          </h3>
                          <p className="text-[11px] text-center text-gray-500 mb-5 font-semibold font-headline-lg">
                            {t('oauth_action_account', nativeLanguage)} <span className="text-gray-700 font-extrabold">{oauthEmail}</span>
                          </p>

                          <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 mb-6 space-y-3">
                            <p className="text-[9px] text-gray-400 font-bold tracking-wider uppercase block font-headline-lg">
                              {t('oauth_wants_access', nativeLanguage)}
                            </p>
                            <div className="flex gap-2.5 items-start">
                              <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0 mt-0.5" />
                              <div className="text-xs text-gray-700 font-medium">
                                <span className="font-bold">{t('oauth_personal_info', nativeLanguage)}</span> {t('oauth_personal_info_desc', nativeLanguage)}
                              </div>
                            </div>
                            <div className="flex gap-2.5 items-start">
                              <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0 mt-0.5" />
                              <div className="text-xs text-gray-700 font-medium">
                                <span className="font-bold">{t('oauth_email_address', nativeLanguage)}</span> {t('oauth_email_address_desc', nativeLanguage)}
                              </div>
                            </div>
                          </div>

                          <p className="text-[9px] text-gray-450 mb-6 leading-relaxed font-semibold text-center font-headline-lg">
                            {t('oauth_consent_desc', nativeLanguage)}
                          </p>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setOauthStep('none');
                                setOauthProvider(null);
                              }}
                              className="w-1/3 py-2.5 border border-gray-250 hover:bg-gray-50 text-xs font-bold text-gray-600 rounded-xl cursor-pointer text-center font-headline-lg"
                            >
                              {t('oauth_cancel', nativeLanguage)}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const localName = formatAutofillName(oauthEmail) || oauthEmail.split('@')[0];
                                handleOauthSubmit(oauthEmail, localName, 'google');
                              }}
                              className="w-2/3 py-2.5 bg-[#4285F4] hover:bg-[#357ae8] text-white text-xs font-bold rounded-xl cursor-pointer text-center shadow-md font-headline-lg"
                            >
                              {t('oauth_confirm_btn', nativeLanguage)}
                            </button>
                          </div>
                        </>
                      ) : (
                        /* Facebook Consent */
                        <>
                          <div className="flex justify-center mb-5 font-black text-2xl tracking-tighter text-[#1877F2] select-none font-mono">
                            facebook
                          </div>

                          <h3 className="text-base font-bold text-center text-gray-800 mb-1 font-headline-lg">
                            {t('oauth_title_facebook', nativeLanguage)}
                          </h3>
                          <p className="text-[11px] text-center text-gray-500 mb-6 font-semibold font-headline-lg">
                            {t('oauth_desc_facebook', nativeLanguage)}
                          </p>

                          <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 mb-6 space-y-3 w-full">
                            <div className="flex items-center gap-3 mb-1">
                              <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center font-bold text-sm select-none">
                                A
                              </div>
                              <div className="text-left">
                                <div className="text-xs font-bold text-gray-800">Arda Şimşek</div>
                                <div className="text-[9px] text-gray-400 font-semibold">{t('oauth_logging_in_fb', nativeLanguage)}</div>
                              </div>
                            </div>
                            <div className="border-t border-gray-200 pt-3 space-y-2 text-left">
                              <p className="text-[9px] text-gray-400 font-bold tracking-wider uppercase block font-headline-lg">
                                {t('oauth_permissions_requested', nativeLanguage)}
                              </p>
                              <div className="text-xs text-gray-700 font-medium">
                                {t('oauth_perm_public_profile', nativeLanguage)}
                              </div>
                              <div className="text-xs text-gray-700 font-medium">
                                {t('oauth_perm_email', nativeLanguage)} ({oauthEmail})
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 w-full">
                            <button
                              type="button"
                              onClick={() => {
                                setOauthStep('none');
                                setOauthProvider(null);
                              }}
                              className="w-1/3 py-2.5 border border-gray-250 hover:bg-gray-50 text-xs font-bold text-gray-600 rounded-xl cursor-pointer text-center font-headline-lg"
                            >
                              {t('oauth_cancel', nativeLanguage)}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleOauthSubmit(oauthEmail, 'Arda Şimşek', 'facebook');
                              }}
                              className="w-2/3 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-xl cursor-pointer text-center shadow-md font-headline-lg animate-pulse"
                            >
                              {t('oauth_continue_as_format', nativeLanguage).replace('{name}', 'Arda Şimşek')}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* STEP: REDIRECTING */}
                  {oauthStep === 'redirecting' && (
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest font-headline-lg">
                          {t('oauth_login_success', nativeLanguage)}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium font-headline-lg max-w-[280px]">
                          {t('oauth_redirecting', nativeLanguage)}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 bg-[#2D3436]/55 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-xs w-full rounded-[24px] border-2 p-5 flex flex-col shadow-2xl relative transition-all ${
                isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
              }`}
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 dark:bg-rose-500/15 flex items-center justify-center mb-4 text-rose-500">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>

              <h3 className={`font-headline-lg text-sm font-bold mb-2 text-center ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                {t('confirm_logout_title', nativeLanguage)}
              </h3>
              <p className="text-[10px] text-gray-400 mb-5 leading-relaxed font-semibold text-center font-headline-lg">
                {t('confirm_logout_desc', nativeLanguage)}
              </p>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-headline-lg ${
                    isDarkMode ? 'bg-[#2A2A30] hover:bg-[#343A40] text-gray-300' : 'bg-gray-150 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {t('btn_cancel', nativeLanguage)}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const providerNames: Record<string, string> = {
                      google: 'Google',
                      facebook: 'Facebook',
                      apple: 'Apple',
                      email: nativeLanguage === 'tr' ? 'E-posta' : 'Email'
                    };
                    const currentProviderName = providerNames[loginProvider || ''] || (nativeLanguage === 'tr' ? 'Hesap' : 'Account');
                    onLogout();
                    setShowLogoutConfirm(false);
                    setToastMessage(t('confirm_logout_toast', nativeLanguage).replace('{provider}', currentProviderName));
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="w-1/2 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-all cursor-pointer shadow-md shadow-rose-500/20 font-headline-lg"
                >
                  {t('settings_logout', nativeLanguage)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-[#2D3436]/55 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-xs w-full rounded-[24px] border-2 p-5 flex flex-col shadow-2xl relative transition-all ${
                isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
              }`}
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 dark:bg-rose-500/15 flex items-center justify-center mb-4 text-rose-500">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>

              <h3 className={`font-headline-lg text-sm font-bold mb-2 text-center ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                {t('confirm_delete_title', nativeLanguage)}
              </h3>
              <p className="text-[10px] text-gray-400 mb-5 leading-relaxed font-semibold text-center font-headline-lg">
                {t('confirm_delete_desc', nativeLanguage)}
              </p>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-headline-lg ${
                    isDarkMode ? 'bg-[#2A2A30] hover:bg-[#343A40] text-gray-300' : 'bg-gray-150 hover:bg-gray-200 text-gray-600'
                  } ${isDeletingAccount ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t('btn_cancel', nativeLanguage)}
                </button>
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={async () => {
                    setIsDeletingAccount(true);
                    setToastMessage(t('confirm_delete_toast_deleting', nativeLanguage));
                    try {
                      await onDeleteAccount();
                      setShowDeleteConfirm(false);
                      setToastMessage(t('confirm_delete_toast_success', nativeLanguage));
                    } catch (err) {
                      console.error(err);
                      setToastMessage(t('auth_error_generic', nativeLanguage));
                      setTimeout(() => setToastMessage(null), 3000);
                    } finally {
                      setIsDeletingAccount(false);
                    }
                  }}
                  className="w-1/2 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-all cursor-pointer shadow-md shadow-rose-500/20 font-headline-lg flex items-center justify-center gap-1.5"
                >
                  {isDeletingAccount ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    t('confirm_delete_btn_confirm', nativeLanguage)
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
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
                {t('invite_modal_title', nativeLanguage)}
              </h3>
              <p className="text-[10px] text-gray-400 mb-4 leading-relaxed font-semibold text-center font-headline-lg">
                {t('invite_modal_desc', nativeLanguage)}
              </p>
              
              <input
                type="text"
                placeholder={t('invite_modal_placeholder', nativeLanguage)}
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
                  {t('btn_cancel', nativeLanguage)}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cleaned = inviteInputVal.trim();
                    if (!cleaned) {
                      setToastMessage(t('invite_toast_enter_code', nativeLanguage));
                      setTimeout(() => setToastMessage(null), 2500);
                      return;
                    }
                    localStorage.setItem('linguist_referred_by', cleaned);
                    setReferredBy(cleaned);
                    setIsInviteInputOpen(false);
                    setToastMessage(t('invite_toast_success', nativeLanguage));
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="w-1/2 py-2 bg-[#FF6B6B] text-white rounded-xl text-xs font-bold hover:bg-[#e05a5a] transition-all cursor-pointer shadow-md shadow-[#FF6B6B]/20 font-headline-lg"
                >
                  {t('btn_apply', nativeLanguage)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRIVACY POLICY MODAL */}
      <AnimatePresence>
        {isPrivacyModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#2D3436]/55 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full rounded-[24px] border-2 p-6 flex flex-col max-h-[80vh] shadow-2xl relative transition-all ${
                isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
              }`}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-[#2A2A30] text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-emerald-500" />
                <h3 className={`font-headline-lg text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                  {t('privacy_title', nativeLanguage)}
                </h3>
              </div>

              {/* Scrollable Content */}
              <div 
                className={`flex-1 overflow-y-auto pr-2 text-left text-[11px] leading-relaxed space-y-4 font-semibold font-headline-lg custom-scrollbar ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-650'
                }`}
              >
                <p>
                  {t('privacy_intro', nativeLanguage)}
                </p>

                <h4 className={`text-xs font-bold mt-3 ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                  {t('privacy_section_1_title', nativeLanguage)}
                </h4>
                <p>
                  {t('privacy_section_1_desc', nativeLanguage)}
                </p>

                <h4 className={`text-xs font-bold mt-3 ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                  {t('privacy_section_2_title', nativeLanguage)}
                </h4>
                <p>
                  {t('privacy_section_2_desc', nativeLanguage)}
                </p>

                <h4 className={`text-xs font-bold mt-3 ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                  {t('privacy_section_3_title', nativeLanguage)}
                </h4>
                <p>
                  {t('privacy_section_3_desc', nativeLanguage)}
                </p>

                <h4 className={`text-xs font-bold mt-3 ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                  {t('privacy_section_4_title', nativeLanguage)}
                </h4>
                <p>
                  {t('privacy_section_4_desc', nativeLanguage)}
                </p>

                <h4 className={`text-xs font-bold mt-3 ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                  {t('privacy_section_5_title', nativeLanguage)}
                </h4>
                <p>
                  {t('privacy_section_5_desc', nativeLanguage)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#2A2A30] flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(false)}
                  className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all cursor-pointer shadow-md shadow-emerald-500/20 font-headline-lg"
                >
                  {t('btn_close', nativeLanguage)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
