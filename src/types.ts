export type Player = 'X' | 'O';
export type CellValue = Player | null;

export type GameMode = 'pvp' | 'ai-easy' | 'ai-hard';

export type SoundTheme = 'cyber' | 'retro' | 'cosmic';

export interface ScoreState {
  x: number;
  o: number;
  ties: number;
  streak: {
    player: Player | null;
    count: number;
  };
}

export interface MatchHistoryItem {
  id: string;
  winner: Player | 'TIE';
  moves: number;
  mode: GameMode;
  time: string;
}

export interface MoveRecord {
  index: number;
  player: Player;
  turnNumber: number;
}

export interface GameWinResult {
  winner: Player;
  line: [number, number, number];
  direction: 'row' | 'col' | 'diag-main' | 'diag-anti';
}
