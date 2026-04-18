import React from 'react';
import { BadgeCheck } from 'lucide-react';

/**
 * FooterSignature - A premium, modern footer component for the YourTube web app.
 * Featuring a dark theme, gradient typography, and subtle micro-animations.
 */
const FooterSignature = () => {
  return (
    <footer className="w-full py-6 md:py-4 mt-auto border-t border-white/5 bg-black/40 backdrop-blur-md select-none relative z-10">
      <div className="max-w-7xl mx-auto px-4 pb-4 md:pb-0 flex flex-col items-center justify-center space-y-3 md:space-y-2">
        
        {/* Main Signature Line */}
        <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 group">
          <span className="text-zinc-500 text-sm font-medium tracking-tight opacity-80 decoration-transparent transition-all">
            Built & Designed by
          </span>
          
          <a 
            href="#" // Replace with actual portfolio link
            className="relative inline-flex items-center gap-1.5 no-underline group/link"
            onClick={(e) => e.preventDefault()}
          >
            <span className="text-base md:text-xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-500 bg-clip-text text-transparent transition-all duration-500 hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.4)] tracking-tight">
              Harshraj Dawar
            </span>
            
            <div className="relative flex items-center justify-center">
              <BadgeCheck className="w-4 h-4 md:w-5 md:h-5 text-blue-500 transition-all duration-300 group-hover/link:scale-110 group-hover/link:rotate-[360deg]" />
              {/* Subtle pulsing glow behind the badge */}
              <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full animate-pulse group-hover/link:bg-blue-500/40"></div>
            </div>

            {/* Premium Underline Animation */}
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-400 to-transparent transition-all duration-700 ease-out group-hover/link:w-full"></span>
          </a>
        </div>

        {/* Minimal Copyright & Branding */}
        <div className="flex flex-col items-center space-y-1">
          <div className="h-[1px] w-8 bg-zinc-800 rounded-full mb-2"></div>
          <p className="text-[9px] md:text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <span>YourTube Premium</span>
            <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
            <span>Est. {new Date().getFullYear()}</span>
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      </div>
    </footer>
  );
};

export default FooterSignature;
