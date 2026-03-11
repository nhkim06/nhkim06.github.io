import { fetchQuizzes, openQuizModal } from './data.js';
import { getEasyMove } from './ai_easy.js';
import { getNormalMove } from './ai_normal.js';
import { getHardMove } from './ai_hard.js';

// 1. 상수 및 DOM 요소 캐싱
export const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const cells = [...document.querySelectorAll('.cell')];
const playerIcon = document.getElementById('playerIcon');
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const endingSound = document.getElementById('endingSound');

// 엔딩 모달 관련 요소
const endModal = document.getElementById('game-end-modal');
const restartBtn = document.getElementById('restartBtn');
const endModalTitle = document.getElementById('end-modal-title');
const endModalContent = document.getElementById('end-modal-content');
const difficultymodal = document.getElementById('difficulty-modal');

// 2. 게임 상태
let audioUnlocked = false;
export let gameState = {
  board: JSON.parse(localStorage.getItem('board')) || Array(9).fill(''),
  currentPlayer: 'X', // 'X': 짱구, 'O': 철수
  isGameOver: false,
};

// 난이도 설정 (URL이 'undefined' 문자열이면 무시하고 localStorage 사용)
const DIFFICULTY_KEY = 'tttDifficulty';
const VALID_LEVELS = ['easy', 'normal', 'hard'];
const getDifficulty = () => {
  const url = new URL(window.location.href);
  const fromUrl = url.searchParams.get('difficulty');
  const fromStorage = localStorage.getItem(DIFFICULTY_KEY);
  if (fromUrl && fromUrl !== 'undefined' && VALID_LEVELS.includes(fromUrl)) {
    return fromUrl;
  }
  if (fromStorage && VALID_LEVELS.includes(fromStorage)) return fromStorage;
  return 'easy';
};
const difficulty = getDifficulty();

// 3. 게임 엔진 함수
async function initGame() {
  await fetchQuizzes();
  renderBoard();
  setTurn(gameState.currentPlayer);
}

export function renderBoard() {
  gameState.board.forEach((value, index) => {
    if (value === 'X') {
      cells[index].innerHTML =
        '<img src="../assets/images/player0_mark.png" class="cell-mark">';
    } else if (value === 'O') {
      cells[index].innerHTML =
        '<img src="../assets/images/player1_mark.png" class="cell-mark">';
    } else {
      cells[index].innerHTML = ``;
    }
  });
}

function animatePlacedCell(index) {
  const cell = cells[index];
  if (!cell) return;
  cell.classList.remove('cell-placed');
  // 강제로 리플로우를 발생시켜 연속 착수 시에도 애니메이션이 다시 재생되도록 처리
  void cell.offsetWidth;
  cell.classList.add('cell-placed');
}

export function setTurn(turn) {
  gameState.currentPlayer = turn;
  const isPlayer = turn === 'X';

  document
    .querySelector('.character-left')
    ?.classList.toggle('is-active', isPlayer);
  document
    .querySelector('.character-right')
    ?.classList.toggle('is-active', !isPlayer);

  const turnText = document.querySelector('.turn-text');
  if (turnText) turnText.textContent = isPlayer ? '짱구의 차례' : '철수의 차례';

  if (playerIcon) {
    playerIcon.src = `../assets/images/player${isPlayer ? 0 : 1}_mark.png`;
  }
}

// 4. 핵심 게임 로직 (alert 제거 및 모달 연결)
export function nextTurn(isCorrect, index) {
  if (isCorrect) {
    gameState.board[index] = gameState.currentPlayer;
    renderBoard();
    animatePlacedCell(index);
    saveToLocalStorage();
    correctSound?.play();

    if (checkWinner()) {
      endGame(gameState.currentPlayer === 'X' ? 'player' : 'cpu');
      return;
    }
    if (checkDraw()) {
      endGame('draw');
      return;
    }
  } else {
    wrongSound?.play();
    // alert('오답입니다! 다음 기회에 도전하세요.');
  }

  const nextPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
  setTurn(nextPlayer);

  if (gameState.currentPlayer === 'O' && !gameState.isGameOver) {
    setTimeout(triggerAiTurn, 1800);
  }
}

