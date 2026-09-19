import { motion } from 'motion/react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  color?: 'orange' | 'green' | 'yellow' | 'cyan' | 'fuchsia' | 'multicolor';
  barCount?: number;
}

export function AudioVisualizer({ isPlaying, color = 'orange', barCount = 7 }: AudioVisualizerProps) {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  const getColorClass = (index: number) => {
    if (color === 'orange') return 'bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.7)]';
    if (color === 'green') return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]';
    if (color === 'cyan') return 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]';
    if (color === 'fuchsia') return 'bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.7)]';
    if (color === 'yellow') return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]';
    // multicolor
    const colors = [
      'bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.7)]',
      'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]',
      'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]',
      'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]',
      'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.7)]',
      'bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.7)]',
      'bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.7)]',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="flex items-end justify-center gap-1.5 h-7 px-1 py-1">
      {bars.map((bar) => {
        const minHeight = 4;
        const maxHeight = 24;
        const heights = [minHeight, maxHeight, minHeight + 6, maxHeight * 0.75, minHeight + 2];
        const delay = (bar * 0.08) % 0.4;
        const duration = 0.35 + (bar % 4) * 0.12;

        return (
          <motion.div
            key={bar}
            className={`w-1 rounded-none ${getColorClass(bar)}`}
            animate={
              isPlaying
                ? {
                    height: heights,
                    opacity: [0.5, 1, 0.7, 1, 0.5],
                  }
                : {
                    height: minHeight,
                    opacity: 0.25,
                  }
            }
            transition={
              isPlaying
                ? {
                    duration: duration,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    delay: delay,
                  }
                : { duration: 0.2 }
            }
          />
        );
      })}
    </div>
  );
}

