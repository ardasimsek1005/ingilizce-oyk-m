/**
 * Google Play Store Billing - Safe In-App Purchase Service
 * 
 * Bu servis, uygulamanın web tarayıcısında (simülasyon) ve Android yerel (Capacitor/Cordova)
 * platformlarında güvenli bir şekilde çalışmasını sağlar. 
 * Kredi kartı bilgileri doğrudan Google Play Store'un kendi güvenli altyapısında saklanır
 * ve doğrulanır; uygulama içerisine kart bilgisi girilmez.
 */

interface CapacitorWindow extends Window {
  Capacitor?: {
    isNativePlatform: () => boolean;
  };
  CdvPurchase?: any;
}

declare const window: CapacitorWindow;

export interface PurchaseResult {
  success: boolean;
  error?: string;
  transactionId?: string;
}

// Module-level state tracking
let currentOnStateChange: ((status: 'processing' | 'success' | 'error', errorMsg?: string) => void) | null = null;
let globalSuccessCallback: ((tier?: 'monthly' | 'yearly' | 'trial', expiryDate?: string) => void) | null = null;
let activePurchaseTier: 'monthly' | 'yearly' | 'trial' | null = null;
let isStoreInitialized = false;
let globalPricingCallback: (() => void) | null = null;

/**
 * Uygulamanın Android üzerinde yerel bir wrapper (Capacitor/Cordova) içinde çalışıp çalışmadığını sorgular.
 */
export const isNativeAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  const win = window as any;
  return !!(win.Capacitor?.isNativePlatform() || win.CdvPurchase);
};

/**
 * Google Play Store Billing altyapısını başlatır ve dinleyicileri kurar.
 * Uygulama açılışında bir kez çağrılmalıdır.
 */
