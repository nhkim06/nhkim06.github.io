const quizData = [
    {
    question: "a = -2, b = 3일 때, a^2 - ab + b^2의 값은?",
    options: [
        "7",
        "13",
        "19",
        "25",
        "31"
    ],
    answer: 2
    },
    {
    question: "다음 중 문법적으로 가장 어색한 문장은?",
    options: [
        "She enjoys listening to music in her free time.",
        "He is looking forward to go on vacation next month.",
        "They have lived in this city for more than ten years.",
        "If I had known you were coming, I would have baked a cake.",
        "The movie, which was directed by a famous director, received great reviews."
    ],
    answer: 1
    },
    {
    question: "다음 중 밑줄 친 단어의 품사가 다른 하나는?",
    options: [
        "갑자기 비가 주룩주룩 내리기 시작했다.",
        "운동장에서 아이들이 신나게 뛰어놀고 있다.",
        "그는 모임에서 조용히 앉아 책을 읽었다.",
        "맛있는 빵 냄새가 솔솔 풍겨왔다.",
        "나는 어제 친구와 함께 영화를 보았다."
    ],
    answer: 4
    }
];

let currentIndex = 0;
let isQuizFinished = false;

const questionEl = document.querySelector("#quiz-question p");
const optionsEl = document.querySelectorAll("#quiz-options button");
const resultEl = document.querySelector("#quiz-result p");
const restartBtn = document.querySelector("#quiz-restart button");

function loadQuestion() {
  const currentQuiz = quizData[currentIndex];
  questionEl.textContent = currentQuiz.question;
  resultEl.textContent = "";
  optionsEl.forEach((btn, index) => {
    btn.textContent = currentQuiz.options[index];
    btn.className = "";
    btn.disabled = false;
  });
}

function checkAnswer(index) {
  const correct = quizData[currentIndex].answer;
  optionsEl.forEach((btn, i) => {
    btn.disabled = true;
    if (i === correct) {
      btn.classList.add("correct");
    } else if (i === index) {
      btn.classList.add("wrong");
    }
  });

  if (index === correct) {
    resultEl.textContent = "정답입니다!";
  } else {
    resultEl.textContent = "오답입니다!";
  }

  setTimeout(() => {
    currentIndex++;
    if (currentIndex < quizData.length) {
      loadQuestion();
    } else {
      showResult();
    }
  }, 1500);
}

function showResult() {
  isQuizFinished = true;
  questionEl.textContent = "퀴즈를 모두 완료했습니다!";
  optionsEl.forEach(btn => btn.style.display = "none");
  resultEl.textContent = "수고하셨습니다! 다시 시작하려면 아래 버튼을 누르세요.";
  restartBtn.style.display = "inline-block";
}

function restartQuiz() {
  currentIndex = 0;
  isQuizFinished = false;
  optionsEl.forEach(btn => {
    btn.style.display = "block";
  });
  restartBtn.style.display = "none";
  loadQuestion();
}

optionsEl.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    if (!isQuizFinished) checkAnswer(index);
  });
});

restartBtn.addEventListener("click", restartQuiz);

// 초기 상태
restartBtn.style.display = "none";
loadQuestion();
