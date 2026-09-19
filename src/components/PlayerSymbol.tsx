import { motion } from 'motion/react';
import { Player } from '../types';

interface PlayerSymbolProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isWinning?: boolean;
  animate?: boolean;
}

export function PlayerSymbol({ player, size = 'lg', isWinning = false, animate = true }: PlayerSymbolProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16 md:w-20 md:h-20',
    xl: 'w-24 h-24 md:w-28 md:h-28',
  };

  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 3.5 : 3;

  if (player === 'X') {
    return (
      <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
        {/* Glow backdrop */}
        <div
          className={`absolute inset-0 rounded-full blur-md opacity-70 transition-all duration-300 ${
            isWinning ? 'bg-orange-400 opacity-95 scale-125' : 'bg-orange-500/40'
          }`}
        />
        
        <svg
          viewBox="0 0 100 100"
          className={`w-full h-full relative z-10 filter drop-shadow-[0_0_12px_rgba(249,115,22,0.9)] ${
            isWinning ? 'drop-shadow-[0_0_24px_rgba(251,146,60,1)]' : ''
          }`}
        >
          {/* Laser stroke 1 */}
          <motion.line
            x1="22"
            y1="22"
            x2="78"
            y2="78"
            stroke="currentColor"
            className="text-orange-400"
            strokeWidth={strokeWidth * 3}
            strokeLinecap="round"
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
          {/* Inner bright core line 1 */}
          <motion.line
            x1="22"
            y1="22"
            x2="78"
            y2="78"
            stroke="#ffffff"
            strokeWidth={strokeWidth * 1.2}
            strokeLinecap="round"
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />

          {/* Laser stroke 2 */}
          <motion.line
            x1="78"
            y1="22"
            x2="22"
            y2="78"
            stroke="currentColor"
            className="text-orange-400"
            strokeWidth={strokeWidth * 3}
            strokeLinecap="round"
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.1, ease: 'easeOut' }}
          />
          {/* Inner bright core line 2 */}
          <motion.line
            x1="78"
            y1="22"
            x2="22"
            y2="78"
            stroke="#ffffff"
            strokeWidth={strokeWidth * 1.2}
            strokeLinecap="round"
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.1, ease: 'easeOut' }}
          />
        </svg>

        {isWinning && (
          <motion.div
            className="absolute inset-0 rounded-full border border-orange-300"
            animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
      {/* Glow backdrop */}
      <div
        className={`absolute inset-0 rounded-full blur-md opacity-70 transition-all duration-300 ${
          isWinning ? 'bg-emerald-400 opacity-95 scale-125' : 'bg-emerald-500/40'
        }`}
      />

      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full relative z-10 filter drop-shadow-[0_0_12px_rgba(52,211,153,0.9)] ${
          isWinning ? 'drop-shadow-[0_0_24px_rgba(110,231,183,1)]' : ''
        }`}
      >
        {/* Outer neon ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="currentColor"
          className="text-emerald-400"
          strokeWidth={strokeWidth * 3}
          strokeLinecap="round"
          initial={animate ? { pathLength: 0, rotate: -90, opacity: 0 } : false}
          animate={{ pathLength: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
        {/* Inner bright core ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="#ffffff"
          strokeWidth={strokeWidth * 1.2}
          strokeLinecap="round"
          initial={animate ? { pathLength: 0, rotate: -90, opacity: 0 } : false}
          animate={{ pathLength: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </svg>

      {isWinning && (
        <motion.div
          className="absolute inset-0 rounded-full border border-emerald-300"
          animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}
