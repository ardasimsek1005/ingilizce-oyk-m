import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number | string;
}

export default function AppLogo({ className = '', size = '100%' }: AppLogoProps) {
  return (
    <img
      src="icon-192.png"
      alt="App Logo"
      style={{ width: size, height: size }}
      className={`select-none object-contain rounded-xl ${className}`}
    />
  );
}
