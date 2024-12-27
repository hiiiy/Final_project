document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addUserForm");
    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("emailError");
    const emailSuccess = document.getElementById("emailSuccess");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const passwordError = document.getElementById("passwordError");

    let isEmailValid = false; // 이메일 유효성 상태를 저장
	
	// 이메일 입력 시 중복 확인
	emailInput.addEventListener("blur", () => {
	    const email = emailInput.value;
	    if (email) {
	        fetch(`/user/emailChk?email=${encodeURIComponent(email)}`)
	            .then((response) => response.json())
	            .then((data) => {
	                if (data.isDuplicate) {
	                    emailError.style.display = "block";
	                    emailSuccess.style.display = "none";
	                    isEmailValid = false; // 이메일이 중복됨
	                } else {
	                    emailError.style.display = "none";
	                    emailSuccess.style.display = "block";
	                    isEmailValid = true; // 이메일 사용 가능
	                }
	            })
	            .catch((error) => {
	                console.error("Error checking email:", error);
	            });
	    }
	});

    // 실시간 비밀번호 확인
    confirmPassword.addEventListener("keyup", () => {
        if (password.value !== confirmPassword.value) {
            passwordError.style.display = "block"; // 오류 메시지 표시
        } else {
            passwordError.style.display = "none"; // 오류 메시지 숨김
        }
    });

    // 폼 제출 시 추가 확인
    form.addEventListener("submit", (event) => {
        if (!isEmailValid) {
            event.preventDefault(); // 폼 제출 방지
            emailError.style.display = "block"; // 오류 메시지 표시
        }

        if (password.value !== confirmPassword.value) {
            event.preventDefault(); // 폼 제출 방지
            passwordError.style.display = "block"; // 오류 메시지 표시
        }
		


    });
});
