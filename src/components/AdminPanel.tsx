import React, { useState, useRef } from 'react';
import { 
  Lock, Unlock, ArrowLeft, Plus, Trash2, Image, BookOpen, 
  Sparkles, CheckCircle2, AlertCircle, HelpCircle, FileText, ChevronRight, 
  BookOpenCheck, Edit2, Upload, Loader2, RefreshCw, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Paragraph } from '../types';

// Preset cover images context
const PRESET_COVERS = [
  { name: 'Kırmızı Başlıklı Kız', url: '/covers/red_riding_hood.webp' },
  { name: 'Külkedisi / Cinderella', url: '/covers/cinderella.webp' },
  { name: 'Pamuk Prenses / Snow White', url: '/covers/snow_white.webp' },
  { name: 'Hansel ve Gretel', url: '/covers/hansel_gretel.webp' },
  { name: 'Jack ve Fasulye Sırığı', url: '/covers/jack_beanstalk.webp' },
  { name: 'Üç Küçük Domuzcuk', url: '/covers/three_pigs.webp' },
  { name: 'Çirkin Ördek Yavrusu', url: '/covers/ugly_duckling.webp' },
  { name: 'Goldilocks ve Üç Ayı', url: '/covers/goldilocks.webp' },
  { name: 'Rapunzel', url: '/covers/rapunzel.webp' },
  { name: 'Uyuyan Güzel', url: '/covers/sleeping_beauty.webp' },
  { name: 'Tavşan ile Kaplumbağa', url: '/covers/tortoise_hare.webp' },
  { name: 'Çizmeli Kedi', url: '/covers/puss_in_boots.webp' },
  { name: 'Meşe Ağacının Sırrı', url: '/covers/secret_oak_tree.webp' },
  { name: 'Kurmalı Kasaba', url: '/covers/clockwork_town.webp' },
  { name: 'Rüyaları Boyayan Çocuk', url: '/covers/painted_dreams.webp' },
  { name: 'Sihirli Orman / Forest', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80' },
  { name: 'Kraliyet Şatosu / Castle', url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&auto=format&fit=crop&q=80' }
];

interface AdminPanelProps {
  books: Book[];
  onAddAdminBook: (newBook: Book) => void;
  onUpdateAdminBook?: (updatedBook: Book) => void;
  onDeleteAdminBook: (bookId: string) => void;
  onBack: () => void;
  isDarkMode?: boolean;
}

export default function AdminPanel({
  books,
  onAddAdminBook,
  onUpdateAdminBook,
  onDeleteAdminBook,
  onBack,
  isDarkMode
}: AdminPanelProps) {
  // Authorization State
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return localStorage.getItem('linguist_admin_auth') === 'true';
  });
  const [loginError, setLoginError] = useState('');

  // Story Creation State Wizard
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  
  // Fields State
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1'>('A1');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  
  // Base64 Upload file state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Bulk English Text input
  const [bulkEnText, setBulkEnText] = useState('');

  // Editing state tracker
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  
  // AI Translation State
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationStep, setTranslationStep] = useState<string>('');
  
  // Success / Error Feedback
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Admin Authorization
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin' || password === '1234' || password === 'linguist2026') {
      setIsAuthorized(true);
      localStorage.setItem('linguist_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Hatalı şifre! Lütfen tekrar deneyin.');
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    localStorage.removeItem('linguist_admin_auth');
    setPassword('');
  };

  // Image Upload handler to convert raw file inputs to Base64 data URLs
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Önemli: Lütfen tarayıcı performansınız için 2MB\'dan daha küçük bir fotoğraf yükleyin.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setCustomCoverUrl('');
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Initiate AI Translate & Compile Book
  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Lütfen hikaye için İngilizce bir başlık girin.');
      return;
    }
    if (!bulkEnText.trim()) {
      setErrorMsg('Lütfen İngilizce hikaye içeriğini girin.');
      return;
    }

    setIsTranslating(true);
    setTranslationStep('Yapay zeka motoruna bağlanılıyor...');

    try {
      // Step 1: Request payload
      setTimeout(() => {
        setTranslationStep('İngilizce metin analiz ediliyor...');
      }, 800);

      setTimeout(() => {
        setTranslationStep('Hikaye sayfaları oluşturuluyor, Türkçe satır altı çeviriler hazırlanıyor...');
      }, 1800);

      setTimeout(() => {
        setTranslationStep('Seviyeye uygun interaktif sözlük kelimeleri çıkartılıyor...');
      }, 3500);

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          text: bulkEnText.trim(),
          level: level
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Çeviri servisi hata döndürdü.');
      }

      const translationData = await response.json();

      if (!translationData.paragraphs || translationData.paragraphs.length === 0) {
        throw new Error('Sistem geçerli paragraf yapıları üretemedi. Lütfen metninizi kontrol edin.');
      }

      // Prepare final cover URL (Preference: Uploaded base64 > Custom URL > Preset URL)
      const finalCover = uploadedImage || customCoverUrl.trim() || coverUrl;

      // Calculate statistics
      const compiledParagraphs: Paragraph[] = translationData.paragraphs.map((p: any, idx: number) => ({
        id: `admin_p_${Date.now()}_${idx}`,
        textEn: p.textEn.trim(),
        textTr: p.textTr.trim(),
        words: p.words || []
      }));

      const totalWords = compiledParagraphs.reduce((sum, p) => sum + p.textEn.split(/\s+/).length, 0);
      const readingTimeMins = Math.max(1, Math.ceil(totalWords / 45));

      if (editingBookId) {
        // Edit mode: modify the existing book
        const updatedBook: Book = {
          id: editingBookId,
          title: title.trim(),
          author: 'Yönetici / Admin',
          level: level,
          levelName: `${level} Swimmer`,
          coverUrl: finalCover,
          percentageCompleted: 0,
          pagesLeft: compiledParagraphs.length,
          totalPages: compiledParagraphs.length,
          currentPage: 0,
          statsWords: totalWords,
          statsTime: `${readingTimeMins}dk`,
          chapters: [
            {
              id: `chap_${editingBookId}`,
              title: translationData.titleTr || 'Giriş / Introduction',
              paragraphs: compiledParagraphs
            }
          ]
        };

        if (onUpdateAdminBook) {
          onUpdateAdminBook(updatedBook);
          setSuccessMsg(`"${title.trim()}" başlıklı hikaye başarıyla güncellendi! 🎉`);
        } else {
          throw new Error('Güncelleme işleyicisi bulunamadı.');
        }
      } else {
        // Create mode: append a new book
        const newBook: Book = {
          id: `admin_book_${Date.now()}`,
          title: title.trim(),
          author: 'Yönetici / Admin',
          level: level,
          levelName: `${level} Swimmer`,
          coverUrl: finalCover,
          percentageCompleted: 0,
          pagesLeft: compiledParagraphs.length,
          totalPages: compiledParagraphs.length,
          currentPage: 0,
          statsWords: totalWords,
          statsTime: `${readingTimeMins}dk`,
          chapters: [
            {
              id: `admin_chap_${Date.now()}`,
              title: translationData.titleTr || 'Giriş / Introduction',
              paragraphs: compiledParagraphs
            }
          ]
        };

        onAddAdminBook(newBook);
        setSuccessMsg(`"${title.trim()}" başarıyla otomatik çevrildi ve kitaplığa eklendi! 🎉`);
      }

      // Reset form states
      handleCancelEdit();
      
      // Auto redirect to manage/list tab
      setTimeout(() => {
        setActiveTab('manage');
        setSuccessMsg('');
      }, 1500);

    } catch (gErr: any) {
      console.error(gErr);
      setErrorMsg(gErr.message || 'Hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Populate form with existing book to edit/update
  const handleEditBookClick = (book: Book) => {
    setEditingBookId(book.id);
    setTitle(book.title);
    setLevel(book.level);
    
    // Extract English text of paragraphs from the book
    const fullEnText = book.chapters[0]?.paragraphs.map(p => p.textEn).join('\n\n') || '';
    setBulkEnText(fullEnText);

    // Cover handling
    const isPreset = PRESET_COVERS.some(c => c.url === book.coverUrl);
    if (isPreset) {
      setCoverUrl(book.coverUrl);
      setCustomCoverUrl('');
      setUploadedImage(null);
    } else if (book.coverUrl.startsWith('data:image/')) {
      setUploadedImage(book.coverUrl);
      setCustomCoverUrl('');
    } else {
      setCustomCoverUrl(book.coverUrl);
      setUploadedImage(null);
    }

    setActiveTab('create');
    setSuccessMsg('');
    setErrorMsg('');
  };

  // Cancel edit state and restore default fields
  const handleCancelEdit = () => {
    setEditingBookId(null);
    setTitle('');
    setLevel('A1');
    setBulkEnText('');
    setCoverUrl(PRESET_COVERS[0].url);
    setCustomCoverUrl('');
    setUploadedImage(null);
    setErrorMsg('');
  };

  // Quick image update function for an existing book
  const handleQuickUpdateImg = () => {
    if (!editingBookId) return;
    const bookToUpdate = books.find(b => b.id === editingBookId);
    if (!bookToUpdate) {
      setErrorMsg('Güncellenecek hikaye bulunamadı!');
      return;
    }

    const finalCover = uploadedImage || customCoverUrl.trim() || coverUrl;

    const updatedBook: Book = {
      ...bookToUpdate,
      coverUrl: finalCover
    };

    if (onUpdateAdminBook) {
      onUpdateAdminBook(updatedBook);
      setSuccessMsg('Kapak resmi başarıyla güncellendi! ✔');
      setErrorMsg('');
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } else {
      setErrorMsg('Kitap güncelleme fonksiyonu bulunamadı.');
    }
  };

  // Secure locked interface (unauthorized view)
  if (!isAuthorized) {
    return (
      <div className={`min-h-[80vh] flex flex-col justify-center items-center px-4 max-w-[500px] mx-auto py-10 ${
        isDarkMode ? 'text-gray-200' : 'text-gray-800'
      }`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full rounded-3xl p-8 border-2 shadow-xl ${
            isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FF6B6B]/10 text-[#FF6B6B] flex items-center justify-center mb-5 border border-[#FF6B6B]/20">
              <Lock className="w-8 h-8 animate-pulse" />
            </div>

            <h2 className="text-xl font-bold font-headline-lg tracking-tight mb-2">
              Yönetici Paneli Girişi
            </h2>
            <p className="text-xs text-gray-400 mb-6 font-semibold leading-relaxed">
              Bu alan sadece uygulama yöneticisine aittir. Hikaye eklemek ya da düzenlemek için şifrenizi doğrulamanız gerekmektedir.
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="text-left">
                <label className="block text-[10px] font-bold text-gray-400 mb-2 ml-1 font-headline-lg">
                  YÖNETİCİ GİRİŞ ŞİFRESİ
                </label>
                <input
                  type="password"
                  required
                  placeholder="Yönetici şifresini girin..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  className={`w-full py-3 px-4 border rounded-xl text-sm focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] ${
                    isDarkMode 
                      ? 'bg-[#121214] border-[#2A2A30] text-white placeholder-gray-650' 
                      : 'bg-white border-gray-200 text-gray-800'
                  }`}
                />
                
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#4ECDC4] font-medium leading-normal bg-[#4ECDC4]/5 px-3 py-2 rounded-lg border border-[#4ECDC4]/10">
                  <Unlock className="w-3.5 h-3.5 shrink-0" />
                  <span>Varsayılan şifreler: <b>admin</b> veya <b>1234</b></span>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onBack}
                  className={`flex-1 py-3 px-4 border rounded-xl text-xs font-bold font-headline-lg cursor-pointer ${
                    isDarkMode 
                      ? 'border-gray-700 text-gray-300 hover:bg-white/5' 
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Geri Dön
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FF6B6B] text-white rounded-xl text-xs font-bold font-headline-lg hover:bg-[#e05a5a] transition-colors cursor-pointer shadow-md shadow-[#FF6B6B]/15"
                >
                  Doğrula ve Gir
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`pb-32 max-w-[680px] mx-auto px-5 pt-6 transition-colors ${
      isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
    }`}>
      
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold font-headline-lg transition-all cursor-pointer ${
            isDarkMode 
              ? 'bg-[#1A1A1E] border-[#2A2A30] text-white hover:bg-[#2A2A30]' 
              : 'bg-white border-[#FFE66D] text-gray-750 hover:bg-[#FFE66D]/15'
          }`}
        >
          <ArrowLeft className="w-4 h-4 text-[#FF6B6B]" />
          <span>Panelden Ayrıl</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="p-1 px-2.5 bg-[#4ECDC4]/10 text-[#4ECDC4] border border-[#4ECDC4]/25 text-[10px] font-extrabold font-headline-lg rounded-full">
            YÖNETİCİ AKTİF
          </span>
          <button
            onClick={handleLogout}
            className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
          >
            Güvenli Çıkış
          </button>
        </div>
      </div>

      <div className={`p-6 rounded-3xl border-2 mb-8 ${
        isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-[#FFE66D]'
      }`}>
        <div className="flex items-center gap-3.5 mb-2.5">
          <div className="w-11 h-11 rounded-xl bg-[#4ECDC4]/10 text-[#4ECDC4] flex items-center justify-center border border-[#4ECDC4]/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-headline-lg tracking-tight leading-none mb-1">
              Yapay Zeka ile Öykü Yayınlama Aracı
            </h1>
            <p className="text-xs text-gray-400 font-semibold">
              İngilizce hikayenizi yapıştırın; satır altı Türkçe tercümeleri ve interaktif sözlük kelimelerini sizin yerinize Gemini otomatik oluştursun!
            </p>
          </div>
        </div>

        {/* Tab Selection Switch Header */}
        <div className="flex border-b border-gray-150 mt-6 gap-6">
          <button
            onClick={() => {
              setActiveTab('create');
              setSuccessMsg('');
            }}
            className={`pb-3 text-xs font-bold font-headline-lg tracking-wider relative cursor-pointer ${
              activeTab === 'create' ? 'text-[#FF6B6B]' : 'text-gray-400 font-semibold'
            }`}
          >
            {editingBookId ? 'HİKAYEYİ DÜZENLE' : 'YENİ HİKAYE OLUŞTUR'}
            {activeTab === 'create' && (
              <motion.div layoutId="admTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-[#FF6B6B]" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('manage');
              setSuccessMsg('');
            }}
            className={`pb-3 text-xs font-bold font-headline-lg tracking-wider relative cursor-pointer ${
              activeTab === 'manage' ? 'text-[#FF6B6B]' : 'text-gray-400 font-semibold'
            }`}
          >
            MEVCUT HİKAYELERİ DÜZENLE ({books.length})
            {activeTab === 'manage' && (
              <motion.div layoutId="admTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-[#FF6B6B]" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'create' ? (
          <motion.form
            onSubmit={handlePublishStory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Show success / error notifications */}
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center gap-3 animate-fade-in mb-4 leading-relaxed">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-150 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-3 animate-fade-in mb-4 leading-relaxed">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* AI TRANSLATING SCREEN MODAL LOGIC INLINE */}
            {isTranslating && (
              <div className={`p-6 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center space-y-4 py-12 ${
                isDarkMode ? 'bg-[#1e1e24] border-[#FF6B6B]/50' : 'bg-[#fff5f5] border-[#FF6B6B]/40'
              }`}>
                <Loader2 className="w-10 h-10 text-[#FF6B6B] animate-spin" />
                <h3 className="font-extrabold text-[#FF6B6B] text-sm tracking-wider">
                  YAPAY ZEKA TERCÜME EDİYOR
                </h3>
                <p className="text-xs text-gray-400 max-w-[420px] font-semibold leading-relaxed leading-normal">
                  {translationStep}
                </p>
                <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-[#FF6B6B] w-full animate-pulse" />
                </div>
              </div>
            )}

            {!isTranslating && (
              <>
                {/* Cancel Edit Bar helper indicator */}
                {editingBookId && (
                  <div className="flex justify-between items-center bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 p-3 rounded-2xl">
                    <span className="text-xs font-bold text-[#4ECDC4] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Düzenleme Modu Aktif (Kitap ID: {editingBookId})
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-xs bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 text-[#FF6B6B] py-1 px-3 rounded-lg font-bold transition-all cursor-pointer"
                    >
                      Vazgeç ve İptal Et
                    </button>
                  </div>
                )}

                {/* SECTION 1: PHOTO HIGHLIGHT UPLOAD */}
                <div className={`p-6 rounded-3xl border-2 space-y-4 ${
                  isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-gray-150'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Image className="w-4 h-4 text-[#FF6B6B]" />
                    <h3 className="font-bold text-xs font-headline-lg tracking-wider text-gray-400">
                      BÖLÜM 1: FOTOĞRAF YÜKLEME VE KAPAK GÖRSELİ
                    </h3>
                  </div>

                  {/* Drag-and-drop Image Selector input field */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handlePhotoUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Raw local File Upload Input Area */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-[16/10] hover:border-[#FF6B6B] hover:bg-[#FF6B6B]/5 relative overflow-hidden group ${
                        isDarkMode ? 'border-gray-700 bg-[#121214]' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {uploadedImage ? (
                        <>
                          <img src={uploadedImage} alt="Uploaded base64" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-350" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold text-white bg-black/60 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                              <Upload className="w-3.5 h-3.5" /> Resmi Değiştir
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-10 h-10 rounded-xl bg-[#FF6B6B]/10 text-[#FF6B6B] flex items-center justify-center mx-auto">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-gray-750">Bilgisayardan Fotoğraf Yükle</p>
                            <p className="text-[10px] text-gray-400 font-semibold mt-1">PNG, JPG veya WEBP (Max 2MB)</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Choose dynamic Presets layout */}
                    <div className="space-y-2 flex flex-col justify-between">
                      <div>
                        <label className="block text-[10px] font-extrabold text-gray-400 mb-1.5">
                          VEYA HAZIR KİTAP KAPAKLARIMIZDAN SEÇİN
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {PRESET_COVERS.map((preset) => {
                            const isSelected = coverUrl === preset.url && !customCoverUrl && !uploadedImage;
                            return (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => {
                                  setCoverUrl(preset.url);
                                  setCustomCoverUrl('');
                                  setUploadedImage(null);
                                }}
                                className={`relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-[#FF6B6B] scale-102 ring-2 ring-[#FF6B6B]/15'
                                    : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img src={preset.url} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-x-0 bottom-0 bg-black/50 p-1">
                                  <p className="text-[8px] font-bold text-white truncate leading-none text-center">{preset.name.split('/')[0]}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="block text-[10px] font-extrabold text-gray-400 mb-1">
                          VEYA GÖRSEL İNTERNET LİNKİ YAPIŞTIRIN
                        </label>
                        <input
                          type="url"
                          placeholder="Örn: https://images.unsplash.com/photo-..."
                          value={customCoverUrl}
                          onChange={(e) => {
                            setCustomCoverUrl(e.target.value);
                            setUploadedImage(null);
                          }}
                          className={`w-full py-2 px-3 border rounded-xl text-xs focus:outline-none focus:border-[#FF6B6B] ${
                            isDarkMode 
                              ? 'bg-[#121214] border-[#2A2A30] text-white placeholder-gray-650' 
                              : 'bg-white border-gray-200 text-gray-800'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {editingBookId && (
                    <div className="pt-4 border-t border-dashed border-gray-400/25 flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-extrabold text-[#FF6B6B] tracking-wider font-headline-lg flex items-center gap-1.5 uppercase">
                          <Image className="w-3.5 h-3.5" /> RESİM GÜNCELLEME ALANI (BASE64)
                        </span>
                        <p className="text-[10px] text-gray-400 leading-normal">
                          Bu buton sayesinde hikayeyi yeniden yapay zeka ile çevirmekle uğraşmadan, doğrudan cihazınızdan yeni bir görsel seçerek Base64 formatında kapak fotoğrafını güncelleyebilirsiniz. Değişiklik anında veritabanına yansıtılacaktır.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <label className="py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer font-headline-lg">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Resim Güncelleme</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 2 * 1024 * 1024) {
                                  setErrorMsg('Önemli: Lütfen tarayıcı performansı için 2MB\'dan küçük bir resim seçin.');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const base64String = reader.result as string;
                                  setUploadedImage(base64String);
                                  
                                  // Locate book to update
                                  const bookToUpdate = books.find(b => b.id === editingBookId);
                                  if (bookToUpdate && onUpdateAdminBook) {
                                    const updatedBook = {
                                      ...bookToUpdate,
                                      coverUrl: base64String
                                    };
                                    onUpdateAdminBook(updatedBook);
                                    setSuccessMsg(`"${bookToUpdate.title}" kitabı kapak resmi başarıyla güncellendi! 🎉`);
                                    setErrorMsg('');
                                  } else {
                                    setErrorMsg('Güncellenecek hikaye bulunamadı veya işlem desteklenmiyor.');
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>

                        {uploadedImage && uploadedImage.startsWith('data:image/') && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-pulse" />
                            <span>Özel Base64 Görsel Yüklü</span>
                          </div>
                        )}
                        
                        <button
                          type="button"
                          onClick={handleQuickUpdateImg}
                          className="py-2.5 px-4 bg-[#FF6B6B] hover:bg-[#e05a5a] text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm font-headline-lg"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-white animate-spin-reverse" />
                          <span>Şuanki Seçime Göre Kaydet</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 2: DIFFICULTY LEVEL AND TITLE */}
                <div className={`p-6 rounded-3xl border-2 space-y-4 ${
                  isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-gray-150'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-[#FF6B6B]" />
                    <h3 className="font-bold text-xs font-headline-lg tracking-wider text-gray-400">
                      BÖLÜM 2: HİKAYE DETAYLARI VE DİL SEVİYESİ
                    </h3>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                      İNGİLİZCE HİKAYE / MASAL BAŞLIĞI*
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={60}
                      placeholder="Örn: The Brave Little Squirrel and the Dragon"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`w-full py-2.5 px-3 border rounded-xl text-sm focus:outline-none focus:border-[#FF6B6B] ${
                        isDarkMode 
                          ? 'bg-[#121214] border-[#2A2A30] text-white placeholder-gray-650' 
                          : 'bg-white border-gray-200 text-gray-800'
                      }`}
                    />
                  </div>

                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.55">
                      ZORLUK DERECESİ (CEFR SEVİYESİ)*
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {['A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setLevel(lvl as any)}
                          className={`py-2 px-1 rounded-xl border text-xs font-extrabold cursor-pointer transition-all ${
                            level === lvl
                              ? 'bg-[#FF6B6B] border-[#FF6B6B] text-white shadow-md'
                              : isDarkMode
                                ? 'bg-[#121214] border-gray-800 text-gray-400 hover:text-white'
                                : 'bg-gray-50 border-gray-250 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SECTION 3: CORE ENGLISH TEXT AREA INPUT */}
                <div className={`p-6 rounded-3xl border-2 space-y-4 ${
                  isDarkMode ? 'bg-[#1A1A1E] border-[#2A2A30]' : 'bg-white border-gray-150'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-[#FF6B6B]" />
                    <h3 className="font-bold text-xs font-headline-lg tracking-wider text-gray-400">
                      BÖLÜM 3: SADECE İNGİLİZCE HİKAYE METNİ
                    </h3>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1.5 leading-relaxed font-semibold">
                      Kendi yazdığınız ya da kopyaladığınız İngilizce hikayeyi olduğu gibi buraya yapıştırın. Yapay zeka sistemimiz hikayeyi küçük paragraflara bölecek, her birinin kusursuz Türkçe satır arası çevirisini yapacak ve okuyucuların üstüne tıklaması için zor kelimeleri sözlüğe ekleyecektir.
                    </label>
                    <textarea
                      required
                      rows={10}
                      placeholder="Once upon a time in a deep forests, there lived a very energetic little squirrel named Nutty. Nutty loved jumping between oak trees and looking for golden walnuts...

One afternoon, he heard a strange sound coming from behind the bushes..."
                      value={bulkEnText}
                      onChange={(e) => setBulkEnText(e.target.value)}
                      className={`w-full p-3.5 border rounded-2xl text-xs focus:outline-none focus:border-[#FF6B6B] font-body-reading leading-relaxed ${
                        isDarkMode 
                          ? 'bg-[#121214] border-[#2A2A30] text-white placeholder-gray-650' 
                          : 'bg-white border-gray-200 text-gray-800'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#FF6B6B] text-white rounded-2xl text-sm font-extrabold hover:bg-[#e05a5a] transition-all cursor-pointer shadow-lg shadow-[#FF6B6B]/25 flex items-center justify-center gap-2"
                >
                  <BookOpenCheck className="w-5 h-5 text-white" />
                  <span>{editingBookId ? 'Yapay Zeka ile Çevir & Hikayeyi Güncelle' : 'Yapay Zeka ile Otomatik Çevir ve Kitaplığa Ekle'}</span>
                </button>
              </>
            )}
          </motion.form>
        ) : (
          /* MANAGED CURRENT/ADMIN STORIES LISTING VIEW PANEL */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-gray-400">KİTAPLIKTAKİ TÜM AKTİF ESERLER</span>
              <span className="text-[10px] font-mono text-[#4ECDC4] font-bold">Toplam {books.length} Kayıt</span>
            </div>

            <div className="space-y-2.5">
              {books.map((book) => {
                const isCustomAdmin = book.id.startsWith('admin_') || book.id.startsWith('custom_');
                return (
                  <div
                    key={book.id}
                    className={`p-3.5 rounded-2xl border flex items-center gap-4 transition-all relative group justify-between hover:scale-[1.01] ${
                      isDarkMode 
                        ? 'bg-[#1A1A1E] border-[#2A2A30]' 
                        : 'bg-white border-gray-150 shadow-3xs'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {/* Fixed thumbnail container displaying standardized book imagery */}
                      <div className="w-11 h-14 rounded-lg overflow-hidden shrink-0 border border-gray-200 shadow-3xs bg-gray-50 flex items-center justify-center">
                        <img src={book.coverUrl} className="w-full h-full object-cover" alt="" />
                      </div>

                      <div className="min-w-0 leading-tight">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase ${
                            book.level.startsWith('A') ? 'bg-[#4ECDC4]' : book.level.startsWith('B') ? 'bg-[#FF6B6B]' : 'bg-[#2D3436]'
                          }`}>
                            {book.level}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono font-bold">
                            {book.statsWords} kelime
                          </span>
                        </div>
                        
                        <h4 className={`font-bold text-sm tracking-tight truncate mt-1 ${
                          isDarkMode ? 'text-white' : 'text-gray-950'
                        }`}>
                          {book.title}
                        </h4>
                        
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {book.author}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditBookClick(book)}
                        className={`p-2 rounded-xl border flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
                          isDarkMode 
                            ? 'border-gray-700 hover:bg-white/5 text-gray-300' 
                            : 'border-gray-250 hover:bg-gray-50 text-gray-650'
                        }`}
                        title="Metni Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#4ECDC4]" />
                        <span>Düzenle</span>
                      </button>

                      {isCustomAdmin && (
                        <button
                          onClick={() => {
                            if (window.confirm(`"${book.title}" başlıklı kitabı kalıcı olarak silmek istediğinize emin misiniz?`)) {
                              onDeleteAdminBook(book.id);
                            }
                          }}
                          className="p-2 rounded-xl border border-rose-100 hover:bg-rose-50 text-rose-500 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
