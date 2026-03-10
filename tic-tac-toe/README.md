

# 🎮 짱구 vs 철수: 지식의 틱택토 (Tic-Tac-Toe Quiz Game)

> **To: 27회차(전공)_강태훈, 27회차(전공)_김나현, 27회차(전공)_김혜빈, 27회차(전공)_문수호, 27회차(전공)_최윤호** > 안녕하세요 팀원 여러분! 저희 팀 프로젝트의 전체적인 개발 기획안과 데이터 구조입니다. 본격적인 개발에 앞서 아래 내용을 확인해 주시고, 각자 맡고 싶은 파트나 의견 편하게 남겨주세요!

<br>

## 🛠 1. 개발 환경 및 협업 툴 (Tech Stack & Tools)

- **Language:** HTML5, CSS3, JavaScript (ES6+)
- **IDE:** VS Code (추천 확장 프로그램: Live Server, Prettier, ESLint)
- **Version Control:** Git & GitHub
  - **협업 전략:** `main` 브랜치에 직접 커밋하지 않고, 기능별 브랜치(`feature/ui-board`, `feature/logic-quiz` 등) 생성 후 PR(Pull Request)을 통해 병합
- **UI/UX Design:** Figma (화면 레이아웃 및 컴포넌트 사전 정의)
- **Management:** Notion (API 명세, 칸반 보드로 할 일 관리)

<br>

## 📂 2. 프로젝트 디렉토리 구조 (Directory Structure)
관심사 분리(Separation of Concerns) 원칙을 적용하여 파일을 나눕니다.

```text
ttt-project/
├── index.html           # 단일 페이지: 시작, 게임, 모달 화면 통합
├── css/
│   ├── reset.css        # 브라우저 기본 스타일 초기화
│   └── style.css        # 메인 디자인 및 애니메이션
├── js/
│   ├── data.js          # JSON 데이터 Fetch 및 퀴즈 출제 로직
│   ├── game.js          # 틱택토 승패 판별 및 턴 관리 로직
│   ├── ai.js            # CPU 철수의 착수 알고리즘
│   └── main.js          # DOM 이벤트 리스너 및 UI 업데이트 제어
├── data/
│   └── quiz.json        # 퀴즈 54문제 (객관식, OX, 주관식) 데이터
└── assets/
    ├── images/          # 짱구, 철수 얼굴, 배경 이미지
    └── sounds/          # (선택) 착수음, 정답/오답 효과음

```

## 🖥 3. UI/UX 화면 및 상태 흐름 (Flow)

페이지 이동 없이 CSS의 `display` 속성을 제어하여 화면을 전환하는 **SPA(Single Page Application)** 유사 방식을 적용합니다.

1. **시작 화면 (Intro State)**
* 배경: 짱구 테마 배경
* 버튼: `[게임 시작]`, `[규칙 설명]`
* 이벤트: 규칙 설명 클릭 시 `<dialog>` 팝업 노출. 시작 클릭 시 '게임 화면'으로 교체.


2. **게임 화면 (Game State)**
* 상단: 현재 턴 표시 (짱구 캐릭터 확대/진동 애니메이션 적용)
* 중앙: 3x3 틱택토 보드
* 이벤트: 빈칸 클릭 시 해당 칸 인덱스 기억 후 '퀴즈 모달' 호출.


3. **퀴즈 모달 (Quiz Modal State)**
* 화면 중앙에 문제와 선택지(or 입력창) 출력.
* **정답 시:** 모달 닫힘 ➡️ 기억해둔 칸에 짱구(Player) 착수 ➡️ 승리 체크 ➡️ 철수 턴
* **오답 시:** 모달 닫힘 ➡️ 빈칸 유지 ➡️ 철수 턴


4. **결과 모달 (Result Modal State)**
* 승/패/무 텍스트 + 표정 이미지 출력. `[다시 하기]` 클릭 시 변수 초기화 후 새 게임.



## 📊 4. 데이터 구조 및 흐름 (Data Structure & Flow)

### 4.1. 퀴즈 세트 원본 데이터 (JSON)

`data/quiz.json` 형식 (UI 렌더링 시 `type`으로 분기 처리)

```json
{
  "version": "1.0",
  "totalCount": 54,
  "quizzes": [
    {
      "id": 1,
      "subject": "HTML", 
      "type": "multiple_choice",
      "difficulty": "medium",
      "question": "HTML에서 하이퍼링크를 생성할 때 사용하는 태그는 무엇인가요?",
      "options": ["<link>", "<a>", "<href>", "<url>"],
      "answer": "<a>",
      "keywords": ["a", "anchor"],
      "explanation": "<a> 태그는 anchor의 약자로, 하이퍼링크를 만듭니다."
    }
  ]
}

```

### 4.2. 게임 상태 관리 (JS State Object)

`main.js` 최상단에 선언하여 전역 상태를 통합 관리합니다.

```javascript
const gameState = {
  // 1. 보드 상태 관리 (0~8 인덱스의 1차원 배열)
  board: Array(9).fill(null), 
  
  // 2. 턴 및 진행 상태 관리
  currentPlayer: 'player', 
  isGameOver: false,       
  selectedCellIndex: null, 
  
  // 3. 퀴즈 데이터 관리
  availableQuizzes: [],    
  currentQuiz: null,       
  
  // 4. 통계 
  score: { player: 0, cpu: 0, draws: 0 }
};

```

## 🧠 5. 핵심 알고리즘 및 구현 상세 (Algorithms)

### A. 퀴즈 랜덤 출제 알고리즘 (Fisher-Yates Shuffle)

```javascript
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

```

### B. 틱택토 승패 판별 로직

```javascript
const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // 가로
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // 세로
  [0, 4, 8], [2, 4, 6]             // 대각선
];

function checkWin(playerType) {
  return WINNING_COMBINATIONS.some(combination => {
    return combination.every(index => gameState.board[index] === playerType);
  });
}

```

### C. 철수(CPU) AI 알고리즘 (Rule-Based)

1. **우선순위 1 (방어):** 플레이어가 다음 턴에 이길 수 있는 자리 방어
2. **우선순위 2 (중앙):** 인덱스 4가 비어있다면 선점
3. **우선순위 3 (랜덤):** 남은 빈칸 중 무작위 착수



---
