console.log("✅ op.js loaded");

const dialogBox = document.getElementById("dialog-box");
const bgm = document.getElementById("bgm");

const dialogs = [
  "엄마 > 음악 따위는 하지 말고 공부나 열심히 해라.",
  "신해철 > ...알겠습니다."
];

let currentIndex = 0;
let charIndex = 0;
let typingInterval = null;
let isTyping = false;

function typeText(text) {
  dialogBox.textContent = "";
  charIndex = 0;
  isTyping = true;
  bgm.currentTime = 0;
  bgm.play();

  typingInterval = setInterval(() => {
    dialogBox.textContent += text.charAt(charIndex);
    charIndex++;
    if (charIndex >= text.length) {
      clearInterval(typingInterval);
      isTyping = false;
      bgm.pause();
    }
  }, 50);
}

function nextDialog() {
  if (isTyping) {
    clearInterval(typingInterval);
    dialogBox.textContent = dialogs[currentIndex - 1];
    isTyping = false;
    bgm.pause();
    return;
  }

  if (currentIndex < dialogs.length) {
    const currentText = dialogs[currentIndex];
    currentIndex++;
    typeText(currentText);
  } else {
    goToNextPage();
  }
}

function goToNextPage() {
  if (currentIndex >= dialogs.length) {
    localStorage.setItem("scene", "3"); // ✅ scene 갱신
    window.location.href = "quiz.html";
  }
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    nextDialog();
  }
});
