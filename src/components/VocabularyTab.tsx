import React, { useState } from 'react';
import { Sparkles, Brain, Search, Volume2, Trash2, BookOpen, Bookmark, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VocabularyWord, getLevelColor, hexToRgba } from '../types';
import { speakNative } from '../services/tts';

interface VocabularyTabProps {
  vocabulary: VocabularyWord[];
  onStartQuiz: (mode: 'saved' | 'random') => void;
  onStartRandomQuizWithDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onRemoveWord: (wordId: string) => void;
  syncTrigger: () => void;
  isDarkMode?: boolean;
}

export default function VocabularyTab({ vocabulary, onStartQuiz, onStartRandomQuizWithDifficulty, onRemoveWord, syncTrigger, isDarkMode }: VocabularyTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

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
      
      {/* Quiz Practices Dashboard Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        
        {/* Card 1: Kelimelerimle Pratik Yap */}
        <div className={`relative overflow-hidden border-2 rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between group ${
          isDarkMode 
            ? 'bg-[#1A1A1E]/80 border-[#2A2A30] hover:border-[#FF6B6B]/40 hover:shadow-[0_8px_24px_rgba(255,107,107,0.05)]' 
            : 'bg-white border-[#FFE66D]/70 hover:border-[#FF6B6B]/40 hover:shadow-[0_8px_24px_rgba(255,107,107,0.05)]'
        }`}>
          {/* Subtle background glow effect */}
          <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-[#FF6B6B]/5 blur-xl group-hover:bg-[#FF6B6B]/10 transition-all duration-500 pointer-events-none" />

          <div>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isDarkMode ? 'bg-[#FF6B6B]/15 text-[#FF6B6B]' : 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
              }`}>
                <Brain className="w-5 h-5 fill-[#FF6B6B]/10 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                vocabulary.length > 0 
                  ? (isDarkMode ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-200/50')
                  : (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')
              }`}>
                {vocabulary.length > 0 ? `${vocabulary.length} KELİME` : 'Kayıt Yok'}
              </span>
            </div>

            <h3 className={`text-base font-black tracking-tight mb-1 transition-colors ${
              isDarkMode ? 'text-white' : 'text-[#2D3436]'
            }`}>
              Kelimelerim
            </h3>
            <p className={`text-xs leading-relaxed mb-6 font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Kitap okurken kaydettiğin özel kelimelerle kelime dağarcığını pekiştir.
            </p>
          </div>

          <button
            onClick={() => vocabulary.length > 0 && onStartQuiz('saved')}
            disabled={vocabulary.length === 0}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md transform active:scale-95 ${
              vocabulary.length > 0 
                ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:from-[#e05a5a] hover:to-[#e67e7e] text-white shadow-[#FF6B6B]/20 hover:scale-[1.02]' 
                : 'bg-gray-105 dark:bg-[#252528] text-gray-400 dark:text-gray-600 cursor-not-allowed border border-transparent'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{vocabulary.length > 0 ? 'Pratiğe Başla' : 'Önce Kelime Ekle'}</span>
          </button>
        </div>

        {/* Card 2: Seviyeli Rastgele Pratik Yap */}
        <div className={`relative overflow-hidden border-2 rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between group ${
          isDarkMode 
            ? 'bg-[#1A1A1E]/80 border-[#2A2A30] hover:border-[#4ECDC4]/40 hover:shadow-[0_8px_24px_rgba(78,205,196,0.05)]' 
            : 'bg-white border-[#FFE66D]/70 hover:border-[#4ECDC4]/40 hover:shadow-[0_8px_24px_rgba(78,205,196,0.05)]'
        }`}>
          {/* Subtle background glow effect */}
          <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-[#4ECDC4]/5 blur-xl group-hover:bg-[#4ECDC4]/10 transition-all duration-500 pointer-events-none" />

          <div>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isDarkMode ? 'bg-[#4ECDC4]/15 text-[#4ECDC4]' : 'bg-[#4ECDC4]/10 text-[#4ECDC4]'
              }`}>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                selectedDifficulty === 'easy' ? (isDarkMode ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-200/50') :
                selectedDifficulty === 'medium' ? (isDarkMode ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30' : 'bg-amber-50 text-amber-600 border border-amber-200/50') :
                (isDarkMode ? 'bg-rose-950/40 text-rose-400 border border-rose-900/30' : 'bg-rose-50 text-rose-600 border border-rose-200/50')
              }`}>
                {selectedDifficulty === 'easy' ? 'Kolay Mod' : selectedDifficulty === 'medium' ? 'Orta Mod' : 'Zor Mod'}
              </span>
            </div>

            <h3 className={`text-base font-black tracking-tight mb-1 transition-colors ${
              isDarkMode ? 'text-white' : 'text-[#2D3436]'
            }`}>
              Rastgele Pratik
            </h3>
            <p className={`text-xs leading-relaxed mb-4 font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Seviyene göre otomatik seçilen kelimelerle pratik yap.
            </p>

            {/* Inlined level options */}
            <div className="grid grid-cols-3 gap-1.5 mb-5">
              {([
                { key: 'easy', label: 'A1-A2', sub: 'Kolay', colorClass: 'border-emerald-500/80 text-emerald-500 bg-emerald-500/10' },
                { key: 'medium', label: 'B1-B2', sub: 'Orta', colorClass: 'border-amber-500/80 text-amber-500 bg-amber-500/10' },
                { key: 'hard', label: 'C1', sub: 'Zor', colorClass: 'border-rose-500/80 text-rose-500 bg-rose-500/10' },
              ] as const).map(({ key, label, sub, colorClass }) => {
                const isActive = selectedDifficulty === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDifficulty(key)}
                    className={`py-2 px-1 rounded-xl text-center border-2 transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-center items-center ${
                      isActive
                        ? `${colorClass} shadow-sm scale-[1.02]`
                        : isDarkMode
                          ? 'bg-[#121214] border-[#2A2A30] text-gray-400 hover:border-[#4ECDC4]/30 hover:text-gray-200'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-[#4ECDC4]/30 hover:text-gray-700'
                    }`}
                  >
                    <span className="block text-[11px] font-black tracking-tight">{label}</span>
                    <span className={`block text-[9px] font-bold mt-0.5 opacity-80`}>{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onStartRandomQuizWithDifficulty(selectedDifficulty)}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md transform hover:scale-[1.02] active:scale-95 text-white ${
              selectedDifficulty === 'easy' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/10' 
                : selectedDifficulty === 'medium'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/10'
                  : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-rose-500/10'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Başlat</span>
          </button>
        </div>
      </div>

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
