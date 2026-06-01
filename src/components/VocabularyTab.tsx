import React, { useState } from 'react';
import { Sparkles, Brain, Search, Volume2, Trash2, BookOpen, Bookmark, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VocabularyWord } from '../types';

interface VocabularyTabProps {
  vocabulary: VocabularyWord[];
  onStartQuiz: (mode: 'saved' | 'random') => void;
  onRemoveWord: (wordId: string) => void;
  syncTrigger: () => void;
  isDarkMode?: boolean;
}

export default function VocabularyTab({ vocabulary, onStartQuiz, onRemoveWord, syncTrigger, isDarkMode }: VocabularyTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVocab = vocabulary.filter(w =>
    w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const speakWord = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    try {
      const cleanT = text.trim();
      if (!cleanT) return;

      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(cleanT)}`;
      const audio = new Audio(googleTtsUrl);
      audio.play().catch(playErr => {
        console.warn("Google TTS audio.play() failed, trying native speech synthesis:", playErr);
        speakWordNative(cleanT);
      });
    } catch (err) {
      console.error("Premium speech playback error, trying native fallback:", err);
      speakWordNative(text);
    }
  };

  const speakWordNative = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRemove = (wordId: string) => {
    onRemoveWord(wordId);
    syncTrigger();
  };

  return (
    <div className={`pb-36 max-w-[680px] mx-auto px-5 pt-6 transition-colors ${
      isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
    }`}>
      
      {/* Quiz Call To Action Section */}
      <section className={`mb-8 text-center border-2 rounded-3xl p-6 transition-colors ${
        isDarkMode 
          ? 'bg-[#1A1A1E] border-[#2A2A30] shadow-[0_8px_16px_rgba(0,0,0,0.15)]' 
          : 'bg-white border-[#FFE66D] shadow-[0_8px_16px_rgba(255,107,107,0.02)]'
      }`}>
        <h2 className={`font-headline-lg text-lg font-bold mb-1.5 tracking-wider transition-colors ${
          isDarkMode ? 'text-[#E6E6E6]' : 'text-[#2D3436]'
        }`}>
          Kelime Dağarcığı
        </h2>
        <p className={`text-sm mb-6 max-w-sm mx-auto font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          İster kendi kaydettiğin kelimelerle pratik yap, ister seviyene göre rastgele kelimeler keşfet.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
          {/* Button 1: Kelimelerimle Pratik Yap */}
          <button
            onClick={() => onStartQuiz('saved')}
            className="group relative inline-flex items-center justify-center gap-2.5 bg-[#FF6B6B] text-white px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md hover:bg-[#e05a5a] transition-all transform active:scale-95 cursor-pointer shadow-[#FF6B6B]/20 w-full max-w-[320px] sm:w-auto"
          >
            <Brain className="w-5 h-5 text-[#FFE66D] fill-[#FFE66D]" />
            <span>Kelimelerimle Pratik Yap</span>
            {vocabulary.length > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                {vocabulary.length}
              </span>
            )}
          </button>

          {/* Button 2: Rastgele Pratik Yap */}
          <button
            onClick={() => onStartQuiz('random')}
            className={`group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all transform active:scale-95 cursor-pointer border w-full max-w-[320px] sm:w-auto ${
              isDarkMode 
                ? 'bg-[#2D3436] border-[#343A40] text-white hover:bg-[#3E4446]' 
                : 'bg-[#FFE66D]/20 border-[#FFE66D] text-[#2D3436] hover:bg-[#FFE66D]/35'
            }`}
          >
            <Sparkles className="w-5 h-5 text-[#FF6B6B] fill-[#FF6B6B]" />
            <span>Rastgele Pratik Yap</span>
          </button>
        </div>
      </section>

      {/* Vocabulary Search controls */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#FF6B6B]">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="Kaydettiğin kelimelerde ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] transition-all ${
            isDarkMode 
              ? 'bg-[#1A1A1E] border-[#2A2A30] text-white placeholder-gray-500' 
              : 'bg-white border-[#FFE66D] text-[#2D3436] placeholder-gray-400'
          }`}
        />
      </div>

      {/* Vocabulary List Grid */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredVocab.length > 0 ? (
            filteredVocab.map((w, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.04, 0.4) }}
                key={w.id}
                className={`border rounded-2xl p-5 flex justify-between items-center group transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-[#1A1A1E] border-[#2A2A30] hover:border-[#FF6B6B]/60 text-white' 
                    : 'bg-white border-[#FFE66D]/70 hover:shadow-md hover:border-[#FF6B6B]/60 text-[#2D3436]'
                }`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className={`font-headline-lg text-lg font-bold truncate transition-colors ${
                      isDarkMode ? 'text-white' : 'text-[#2D3436]'
                    }`}>
                      {w.word}
                    </h3>
                    <button
                      onClick={(e) => speakWord(e, w.word)}
                      className={`p-1 rounded-full hover:text-[#FF6B6B] transition-colors ${
                        isDarkMode ? 'text-gray-400 hover:bg-[#2A2A30]' : 'text-gray-400 hover:bg-[#FFE66D]/20'
                      }`}
                      title="Sesi Dinle"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-headline-lg text-sm text-[#FF6B6B] font-bold italic">
                    {w.translation}
                  </p>
                  
                  {/* Detailed descriptions if they exist */}
                  {(w.exampleEn || w.notes) && (
                    <div className={`mt-3 text-xs p-2.5 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-[#121214] border-[#2A2A30] text-gray-300' 
                        : 'bg-[#FFFBF0] border-[#FFE66D]/45 text-gray-700'
                    }`}>
                      {w.notes && <p className="text-gray-400 font-medium mb-1">{w.notes}</p>}
                      {w.exampleEn && (
                        <p className="font-mono italic">
                          "{w.exampleEn}" → <span className="text-[#FF6B6B] font-bold">{w.exampleTr}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] uppercase tracking-wide font-bold text-[#4ECDC4] bg-[#4ECDC4]/10 border border-[#4ECDC4]/30 px-2.5 py-1 rounded-full">
                    {w.level}
                  </span>
                  
                  <button
                    onClick={() => handleRemove(w.id)}
                    className={`p-2 rounded-full transition-colors cursor-pointer ${
                      isDarkMode ? 'text-gray-400 hover:text-rose-500 hover:bg-white/5' : 'text-gray-450 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title="Kelimeyi Sil"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`border-2 border-dashed rounded-[24px] p-10 flex flex-col items-center justify-center text-center mt-4 transition-colors ${
                isDarkMode 
                  ? 'bg-[#1A1A1E] border-[#2A2A30]' 
                  : 'bg-white border-[#FFE66D]'
              }`}
            >
              <BookOpen className="w-10 h-10 text-[#FF6B6B] mb-3" />
              <p className={`text-sm font-bold max-w-[280px] ${isDarkMode ? 'text-gray-300' : 'text-gray-650'}`}>
                {searchQuery ? 'Aradığınız kritere uygun kelime bulunamadı.' : 'Henüz kelime kaydetmediniz. Kitaplıktan kelimelere tıklayarak başlayabilirsiniz!'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
