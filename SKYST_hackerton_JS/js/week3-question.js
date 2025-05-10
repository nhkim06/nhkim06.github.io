document.getElementById("submit").addEventListener("click", () => {
  const answer = document.getElementById("answer").value.trim();

  if (!answer) {
    alert("답변을 입력해주세요!");
    return;
  }

  localStorage.setItem("answer3", answer);
  localStorage.setItem("scene", "4");

  alert("답변이 저장되었습니다! 메인 화면으로 이동합니다.");
  window.location.href = "main.html";
});