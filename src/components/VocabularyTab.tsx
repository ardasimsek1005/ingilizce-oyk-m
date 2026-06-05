import React, { useState } from 'react';
import { Sparkles, Brain, Search, Volume2, Trash2, BookOpen, Bookmark, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VocabularyWord, getLevelColor, hexToRgba } from '../types';
import { speakNative } from '../services/tts';

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
    speakNative(text, 'en-US');
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

        <div className="flex flex-col gap-3 justify-center items-center w-full">
          {/* Button 1: Kelimelerimle Pratik Yap */}
          <button
            onClick={() => onStartQuiz('saved')}
            className="group relative inline-flex items-center justify-center gap-2 bg-[#FF6B6B] text-white px-5 py-3.5 rounded-2xl font-bold text-[12px] sm:text-sm shadow-md hover:bg-[#e05a5a] transition-all transform active:scale-95 cursor-pointer shadow-[#FF6B6B]/20 w-full max-w-[280px]"
          >
            <Brain className="w-4 h-4 text-[#FFE66D] fill-[#FFE66D] shrink-0" />
            <span className="truncate">Kelimelerimle Pratik Yap</span>
            {vocabulary.length > 0 && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold shrink-0">
                {vocabulary.length}
              </span>
            )}
          </button>

          {/* Button 2: Rastgele Pratik Yap */}
          <button
            onClick={() => onStartQuiz('random')}
            className={`group inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-[12px] sm:text-sm shadow-md transition-all transform active:scale-95 cursor-pointer border w-full max-w-[280px] ${
              isDarkMode 
                ? 'bg-[#2D3436] border-[#343A40] text-white hover:bg-[#3E4446]' 
                : 'bg-[#FFE66D]/20 border-[#FFE66D] text-[#2D3436] hover:bg-[#FFE66D]/35'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#FF6B6B] fill-[#FF6B6B] shrink-0" />
            <span className="truncate">Rastgele Pratik Yap</span>
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.4) }}
                key={w.id}
                className={`border rounded-2xl p-5 flex flex-col justify-between group transition-all duration-300 relative ${
                  isDarkMode 
                    ? 'bg-[#1A1A1E] border-[#2A2A30] hover:border-[#FF6B6B]/45 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)]' 
                    : 'bg-white border-[#FFE66D]/50 hover:shadow-[0_10px_25px_-5px_rgba(255,107,107,0.06)] hover:border-[#FF6B6B]/45'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  {/* Word & Pronunciation & Level Badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className={`font-headline-lg text-lg font-black tracking-tight transition-colors ${
                        isDarkMode ? 'text-white' : 'text-[#2D3436]'
                      }`}>
                        {w.word}
                      </h3>
                      
                      <button
                        onClick={(e) => speakWord(e, w.word)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          isDarkMode 
                            ? 'bg-[#2A2A30] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white' 
                            : 'bg-[#FF6B6B]/10 text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white'
                        }`}
                        title="Sesi Dinle"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] text-[#FF6B6B] font-extrabold tracking-wide uppercase">
                        {w.translation}
                      </span>
                    </div>
                  </div>

                  {/* Right side: Level Badge & Trash Button */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {(() => {
                      const lvl = w.level || 'A1';
                      const color = getLevelColor(lvl);
                      return (
                        <span 
                          className="text-[9px] uppercase tracking-wider font-extrabold border px-2.5 py-0.5 rounded-full"
                          style={{
                            color: color,
                            backgroundColor: hexToRgba(color, 0.1),
                            borderColor: hexToRgba(color, 0.25)
                          }}
                        >
                          {lvl}
                        </span>
                      );
                    })()}

                    <button
                      onClick={() => handleRemove(w.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                        isDarkMode 
                          ? 'border-transparent text-gray-500 hover:text-red-400 hover:bg-red-950/15' 
                          : 'border-transparent text-gray-450 hover:text-red-500 hover:bg-red-50'
                      }`}
                      title="Kelimeyi Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Example sentence / Detailed description */}
                {(w.exampleEn || w.notes) && (
                  <div className={`mt-3.5 text-xs p-3 rounded-xl border-l-4 transition-colors ${
                    isDarkMode 
                      ? 'bg-[#121214] border-l-[#FF6B6B] border-y-[#2A2A30] border-r-[#2A2A30] text-gray-300' 
                      : 'bg-[#FFE66D]/5 border-l-[#FF6B6B] border-y-[#FFE66D]/40 border-r-[#FFE66D]/40 text-gray-700'
                  }`}>
                    {w.notes && (
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Bookmark className="w-3 h-3 text-[#FF6B6B]" />
                        <span>Not: {w.notes}</span>
                      </p>
                    )}
                    {w.exampleEn && (
                      <div className="mt-1 leading-relaxed">
                        <p className="font-semibold text-gray-700 dark:text-gray-200">
                          {w.exampleEn}
                        </p>
                        <p className="text-[#FF6B6B] font-bold mt-0.5">
                          {w.exampleTr}
                        </p>
                      </div>
                    )}
                  </div>
                )}
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
