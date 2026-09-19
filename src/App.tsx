/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  CellValue,
  GameMode,
  GameWinResult,
  MatchHistoryItem,
  Player,
  ScoreState,
  SoundTheme,
} from './types';
import { checkWinner, getAIMove, isBoardFull } from './utils/gameLogic';
import { soundEngine } from './audio/soundEngine';
import { GameBoard } from './components/GameBoard';
import { PlayerHUDCard } from './components/ScoreBoard';
import { WinnerModal } from './components/WinnerModal';
import { AudioVisualizer } from './components/AudioVisualizer';
import {
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Bot,
  Zap,
  Activity,
  History,
  Radio,
  Sliders,
  Music,
} from 'lucide-react';

const INITIAL_BOARD: CellValue[] = Array(9).fill(null);

const INITIAL_SCORES: ScoreState = {
  x: 0,
  o: 0,
  ties: 0,
  streak: {
    player: null,
    count: 0,
  },
};

export default function App() {
  const [board, setBoard] = useState<CellValue[]>(INITIAL_BOARD);
  const [currentTurn, setCurrentTurn] = useState<Player>('X');
  const [winResult, setWinResult] = useState<GameWinResult | null>(null);
  const [isDraw, setIsDraw] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [soundTheme, setSoundTheme] = useState<SoundTheme>('cyber');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [scores, setScores] = useState<ScoreState>(INITIAL_SCORES);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [history, setHistory] = useState<MatchHistoryItem[]>([
    {
      id: 'init-1',
      winner: 'X',
      moves: 5,
      mode: 'pvp',
      time: 'PREV ROUND',
    },
  ]);

  // Sync music state listener from soundEngine
  useEffect(() => {
    soundEngine.onMusicStateChange = (playing) => {
      setIsPlayingMusic(playing);
    };
    return () => {
      soundEngine.onMusicStateChange = undefined;
    };
  }, []);

  const fireVictoryConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f97316', '#10b981', '#fbbf24', '#34d399', '#fb923c'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0.1, y: 0.6 },
          colors: ['#f97316', '#fb923c', '#fdba74'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 0.9, y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7'],
        });
      }, 250);
    } catch {
      // Ignored if confetti fails
    }
  }, []);

  // Record a completed match to the telemetry history
  const recordHistory = useCallback(
    (winner: Player | 'TIE', totalMoves: number) => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      setHistory((prev) => [
        {
          id: `match-${Date.now()}`,
          winner,
          moves: totalMoves,
          mode: gameMode,
          time: timeStr,
        },
        ...prev.slice(0, 7), // Keep 8 recent matches
      ]);
    },
    [gameMode]
  );

  // Process a move at a specific index
  const handleMakeMove = useCallback(
    (index: number, player: Player) => {
      if (board[index] !== null || winResult !== null || isDraw) return;

      // Play distinct synthesized sound for player
      soundEngine.playTurnSound(player, soundTheme);

      const newBoard = [...board];
      newBoard[index] = player;
      setBoard(newBoard);
      const newMoveCount = moveCount + 1;
      setMoveCount(newMoveCount);

      // Check win condition
      const win = checkWinner(newBoard);
      if (win) {
        setWinResult(win);
        soundEngine.playWinnerFanfare(win.winner, soundTheme);
        fireVictoryConfetti();
        recordHistory(win.winner, newMoveCount);

        // Update scores and streak
        setScores((prev) => {
          const isSameStreak = prev.streak.player === win.winner;
          const newStreakCount = isSameStreak ? prev.streak.count + 1 : 1;
          return {
            ...prev,
            x: win.winner === 'X' ? prev.x + 1 : prev.x,
            o: win.winner === 'O' ? prev.o + 1 : prev.o,
            streak: {
              player: win.winner,
              count: newStreakCount,
            },
          };
        });

        setTimeout(() => {
          setIsModalOpen(true);
        }, 1100);
        return;
      }

      // Check draw condition
      if (isBoardFull(newBoard)) {
        setIsDraw(true);
        soundEngine.playTieSound();
        recordHistory('TIE', newMoveCount);

        setScores((prev) => ({
          ...prev,
          ties: prev.ties + 1,
          streak: {
            player: null,
            count: 0,
          },
        }));

        setTimeout(() => {
          setIsModalOpen(true);
        }, 750);
        return;
      }

      // Toggle turn
      setCurrentTurn(player === 'X' ? 'O' : 'X');
    },
    [board, winResult, isDraw, moveCount, soundTheme, fireVictoryConfetti, recordHistory]
  );

  // AI Turn handler
  const aiMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (
      gameMode.startsWith('ai') &&
      currentTurn === 'O' &&
      !winResult &&
      !isDraw &&
      !isBoardFull(board)
    ) {
      setIsAiThinking(true);
      const difficulty = gameMode === 'ai-easy' ? 'easy' : 'hard';

      aiMoveTimeoutRef.current = setTimeout(() => {
        const bestMove = getAIMove(board, 'O', difficulty);
        if (bestMove !== -1) {
          handleMakeMove(bestMove, 'O');
        }
        setIsAiThinking(false);
      }, 400);
    }

    return () => {
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current);
      }
    };
  }, [currentTurn, gameMode, board, winResult, isDraw, handleMakeMove]);

  const handleCellClick = (index: number) => {
    if (isAiThinking && gameMode.startsWith('ai') && currentTurn === 'O') {
      return;
    }
    handleMakeMove(index, currentTurn);
  };

  const handleNextRound = () => {
    soundEngine.stopFanfare();
    setBoard(INITIAL_BOARD);
    setWinResult(null);
    setIsDraw(false);
    setIsModalOpen(false);
    setMoveCount(0);
    setCurrentTurn('X');
  };

  const handleFullReset = () => {
    soundEngine.stopFanfare();
    setBoard(INITIAL_BOARD);
    setWinResult(null);
    setIsDraw(false);
    setIsModalOpen(false);
    setMoveCount(0);
    setScores(INITIAL_SCORES);
    setCurrentTurn('X');
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  const isXTurn = currentTurn === 'X' && !winResult && !isDraw;
  const isOTurn = currentTurn === 'O' && !winResult && !isDraw;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden bg-[#020617] text-slate-100 font-sans selection:bg-orange-500 selection:text-black">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      {/* ========================================================================= */}
      {/* LEFT SIDEBAR: HUD & PLAYER STATUS */}
      {/* ========================================================================= */}
      <aside
        id="hud-sidebar"
        className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-800/50 bg-slate-950/40 p-5 sm:p-6 backdrop-blur-md flex flex-col justify-between relative z-10"
      >
        <div className="space-y-6">
          {/* Header Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h1 className="text-xs font-bold tracking-[0.2em] text-slate-300 uppercase">
                  SYSTEM / NEON NEXUS
                </h1>
                <p className="text-[10px] text-slate-500 font-mono">AUDIO SYNTHESIS ENGINE</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2 py-1 rounded-full border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">LIVE</span>
            </div>
          </div>

          {/* Active / Waiting Player Status Cards */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              COMBATANTS
            </div>

            {/* Player X HUD */}
            <PlayerHUDCard
              player="X"
              isTurn={isXTurn}
              isWinner={winResult?.winner === 'X'}
              score={scores.x}
              streakCount={scores.streak.player === 'X' ? scores.streak.count : 0}
              gameMode={gameMode}
            />

            {/* Player O HUD */}
            <PlayerHUDCard
              player="O"
              isTurn={isOTurn}
              isWinner={winResult?.winner === 'O'}
              score={scores.o}
              streakCount={scores.streak.player === 'O' ? scores.streak.count : 0}
              gameMode={gameMode}
            />
          </div>

          {/* Live Soundscape Module */}
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-orange-400" />
                <span>SOUNDSCAPE</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                {soundTheme.toUpperCase()}_PROFILE
              </span>
            </div>

            {/* Track status and visualizer */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800/60">
              <div className="flex items-center gap-2 overflow-hidden">
                <Music
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isPlayingMusic ? 'text-amber-400 animate-spin' : 'text-slate-400'
                  }`}
                />
                <span className="text-[11px] font-mono text-slate-300 truncate">
                  {isPlayingMusic ? 'WINNER_FANFARE.WAV' : 'SYNTH_SYNCS.ACTIVE'}
                </span>
              </div>
              <AudioVisualizer
                isPlaying={isPlayingMusic || isXTurn || isOTurn}
                color={isPlayingMusic ? 'yellow' : isXTurn ? 'orange' : 'green'}
                barCount={5}
              />
            </div>

            {/* Quick Audio Test Triggers */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                id="test-x-sound-btn"
                onClick={() => soundEngine.playPlayerXSound(soundTheme)}
                className="py-1.5 px-2 rounded-lg bg-orange-950/40 border border-orange-500/30 text-orange-300 hover:bg-orange-900/40 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                title="Trigger Player X Move Audio"
              >
                P1 AUDIO
              </button>
              <button
                id="test-o-sound-btn"
                onClick={() => soundEngine.playPlayerOSound(soundTheme)}
                className="py-1.5 px-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                title="Trigger Player O Move Audio"
              >
                P2 AUDIO
              </button>
              <button
                id="test-winner-music-btn"
                onClick={() => soundEngine.playWinnerFanfare('X', soundTheme)}
                className="py-1.5 px-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 hover:bg-amber-900/40 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                title="Trigger Winner Fanfare Music"
              >
                FANFARE
              </button>
            </div>
          </div>
        </div>

        {/* Global Reset / Reboot */}
        <div className="pt-4 mt-4 border-t border-slate-800/50 flex items-center justify-between">
          <button
            id="reset-scores-btn"
            onClick={() => {
              soundEngine.playClickSound();
              handleFullReset();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer font-mono"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET SCORES</span>
          </button>
          <span className="text-[10px] font-mono text-slate-600">VER 3.2.0</span>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* CENTER STAGE: GAME ARENA & CONTROLS */}
      {/* ========================================================================= */}
      <main
        id="arena-main"
        className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-y-auto lg:overflow-hidden"
      >
        {/* Top Control Bar: Mode Selector, Sound Selector, Master Mute */}
        <div className="w-full max-w-xl flex flex-wrap items-center justify-between gap-3 z-10 mb-2">
          {/* Mode Pill Selector */}
          <div className="flex items-center space-x-1 bg-slate-900/60 p-1 rounded-full border border-slate-800/80 backdrop-blur-md">
            <button
              id="mode-pvp-btn"
              onClick={() => {
                soundEngine.playClickSound();
                setGameMode('pvp');
                handleNextRound();
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider transition-all cursor-pointer ${
                gameMode === 'pvp'
                  ? 'bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.6)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2P LOCAL
            </button>
            <button
              id="mode-ai-easy-btn"
              onClick={() => {
                soundEngine.playClickSound();
                setGameMode('ai-easy');
                handleNextRound();
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider transition-all cursor-pointer ${
                gameMode === 'ai-easy'
                  ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AI CASUAL
            </button>
            <button
              id="mode-ai-hard-btn"
              onClick={() => {
                soundEngine.playClickSound();
                setGameMode('ai-hard');
                handleNextRound();
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider transition-all cursor-pointer ${
                gameMode === 'ai-hard'
                  ? 'bg-green-600 text-white shadow-[0_0_12px_rgba(34,197,94,0.6)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AI MASTER
            </button>
          </div>

          {/* Sound Theme & Mute Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-800">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="sound-theme-select"
                value={soundTheme}
                onChange={(e) => {
                  const newTheme = e.target.value as SoundTheme;
                  setSoundTheme(newTheme);
                  soundEngine.playPlayerXSound(newTheme);
                }}
                className="bg-transparent text-slate-300 text-xs font-mono font-medium focus:outline-none cursor-pointer"
              >
                <option value="cyber" className="bg-slate-950 text-slate-200">
                  CYBER NEON
                </option>
                <option value="retro" className="bg-slate-950 text-slate-200">
                  8-BIT RETRO
                </option>
                <option value="cosmic" className="bg-slate-950 text-slate-200">
                  COSMIC CHIME
                </option>
              </select>
            </div>

            <button
              id="mute-toggle-btn"
              onClick={() => {
                soundEngine.playClickSound();
                handleToggleMute();
              }}
              className={`p-1.5 px-2.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                isMuted
                  ? 'bg-red-950/40 border-red-800 text-red-400'
                  : 'bg-slate-900/80 border-slate-800 text-orange-400 hover:border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-mono">{isMuted ? 'MUTED' : 'AUDIO'}</span>
            </button>
          </div>
        </div>

        {/* Center Score Counter */}
        <div className="flex flex-col items-center my-1 z-10 select-none">
          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mb-1">
            SESSION ROUNDS
          </span>
          <div className="flex items-center space-x-6">
            <div className="text-4xl sm:text-5xl font-mono font-bold text-orange-400 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
              {scores.x.toString().padStart(2, '0')}
            </div>
            <div className="text-2xl font-mono text-slate-700">:</div>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
              {scores.o.toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* The Grid Arena */}
        <div className="relative my-auto flex flex-col items-center justify-center z-10">
          <GameBoard
            board={board}
            winResult={winResult}
            currentTurn={currentTurn}
            isGameOver={winResult !== null || isDraw}
            onCellClick={handleCellClick}
            disabled={isAiThinking && gameMode.startsWith('ai') && currentTurn === 'O'}
          />
        </div>

        {/* Turn Status Message & Action Pill */}
        <div className="w-full max-w-md flex flex-col items-center gap-3 z-10 mt-2">
          {winResult ? (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-orange-500/40 text-xs font-mono font-bold animate-pulse text-orange-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PLAYER {winResult.winner} VICTORY // PLAYING FANFARE MUSIC</span>
            </div>
          ) : isDraw ? (
            <div className="px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-mono font-bold text-slate-300">
              STALEMATE DETECTED // ROUND DRAW
            </div>
          ) : isAiThinking ? (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold">
              <Bot className="w-3.5 h-3.5 animate-spin" />
              <span>AI CALCULATING OPTIMAL RESPONSE...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
              <span>CURRENT TURN:</span>
              <span
                className={`font-bold ${
                  currentTurn === 'X' ? 'text-orange-400' : 'text-emerald-400'
                }`}
              >
                {gameMode.startsWith('ai') && currentTurn === 'O'
                  ? 'AI PLAYER (O)'
                  : `PLAYER ${currentTurn}`}
              </span>
              <span>• MOVE #{moveCount + 1}</span>
            </div>
          )}

          {/* Reboot Button */}
          <button
            id="reboot-arena-btn"
            onClick={() => {
              soundEngine.playClickSound();
              handleNextRound();
            }}
            className="px-8 py-3 bg-white text-black font-bold rounded-full text-xs uppercase tracking-wider hover:bg-orange-400 hover:text-black transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REBOOT ARENA</span>
          </button>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* RIGHT SIDEBAR: TELEMETRY & MATCH HISTORY */}
      {/* ========================================================================= */}
      <aside
        id="telemetry-sidebar"
        className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800/50 bg-slate-950/40 p-5 sm:p-6 backdrop-blur-md flex flex-col justify-between relative z-10"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold tracking-[0.2em] text-slate-300 uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-orange-400" />
              <span>MATCH TELEMETRY</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">LIVE FEED</span>
          </div>

          {/* Match History List */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1">
              <History className="w-3 h-3 text-slate-500" />
              <span>RECENT ENGAGEMENTS</span>
            </div>

            <div className="space-y-1.5 font-mono text-xs max-h-48 lg:max-h-56 overflow-y-auto pr-1">
              {history.map((item, idx) => {
                const isXWin = item.winner === 'X';
                const isOWin = item.winner === 'O';
                const isTie = item.winner === 'TIE';

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/30 border border-slate-800/50 text-[11px]"
                  >
                    <span className="text-slate-500">
                      RND {(history.length - idx).toString().padStart(2, '0')}
                    </span>
                    <span
                      className={`font-bold ${
                        isXWin
                          ? 'text-orange-400'
                          : isOWin
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {isTie ? 'TIE' : `P-${item.winner} WIN`} [{item.moves}-MOV]
                    </span>
                    <span className="text-slate-600 text-[10px]">{item.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audio Synthesizer Diagnostics */}
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 space-y-2.5">
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              AUDIO ENGINE STATUS
            </div>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>SYNTH_OSC:</span>
                <span className="text-orange-400">POLYPHONIC</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>FREQ_RANGE:</span>
                <span className="text-slate-200">220Hz - 1046Hz</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>FANFARE_CHORDS:</span>
                <span className="text-emerald-400">TRIAD_ARPEGGIO</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>OUTPUT_BUS:</span>
                <span className={isMuted ? 'text-red-400' : 'text-emerald-400'}>
                  {isMuted ? 'MUTED' : 'ONLINE (0dB)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Footer */}
        <div className="pt-4 mt-4 border-t border-slate-800/50 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>LATENCY: &lt;1ms</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            SYNTH_READY
          </span>
        </div>
      </aside>

      {/* Winner Celebration Modal */}
      <WinnerModal
        isOpen={isModalOpen}
        winner={winResult ? winResult.winner : null}
        isDraw={isDraw}
        onPlayAgain={handleNextRound}
        isPlayingMusic={isPlayingMusic}
        soundTheme={soundTheme}
      />
    </div>
  );
}
