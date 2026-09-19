import { CellValue, GameWinResult, Player } from '../types';

export const WINNING_COMBINATIONS: { line: [number, number, number]; direction: GameWinResult['direction'] }[] = [
  { line: [0, 1, 2], direction: 'row' },
  { line: [3, 4, 5], direction: 'row' },
  { line: [6, 7, 8], direction: 'row' },
  { line: [0, 3, 6], direction: 'col' },
  { line: [1, 4, 7], direction: 'col' },
  { line: [2, 5, 8], direction: 'col' },
  { line: [0, 4, 8], direction: 'diag-main' },
  { line: [2, 4, 6], direction: 'diag-anti' },
];

export function checkWinner(board: CellValue[]): GameWinResult | null {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo.line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a] as Player,
        line: combo.line,
        direction: combo.direction,
      };
    }
  }
  return null;
}

export function isBoardFull(board: CellValue[]): boolean {
  return board.every((cell) => cell !== null);
}

export function getAvailableMoves(board: CellValue[]): number[] {
  const moves: number[] = [];
  board.forEach((cell, idx) => {
    if (cell === null) moves.push(idx);
  });
  return moves;
}

/**
 * Minimax algorithm for Unbeatable AI
 */
function minimax(
  board: CellValue[],
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  humanPlayer: Player
): { score: number; bestMove?: number } {
  const winResult = checkWinner(board);
  if (winResult) {
    if (winResult.winner === aiPlayer) return { score: 10 - depth };
    if (winResult.winner === humanPlayer) return { score: depth - 10 };
  }
  if (isBoardFull(board)) {
    return { score: 0 };
  }

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    let maxScore = -Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      board[move] = aiPlayer;
      const result = minimax(board, depth + 1, false, aiPlayer, humanPlayer);
      board[move] = null;

      if (result.score > maxScore) {
        maxScore = result.score;
        bestMove = move;
      }
    }
    return { score: maxScore, bestMove };
  } else {
    let minScore = Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      board[move] = humanPlayer;
      const result = minimax(board, depth + 1, true, aiPlayer, humanPlayer);
      board[move] = null;

      if (result.score < minScore) {
        minScore = result.score;
        bestMove = move;
      }
    }
    return { score: minScore, bestMove };
  }
}

export function getAIMove(board: CellValue[], aiPlayer: Player, difficulty: 'easy' | 'hard'): number {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return -1;

  if (difficulty === 'easy') {
    // 70% random move, 30% smart move
    if (Math.random() < 0.7) {
      const randomIndex = Math.floor(Math.random() * availableMoves.length);
      return availableMoves[randomIndex];
    }
  }

  const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';
  const result = minimax(board, 0, true, aiPlayer, humanPlayer);
  return result.bestMove !== undefined ? result.bestMove : availableMoves[0];
}
