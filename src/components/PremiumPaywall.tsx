import React, { useState, useEffect } from 'react';
import { Crown, X, ShieldCheck, RefreshCw, Lock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { purchasePlayStoreSubscription, restorePlayStorePurchases, getLocalizedPrices, registerPricingListener } from '../services/billing';
import { UserStats } from '../types';
import { t, LanguageCode } from '../i18n';

interface PremiumPaywallProps {
  stats: UserStats;
  refillCountdown: string;
  nativeLanguage: LanguageCode;
  isDarkMode: boolean;
  onClose: () => void;
  onSubscribe: (tier: 'monthly' | 'yearly') => void;
  syncTrigger: () => void;
}

export const PremiumPaywall: React.FC<PremiumPaywallProps> = ({
  stats,
  refillCountdown,
  nativeLanguage,
  isDarkMode,
  onClose,
  onSubscribe,
  syncTrigger
}) => {
  const isTrialAvailable = !stats.premiumExpiryDate && localStorage.getItem('linguist_trial_used') !== 'true';
  const [checkoutTier, setCheckoutTier] = useState<'monthly' | 'yearly' | 'trial'>(isTrialAvailable ? 'trial' : 'yearly');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [prices, setPrices] = useState(() => {
    if (nativeLanguage === 'tr') {
      return {
        monthly: '99\u20BA',
        yearlyMonthly: '59\u20BA',
        yearlyTotal: '712\u20BA',
        yearlyOriginalTotal: '1.188\u20BA'
      };
    } else if (['de', 'fr', 'es', 'it', 'pt'].includes(nativeLanguage)) {
      return {
        monthly: '1.79\u20AC',
        yearlyMonthly: '1.09\u20AC',
        yearlyTotal: '12.99\u20AC',
        yearlyOriginalTotal: '21.48\u20AC'
      };
    } else {
      return {
        monthly: '$1.99',
        yearlyMonthly: '$1.25',
        yearlyTotal: '$14.99',
        yearlyOriginalTotal: '$23.88'
      };
    }
  });

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    const updatePrices = () => {
      const localPrices = getLocalizedPrices();
      if (localPrices) {
        setPrices(localPrices);
      } else {
        if (nativeLanguage === 'tr') {
          setPrices({
            monthly: '99\u20BA',
            yearlyMonthly: '59\u20BA',
            yearlyTotal: '712\u20BA',
            yearlyOriginalTotal: '1.188\u20BA'
          });
        } else if (['de', 'fr', 'es', 'it', 'pt'].includes(nativeLanguage)) {
          setPrices({
            monthly: '1.79\u20AC',
            yearlyMonthly: '1.09\u20AC',
            yearlyTotal: '12.99\u20AC',
            yearlyOriginalTotal: '21.48\u20AC'
          });
        } else {
          setPrices({
            monthly: '$1.99',
            yearlyMonthly: '$1.25',
            yearlyTotal: '$14.99',
            yearlyOriginalTotal: '$23.88'
          });
        }
      }
    };
    
    updatePrices();
    const unsubscribe = registerPricingListener(updatePrices);
    return () => unsubscribe();
  }, [nativeLanguage]);

  const processSecurePayment = (e: React.FormEvent) => {
    e.preventDefault();

    purchasePlayStoreSubscription(checkoutTier, (status, errorMsg) => {
      if (status === 'processing') {
        setIsProcessingPayment(true);
      } else if (status === 'success') {
        setIsProcessingPayment(false);
        setPaymentDone(true);
        if (checkoutTier === 'trial') {
          localStorage.setItem('linguist_trial_used', 'true');
        }
        onSubscribe(checkoutTier === 'trial' ? 'monthly' : checkoutTier);
        syncTrigger();

        setTimeout(() => {
          onClose();
          setPaymentDone(false);
        }, 2000);
      } else if (status === 'error') {
        setIsProcessingPayment(false);
        setToastMessage(errorMsg || t('sub_payment_error', nativeLanguage));
      }
    });
  };

  const handleRestorePurchases = () => {
    restorePlayStorePurchases((status, errorMsg) => {
      if (status === 'processing') {
        setIsProcessingPayment(true);
      } else if (status === 'success') {
        setIsProcessingPayment(false);
        setPaymentDone(true);
        onSubscribe('yearly');
        syncTrigger();
        
        setTimeout(() => {
          onClose();
          setPaymentDone(false);
        }, 2000);
      } else if (status === 'error') {
        setIsProcessingPayment(false);
        setToastMessage(errorMsg || t('sub_payment_error', nativeLanguage));
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D3436]/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] max-w-sm w-[90%] bg-red-500 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <span>⚠️ {toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`max-w-md w-full rounded-[28px] overflow-hidden border-2 shadow-2xl flex flex-col max-h-[92dvh] transition-colors ${
          isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
        }`}
      >
        <div className="bg-[#1E1E22] text-white p-6 relative overflow-hidden shrink-0 select-none border-b border-gray-800">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FF6B6B]/20 rounded-full blur-xl" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 bg-[#FFE66D] text-gray-950 text-[10px] font-bold px-2.5 py-1 rounded-full w-max shadow-xs font-headline-lg">
            <Crown className="w-3.5 h-3.5 text-[#FF6B6B] fill-[#FF6B6B]" />
            <span>{t('premium_benefits_tag', nativeLanguage)}</span>
          </div>
          <h3 className="font-headline-lg text-2xl font-bold tracking-tight mb-1 text-white">
            {stats.hearts <= 0 ? t('no_lives_title', nativeLanguage) : t('premium_access_title', nativeLanguage)}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed font-semibold">
            {stats.hearts <= 0 && refillCountdown ? (
              <span className="text-[#FF6B6B] font-bold">{t('refill_countdown_desc', nativeLanguage).replace('{time}', refillCountdown)}</span>
            ) : (
              t('premium_features_desc', nativeLanguage)
            )}
          </p>
        </div>

        <div className={`p-6 flex-1 overflow-y-auto space-y-5 transition-colors ${
          isDarkMode ? 'bg-[#1A1A1E]' : 'bg-white'
        }`}>
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-455 tracking-widest block font-headline-lg">{t('subscription_plans', nativeLanguage)}</span>
            
            <div
              onClick={() => setCheckoutTier('monthly')}
              className={`p-4 border-2 rounded-2xl flex justify-between items-center cursor-pointer transition-all ${
                checkoutTier === 'monthly'
                  ? isDarkMode ? 'border-[#FF6B6B] bg-[#FF6B6B]/10' : 'border-[#FF6B6B] bg-[#FFFBF0]'
                  : isDarkMode ? 'border-[#2A2A30] hover:border-gray-700' : 'border-[#FFE66D] hover:border-[#FF6B6B]/45'
              }`}
            >
              <div>
                <span className={`font-bold text-sm block font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                  {t('monthly_subscription', nativeLanguage)}
                  {prices.hasMonthlyTrial && (
                    <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-extrabold shadow-sm select-none ml-1.5 inline-block">
                      {prices.monthlyTrialPeriodLabel} Ücretsiz!
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-gray-400 font-medium font-headline-lg">{t('cancel_anytime', nativeLanguage)}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-lg font-headline-lg text-[#FF6B6B] block">
                  {prices.monthly}{' '}
                  <span className="text-xs font-semibold text-gray-400">
                    {t('unit_per_month', nativeLanguage)}
                  </span>
                </span>
              </div>
            </div>

            {/* 3-Day Free Trial Choice Card */}
            {isTrialAvailable && (
              <div
                onClick={() => setCheckoutTier('trial')}
                className={`p-4 border-2 rounded-2xl flex justify-between items-center cursor-pointer transition-all relative overflow-hidden ${
                  checkoutTier === 'trial'
                    ? isDarkMode ? 'border-[#E84393] bg-[#E84393]/10' : 'border-[#E84393] bg-[#FFF0F5]'
                    : isDarkMode ? 'border-[#2A2A30] hover:border-gray-700' : 'border-[#FFE66D] hover:border-[#FF6B6B]/45'
                }`}
              >
                <div className="absolute top-0 right-0 bg-[#E84393] text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-bl-lg tracking-wider font-headline-lg shadow-sm">
                  POPÜLER
                </div>
                <div>
                  <span className={`font-bold text-sm flex items-center gap-1.5 font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                    {t('trial_subscription_title', nativeLanguage)}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium font-headline-lg">
                    {t('trial_subscription_detail', nativeLanguage).replace('{amount}', prices.monthly)}
                  </span>
                </div>
              </div>
            )}

            <div
              onClick={() => setCheckoutTier('yearly')}
              className={`p-4 border-2 rounded-2xl flex justify-between items-center cursor-pointer transition-all relative overflow-hidden ${
                checkoutTier === 'yearly'
                  ? isDarkMode ? 'border-[#4ECDC4] bg-[#4ECDC4]/10' : 'border-[#4ECDC4] bg-[#4ECDC4]/5'
                  : isDarkMode ? 'border-[#2A2A30] hover:border-gray-700' : 'border-[#FFE66D] hover:border-[#FF6B6B]/45'
              }`}
            >
              <div className="absolute top-0 right-0 bg-[#4ECDC4] text-[#2D3436] font-extrabold text-[9px] px-2.5 py-0.5 rounded-bl-lg tracking-wider font-headline-lg shadow-sm">
                {t('percent_discount', nativeLanguage).replace('{percent}', '40')}
              </div>
              <div>
                <span className={`font-bold text-sm flex items-center gap-1.5 font-headline-lg ${isDarkMode ? 'text-white' : 'text-[#2D3436]'}`}>
                  {t('yearly_subscription', nativeLanguage)}
                  {prices.hasYearlyTrial && (
                    <span className="text-[9px] bg-[#E84393] text-white px-1.5 py-0.5 rounded font-extrabold shadow-sm select-none">
                      {prices.yearlyTrialPeriodLabel} Ücretsiz Deneme!
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-gray-400 font-medium font-headline-lg">
                  {t('yearly_payment_detail', nativeLanguage).replace('{amount}', prices.yearlyTotal)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-455 line-through block font-bold">
                  {prices.yearlyOriginalTotal}
                </span>
                <span className="font-bold text-lg font-headline-lg text-[#4ECDC4] block">
                  {prices.yearlyMonthly}{' '}
                  <span className="text-xs font-semibold text-gray-400">
                    {t('unit_per_month', nativeLanguage)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={processSecurePayment} className="space-y-5">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-xs font-bold text-gray-400 tracking-widest block font-headline-lg">{t('google_play_payment', nativeLanguage)}</span>
              <div className="flex items-center gap-1.5 text-xs text-[#4ECDC4] font-bold bg-[#4ECDC4]/10 px-3 py-1 rounded-full border border-[#4ECDC4]/30">
                <ShieldCheck className="w-4 h-4 text-[#4ECDC4]" />
                <span>{t('google_play_protected', nativeLanguage)}</span>
              </div>
            </div>

            {!paymentDone ? (
              <button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-75 font-headline-lg"
              >
                {isProcessingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-gray-950" />
                    <span>{t('processing_google_play', nativeLanguage)}</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 text-gray-950 fill-gray-950" />
                    <span>
                      {checkoutTier === 'yearly' && prices.hasYearlyTrial
                        ? (nativeLanguage === 'tr' ? `${prices.yearlyTrialPeriodLabel} Ücretsiz Deneme` : `Start ${prices.yearlyTrialPeriodLabel} Free Trial`)
                        : checkoutTier === 'monthly' && prices.hasMonthlyTrial
                        ? (nativeLanguage === 'tr' ? `${prices.monthlyTrialPeriodLabel} Ücretsiz Deneme` : `Start ${prices.monthlyTrialPeriodLabel} Free Trial`)
                        : t('btn_subscribe', nativeLanguage)}
                    </span>
                  </>
                )}
              </button>
            ) : (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="w-full py-3.5 bg-emerald-500/10 border border-emerald-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2 select-none"
              >
                <Check className="w-5 h-5 text-emerald-500 animate-bounce" />
                <span className={isDarkMode ? 'text-white' : 'text-[#2D3436]'}>{t('payment_success_premium', nativeLanguage)}</span>
              </motion.div>
            )}



            <p className="text-[10px] leading-relaxed text-gray-400 text-left font-medium select-none">
              {t('google_play_terms_desc', nativeLanguage).replace('{amount}', checkoutTier === 'monthly' ? prices.monthly : prices.yearlyTotal)}
            </p>
          </form>

          <div className="flex justify-center pt-2 pb-1">
            <button
              type="button"
              onClick={handleRestorePurchases}
              disabled={isProcessingPayment}
              className="text-[11px] text-blue-500 hover:text-blue-600 font-bold tracking-wide transition-colors flex items-center gap-1 select-none disabled:opacity-50"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{t('restore_purchases', nativeLanguage)}</span>
            </button>
          </div>

          <div className="flex justify-center items-center gap-1.5 text-[9px] text-gray-400 font-semibold pt-1 select-none text-center leading-normal">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            <span>{t('secure_checkout_desc', nativeLanguage)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
