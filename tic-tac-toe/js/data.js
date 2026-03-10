export let availableQuizzes = [];

const typeLabels = {
  multiple_choice: '객관식',
  ox: 'OX 퀴즈',
  short_answer: '단답형',
};

// 1. JSON 데이터 읽기 및 셔플
export async function fetchQuizzes() {
  try {
    const response = await fetch('../data/quiz.json');
    const data = await response.json();
    // 데이터를 무작위로 섞어서 저장
    availableQuizzes = data.quizzes.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error('데이터 로드 실패:', error);
  }
}

// 2. 퀴즈 모달 열기
export function openQuizModal(index, callback) {
  if (availableQuizzes.length === 0) {
    // 퀴즈를 모두 소모했을 경우 다시 로드하거나 처리
    fetchQuizzes().then(() => {
      if (availableQuizzes.length > 0) openQuizModal(index, callback);
    });
    return;
  }

  const currentQuiz = availableQuizzes.pop();
  const optionsContainer = document.getElementById('quiz-options');
  const quizModal = document.getElementById('quiz-modal');

  // UI 요소 텍스트 설정
  document.getElementById('quiz-subject').textContent =
    currentQuiz.subject || '일반';
  document.getElementById('quiz-type').textContent =
    typeLabels[currentQuiz.type] || '퀴즈';
  document.getElementById('quiz-question').textContent = currentQuiz.question;

  if (optionsContainer) {
    optionsContainer.innerHTML = '';

    // 보기 버튼 생성 (객관식/OX) 또는 주관식 입력창 생성
    if (currentQuiz.options && currentQuiz.options.length > 0) {
      currentQuiz.options.forEach((option) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = option;
        btn.onclick = () => handleAnswer(option, currentQuiz, callback);
        optionsContainer.appendChild(btn);
      });
    } else {
      renderShortAnswerInput(currentQuiz, callback);
    }
  }

  if (quizModal) quizModal.style.display = 'flex';
}

// 3. 주관식 입력창 렌더링
function renderShortAnswerInput(quiz, callback) {
  const container = document.getElementById('quiz-options');

  const input = document.createElement('input');
  input.id = 'quiz-answer-input';
  input.className = 'quiz-answer-input';
  input.placeholder = '정답 입력';
  input.autocomplete = 'off'; // 자동완성 끄기

  const submitBtn = document.createElement('button');
  submitBtn.className = 'quiz-option-btn';
  submitBtn.textContent = '확인';

  // 엔터키 지원
  input.onkeypress = (e) => {
    if (e.key === 'Enter') handleAnswer(input.value, quiz, callback);
  };

  submitBtn.onclick = () => handleAnswer(input.value, quiz, callback);

  container.appendChild(input);
  container.appendChild(submitBtn);
  input.focus();
}

// 4. 정답 확인 및 결과 전달
function handleAnswer(userAnswer, quiz, callback) {
  closeModal();
  const isCorrect = checkCorrect(userAnswer, quiz);

  // game.js의 nextTurn(isCorrect, index)으로 결과를 돌려줌
  if (callback) callback(isCorrect);
}

// 정답 검증 로직
function checkCorrect(userAnswer, quiz) {
  const normUser = normalizeAnswer(userAnswer);
  const normCorrect = normalizeAnswer(quiz.answer);

  // 기본 정답 비교
  const isAnswerMatch = normUser === normCorrect;

  // 키워드 비교 (주관식 대비)
  const isKeywordMatch = quiz.keywords?.some(
    (k) => normUser === normalizeAnswer(k),
  );

  return isAnswerMatch || isKeywordMatch;
}

// 문자열 정규화 (공백 제거, 소문자화)
function normalizeAnswer(text) {
  return String(text ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

function closeModal() {
  const modal = document.getElementById('quiz-modal');
  if (modal) modal.style.display = 'none';
}
