import { Volume2, VolumeX, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { GameMode, SoundTheme } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { AudioVisualizer } from './AudioVisualizer';

interface GameHeaderProps {
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
  soundTheme: SoundTheme;
  onSoundThemeChange: (theme: SoundTheme) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isPlayingMusic: boolean;
  onResetGame: () => void;
}

export function GameHeader({
  gameMode,
  onGameModeChange,
  soundTheme,
  onSoundThemeChange,
  isMuted,
  onToggleMute,
  isPlayingMusic,
  onResetGame,
}: GameHeaderProps) {
  const handleTestX = () => {
    soundEngine.playPlayerXSound(soundTheme);
  };

  const handleTestO = () => {
    soundEngine.playPlayerOSound(soundTheme);
  };

  const handleTestFanfare = () => {
    soundEngine.playWinnerFanfare('X', soundTheme);
  };

  return (
    <header className="w-full max-w-xl mx-auto flex flex-col gap-4 mb-6">
      {/* Title & Master Audio Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-pink-500 p-0.5 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-300" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-300 to-amber-200 tracking-tight flex items-center gap-1.5">
              <span>Flashy Tic Tac Toe</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Interactive Player Audio & Winner Fanfare</span>
            </p>
          </div>
        </div>

        {/* Global Sound & Reset controls */}
        <div className="flex items-center gap-2">
          <button
            id="mute-toggle-btn"
            onClick={() => {
              soundEngine.playClickSound();
              onToggleMute();
            }}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              isMuted
                ? 'bg-red-950/40 border-red-800/80 text-red-400 hover:bg-red-900/50'
                : 'bg-slate-900 border-slate-800 text-cyan-300 hover:border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
            }`}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>

          <button
            id="reset-scores-btn"
            onClick={() => {
              soundEngine.playClickSound();
              onResetGame();
            }}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title="Reset Board & Scores"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode & Audio Controls Bar */}
      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Game Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            id="mode-pvp-btn"
            onClick={() => {
              soundEngine.playClickSound();
              onGameModeChange('pvp');
            }}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              gameMode === 'pvp'
                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2 Players
          </button>
          <button
            id="mode-ai-easy-btn"
            onClick={() => {
              soundEngine.playClickSound();
              onGameModeChange('ai-easy');
            }}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              gameMode === 'ai-easy'
                ? 'bg-pink-500/20 border border-pink-500/50 text-pink-300 shadow-[0_0_8px_rgba(236,72,153,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Easy
          </button>
          <button
            id="mode-ai-hard-btn"
            onClick={() => {
              soundEngine.playClickSound();
              onGameModeChange('ai-hard');
            }}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              gameMode === 'ai-hard'
                ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Master
          </button>
        </div>

        {/* Sound Theme Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Sound:</span>
          <select
            id="sound-theme-select"
            value={soundTheme}
            onChange={(e) => {
              const newTheme = e.target.value as SoundTheme;
              onSoundThemeChange(newTheme);
              soundEngine.playPlayerXSound(newTheme);
            }}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 font-medium focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="cyber">Cyber Neon</option>
            <option value="retro">8-Bit Retro</option>
            <option value="cosmic">Cosmic Chime</option>
          </select>
        </div>

        {/* Quick Audio Test buttons */}
        <div className="flex items-center gap-1.5">
          <button
            id="test-x-sound-btn"
            onClick={handleTestX}
            className="px-2 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 transition-colors text-[11px] font-bold cursor-pointer"
            title="Preview Player X Move Sound"
          >
            🔊 X Sound
          </button>
          <button
            id="test-o-sound-btn"
            onClick={handleTestO}
            className="px-2 py-1 rounded-lg bg-pink-950/60 border border-pink-500/40 text-pink-300 hover:bg-pink-900/50 transition-colors text-[11px] font-bold cursor-pointer"
            title="Preview Player O Move Sound"
          >
            🔊 O Sound
          </button>
          <button
            id="test-winner-music-btn"
            onClick={handleTestFanfare}
            className="px-2 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 transition-colors text-[11px] font-bold cursor-pointer flex items-center gap-1"
            title="Preview Winner Victory Fanfare Music"
          >
            🎵 Fanfare
          </button>
        </div>
      </div>

      {/* Music Playing Banner if fanfare is actively rolling */}
      {isPlayingMusic && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs">
          <span className="font-semibold flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>Playing Winner Fanfare Music...</span>
          </span>
          <div className="flex items-center gap-2">
            <AudioVisualizer isPlaying={true} color="yellow" barCount={5} />
            <button
              onClick={() => soundEngine.stopFanfare()}
              className="text-[10px] text-amber-400 underline hover:text-amber-200 cursor-pointer"
            >
              Stop
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
