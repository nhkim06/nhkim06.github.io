document.getElementById("submit").addEventListener("click", () => {
  const answer = document.getElementById("answer").value.trim();

  if (!answer) {
    alert("답변을 입력해주세요!");
    return;
  }

  // 답변 저장
  localStorage.setItem("answer1", answer);

  // scene 값을 2로 저장
  localStorage.setItem("scene", "2");

  // 저장 완료 메시지 출력 후 메인 화면으로 이동
  alert("답변이 저장되었습니다!");
  window.location.href = "main.html";
});