import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number | string;
}

export default function AppLogo({ className = '', size = '100%' }: AppLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      width={size}
      height={size}
      className={`select-none ${className}`}
      id="app-logo-canvas"
    >
      <defs>
        {/* Background Dark Sky Gradient */}
        <linearGradient id="appLogoBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0B1A30" />
          <stop offset="45%" stopColor="#102540" />
          <stop offset="100%" stopColor="#1A3A5F" />
        </linearGradient>

        {/* Text Drop Shadow Filters */}
        <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="1" floodColor="#040914" floodOpacity="0.85" />
        </filter>
        <filter id="yellowTextShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3.5" stdDeviation="1.5" floodColor="#040914" floodOpacity="0.9" />
        </filter>
      </defs>

      {/* Main Back Plate (Standard rounded squircle representing the App Icon) */}
      {/* We apply rounded and overflow hidden properties to ensure no boundaries spill */}
      <rect width="128" height="128" rx="28" fill="url(#appLogoBg)" />

      {/* Star Field */}
      {/* Twinkly Stars - Gold & Whitish stars scattered */}
      <polygon points="25,24 26.5,27.5 30,27.5 27.2,29.5 28.2,33 25,30.8 21.8,33 22.8,29.5 20,27.5 23.5,27.5" fill="#FFD700" />
      <polygon points="98,18 99,20.5 101.5,20.5 99.5,21.8 100.2,24.2 98,22.7 95.8,24.2 96.5,21.8 94.5,20.5 97,20.5" fill="#FFD700" />
      <polygon points="110,48 111,50.2 113.2,50.2 111.4,51.4 112,53.6 110,52.2 108,53.6 108.6,51.4 106.8,50.2 109,50.2" fill="#FFA500" opacity="0.8" />
      <polygon points="20,68 20.6,69.5 22,69.5 20.9,70.3 21.3,71.7 20,70.8 18.7,71.7 19.1,70.3 18,69.5 19.4,69.5" fill="#FFA500" opacity="0.8" />
      
      {/* Small Glowing Background Stars */}
      <circle cx="50" cy="28" r="0.75" fill="#FFFFFF" opacity="0.6" />
      <circle cx="38" cy="18" r="1" fill="#FFFFFF" opacity="0.7" />
      <circle cx="82" cy="24" r="0.8" fill="#FFFFFF" opacity="0.5" />
      <circle cx="112" cy="32" r="1.2" fill="#FFFFFF" opacity="0.9" />
      <circle cx="16" cy="46" r="1" fill="#FFFFFF" opacity="0.8" />

      {/* Cloud Puff Elements in Background Corners */}
      <path d="M-5,128 C12,106 28,110 38,117 C44,121 46,125 45,128 Z" fill="#FFFFFF" opacity="0.18" />
      <path d="M133,128 C120,105 102,109 92,116 C86,120 84,125 85,128 Z" fill="#FFFFFF" opacity="0.18" />

      {/* London Skyline Background Elements */}
      {/* London Eye structure */}
      <g opacity="0.32" stroke="#E2E8F0" strokeWidth="0.8">
        <circle cx="68" cy="85" r="17" fill="none" />
        <circle cx="68" cy="85" r="1.5" fill="#E2E8F0" />
        {/* Spokes */}
        <line x1="68" y1="85" x2="68" y2="68" />
        <line x1="68" y1="85" x2="68" y2="102" />
        <line x1="68" y1="85" x2="51" y2="85" />
        <line x1="68" y1="85" x2="85" y2="85" />
        <line x1="68" y1="85" x2="56" y2="73" />
        <line x1="68" y1="85" x2="80" y2="97" />
        <line x1="68" y1="85" x2="80" y2="73" />
        <line x1="68" y1="85" x2="56" y2="97" />
        {/* Supporting legs */}
        <line x1="68" y1="85" x2="60" y2="102" />
        <line x1="68" y1="85" x2="76" y2="102" />
      </g>

      {/* Big Ben Clock Tower */}
      <g opacity="0.35">
        <rect x="80" y="66" width="10" height="36" fill="#A0AEC0" />
        <polygon points="79,66 85,50 91,66" fill="#718096" />
        <rect x="83" y="69" width="4" height="4" rx="0.5" fill="#FFE66D" />
        <circle cx="85" cy="71" r="1.2" fill="#2D3748" />
        {/* Tower Details */}
        <line x1="85" y1="76" x2="85" y2="102" stroke="#2D3748" strokeWidth="0.5" />
        <line x1="82" y1="84" x2="88" y2="84" stroke="#2D3748" strokeWidth="0.5" />
      </g>

      {/* Classic Red Telephone Kiosk (Left Depth Layer) */}
      <g opacity="0.9">
        <rect x="22" y="81" width="10" height="21" rx="1.2" fill="#E53E3E" />
        {/* Dome */}
        <path d="M22,81 Q27,77 32,81 Z" fill="#C53030" />
        <rect x="24" y="79" width="6" height="1.5" rx="0.3" fill="#FFE66D" opacity="0.9" />
        {/* Windows light grid */}
        <rect x="24" y="83" width="6" height="17" fill="#FFFBEB" opacity="0.15" />
        <line x1="25.3" y1="83" x2="25.3" y2="100" stroke="#FFFBEB" strokeWidth="0.5" opacity="0.7" />
        <line x1="27" y1="83" x2="27" y2="100" stroke="#FFFBEB" strokeWidth="0.5" opacity="0.7" />
        <line x1="28.7" y1="83" x2="28.7" y2="100" stroke="#FFFBEB" strokeWidth="0.5" opacity="0.7" />
        {/* Horizontal bars */}
        <line x1="22" y1="86" x2="32" y2="86" stroke="#C53030" strokeWidth="0.7" />
        <line x1="22" y1="89" x2="32" y2="89" stroke="#C53030" strokeWidth="0.7" />
        <line x1="22" y1="92" x2="32" y2="92" stroke="#C53030" strokeWidth="0.7" />
        <line x1="22" y1="95" x2="32" y2="95" stroke="#C53030" strokeWidth="0.7" />
        <line x1="22" y1="98" x2="32" y2="98" stroke="#C53030" strokeWidth="0.7" />
      </g>

      {/* Double-Decker Red Bus (Right Depth Layer) */}
      <g opacity="0.9">
        <rect x="94" y="86" width="22" height="16" rx="1.8" fill="#E53E3E" />
        {/* Bottom Black Grill & Tires */}
        <circle cx="99" cy="102" r="2" fill="#1A202C" stroke="#E2E8F0" strokeWidth="0.4" />
        <circle cx="111" cy="102" r="2" fill="#1A202C" stroke="#E2E8F0" strokeWidth="0.4" />
        {/* Lights */}
        <circle cx="95" cy="99" r="0.8" fill="#FEE2E2" />
        <circle cx="95" cy="101" r="0.6" fill="#FBBF24" />
        {/* Windows columns */}
        {/* Upper deck */}
        <rect x="96.5" y="88" width="4" height="4" rx="0.5" fill="#FCD34D" opacity="0.85" />
        <rect x="101.5" y="88" width="4" height="4" rx="0.5" fill="#FCD34D" opacity="0.85" />
        <rect x="106.5" y="88" width="4" height="4" rx="0.5" fill="#FCD34D" opacity="0.85" />
        <rect x="111.5" y="88" width="2.5" height="4" rx="0.5" fill="#FCD34D" opacity="0.85" />
        {/* Lower deck */}
        <rect x="97" y="93.5" width="3.5" height="4" rx="0.5" fill="#FCD34D" opacity="0.85" />
        <rect x="101.5" y="93.5" width="4" height="4" rx="0.5" fill="#FCD34D" opacity="0.85" />
        <rect x="106.5" y="93.5" width="4" height="4" rx="0.5" fill="#FCD34D" opacity="0.85" />
        {/* Black line separator */}
        <line x1="94" y1="93" x2="116" y2="93" stroke="#2D3748" strokeWidth="0.8" />
      </g>

      {/* Book Icon Speech Bubble at the Top Center */}
      <g filter="url(#textShadow)">
        {/* Bubble Tail */}
        <polygon points="64,36 60,32 68,32" fill="#FFFFFF" />
        {/* Main Bubble */}
        <rect x="49" y="10" width="30" height="22" rx="7" fill="#FFFFFF" />
        {/* Mini Book Icon Inside Bubble */}
        <path d="M57,21 C59.5,19.2 62.5,19.8 64,21 C65.5,19.8 68.5,19.2 71,21 L71,17.5 C68.5,16 65.5,16.5 64,17.8 C62.5,16.5 59.5,16 57,17.5 Z" fill="#102540" />
        <line x1="64" y1="18" x2="64" y2="21" stroke="#102540" strokeWidth="0.8" />
      </g>

      {/* Main APP TITLE - "İNGİLİZCE" (White curved styling) */}
      <g filter="url(#textShadow)">
        <text
          x="64"
          y="56"
          textAnchor="middle"
          fill="#FFFFFF"
          stroke="#091528"
          strokeWidth="3.2"
          strokeLinejoin="round"
          paintOrder="stroke fill"
          fontFamily="system-ui, -apple-system, 'Inter', 'Fredoka One', 'Nunito', sans-serif"
          fontWeight="900"
          fontSize="17.2"
          letterSpacing="0.4"
          transform="rotate(-2 64 56)"
        >
          İNGİLİZCE
        </text>
      </g>

      {/* Main APP TITLE - "ÖYKÜM" (Yellow curved styling) */}
      <g filter="url(#yellowTextShadow)">
        <text
          x="65"
          y="77.5"
          textAnchor="middle"
          fill="#FFEB60"
          stroke="#091528"
          strokeWidth="4"
          strokeLinejoin="round"
          paintOrder="stroke fill"
          fontFamily="system-ui, -apple-system, 'Inter', 'Fredoka One', 'Nunito', sans-serif"
          fontWeight="950"
          fontSize="23.5"
          letterSpacing="0.8"
          transform="rotate(1.5 65 77.5)"
        >
          ÖYKÜM
        </text>
      </g>

      {/* Foreground Open Book at the bottom */}
      <g filter="url(#textShadow)">
        {/* Hard spine binding under-shadow */}
        <rect x="62.5" y="104" width="3" height="15" fill="#718096" opacity="0.4" />
        
        {/* Book Left Page */}
        <path
          d="M14,105 C33,96 55,100 64,104 L64,120 C55,116 33,112 14,121 Z"
          fill="#FAF9F5"
          stroke="#2D3748"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        
        {/* Left Page Detail Texture lines */}
        <path d="M16.5,107 C34,98.5 54,102.3 61.5,106.3" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />
        <path d="M16.5,110 C34,101.5 54,105.3 61.5,109.3" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />
        <path d="M16.5,113 C34,104.5 54,108.3 61.5,112.3" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />

        {/* Book Right Page */}
        <path
          d="M114,105 C95,96 73,100 64,104 L64,120 C73,116 95,112 114,121 Z"
          fill="#FAF9F5"
          stroke="#2D3748"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Right Page Detail Texture lines */}
        <path d="M111.5,107 C94,98.5 74,102.3 66.5,106.3" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />
        <path d="M111.5,110 C94,101.5 74,105.3 66.5,109.3" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />
        <path d="M111.5,113 C94,104.5 74,108.3 66.5,112.3" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />

        {/* Hanging Red Ribbon Bookmark */}
        <path
          d="M62.2,104 L62.2,126 L64,123.5 L65.8,126 L65.8,104 Z"
          fill="#EF4444"
          stroke="#2D3748"
          strokeWidth="0.4"
        />
      </g>
    </svg>
  );
}
