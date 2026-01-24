import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-[#FDFDFD] flex flex-col items-center justify-center z-50">
      {/* Subtle background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/30 blur-[100px] animate-pulse"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-100/30 blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative flex flex-col items-center">
        
        {/* Main Content - No Card */}
        <div className="relative flex flex-col items-center animate-fade-in-up">
          
          {/* Logo Icon with Glow/Rim Light */}
          <div className="relative mb-8 group">
            {/* Glow effect behind logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
            
            {/* Custom SVG Logo - Stack of Books */}
            <div className="drop-shadow-2xl animate-[bounce_2.5s_infinite] relative z-10">
              <Logo className="w-[100px] h-[100px]" />
            </div>

            {/* Shadow underneath */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-black/10 rounded-[100%] blur-sm animate-[pulse_2.5s_infinite]"></div>
          </div>
          
          {/* Text Logo */}
          <h1 className="text-6xl font-black tracking-tight mb-3 text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 drop-shadow-sm">
              DZ-Kitab
            </span>
          </h1>
          
          <p className="text-slate-400 text-xs font-bold tracking-[0.4em] uppercase mb-12 text-center">
            Loading Experience
          </p>
          
          {/* Modern Dots Loader - Bouncing from fixed baseline */}
          <div className="flex items-end justify-center gap-3 h-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                animate={{
                  y: ["-150%", "0%"], // Moves from high to floor (0%)
                  scaleY: [1, 1, 0.8, 1], // Subtle squash on impact
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeIn", // Accelerate down (gravity), decelerate up
                  delay: i * 0.15, // Staggered start
                  times: [0, 1] // Map keyframes
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
