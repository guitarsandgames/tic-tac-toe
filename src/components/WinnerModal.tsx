import { motion } from 'motion/react';
import { Trophy, RotateCcw, Volume2, Music, Sparkles } from 'lucide-react';
import { Player, SoundTheme } from '../types';
import { PlayerSymbol } from './PlayerSymbol';
import { AudioVisualizer } from './AudioVisualizer';
import { soundEngine } from '../audio/soundEngine';

interface WinnerModalProps {
  isOpen: boolean;
  winner: Player | null;
  isDraw: boolean;
  onPlayAgain: () => void;
  isPlayingMusic: boolean;
  soundTheme: SoundTheme;
}

export function WinnerModal({
  isOpen,
  winner,
  isDraw,
  onPlayAgain,
  isPlayingMusic,
  soundTheme,
}: WinnerModalProps) {
  if (!isOpen) return null;

  const isX = winner === 'X';

  const handleReplayMusic = () => {
    if (winner) {
      soundEngine.playWinnerFanfare(winner, soundTheme);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <motion.div
        id="winner-announcement-modal"
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className={`relative w-full max-w-sm overflow-hidden rounded-2xl p-6 sm:p-8 text-center border backdrop-blur-2xl shadow-2xl ${
          isDraw
            ? 'bg-slate-900/90 border-slate-700/80 shadow-[0_0_50px_rgba(30,41,59,0.5)]'
            : isX
            ? 'bg-slate-950/95 border-orange-500/80 shadow-[0_0_60px_rgba(249,115,22,0.4)]'
            : 'bg-slate-950/95 border-emerald-500/80 shadow-[0_0_60px_rgba(16,185,129,0.4)]'
        }`}
      >
        {/* Glow ambient pulse in backdrop */}
        <div
          className={`absolute -inset-10 rounded-full blur-3xl opacity-30 pointer-events-none ${
            isDraw ? 'bg-slate-500' : isX ? 'bg-orange-500' : 'bg-emerald-500'
          }`}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          {winner ? (
            <>
              {/* Crown / Trophy icon */}
              <motion.div
                className="relative mb-3 flex items-center justify-center"
                animate={{ rotate: [-4, 4, -4], y: [0, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center border shadow-lg ${
                    isX
                      ? 'bg-orange-950/80 border-orange-400 text-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.6)]'
                      : 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.6)]'
                  }`}
                >
                  <Trophy className="w-8 h-8" />
                </div>
                <Sparkles
                  className={`absolute -top-2 -right-2 w-5 h-5 animate-pulse ${
                    isX ? 'text-orange-300' : 'text-emerald-300'
                  }`}
                />
              </motion.div>

              <div className="flex items-center justify-center gap-2 mb-1">
                <PlayerSymbol player={winner} size="sm" isWinning={true} animate={false} />
                <h2
                  className={`text-2xl sm:text-3xl font-mono font-black uppercase tracking-wider ${
                    isX
                      ? 'text-orange-300 drop-shadow-[0_0_12px_rgba(251,146,60,0.8)]'
                      : 'text-emerald-300 drop-shadow-[0_0_12px_rgba(110,231,183,0.8)]'
                  }`}
                >
                  Player {winner} Victorious
                </h2>
              </div>

              <p className="text-xs font-medium text-slate-400 mb-4 font-mono">
                ARENA CONQUERED // FANFARE MUSIC TRIGGERED
              </p>

              {/* Music Visualizer Banner */}
              <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 mb-5">
                <div className="flex items-center gap-2">
                  <Music
                    className={`w-4 h-4 ${isX ? 'text-orange-400' : 'text-emerald-400'} animate-bounce`}
                  />
                  <span className="text-[11px] text-slate-300 font-mono">
                    {isPlayingMusic ? 'FANFARE_PLAYING.WAV' : 'FANFARE_READY.WAV'}
                  </span>
                </div>
                <AudioVisualizer
                  isPlaying={isPlayingMusic}
                  color={isX ? 'orange' : 'green'}
                  barCount={5}
                />
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center border border-slate-700 bg-slate-800/80 text-slate-300 mb-3 shadow-lg">
                <RotateCcw className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-mono font-black text-slate-100 uppercase tracking-wider mb-1">
                Stalemate
              </h2>
              <p className="text-xs font-mono text-slate-400 mb-5">
                NEURAL OVERLOAD // PERFECT EQUILIBRIUM
              </p>
            </>
          )}

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2">
            <button
              id="play-again-btn"
              onClick={() => {
                soundEngine.playClickSound();
                onPlayAgain();
              }}
              className={`w-full py-3 px-6 rounded-full font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isDraw
                  ? 'bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                  : isX
                  ? 'bg-white text-black hover:bg-orange-400 hover:text-black shadow-[0_0_20px_rgba(249,115,22,0.5)]'
                  : 'bg-white text-black hover:bg-emerald-400 hover:text-black shadow-[0_0_20px_rgba(52,211,153,0.5)]'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reboot Arena</span>
            </button>

            {winner && (
              <button
                id="replay-winner-music-btn"
                onClick={handleReplayMusic}
                className="w-full py-2.5 px-4 rounded-xl font-mono text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Replay Victory Fanfare</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

