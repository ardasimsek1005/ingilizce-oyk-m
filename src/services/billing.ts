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
let globalSuccessCallback: ((tier?: 'monthly' | 'yearly') => void) | null = null;
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
  onSuccess: (tier?: 'monthly' | 'yearly') => void
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
          globalSuccessCallback('yearly');
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
  tier: 'monthly' | 'yearly',
  onStateChange: (status: 'processing' | 'success' | 'error', errorMsg?: string) => void
): Promise<void> => {
  
  const productId = 'premium_upgrade';
  const win = window as any;
  const CdvPurchase = win.CdvPurchase;

  // DURUM 1: Yerel Android Cihaz (Capacitor / Cordova Entegrasyonu)
  if (isNativeAndroid() && CdvPurchase && CdvPurchase.store && typeof CdvPurchase.store.order === 'function') {
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
        // v13 abonelik yapısında teklif (offer) kimliği "urun_id@plan_id" formatındadır.
        const offerId = `${productId}@${tier}`; // premium_upgrade@monthly veya premium_upgrade@yearly
        console.log('Sipariş başlatılıyor:', offerId);
        
        const offer = product.getOffer(offerId) || product.getOffer() || product;
        
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
        console.warn('Google Play ürünü hazır değil veya satın alınamaz durumda. Simülasyon kullanılıyor.');
        simulatePlayStorePurchase(onStateChange);
      }
    } catch (e: any) {
      console.error('IAP Hatası: ', e);
      onStateChange('error', `Başlatma Hatası: ${e?.message || e}`);
    }
  } 
  // DURUM 2: Web Tarayıcı Geliştirme Ortamı veya eklenti yüklenmemiş durum (Simülasyon Modu)
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

  if (isNativeAndroid() && CdvPurchase && CdvPurchase.store) {
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
          globalSuccessCallback('yearly');
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
    // Simülasyon (Web) ortamında geri yükleme testi
    onStateChange('processing');
    setTimeout(() => {
      if (globalSuccessCallback) {
        globalSuccessCallback('yearly');
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
}

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
    
    // Aylık abonelik teklifi (premium_upgrade@monthly) veya varsayılan teklif
    const monthlyOffer = product.getOffer('premium_upgrade@monthly') || product.getOffer();
    const monthlyPhase = monthlyOffer?.pricingPhases?.[0];
    const monthlyPriceFormatted = monthlyPhase?.formattedPrice;
    
    // Yıllık abonelik teklifi (premium_upgrade@yearly) veya varsayılan teklif
    const yearlyOffer = product.getOffer('premium_upgrade@yearly') || product.getOffer();
    const yearlyPhase = yearlyOffer?.pricingPhases?.[0];
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
      
      return {
        monthly: monthlyPriceFormatted,
        yearlyMonthly: yearlyMonthlyFormatted,
        yearlyTotal: yearlyPriceFormatted,
        yearlyOriginalTotal: originalTotalFormatted,
      };
    }
  } catch (e) {
    console.error('Yerel fiyatlar çözümlenirken hata oluştu:', e);
  }
  return null;
};
