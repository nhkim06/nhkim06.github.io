document.getElementById("submit").addEventListener("click", () => {
  const answer = document.getElementById("answer").value.trim();

  if (!answer) {
    alert("답변을 입력해주세요!");
    return;
  }

  // 답변 저장
  localStorage.setItem("answer2", answer);

  // scene 값을 3으로 설정
  localStorage.setItem("scene", "3");

  alert("답변이 저장되었습니다! 메인 화면으로 이동합니다.");
  window.location.href = "main.html";
});