export const initializeBillingStore = (
  onSuccess: (tier?: 'monthly' | 'yearly' | 'trial', expiryDate?: string) => void
): void => {
  if (typeof window === 'undefined') return;
  const win = window as any;
  const CdvPurchase = win.CdvPurchase;

  if (!CdvPurchase || !CdvPurchase.store) {
    console.log('Google Play Billing: CdvPurchase veya store eklentisi henüz yüklenmedi.');
    return;
  }

  if (isStoreInitialized) {
    console.log('Google Play Billing: Store zaten başlatılmış durumda.');
    globalSuccessCallback = onSuccess; // Callback'i güncelle
    
    try {
      const { store, Platform } = CdvPurchase;
      const product = store.get('premium_upgrade', Platform.GOOGLE_PLAY);
      if (product && product.owned) {
        const transaction = product.transactions?.[0] || product.transaction;
        if (transaction) {
          let actualTier: 'monthly' | 'yearly' | 'trial' = 'yearly';
          const savedTier = activePurchaseTier || localStorage.getItem('linguist_active_purchase_tier');
          if (savedTier === 'monthly' || savedTier === 'yearly' || savedTier === 'trial') {
            actualTier = savedTier;
          } else {
            const offerId = (transaction.offerId || '').toLowerCase();
            if (offerId.includes('yearly') || offerId.includes('year') || offerId.includes('yillik')) {
              actualTier = 'yearly';
            } else if (offerId.includes('trial') || offerId.includes('deneme') || offerId.includes('3-gun') || offerId.includes('free')) {
              actualTier = 'trial';
            } else if (offerId.includes('monthly') || offerId.includes('month') || offerId.includes('aylik')) {
              actualTier = 'monthly';
            }
          }

          let expiryDateStr: string | undefined = undefined;
          const rawExpiry = transaction.expirationDate || transaction.expiryDate;
          if (rawExpiry) {
            expiryDateStr = new Date(rawExpiry).toISOString();
          } else {
            const rawPurchase = transaction.purchaseDate || transaction.time || transaction.date;
            if (rawPurchase) {
              const pDate = new Date(rawPurchase);
              if (actualTier === 'trial') {
                pDate.setDate(pDate.getDate() + 3);
              } else if (actualTier === 'monthly') {
                pDate.setMonth(pDate.getMonth() + 1);
              } else {
                pDate.setFullYear(pDate.getFullYear() + 1);
              }
              expiryDateStr = pDate.toISOString();
            }
          }
          console.log('Google Play Billing: Auto-syncing (already initialized) active subscription tier:', actualTier, 'expiry:', expiryDateStr);
          if (globalSuccessCallback) {
            globalSuccessCallback(actualTier, expiryDateStr);
          }
        }
      }
    } catch (err) {
      console.error('Error during pre-initialized subscription check:', err);
    }
    return;
  }

  globalSuccessCallback = onSuccess;

  try {
    const { store, ProductType, Platform, LogLevel } = CdvPurchase;

    // Log seviyesini ayarla
    store.verbosity = LogLevel.INFO;

    // Ürünü kaydet (V13 API gereği array içinde olmalıdır)
    store.register([
      {
        id: 'premium_upgrade',
        type: ProductType.PAID_SUBSCRIPTION,
        platform: Platform.GOOGLE_PLAY,
      }
    ]);

    // İşlem yaşam döngüsü dinleyicileri
    store.when()
      .approved((transaction: any) => {
        console.log('Ödeme onaylandı:', transaction.productId);
        transaction.verify();
      })
      .verified((receipt: any) => {
        console.log('Ödeme doğrulandı:', receipt.id);
        receipt.finish();
        
        // Premium durumunu global olarak güncelle
        if (globalSuccessCallback) {
          let tier: 'monthly' | 'yearly' | 'trial' = 'yearly';
          const savedTier = activePurchaseTier || localStorage.getItem('linguist_active_purchase_tier');
          if (savedTier === 'monthly' || savedTier === 'yearly' || savedTier === 'trial') {
            tier = savedTier;
          } else {
            const transaction = receipt.transactions?.[0];
            const offerId = (transaction?.offerId || '').toLowerCase();
            if (offerId.includes('yearly') || offerId.includes('year') || offerId.includes('yillik')) {
              tier = 'yearly';
            } else if (offerId.includes('trial') || offerId.includes('deneme') || offerId.includes('3-gun') || offerId.includes('free')) {
              tier = 'trial';
            } else if (offerId.includes('monthly') || offerId.includes('month') || offerId.includes('aylik')) {
              tier = 'monthly';
            }
          }

          let expiryDateStr: string | undefined = undefined;
          const transaction = receipt.transactions?.[0];
          if (transaction) {
            const rawExpiry = transaction.expirationDate || transaction.expiryDate;
            if (rawExpiry) {
              expiryDateStr = new Date(rawExpiry).toISOString();
            } else {
              const rawPurchase = transaction.purchaseDate || transaction.time || transaction.date;
              if (rawPurchase) {
                const pDate = new Date(rawPurchase);
                if (tier === 'trial') {
                  pDate.setDate(pDate.getDate() + 3);
                } else if (tier === 'monthly') {
                  pDate.setMonth(pDate.getMonth() + 1);
                } else {
                  pDate.setFullYear(pDate.getFullYear() + 1);
                }
                expiryDateStr = pDate.toISOString();
              }
            }
          }

          globalSuccessCallback(tier, expiryDateStr);
        }
        
        // Aktif ödeme penceresini başarıyla kapat
        if (currentOnStateChange) {
          currentOnStateChange('success');
        }
      })
      .finished((transaction: any) => {
        console.log('İşlem tamamen tamamlandı:', transaction.id);
      });

    // Google Play Store'dan ürün detayları (ve yerel fiyatlar) geldikçe dinleyicileri uyar
    store.when().productUpdated((product: any) => {
      console.log('Ürün güncellendi (Fiyat/Detay):', product.id);
      if (globalPricingCallback) {
        globalPricingCallback();
      }
    });

    // Global hata dinleyicisi (v13'te kaldırılan store.when().cancelled() / error() yerine kullanılır)
    store.error((error: any) => {
      console.error('Google Play Store Hatası:', error);
      if (currentOnStateChange) {
        if (error.code === CdvPurchase.ErrorCode.PAYMENT_CANCELLED) {
          currentOnStateChange('error', 'Ödeme kullanıcı tarafından iptal edildi.');
        } else {
          currentOnStateChange('error', `Google Play Hatası: ${error.message || error}`);
        }
      }
    });

    store.ready(() => {
      console.log('Google Play Billing: Store ready.');
      try {
        const product = store.get('premium_upgrade', Platform.GOOGLE_PLAY);
        if (product && product.owned) {
          const transaction = product.transactions?.[0] || product.transaction;
          if (transaction) {
            let actualTier: 'monthly' | 'yearly' | 'trial' = 'yearly';
            const savedTier = activePurchaseTier || localStorage.getItem('linguist_active_purchase_tier');
            if (savedTier === 'monthly' || savedTier === 'yearly' || savedTier === 'trial') {
              actualTier = savedTier;
            } else {
              const offerId = (transaction.offerId || '').toLowerCase();
              if (offerId.includes('yearly') || offerId.includes('year') || offerId.includes('yillik')) {
                actualTier = 'yearly';
              } else if (offerId.includes('trial') || offerId.includes('deneme') || offerId.includes('3-gun') || offerId.includes('free')) {
                actualTier = 'trial';
              } else if (offerId.includes('monthly') || offerId.includes('month') || offerId.includes('aylik')) {
                actualTier = 'monthly';
              }
            }

            let expiryDateStr: string | undefined = undefined;
            const rawExpiry = transaction.expirationDate || transaction.expiryDate;
            if (rawExpiry) {
              expiryDateStr = new Date(rawExpiry).toISOString();
            } else {
              const rawPurchase = transaction.purchaseDate || transaction.time || transaction.date;
              if (rawPurchase) {
                const pDate = new Date(rawPurchase);
                if (actualTier === 'trial') {
                  pDate.setDate(pDate.getDate() + 3);
                } else if (actualTier === 'monthly') {
                  pDate.setMonth(pDate.getMonth() + 1);
                } else {
                  pDate.setFullYear(pDate.getFullYear() + 1);
                }
                expiryDateStr = pDate.toISOString();
              }
            }

            console.log('Google Play Billing: Auto-syncing active subscription tier on store ready:', actualTier, 'expiry:', expiryDateStr);
            if (globalSuccessCallback) {
              globalSuccessCallback(actualTier, expiryDateStr);
            }
          }
        }
      } catch (err) {
        console.error('Error during store.ready subscription check:', err);
      }
    });

    console.log('CdvPurchase Store başlatılıyor...');
    store.initialize([Platform.GOOGLE_PLAY]);
    isStoreInitialized = true;
  } catch (err) {
    console.error('Billing store başlatılırken hata oluştu:', err);
  }
};

