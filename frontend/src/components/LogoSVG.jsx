import React from 'react';

export default function LogoSVG({ className = "w-8 h-8" }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`${className} shrink-0`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Orbit Rings */}
      <circle cx="48" cy="46" r="38" stroke="url(#orbitGradient)" strokeWidth="1.5" strokeDasharray="160 50" />
      <circle cx="48" cy="46" r="42" stroke="url(#orbitGradientTeal)" strokeWidth="1" strokeDasharray="80 180" />
      
      {/* Orbit Dots */}
      <circle cx="83" cy="27" r="3.5" fill="#14B8A6" />
      <circle cx="15" cy="62" r="3.5" fill="#2563EB" />

      {/* Main Map Pin Shadow */}
      <ellipse cx="48" cy="88" rx="14" ry="2.5" fill="rgba(0,0,0,0.1)" />

      {/* Main Map Pin Outline */}
      <path 
        d="M48 16C31.4 16 18 29.4 18 46C18 64.6 44.2 84.8 45.8 86C47 87 49 87 50.2 86C51.8 84.8 78 64.6 78 46C78 29.4 64.6 16 48 16Z" 
        fill="url(#pinGradient)" 
      />

      {/* Skyline Silhouette inside the pin */}
      <path 
        d="M26 62h44V55h-4v-7h-5v-10h-6v5h-4v-9h-6v10h-4v4h-5v7h-5v7z" 
        fill="url(#cityGradient)" 
        opacity="0.25" 
      />
      <path 
        d="M32 62h32V57h-3v-5h-4v-8h-4v4h-3v-7h-4v7h-3v3h-4v3h-3v6z" 
        fill="url(#cityGradient)" 
        opacity="0.45" 
      />

      {/* Three People Silhouettes (Avatars) */}
      <circle cx="39" cy="51" r="4" fill="#14B8A6" />
      <path d="M32 62c0-3 2.5-5 6-5s6 2 6 5H32z" fill="#14B8A6" />

      <circle cx="57" cy="51" r="4" fill="#60A5FA" />
      <path d="M50 62c0-3 2.5-5 6-5s6 2 6 5H50z" fill="#60A5FA" />

      <circle cx="48" cy="48" r="5" fill="#1E3A8A" />
      <path d="M39 62c0-4 3.5-7 8-7s8 3 8 7H39z" fill="#1E3A8A" />

      {/* Corner Security Checkmark Shield */}
      <path 
        d="M62 64c0 0 0-4 6-6s8-1 8-1s2 10-6 16c-8-6-8-16-8-16z" 
        fill="#14B8A6" 
        stroke="white" 
        strokeWidth="1.5" 
      />
      <path 
        d="M67 72l2 2 4-4" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      <defs>
        <linearGradient id="pinGradient" x1="48" y1="16" x2="48" y2="87" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="cityGradient" x1="48" y1="36" x2="48" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="orbitGradient" x1="10" y1="46" x2="86" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="orbitGradientTeal" x1="48" y1="4" x2="48" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