function triggerAiTurn() {
  if (gameState.isGameOver) return;

  let aiIndex = null;

  if (difficulty === 'hard') {
    aiIndex = getHardMove(gameState.board);
  } else if (difficulty === 'normal') {
    const aiBoard = gameState.board.map((cell) => {
      if (cell === 'X') return 'X';
      if (cell === 'O') return 'O';
      return '';
    });

    aiIndex = getNormalMove(aiBoard);
  } else {
    aiIndex = getEasyMove(gameState.board);
  }
  if (aiIndex !== null) nextTurn(true, aiIndex);
}

function endGame(result) {
  gameState.isGameOver = true;
  localStorage.removeItem('board');
  setTimeout(() => openGameEnding(result), 300);
}

function openGameEnding(result) {
  endingSound?.play();
  endModalContent.innerHTML = ''; // 초기화

  if (endModal) {
    endModal.classList.add('is-open');
  }
  if (result === 'draw') {
    endModalContent.className = 'draw';
    endModalContent.innerHTML = `
      <img src="../assets/images/player0.png" class="img-size move">
      <img src="../assets/images/player1.png" class="img-size move">`;
    endModalTitle.innerText = 'DRAW';
  } else {
    const isPlayer = result === 'player';
    const srcUrl = isPlayer
      ? '../assets/images/player0.png'
      : '../assets/images/player1.png';
    const text = isPlayer
      ? `히히~ 어때? <br>역시 짱구지!`
      : `후훗, <br>예상한 결과야.`;

    endModalContent.className = 'win';
    endModalContent.innerHTML = `
      <img class="move img-size" src="${srcUrl}"> 
      <div id="result-text-div"><p id="result-text">${text}</p></div>`;
    endModalTitle.innerText = isPlayer ? '짱구 승리!' : '철수 승리!';
  }
}

// 5. 이벤트 리스너
cells.forEach((cell, index) => {
  cell.addEventListener('click', () => {
    if (
      gameState.board[index] !== '' ||
      gameState.isGameOver ||
      gameState.currentPlayer !== 'X'
    )
      return;
    openQuizModal(index, (isCorrect) => nextTurn(isCorrect, index));
  });
});

// 5. 이벤트 리스너 - 다시하기 버튼 클릭 시
restartBtn?.addEventListener('click', () => {
  // 1. 현재 열려있는 엔딩 모달을 닫습니다.
  if (endModal) {
    endModal.classList.remove('is-open');
  }

  // 2. 난이도 선택 모달을 띄웁니다.
  if (difficultymodal) {
    difficultymodal.style.display = 'flex'; // 오버레이 표시
  }
});

document.querySelectorAll('.difficulty-button').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const level = e.target.dataset.level;
    if (!level) return;
    localStorage.setItem('tttDifficulty', level); // 선택한 난이도 저장
    localStorage.removeItem('board'); // 기존 게임판 데이터 삭제
    // URL 쿼리를 새 난이도로 바꾼 뒤 새로고침 (이전 difficulty가 URL에 남아 있으면 그게 우선 적용되므로)
    const url = new URL(window.location.href);
    url.searchParams.set('difficulty', level);
    window.location.href = url.toString();
  });
});

document
  .getElementById('difficulty-close-btn')
  ?.addEventListener('click', () => {
    if (difficultymodal) difficultymodal.style.display = 'none';
  });

document.getElementById('resetBtn')?.addEventListener('click', () => {
  localStorage.removeItem('board');
  window.location.reload();
});

// 오디오 잠금 해제
document.addEventListener(
  'click',
  () => {
    if (!audioUnlocked) {
      new Audio().play().catch(() => {});
      audioUnlocked = true;
    }
  },
  { once: true },
);

export function checkWinner() {
  return winPatterns.some(
    ([a, b, c]) =>
      gameState.board[a] &&
      gameState.board[a] === gameState.board[b] &&
      gameState.board[a] === gameState.board[c],
  );
}

export function checkDraw() {
  return gameState.board.every((cell) => cell !== '');
}
export function saveToLocalStorage() {
  localStorage.setItem('board', JSON.stringify(gameState.board));
}

document.addEventListener('DOMContentLoaded', initGame);