/**
 * Google Play Store aboneliğini başlatır.
 * 
 * @param tier 'monthly' (Aylık Abonelik) | 'yearly' (Yıllık Abonelik)
 * @param onStateChange Ödeme durumu güncellemelerini takip eden callback (işleniyor, başarılı, başarısız vb.)
 */
export const purchasePlayStoreSubscription = async (
  tier: 'monthly' | 'yearly' | 'trial',
  onStateChange: (status: 'processing' | 'success' | 'error', errorMsg?: string) => void
): Promise<void> => {
  activePurchaseTier = tier;
  if (typeof window !== 'undefined') {
    localStorage.setItem('linguist_active_purchase_tier', tier);
  }
  
  const productId = 'premium_upgrade';
  const win = window as any;
  const CdvPurchase = win.CdvPurchase;

  // DURUM 1: Yerel Android Cihaz (Capacitor / Cordova Entegrasyonu)
  if (isNativeAndroid()) {
    if (CdvPurchase && CdvPurchase.store && typeof CdvPurchase.store.order === 'function') {
      onStateChange('processing');
      currentOnStateChange = onStateChange;
      
      try {
        const store = CdvPurchase.store;

        // Eğer store henüz başlatılmadıysa tekrar dene
        if (!isStoreInitialized) {
          if (globalSuccessCallback) {
            initializeBillingStore(globalSuccessCallback);
          } else {
            initializeBillingStore(() => {});
          }
        }

        const product = store.get(productId, CdvPurchase.Platform.GOOGLE_PLAY);

        if (product && product.canPurchase) {
          let offer: any = null;

          if (product.offers && product.offers.length > 0) {
            if (tier === 'trial') {
              // 1. Doğrudan Google Play Console'da oluşturduğunuz "3-gun-deneme" teklif kimliğini ara
              offer = product.offers.find((o: any) => o.id === 'premium_upgrade@3-gun-deneme');

              if (!offer) {
                // Alternatif olarak isminde "deneme", "3-gun" veya "trial" geçen teklif ara
                offer = product.offers.find((o: any) => {
                  const id = o.id.toLowerCase();
                  return id.includes('3-gun') || id.includes('deneme') || id.includes('trial') || id.includes('free');
                });
              }

              if (!offer) {
                // Ücretsiz deneme içeren (paymentMode === 2 veya priceMicros === 0 olan) herhangi bir teklifi bul
                offer = product.offers.find((o: any) => 
                  o.pricingPhases?.some((phase: any) => phase.paymentMode === 2 || phase.priceMicros === 0)
                );
              }
              
              if (!offer) {
                // En kötü ihtimalle aylık planı seç
                const monthlyOffers = product.offers.filter((o: any) => {
                  const id = o.id.toLowerCase();
                  return id.includes('monthly') || id.includes('month') || id.includes('aylik');
                });
                offer = monthlyOffers[0] || product.getOffer();
              }
            } else if (tier === 'monthly') {
              // Standart aylık plan (teklif kimliği doğrudan "premium_upgrade@monthly" olanı bulur)
              offer = product.offers.find((o: any) => o.id === 'premium_upgrade@monthly');

              if (!offer) {
                const monthlyOffers = product.offers.filter((o: any) => {
                  const id = o.id.toLowerCase();
                  return id.includes('monthly') || id.includes('month') || id.includes('aylik');
                });
                // Deneme süresi içermeyen standart teklifi seç
                offer = monthlyOffers.find((o: any) => 
                  !o.pricingPhases?.some((phase: any) => phase.paymentMode === 2 || phase.priceMicros === 0)
                ) || monthlyOffers[0];
              }
            } else if (tier === 'yearly') {
              // Standart yıllık plan (teklif kimliği doğrudan "premium_upgrade@yearly" olanı bulur)
              offer = product.offers.find((o: any) => o.id === 'premium_upgrade@yearly');

              if (!offer) {
                const yearlyOffers = product.offers.filter((o: any) => {
                  const id = o.id.toLowerCase();
                  return id.includes('yearly') || id.includes('year') || id.includes('yillik') || id.includes('annual');
                });
                // Deneme süresi içermeyen standart teklifi seç
                offer = yearlyOffers.find((o: any) => 
                  !o.pricingPhases?.some((phase: any) => phase.paymentMode === 2 || phase.priceMicros === 0)
                ) || yearlyOffers[0];
              }
            }
          }

          // Eğer hala teklif belirlenemediyse eski usul id eşleştirmesine düş
          if (!offer) {
            const basePlanOfferId = `${productId}@${tier === 'trial' ? 'monthly' : tier}`;
            offer = product.getOffer(basePlanOfferId) || product.getOffer();
          }

          console.log('Sipariş başlatılıyor:', offer.id || offer);
          
          // Siparişi ver ve promise sonucunu kontrol et
          store.order(offer).then((error: any) => {
            if (error) {
              console.error('store.order hata döndü:', error);
              if (error.code === CdvPurchase.ErrorCode.PAYMENT_CANCELLED) {
                onStateChange('error', 'Ödeme kullanıcı tarafından iptal edildi.');
              } else {
                onStateChange('error', `Google Play Hatası: ${error.message || error}`);
              }
            }
          }).catch((err: any) => {
            console.error('store.order catch hatası:', err);
            onStateChange('error', `Sipariş başlatılamadı: ${err?.message || err}`);
          });
        } else {
          console.warn('Google Play ürünü hazır değil veya satın alınamaz durumda.');
          onStateChange('error', 'Google Play ödeme servisi şu an hazır değil veya ürün bulunamadı. Lütfen internetinizi kontrol edip birkaç saniye sonra tekrar deneyin.');
        }
      } catch (e: any) {
        console.error('IAP Hatası: ', e);
        onStateChange('error', `Başlatma Hatası: ${e?.message || e}`);
      }
    } else {
      // Eklenti yüklü değil veya henüz başlatılamadı
      onStateChange('error', 'Google Play Store bağlantısı kurulamadı. Lütfen Google Play Hizmetlerini ve internetinizi kontrol edip tekrar deneyin.');
    }
  } 
  // DURUM 2: Web Tarayıcı Geliştirme Ortamı (Simülasyon Modu)
  else {
    simulatePlayStorePurchase(onStateChange);
  }
};

