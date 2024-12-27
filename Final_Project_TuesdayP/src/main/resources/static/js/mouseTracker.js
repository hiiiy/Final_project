// DOMContentLoaded 이벤트로 DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    if (!window.currentUser) {
        console.error('currentUser is not defined!');
        return;
    }

    const { userId, username: userName, profileColor } = window.currentUser;

    console.log(`User ID: ${userId}, User Name: ${userName}`);

    // WebSocket 설정
    const socket = new SockJS('/ws');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
        console.log(`Connected as ${userName} (${userId})`);

        // WebSocket 메시지 수신
        stompClient.subscribe('/topic/mouse/position', (message) => {
            const { userId: senderId, userName: senderName, profileColor: senderColor, x, y } = JSON.parse(message.body);

            if (senderId === window.currentUser.userId) return; // 자신의 메시지는 무시

            const centerContent = document.getElementById('center-content');
            if (!centerContent) {
                console.error('#center-content element not found!');
                return;
            }

            const bounds = centerContent.getBoundingClientRect();

            // center-content 내부 좌표 계산
            const relativeX = x - bounds.left;
            const relativeY = y - bounds.top;

            if (relativeX >= 0 && relativeX <= bounds.width && relativeY >= 0 && relativeY <= bounds.height) {
                let cursor = document.getElementById(`cursor-${senderId}`);
                if (!cursor) {
                    // 커서 요소 생성
                    cursor = document.createElement('div');
                    cursor.id = `cursor-${senderId}`;
                    cursor.className = 'remote-cursor';
                    cursor.style.color = senderColor; // 사용자 색상 반영

                    // 사용자 이름 추가
                    const label = document.createElement('div');
                    label.className = 'cursor-label';
                    label.innerText = senderName;
                    label.style.backgroundColor = senderColor; // 사용자 색상 반영
                    cursor.appendChild(label);

                    centerContent.appendChild(cursor);
                }

                // 커서 위치 업데이트
                cursor.style.left = `${relativeX}px`;
                cursor.style.top = `${relativeY}px`;
                cursor.style.display = 'block';
            } else {
                // center-content 밖이면 커서 숨김
                const cursor = document.getElementById(`cursor-${senderId}`);
                if (cursor) {
                    cursor.style.display = 'none';
                }
            }
        });

        // 마우스 움직임 감지 및 서버로 전송
        document.addEventListener('mousemove', (event) => {
            const bounds = document.getElementById('center-content').getBoundingClientRect();
            const message = {
                userId: userId,
                userName: userName,
                profileColor: profileColor,
                x: event.clientX,
                y: event.clientY,
            };
            stompClient.send('/app/mouse/move', {}, JSON.stringify(message));
        });
    });
});


// Throttle 함수
function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = new Date().getTime();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func(...args);
        }
    };
}
