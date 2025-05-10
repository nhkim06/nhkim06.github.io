const gameArea = document.getElementById("game-area");
const piano = document.getElementById("piano");
const scoreDisplay = document.getElementById("score-display");
const bgm = document.getElementById("bgm");
const nextBtn = document.getElementById("next-button");

const applause = new Audio("assets/applause.mp3");
const boo = new Audio("assets/boo.mp3");

let score = 0;
let combo = 0;
let missStreak = 0;
let gameStarted = false;
let freeze = false;
let gameOverTriggered = false;

const message = document.createElement("div");
message.style.position = "absolute";
message.style.top = "10%";
message.style.left = "50%";
message.style.transform = "translateX(-50%)";
message.style.fontSize = "48px";
message.style.fontWeight = "bold";
message.style.color = "white";
message.style.zIndex = "20";
message.style.display = "none";
message.dataset.shown = "false";
document.body.appendChild(message);

function showMessage(text, duration) {
  if (freeze) return;
  message.innerHTML = `<div>${text}</div>`;
  message.style.display = "block";
  setTimeout(() => {
    if (!freeze) message.style.display = "none";
  }, duration);
}

function showGameOverMessage(isTimeout = false) {
  if (message.dataset.shown === "true") return;
  message.dataset.shown = "true";
  gameOverTriggered = true;

  const isSuccess = score >= 50;
  message.style.top = "10%";
  message.style.color = isSuccess ? "lightgreen" : "red";
  message.style.backgroundColor = "black";
  message.style.padding = "20px";
  message.style.borderRadius = "12px";
  message.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
  message.style.textAlign = "center";

  let html = "";
  if (!isTimeout) html += `<div>GAME OVER</div>`;
  html += `
    <div style="font-size: 32px; margin-top: 20px;">Final Score: ${score}</div>
    <div style="font-size: 28px; margin-top: 10px;">
      ${isSuccess ? 'Success!' : 'Fail...'}
    </div>
  `;

  message.innerHTML = html;
  message.style.display = "block";

  document.querySelectorAll(".note").forEach(note => {
    note.style.animationPlayState = "paused";
  });

  bgm.pause();
  bgm.currentTime = 0;

  if (isSuccess) {
    applause.play();
    confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
    nextBtn.style.display = "block";
  } else {
    boo.play();
  }
}

nextBtn.onclick = () => {
  window.location.href = "next.html";
};

const keyToIndex = { a: 0, s: 1, d: 2, f: 3, j: 4, k: 5, l: 6 };
const notePositions = [
  "calc(50% - 180px)",
  "calc(50% - 130px)",
  "calc(50% - 80px)",
  "calc(50% - 30px)",
  "calc(50% + 20px)",
  "calc(50% + 70px)",
  "calc(50% + 120px)"
];

function updateScoreDisplay() {
  scoreDisplay.textContent = `Score: ${score}`;
}

function spawnNote() {
  if (!gameStarted || freeze) return;
  const index = Math.floor(Math.random() * 7);
  const note = document.createElement("div");
  note.classList.add("note");

  let left = notePositions[index];
  if (index === 0) left = "calc(50% - 170px)";
  else if (index === 2) left = "calc(50% - 90px)";
  else if (index === 5) left = "calc(50% + 80px)";
  note.style.left = left;
  note.style.backgroundColor = index >= 4 ? "blue" : "red";
  note.dataset.index = index;
  note.dataset.hit = "false";
  note.textContent = (index + 1).toString();
  gameArea.appendChild(note);

  setTimeout(() => {
    if (note.dataset.hit === "false") {
      if (freeze) return;
      note.dataset.hit = "true";
      note.style.opacity = "0.5";
      combo = 0;
      missStreak++;
      score -= 10;
      updateScoreDisplay();
      showMessage("MISS", 800);
      note.remove();
      if (missStreak >= 5) {
        freeze = true;
        clearInterval(spawnInterval);
        showGameOverMessage(false);
      }
    }
  }, 3100);
}

let spawnInterval;
function startGame() {
  showMessage("Get Ready...", 5000);
  setTimeout(() => {
    gameStarted = true;
    spawnInterval = setInterval(spawnNote, 1000);
  }, 5000);
}

document.addEventListener("keydown", (e) => {
  if (!gameStarted && e.key === "Enter") {
    bgm.volume = 1.0;
    bgm.play().catch(err => console.warn("음악 자동 재생 차단됨", err));
    startGame();
    return;
  }

  if (!gameStarted || freeze) return;
  const key = e.key.toLowerCase();
  if (!keyToIndex.hasOwnProperty(key)) return;
  const index = keyToIndex[key];
  const pianoRect = piano.getBoundingClientRect();
  const top = pianoRect.top;
  const bottom = pianoRect.bottom;

  const notes = Array.from(document.querySelectorAll(".note"))
    .filter(n => Number(n.dataset.index) === index && n.dataset.hit === "false")
    .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);

  if (notes.length > 0) {
    const note = notes[0];
    const r = note.getBoundingClientRect();
    if (r.top >= top && r.bottom <= bottom) {
      note.dataset.hit = "true";
      note.style.backgroundColor = "green";
      combo++;
      missStreak = 0;
      score += combo % 5 === 0 ? 30 : 10;
      showMessage(combo % 5 === 0 ? "COMBO!!" : "GOOD", combo % 5 === 0 ? 1500 : 800);
    } else {
      note.dataset.hit = "true";
      note.style.opacity = "0.5";
      combo = 0;
      missStreak++;
      score -= 10;
      showMessage("MISS", 800);
    }
    updateScoreDisplay();
    setTimeout(() => note.remove(), 200);
  } else {
    combo = 0;
    missStreak++;
    score -= 10;
    updateScoreDisplay();
    showMessage("MISS", 800);
  }

  if (missStreak >= 5) {
    freeze = true;
    clearInterval(spawnInterval);
    showGameOverMessage(false);
  }
});

bgm.addEventListener("ended", () => {
  if (!gameOverTriggered) {
    freeze = true;
    clearInterval(spawnInterval);
    showGameOverMessage(true);
  }
});