/**
 * Web tarayıcı ortamında Google Play Store satın alma arayüzünü taklit eden güvenli simülatör.
 */
const simulatePlayStorePurchase = (
  onStateChange: (status: 'processing' | 'success' | 'error') => void
) => {
  onStateChange('processing');

  // Google Play ağ gecikmesi ve GPay doğrulama simülasyonu (2 saniye)
  setTimeout(() => {
    onStateChange('success');
  }, 2000);
};

/**
 * Satın almaları manuel olarak geri yüklemek (restore) için kullanılır.
 * Google Play Store'daki güncel abonelik durumunu sorgular.
 */
export const restorePlayStorePurchases = async (
  onStateChange: (status: 'processing' | 'success' | 'error', errorMsg?: string) => void
): Promise<void> => {
  const win = window as any;
  const CdvPurchase = win.CdvPurchase;

  if (isNativeAndroid()) {
    if (CdvPurchase && CdvPurchase.store) {
      onStateChange('processing');
      try {
        const store = CdvPurchase.store;
        
        console.log('Satın almalar geri yükleniyor (store.update)...');
        // store.update() Google Play Store'daki güncel makbuzları ve abonelik durumunu yeniler
        await store.update();
        
        const product = store.get('premium_upgrade', CdvPurchase.Platform.GOOGLE_PLAY);
        
        if (product && product.owned) {
          console.log('Abonelik doğrulandı ve geri yüklendi.');
          if (globalSuccessCallback) {
            let restoredTier: 'monthly' | 'yearly' | 'trial' = 'yearly';
            const transaction = product.transactions?.[0] || product.transaction;
            const offerId = (transaction?.offerId || '').toLowerCase();
            if (offerId.includes('yearly') || offerId.includes('year') || offerId.includes('yillik')) {
              restoredTier = 'yearly';
            } else if (offerId.includes('trial') || offerId.includes('deneme') || offerId.includes('3-gun') || offerId.includes('free')) {
              restoredTier = 'trial';
            } else if (offerId.includes('monthly') || offerId.includes('month') || offerId.includes('aylik')) {
              restoredTier = 'monthly';
            }

            let expiryDateStr: string | undefined = undefined;
            if (transaction) {
              const rawExpiry = transaction.expirationDate || transaction.expiryDate;
              if (rawExpiry) {
                expiryDateStr = new Date(rawExpiry).toISOString();
              } else {
                const rawPurchase = transaction.purchaseDate || transaction.time || transaction.date;
                if (rawPurchase) {
                  const pDate = new Date(rawPurchase);
                  if (restoredTier === 'trial') {
                    pDate.setDate(pDate.getDate() + 3);
                  } else if (restoredTier === 'monthly') {
                    pDate.setMonth(pDate.getMonth() + 1);
                  } else {
                    pDate.setFullYear(pDate.getFullYear() + 1);
                  }
                  expiryDateStr = pDate.toISOString();
                }
              }
            }

            globalSuccessCallback(restoredTier, expiryDateStr);
          }
          onStateChange('success');
        } else {
          console.log('Geri yükleme: Aktif abonelik bulunamadı.');
          onStateChange('error', 'Aktif bir abonelik bulunamadı.');
        }
      } catch (e: any) {
        console.error('Geri yükleme hatası: ', e);
        onStateChange('error', `Geri Yükleme Hatası: ${e?.message || e}`);
      }
    } else {
      onStateChange('error', 'Google Play Store bağlantısı kurulamadı. Lütfen Google Play Hizmetlerini ve internetinizi kontrol edip tekrar deneyin.');
    }
  } else {
    // Simülasyon (Web) ortamında geri yükleme testi
    onStateChange('processing');
    setTimeout(() => {
      if (globalSuccessCallback) {
        const saved = localStorage.getItem('linguist_active_purchase_tier') as any;
        globalSuccessCallback(saved || 'yearly');
      }
      onStateChange('success');
    }, 1500);
  }
};

