/**
 * 비어있는 칸 중에서 무작위로 하나를 선택하여 반환합니다.
 * @param {Array} board 현재 게임판 상태
 * @returns {number|null} 선택된 인덱스 또는 null
 */

/* 난이도 'normal'에서 사용할 AI 로직
  1. 플레이어가 이길 수 있으면 막는다
  나머지는 랜덤
*/

import { winPatterns } from './game.js';
import { findWinningMove } from './ai_hard.js';

export function getNormalMove(board) {
  const human = 'X';

  const availableIndices = board
    .map((cell, idx) => (cell === '' ? idx : null))
    .filter((idx) => idx !== null);

  if (availableIndices.length === 0) return null;

  let move = findWinningMove(board, human);
  if (move !== null) return move;

  const randomIndex = Math.floor(Math.random() * availableIndices.length);
  return availableIndices[randomIndex];
}
