import { motion } from 'motion/react';
import { Bot, User, Flame, Volume2 } from 'lucide-react';
import { Player, ScoreState, GameMode } from '../types';
import { PlayerSymbol } from './PlayerSymbol';

interface PlayerHUDCardProps {
  player: Player;
  isTurn: boolean;
  isWinner: boolean;
  score: number;
  streakCount: number;
  gameMode: GameMode;
}

export function PlayerHUDCard({
  player,
  isTurn,
  isWinner,
  score,
  streakCount,
  gameMode,
}: PlayerHUDCardProps) {
  const isX = player === 'X';
  const isAi = gameMode.startsWith('ai') && !isX;

  return (
    <motion.div
      id={`player-${player.toLowerCase()}-hud`}
      className={`p-4 rounded-xl border transition-all duration-300 ${
        isTurn
          ? isX
            ? 'bg-orange-950/20 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)]'
            : 'bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
          : 'bg-slate-900/30 border-slate-800/60 opacity-60'
      }`}
      animate={isTurn ? { scale: [1, 1.015, 1] } : { scale: 1 }}
      transition={{ duration: 2.5, repeat: isTurn ? Infinity : 0, ease: 'easeInOut' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg border ${
              isX
                ? 'bg-orange-500/10 border-orange-500/40 text-orange-400'
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
            }`}
          >
            {isAi ? <Bot className="w-5 h-5" /> : player}
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider text-slate-200">
              {isAi ? (gameMode === 'ai-easy' ? 'AI (CASUAL)' : 'AI (MASTER)') : `PLAYER ${player}`}
            </div>
            <div className="text-[10px] text-slate-500 tracking-widest uppercase">
              {isTurn ? (
                <span className={isX ? 'text-orange-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                  ● ACTIVE TURN
                </span>
              ) : (
                'WAITING'
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-xl font-mono font-black ${
              isX ? 'text-orange-400' : 'text-emerald-400'
            }`}
          >
            {score.toString().padStart(2, '0')}
          </div>
          <div className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
            WINS
          </div>
        </div>
      </div>

      {/* Stepped progress indicators */}
      <div className="flex space-x-1.5 mb-2">
        <div
          className={`h-1 flex-1 rounded-full ${
            isTurn
              ? isX
                ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]'
                : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
              : 'bg-slate-800'
          }`}
        />
        <div
          className={`h-1 flex-1 rounded-full ${
            isTurn
              ? isX
                ? 'bg-orange-500/60'
                : 'bg-emerald-500/60'
              : 'bg-slate-800'
          }`}
        />
        <div
          className={`h-1 flex-1 rounded-full ${
            isTurn
              ? isX
                ? 'bg-orange-500/30'
                : 'bg-emerald-500/30'
              : 'bg-slate-800'
          }`}
        />
      </div>

      {/* Micro telemetry footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
        <span className="flex items-center gap-1">
          <Volume2 className="w-3 h-3 text-slate-400" />
          <span>{isX ? 'SOLAR_ZAP.FX' : 'EMERALD_ORB.FX'}</span>
        </span>
        {streakCount > 1 && (
          <span className={`font-bold flex items-center gap-0.5 ${isX ? 'text-orange-400' : 'text-emerald-400'}`}>
            <Flame className="w-3 h-3" />
            <span>{streakCount}X STREAK</span>
          </span>
        )}
      </div>
    </motion.div>
  );
}

interface ScoreBoardProps {
  currentTurn: Player;
  scores: ScoreState;
  gameMode: GameMode;
  isGameOver: boolean;
  winner: Player | null;
}

export function ScoreBoard({ currentTurn, scores, gameMode, isGameOver, winner }: ScoreBoardProps) {
  const isXTurn = currentTurn === 'X' && !isGameOver;
  const isOTurn = currentTurn === 'O' && !isGameOver;

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Session Rounds & Match Score display */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold mb-1">
          SESSION ROUNDS
        </span>
        <div className="flex items-center space-x-6">
          <div className="text-4xl sm:text-5xl font-mono font-bold text-orange-400 drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]">
            {scores.x.toString().padStart(2, '0')}
          </div>
          <div className="text-2xl font-mono text-slate-700">:</div>
          <div className="text-4xl sm:text-5xl font-mono font-bold text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]">
            {scores.o.toString().padStart(2, '0')}
          </div>
        </div>
        {scores.ties > 0 && (
          <span className="mt-1 text-[11px] font-mono text-slate-400">
            {scores.ties} {scores.ties === 1 ? 'Draw' : 'Draws'}
          </span>
        )}
      </div>

      {/* Mobile-only player card row */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-4 lg:hidden">
        <PlayerHUDCard
          player="X"
          isTurn={isXTurn}
          isWinner={winner === 'X'}
          score={scores.x}
          streakCount={scores.streak.player === 'X' ? scores.streak.count : 0}
          gameMode={gameMode}
        />
        <PlayerHUDCard
          player="O"
          isTurn={isOTurn}
          isWinner={winner === 'O'}
          score={scores.o}
          streakCount={scores.streak.player === 'O' ? scores.streak.count : 0}
          gameMode={gameMode}
        />
      </div>
    </div>
  );
}

