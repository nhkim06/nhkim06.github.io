// 1. 요소 선택
const ruleBtn = document.getElementById('rule-btn');
const modal = document.getElementById('rule-modal');
const closeBtn = document.getElementById('close-btn');
const menuBtns = document.querySelectorAll('.menu > ul > li');

const startBtn = document.querySelector('#start');

const difficultyModal = document.getElementById('difficulty-modal');
const difficultyCloseBtn = document.getElementById('difficulty-close-btn');
const difficultyButtons = document.querySelectorAll('.difficulty-button');

menuBtns.forEach((btn) => {
    // 마우스를 올렸을 때
    btn.addEventListener('mouseenter', () => {
        gsap.to(btn, {
            '--bg-height': '100%', // CSS 변수 값을 100%로
            duration: 0.4,
            ease: 'power2.out',
        });
    });

    // 마우스를 뗐을 때
    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
            '--bg-height': '0%', // 다시 0%로
            duration: 0.3,
            ease: 'power2.in',
        });
    });
});

// 2. 모달 열기/닫기 로직
ruleBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    gsap.fromTo(
        '.rule-board',
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
    );
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
    if (e.target === difficultyModal) {
        difficultyModal.style.display = 'none';
    }
});

closeBtn.addEventListener('mouseenter', () => {
    gsap.to(closeBtn, {
        scale: 1.5, // 1.5배 크기로
        duration: 0.4,
        ease: 'back.out(1.7)', // 쫀득한 탄성
        color: '#555', // 색상 변경
    });
});

closeBtn.addEventListener('mouseleave', () => {
    gsap.to(closeBtn, {
        scale: 1, // 원래 크기로
        duration: 0.3,
        ease: 'power2.out',
        color: '#111',
    });
});

startBtn.addEventListener('click', (e) => {
    e.preventDefault();
    difficultyModal.style.display = 'flex';
});

difficultyCloseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    difficultyModal.style.display = 'none';
});
if (difficultyButtons.length > 0) {
    difficultyButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const level = btn.dataset.level;
            if (!level) return;

            try {
                localStorage.setItem('tttDifficulty', level);
            } catch (e) {}

            // GSAP 애니메이션 시작
            gsap.to('.col', {
                duration: 0.6,
                opacity: 1,
                scale: 1.1,
                stagger: {
                    grid: [16, 16],
                    from: 'random', // 랜덤하게 픽셀이 채워짐
                    amount: 0.8, // 전체 애니메이션 시간
                },
                ease: 'power2.inOut',
                onComplete: (selectedLevel) => {
                    // 애니메이션이 끝나면 페이지 이동
                    window.location.href = `./game?difficulty=${encodeURIComponent(selectedLevel)}`;
                },
            });
        });
    });
}
