export function initializeMouseTracking(currentUser) {
	const mainContainer  = document.querySelector('.main-container'); // main-container 가져오기
	const excludedElements = ['.team-status', '#chat-container', 'header']; // 제외할 요소들에 '#chat-container' 추가

    const socket = new SockJS('/ws');
    const stompClient = Stomp.over(socket);

	stompClient.debug = null;

    stompClient.connect({}, function () {
        console.log("WebSocket connected");

        // 다른 사용자들의 마우스 위치 수신
        stompClient.subscribe('/topic/mouse', (message) => {
            const data = JSON.parse(message.body);

            // 자신의 메시지는 무시
            if (data.userId === currentUser.userId) {
                return;
            }
            // 상대방 커서 업데이트
			updateMouseCursor(data, mainContainer); // mainContainer 전달
        });

        // 자신의 마우스 움직임 전송
        document.addEventListener('mousemove', (event) => {
			// 마우스 이벤트 필터링
			if (shouldIgnoreMouseEvent(event, excludedElements)) {
			    return;
			}
			
			const rect = mainContainer.getBoundingClientRect();
            const mousePosition = {
                x: event.clientX,
                y: event.clientY,
                userId: currentUser.userId,
                username: currentUser.username,
                color: currentUser.profileColor
            };
            stompClient.send("/app/mouse", {}, JSON.stringify(mousePosition));
        });
    });
}

// 특정 요소 위에서는 마우스 이벤트를 무시
function shouldIgnoreMouseEvent(event, excludedSelectors) {
    return excludedSelectors.some((selector) => {
        const element = document.querySelector(selector);
        return element && element.contains(event.target); // 해당 요소 내에 마우스가 있는지 확인
    });
}

function updateMouseCursor(data, mainContainer) {
    let cursor = document.getElementById(`cursor-${data.userId}`);
    if (!cursor) {
        // 커서 요소 생성
        cursor = document.createElement('div');
        cursor.id = `cursor-${data.userId}`;
        cursor.style.position = 'absolute';
        cursor.style.zIndex = '1000';
        cursor.style.display = 'flex';
        cursor.style.alignItems = 'center';

        const nameTag = document.createElement('span');
        nameTag.innerText = data.username;
        nameTag.style.whiteSpace = 'nowrap';
        nameTag.style.backgroundColor = '#fff';
        nameTag.style.padding = '2px 4px';
        nameTag.style.borderRadius = '3px';
        nameTag.style.fontSize = '10px';
        nameTag.style.boxShadow = '0 0 2px rgba(0,0,0,0.5)';
        cursor.appendChild(nameTag);

        mainContainer.appendChild(cursor); // main-container 내에 추가
    }

    // mainContainer의 위치 보정
    const rect = mainContainer.getBoundingClientRect();
    const adjustedX = data.x - rect.left + mainContainer.scrollLeft;
    const adjustedY = data.y - rect.top + mainContainer.scrollTop;

    // 커서 위치 업데이트
    cursor.style.transform = `translate(${adjustedX}px, ${adjustedY}px)`;
}

// 동적으로 커서 이미지를 생성
function generateCursorImage(color) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = '/images/cursor-image.png'; // 기본 커서 이미지 경로

        img.onload = () => {
            // 캔버스 생성
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            // 원본 이미지 그리기
            ctx.drawImage(img, 0, 0);

            // 색상 오버레이
            ctx.globalCompositeOperation = 'source-atop'; // 기존 이미지에 색상을 덧씌움
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 캔버스를 데이터 URL로 변환
            resolve(canvas.toDataURL('image/png'));
        };
    });
}


