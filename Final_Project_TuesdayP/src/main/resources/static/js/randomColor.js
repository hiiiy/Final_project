document.addEventListener("DOMContentLoaded", function () {
	
    // 랜덤 색상을 선택
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // 프로필 초기 배경색 설정
    const profileInitial = document.getElementById("profileInitial");
    if (profileInitial) {
        profileInitial.style.backgroundColor = randomColor;
    }
});
