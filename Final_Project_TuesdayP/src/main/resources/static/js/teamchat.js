export function initChat(projectId, currentUser) {
    // WebSocket 및 STOMP 클라이언트 초기화
    const socket = new SockJS('/ws');
    const stompClient = Stomp.over(socket);

    // HTML 요소 선택
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
	const chatContainer = document.getElementById('chat-container');
	const toggleButton = document.getElementById('toggle-chat');
	const chatNotification = document.getElementById('chat-notification');

	let isExpanded = true;
	let typingTimeout;

	
	// WebSocket 연결
	    stompClient.connect({}, () => {
	        console.log("WebSocket connected.");

	        // 서버에서 수신한 메시지를 처리
	        stompClient.subscribe(`/topic/chat/${projectId}`, (message) => {
	            const chatMessage = JSON.parse(message.body);
		
	            displayMessage(chatMessage);
	            if (!isExpanded) {
	                showNotification();
	            }	
	        });

	        // 이전 메시지 로드
	        fetch(`/api/chat/${projectId}`)
	            .then((response) => response.json())
	            .then((messages) => {
	                messages.forEach(displayMessage);
	            })
	            .catch((error) => console.error("Error loading chat messages:", error));
	    });
		
    // 메시지 전송 처리
    sendButton.addEventListener('click', () => {
        sendMessage();
    });

	chatInput.addEventListener('keydown', (event) => {
	    if (event.key === 'Enter') {
	        sendMessage();
	    }
	});


	// 채팅창 최소화/최대화 버튼 클릭 이벤트
	   toggleButton.addEventListener('click', () => {
	       isExpanded = !isExpanded;

	       if (isExpanded) {
	           chatContainer.classList.remove('chat-collapsed');
	           chatContainer.classList.add('chat-expanded');
	           toggleButton.textContent = '–';
	           hideNotification(); // 알림 숨기기
	       } else {
	           chatContainer.classList.remove('chat-expanded');
	           chatContainer.classList.add('chat-collapsed');
	           toggleButton.textContent = '+';
	       }
	   });
	
	// 알림 클릭 이벤트 (채팅창 열기)
	chatNotification.addEventListener('click', () => {
	    chatContainer.classList.remove('chat-collapsed');
	    chatContainer.classList.add('chat-expanded');
	    toggleButton.textContent = '–';
	    hideNotification();
	    isExpanded = true;
	});

    // 메시지 화면에 표시
	function displayMessage(chatMessage) {
	    const messageElement = document.createElement('div');
	    const currentUserId = Number(currentUser.userId);

	    // 본인 메시지
	    if (chatMessage.userId === currentUserId) {
	        messageElement.className = 'message-self'; // 본인 메시지 스타일
	        messageElement.textContent = chatMessage.message; // 이름 없이 메시지만 표시
	    } else {
	        // 상대방 메시지
	        messageElement.className = 'message-other'; // 상대 메시지 스타일
	        
	        // 이름과 메시지를 포함한 형식
	        const usernameElement = document.createElement('div');
	        usernameElement.className = 'username';
	        usernameElement.textContent = chatMessage.username; // 상대방 이름
	        
	        const textElement = document.createElement('div');
	        textElement.textContent = chatMessage.message; // 상대방 메시지

	        // 이름과 메시지를 함께 추가
	        messageElement.appendChild(usernameElement);
	        messageElement.appendChild(textElement);
	    }

	    // 메시지를 화면에 추가
	    chatMessages.appendChild(messageElement);
	    chatMessages.scrollTop = chatMessages.scrollHeight; // 자동 스크롤
	}

    // 메시지 전송
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') {
            return;
        }

        const chatMessage = {
            projectId: parseInt(projectId, 10),
            userId: parseInt(currentUser.userId, 10),
            username: currentUser.username,
            message: message,
			timestamp: new Date().toISOString()
        };

        stompClient.send(`/app/chat/send`, {}, JSON.stringify(chatMessage));
        console.log("Sent message:", chatMessage);

        chatInput.value = ''; // 입력 필드 초기화
    }
	
	// 알림 표시
	function showNotification() {
	    chatNotification.textContent = "새로운 메시지가 도착했습니다.";
	    chatNotification.classList.remove('hidden');
	    chatNotification.style.display = 'block';
		// 1초 뒤에 알림 숨기기
		setTimeout(() => {
		    hideNotification();
		}, 700); // 500ms = 0.7초
	}

	// 알림 숨기기
	function hideNotification() {
	    chatNotification.classList.add('hidden');
	    chatNotification.style.display = 'none';
	}
	
	function markMessageAsRead(messageId) {
	    fetch(`/api/chat/read/${messageId}`, {
	        method: 'POST'
	    })
	    .then(response => {
	        if (response.ok) {
	            console.log(`Message ${messageId} marked as read`);
	        } else {
	            console.error(`Failed to mark message ${messageId} as read`);
	        }
	    })
	    .catch(error => console.error('Error:', error));
	}
	
}

// 성공 메시지 처리 및 초대 버튼 이벤트 처리
document.addEventListener('DOMContentLoaded', () => {
    const successMessage = document.getElementById('inviteSuccessMessage');
    if (successMessage) {
        setTimeout(() => {
            successMessage.style.transition = 'opacity 0.5s';
            successMessage.style.opacity = '0';
            setTimeout(() => successMessage.remove(), 500);
        }, 2000);
    }

    const inviteButton = document.getElementById('inviteButton');
    if (inviteButton) {
        inviteButton.addEventListener('click', function () {
            const projectId = this.getAttribute('data-project-id');
            if (!projectId || projectId === "null") {
                alert('프로젝트 ID가 유효하지 않습니다.');
                return;
            }
            window.location.href = '/invitations/invite?projectId=' + projectId;
        });
    }
});