/**
 * Fiyat güncellemelerini dinlemek için callback kaydeder.
 */
export const registerPricingListener = (callback: () => void): (() => void) => {
  globalPricingCallback = callback;
  return () => {
    globalPricingCallback = null;
  };
};

export interface LocalizedPrices {
  monthly: string;
  yearlyMonthly: string;
  yearlyTotal: string;
  yearlyOriginalTotal: string;
  hasYearlyTrial?: boolean;
  yearlyTrialPeriodLabel?: string;
  hasMonthlyTrial?: boolean;
  monthlyTrialPeriodLabel?: string;
}

/**
 * ISO 8601 formatındaki ödeme dönemini yerel dile çevirir (örn. P3D -> 3 Gün, P1W -> 1 Hafta)
 */
const parseBillingPeriod = (period: string, lang: string): string => {
  if (!period) return '';
  const match = period.match(/^P(\d+)([DWMY])$/);
  if (!match) return '';
  const amount = parseInt(match[1], 10);
  const unit = match[2];
  
  const isTr = lang === 'tr';
  if (unit === 'D') {
    return isTr ? `${amount} Gün` : `${amount} Day${amount > 1 ? 's' : ''}`;
  } else if (unit === 'W') {
    return isTr ? `${amount} Hafta` : `${amount} Week${amount > 1 ? 's' : ''}`;
  } else if (unit === 'M') {
    return isTr ? `${amount} Ay` : `${amount} Month${amount > 1 ? 's' : ''}`;
  } else if (unit === 'Y') {
    return isTr ? `${amount} Yıl` : `${amount} Year${amount > 1 ? 's' : ''}`;
  }
  return '';
};

