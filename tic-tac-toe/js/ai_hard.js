/**
 * 비어있는 칸 중에서 무작위로 하나를 선택하여 반환합니다.
 * @param {Array} board 현재 게임판 상태
 * @returns {number|null} 선택된 인덱스 또는 null
 */

import { winPatterns } from './game.js';

function checkWinner(board) {
  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (!board.includes('')) return 'tie';
  return null;
}

function minimax(board, depth, isMaximizing) {
  const winner = checkWinner(board);

  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (winner === 'tie') return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'O';
        let score = minimax(board, depth + 1, false);
        board[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'X';
        let score = minimax(board, depth + 1, true);
        board[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

export function getHardMove(board) {
  const ai = 'O';
  const human = 'X';

  let bestScore = -Infinity;
  let move = null;

  const emptyCells = board.filter((cell) => cell === '').length;
  if (emptyCells === 9) return 4;

  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = ai;
      let score = minimax(board, 0, false);
      board[i] = '';

      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  return move;
}

export function findWinningMove(board, player) {
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    const values = [board[a], board[b], board[c]];
    const playerCount = values.filter((v) => v === player).length;
    const emptyIndex = pattern.find((i) => board[i] === '');

    if (playerCount === 2 && emptyIndex !== undefined) {
      return emptyIndex;
    }
  }
  return null;
}
