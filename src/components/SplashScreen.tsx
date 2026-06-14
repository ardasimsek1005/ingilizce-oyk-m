import React, { useMemo, useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { LanguageCode, t } from '../i18n';

interface SplashScreenProps {
  nativeLanguage: LanguageCode;
}

export default function SplashScreen({ nativeLanguage }: SplashScreenProps) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMouseOffset({
        x: (x - 50) / 50,
        y: (y - 50) / 50
      });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  const stars = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 3 + 1;
      const delay = Math.random() * 5;
      const duration = 2 + Math.random() * 4;
      const isGold = Math.random() > 0.8;
      return {
        id: i,
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        animation: `twinkle ${duration}s ease-in-out ${delay}s infinite`,
        backgroundColor: isGold ? '#ffb866' : 'white',
        boxShadow: isGold ? '0 0 4px #ffb866' : 'none'
      };
    });
  }, []);

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center min-h-full w-full overflow-hidden bg-radial from-[#1a365d] to-[#091423] px-5 select-none">
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
      `}</style>

      {/* Animated Star Field Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 transition-transform duration-300 ease-out" 
        style={{ transform: `translate(${mouseOffset.x}%, ${mouseOffset.y}%)` }}
      >
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: star.left,
              top: star.top,
              width: star.width,
              height: star.height,
              animation: star.animation,
              backgroundColor: star.backgroundColor,
              boxShadow: star.boxShadow,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>

      {/* Central Branding Container */}
      <div className="relative z-10 flex flex-col items-center space-y-8 animate-float">
        {/* App Logo with Magical Glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#ffb866]/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <img 
            alt={nativeLanguage === 'tr' ? "İngilizce Öyküm App Icon" : "My English Story App Icon"} 
            className="w-32 h-32 rounded-[2rem] shadow-2xl relative z-20 border border-white/10 object-cover" 
            src="/icon-512.png"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=80';
            }}
          />
        </div>
        
        {/* App Name Title */}
        <div className="text-center space-y-2">
          <h1 className="font-headline-lg text-3xl font-black text-[#ffb866] tracking-tight">
            {nativeLanguage === 'tr' ? 'İngilizce Öyküm' : 'My English Story'}
          </h1>
          <p className="text-xs font-semibold text-gray-300 tracking-widest">
            {t('splash_subtitle', nativeLanguage).toLocaleUpperCase(nativeLanguage === 'tr' ? 'tr-TR' : 'en-US')}
          </p>
        </div>
      </div>

      {/* Loading State Area (Bottom Anchored) */}
      <div className="absolute bottom-20 left-0 w-full flex flex-col items-center space-y-6 px-10">
        {/* Tagline */}
        <div className="flex items-center space-x-2 text-[#ffb866]">
          <Sparkles className="w-4.5 h-4.5 animate-spin-slow fill-[#ffb866]" />
          <p className="text-xs font-bold tracking-widest italic">
            {t('splash_tagline', nativeLanguage)}
          </p>
        </div>
        {/* Delicate Progress Bar */}
        <div className="w-full max-w-[240px] h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div className="h-full bg-gradient-to-r from-[#ffb866]/40 via-[#ffb866] to-[#ffb866]/40 rounded-full animate-progress" />
        </div>
      </div>

      {/* Ambient Light Effects */}
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#ffb866]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#4ECDC4]/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
