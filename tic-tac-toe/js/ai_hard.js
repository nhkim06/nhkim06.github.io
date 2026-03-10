/**
 * 비어있는 칸 중에서 무작위로 하나를 선택하여 반환합니다.
 * @param {Array} board 현재 게임판 상태
 * @returns {number|null} 선택된 인덱스 또는 null
 */

import { winPatterns } from './game.js';

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

export function getHardMove(board) {
  const ai = 'O';
  const human = 'X';

  const availableIndices = board
    .map((cell, idx) => (cell === '' ? idx : null))
    .filter((idx) => idx !== null);

  if (availableIndices.length === 0) return null;

  let move = findWinningMove(board, ai);
  if (move !== null) return move;

  move = findWinningMove(board, human);
  if (move !== null) return move;

  if (board[4] === '') return 4;

  const corners = [0, 2, 6, 8].filter((i) => board[i] === '');
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  const randomIndex = Math.floor(Math.random() * availableIndices.length);
  return availableIndices[randomIndex];
}