/**
 * Google Play Store'dan gelen güncel ve yerelleştirilmiş fiyat bilgilerini çeker.
 * Eğer yerel fiyatlar henüz yüklenmediyse null döner.
 */
export const getLocalizedPrices = (): LocalizedPrices | null => {
  if (typeof window === 'undefined') return null;
  const win = window as any;
  const CdvPurchase = win.CdvPurchase;
  if (!isNativeAndroid() || !CdvPurchase || !CdvPurchase.store) {
    return null;
  }
  
  try {
    const store = CdvPurchase.store;
    const product = store.get('premium_upgrade', CdvPurchase.Platform.GOOGLE_PLAY);
    if (!product || !product.offers || product.offers.length === 0) {
      return null;
    }
    
    // Teklif bulmayı daha esnek hale getiren yardımcı fonksiyon
    const getPlanOffer = (type: 'monthly' | 'yearly') => {
      if (!product.offers || product.offers.length === 0) return product.getOffer();
      const exactId = `premium_upgrade@${type}`;
      const exact = product.offers.find((o: any) => o.id === exactId);
      if (exact) return exact;
      
      const keywords = type === 'yearly' 
        ? ['yearly', 'year', 'yillik', 'annual'] 
        : ['monthly', 'month', 'aylik'];
      const matched = product.offers.find((o: any) => keywords.some(k => o.id.toLowerCase().includes(k)));
      return matched || product.getOffer();
    };

    const monthlyOffer = getPlanOffer('monthly');
    const yearlyOffer = getPlanOffer('yearly');
    
    // Teklif içindeki asıl tekrarlayan (recurring) ödeme aşamasını bulan yardımcı fonksiyon
    const getRecurringPhase = (offer: any) => {
      if (!offer || !offer.pricingPhases || offer.pricingPhases.length === 0) return null;
      return offer.pricingPhases.find((p: any) => p.paymentMode === 0 || p.priceMicros > 0) || offer.pricingPhases[offer.pricingPhases.length - 1];
    };

    const monthlyPhase = getRecurringPhase(monthlyOffer);
    const monthlyPriceFormatted = monthlyPhase?.formattedPrice;
    
    const yearlyPhase = getRecurringPhase(yearlyOffer);
    const yearlyPriceFormatted = yearlyPhase?.formattedPrice;
    
    if (monthlyPriceFormatted && yearlyPriceFormatted && monthlyPhase && yearlyPhase) {
      const currencyCode = yearlyPhase.currency || 'TRY';
      
      // Kullanıcının bölgesine ve para birimine göre sayı formatlayıcı oluştur
      const formatter = new Intl.NumberFormat(win.navigator.language || undefined, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      
      // Yıllık aboneliğin aylık eşdeğerini hesapla (Toplam Yıllık Fiyat / 12)
      const yearlyMonthlyEquivalentMicros = yearlyPhase.priceMicros / 12;
      const yearlyMonthlyEquivalent = yearlyMonthlyEquivalentMicros / 1000000;
      const yearlyMonthlyFormatted = formatter.format(yearlyMonthlyEquivalent);
      
      // İndirimsiz toplam orijinal fiyatı hesapla (Aylık Fiyat * 12)
      const originalTotalMicros = monthlyPhase.priceMicros * 12;
      const originalTotal = originalTotalMicros / 1000000;
      const originalTotalFormatted = formatter.format(originalTotal);
      
      // Deneme sürümü (Free Trial) tespiti ve ayrıştırılması
      let hasYearlyTrial = false;
      let yearlyTrialPeriodLabel = '';
      let hasMonthlyTrial = false;
      let monthlyTrialPeriodLabel = '';
      
      const lang = win.navigator.language?.split('-')[0] || 'tr';

      if (product.offers && product.offers.length > 0) {
        // Yıllık deneme kontrolü (tüm yıllık teklifler içinde deneme aşaması arar)
        const yearlyOffers = product.offers.filter((o: any) => {
          const id = o.id.toLowerCase();
          return id.includes('yearly') || id.includes('year') || id.includes('yillik') || id.includes('annual');
        });
        const yearlyTrialOffer = yearlyOffers.find((o: any) => 
          o.pricingPhases?.some((phase: any) => phase.paymentMode === 2 || phase.priceMicros === 0)
        );
        if (yearlyTrialOffer) {
          hasYearlyTrial = true;
          const trialPhase = yearlyTrialOffer.pricingPhases.find((phase: any) => phase.paymentMode === 2 || phase.priceMicros === 0);
          if (trialPhase?.billingPeriod) {
            yearlyTrialPeriodLabel = parseBillingPeriod(trialPhase.billingPeriod, lang);
          }
        }

        // Aylık deneme kontrolü (tüm aylık teklifler içinde deneme aşaması arar)
        const monthlyOffers = product.offers.filter((o: any) => {
          const id = o.id.toLowerCase();
          return id.includes('monthly') || id.includes('month') || id.includes('aylik');
        });
        const monthlyTrialOffer = monthlyOffers.find((o: any) => 
          o.pricingPhases?.some((phase: any) => phase.paymentMode === 2 || phase.priceMicros === 0)
        );
        if (monthlyTrialOffer) {
          hasMonthlyTrial = true;
          const trialPhase = monthlyTrialOffer.pricingPhases.find((phase: any) => phase.paymentMode === 2 || phase.priceMicros === 0);
          if (trialPhase?.billingPeriod) {
            monthlyTrialPeriodLabel = parseBillingPeriod(trialPhase.billingPeriod, lang);
          }
        }
      }
      
      return {
        monthly: monthlyPriceFormatted,
        yearlyMonthly: yearlyMonthlyFormatted,
        yearlyTotal: yearlyPriceFormatted,
        yearlyOriginalTotal: originalTotalFormatted,
        hasYearlyTrial,
        yearlyTrialPeriodLabel: yearlyTrialPeriodLabel || '3 Gün',
        hasMonthlyTrial,
        monthlyTrialPeriodLabel: monthlyTrialPeriodLabel || '3 Gün'
      };
    }
  } catch (e) {
    console.error('Yerel fiyatlar çözümlenirken hata oluştu:', e);
  }
  return null;
};
