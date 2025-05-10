const dialogBox = document.getElementById("dialog-box");
const bgm = document.getElementById("bgm");

const dialogs = [
  "신해철 > 당신의 꿈을 알려주세요."
];

let currentIndex = 0;
let charIndex = 0;
let typingInterval = null;
let isTyping = false;

function typeText(text) {
  dialogBox.textContent = "";
  charIndex = 0;
  isTyping = true;

  // 話し始めたらBGM再生
  bgm.currentTime = 0;
  bgm.play();

  typingInterval = setInterval(() => {
    dialogBox.textContent += text.charAt(charIndex);
    charIndex++;

    if (charIndex >= text.length) {
      clearInterval(typingInterval);
      isTyping = false;
      bgm.pause(); // タイピング終了時にBGM停止
    }
  }, 50);
}

function nextDialog() {
  if (isTyping) {
    clearInterval(typingInterval);
    dialogBox.textContent = dialogs[currentIndex - 1];
    isTyping = false;
    bgm.pause(); // タイピング飛ばし時も止める
    return;
  }

  if (currentIndex < dialogs.length) {
    const currentText = dialogs[currentIndex];
    currentIndex++;
    typeText(currentText);
  } else {
    dialogBox.textContent = "";
  }
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    nextDialog();
  }
});

