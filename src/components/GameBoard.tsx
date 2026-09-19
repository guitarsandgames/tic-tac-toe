import { motion } from 'motion/react';
import { CellValue, GameWinResult, Player } from '../types';
import { PlayerSymbol } from './PlayerSymbol';
import { soundEngine } from '../audio/soundEngine';

interface GameBoardProps {
  board: CellValue[];
  winResult: GameWinResult | null;
  currentTurn: Player;
  isGameOver: boolean;
  onCellClick: (index: number) => void;
  disabled?: boolean;
}

export function GameBoard({
  board,
  winResult,
  currentTurn,
  isGameOver,
  onCellClick,
  disabled = false,
}: GameBoardProps) {
  const winningIndices = winResult ? winResult.line : [];

  const handleCellHover = (cell: CellValue) => {
    if (!isGameOver && !disabled && cell === null) {
      soundEngine.playHoverSound();
    }
  };

  return (
    <div className="relative p-3 sm:p-5 flex items-center justify-center">
      {/* Immersive grid crosshair axis dividers */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-[calc(100%+24px)] bg-gradient-to-b from-transparent via-orange-500/25 to-transparent pointer-events-none z-0" />
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent pointer-events-none z-0" />

      {/* Grid container */}
      <div
        id="tic-tac-toe-grid"
        className="relative z-10 grid grid-cols-3 gap-3 sm:gap-4"
      >
        {board.map((cell, index) => {
          const isWinningCell = winningIndices.includes(index);
          const isPlayable = !isGameOver && !disabled && cell === null;

          return (
            <motion.button
              key={index}
              id={`grid-cell-${index}`}
              aria-label={`Cell ${index + 1}: ${cell ? cell : 'Empty'}`}
              onClick={() => {
                if (isPlayable) {
                  onCellClick(index);
                }
              }}
              onMouseEnter={() => handleCellHover(cell)}
              disabled={!isPlayable}
              whileHover={
                isPlayable
                  ? {
                      scale: 1.03,
                      borderColor:
                        currentTurn === 'X'
                          ? 'rgba(249,115,22,0.7)'
                          : 'rgba(52,211,153,0.7)',
                      boxShadow:
                        currentTurn === 'X'
                          ? '0 0 20px rgba(249,115,22,0.35)'
                          : '0 0 20px rgba(16,185,129,0.35)',
                    }
                  : {}
              }
              whileTap={isPlayable ? { scale: 0.95 } : {}}
              className={`w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-xl border flex items-center justify-center relative select-none overflow-hidden cursor-pointer transition-colors ${
                isWinningCell
                  ? winResult?.winner === 'X'
                    ? 'bg-orange-950/70 border-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.7)]'
                    : 'bg-emerald-950/70 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.7)]'
                  : cell !== null
                  ? cell === 'X'
                    ? 'bg-slate-900/60 border-slate-700/60 cursor-default'
                    : 'bg-slate-900/60 border-slate-700/60 cursor-default'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70'
              }`}
            >
              {/* Placement target ghost indicator */}
              {cell === null && !isGameOver && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-25 transition-opacity">
                  <div
                    className={`w-10 h-10 rounded-lg border border-dashed ${
                      currentTurn === 'X' ? 'border-orange-400' : 'border-emerald-400'
                    }`}
                  />
                </div>
              )}

              {/* Placed Symbol */}
              {cell && (
                <PlayerSymbol
                  player={cell}
                  size="lg"
                  isWinning={isWinningCell}
                  animate={true}
                />
              )}

              {/* Winning pulse overlay */}
              {isWinningCell && (
                <motion.div
                  className={`absolute inset-0 rounded-xl pointer-events-none ${
                    winResult?.winner === 'X' ? 'bg-orange-400/20' : 'bg-emerald-500/20'
                  }`}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Dynamic Laser Strike-Through line across the board */}
      {winResult && (
        <svg
          className="absolute inset-0 w-full h-full z-20 pointer-events-none p-3 sm:p-5"
          viewBox="0 0 300 300"
        >
          {(() => {
            const coords = [
              { x: 50, y: 50 },
              { x: 150, y: 50 },
              { x: 250, y: 50 },
              { x: 50, y: 150 },
              { x: 150, y: 150 },
              { x: 250, y: 150 },
              { x: 50, y: 250 },
              { x: 150, y: 250 },
              { x: 250, y: 250 },
            ];

            const p1 = coords[winResult.line[0]];
            const p3 = coords[winResult.line[2]];

            const isX = winResult.winner === 'X';
            const strokeColor = isX ? '#fb923c' : '#34d399';
            const glowColor = isX ? 'rgba(249,115,22,0.9)' : 'rgba(52,211,153,0.9)';

            const dx = p3.x - p1.x;
            const dy = p3.y - p1.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const extend = 30;
            const startX = p1.x - (dx / length) * extend;
            const startY = p1.y - (dy / length) * extend;
            const endX = p3.x + (dx / length) * extend;
            const endY = p3.y + (dy / length) * extend;

            return (
              <g>
                <motion.line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={strokeColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 16px ${glowColor})` }}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.85 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
                <motion.line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#ffffff"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </g>
            );
          })()}
        </svg>
      )}
    </div>
  );
}

