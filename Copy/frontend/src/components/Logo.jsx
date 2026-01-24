import React from 'react';

const Logo = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      dir="ltr" // Ensure SVG content is always treated as LTR
    >
      <defs>
        <linearGradient id="book1" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e3a8a" />
          <stop offset="1" stopColor="#172554" />
        </linearGradient>
        <linearGradient id="book2" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7f1d1d" />
          <stop offset="1" stopColor="#991b1b" />
        </linearGradient>
        <linearGradient id="book3" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e40af" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      
      {/* Bottom Book */}
      <path d="M15 75H85C87.2 75 89 73.2 89 71V61C89 58.8 87.2 57 85 57H15C10.6 57 7 60.6 7 65V67C7 71.4 10.6 75 15 75Z" fill="url(#book1)" transform="rotate(-3 48 66)" />
      <path d="M15 75C10.6 75 7 71.4 7 67V65C7 60.6 10.6 57 15 57" stroke="white" strokeOpacity="0.1" strokeWidth="1" fill="none" transform="rotate(-3 48 66)" />

      {/* Middle Book */}
      <path d="M18 55H88C90.2 55 92 53.2 92 51V41C92 38.8 90.2 37 88 37H18C13.6 37 10 40.6 10 45V47C10 51.4 13.6 55 18 55Z" fill="url(#book2)" transform="rotate(2 51 46)" />
      <path d="M18 55C13.6 55 10 51.4 10 47V45C10 40.6 13.6 37 18 37" stroke="white" strokeOpacity="0.1" strokeWidth="1" fill="none" transform="rotate(2 51 46)" />

      {/* Top Book */}
      <path d="M15 35H85C87.2 35 89 33.2 89 31V21C89 18.8 87.2 17 85 17H15C10.6 17 7 20.6 7 25V27C7 31.4 10.6 35 15 35Z" fill="url(#book3)" transform="rotate(-2 48 26)" />
      <path d="M15 35C10.6 35 7 31.4 7 27V25C7 20.6 10.6 17 15 17" stroke="white" strokeOpacity="0.2" strokeWidth="1" fill="none" transform="rotate(-2 48 26)" />
      
      {/* Decorative line on top book */}
      <rect x="20" y="24" width="50" height="2" rx="1" fill="white" fillOpacity="0.3" transform="rotate(-2 48 26)" />
    </svg>
  );
};

export default Logo;
