/**
 * 비어있는 칸 중에서 무작위로 하나를 선택하여 반환합니다.
 * @param {Array} board 현재 게임판 상태
 * @returns {number|null} 선택된 인덱스 또는 null
 */

import { winPatterns } from './game.js';

export function getEasyMove(board) {
  const ai = 'O';
  const human = 'X';
  const availableIndices = board
    .map((cell, idx) => (cell === '' ? idx : null))
    .filter((idx) => idx !== null);

  if (availableIndices.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * availableIndices.length);
  return availableIndices[randomIndex];
}
