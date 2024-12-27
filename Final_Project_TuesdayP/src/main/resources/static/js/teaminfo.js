export function initTeamInfo(projectId) {
    const socket = new SockJS('/ws');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function () {
        console.log('WebSocket 연결 성공');

        // 상태 업데이트 메시지 수신
        stompClient.subscribe('/topic/status', function () {
            refreshTeamStatus(projectId); // 전체 상태 새로고침
        });

        // 새 팀원 추가 메시지 수신
        stompClient.subscribe('/topic/team-update', function (message) {
            const newMember = JSON.parse(message.body);
            addNewTeamMember(newMember); // 새 팀원 추가
        });
    });
	
	// 특정 사용자의 상태를 업데이트하는 함수
	    function updateUserStatus(userId, status) {
	        const userElement = document.querySelector(`.profile-info[data-user-id="${userId}"]`);
	        if (userElement) {
	            const statusIndicator = userElement.querySelector('.status-indicator');
	            const statusText = userElement.querySelector('.status-text');

	            // 상태 아이콘 및 텍스트 업데이트
	            if (statusIndicator) {
	                statusIndicator.className = `status-indicator ${status}`;
	            }
	            if (statusText) {
	                statusText.textContent = status === 'active' ? '활동 중' : 
	                                         status === 'away' ? '자리 비움' : 
	                                         '오프라인';
	            }

	            // 데이터 속성 업데이트
	            userElement.setAttribute('data-status', status);

	            console.log(`사용자 ID ${userId} 상태가 ${status}로 업데이트되었습니다.`);
	        } else {
	            console.warn(`사용자 ID ${userId}에 해당하는 요소를 찾을 수 없습니다.`);
	        }
	    }
		
		// 새 팀원을 추가하는 함수
		  function addNewTeamMember(newMember) {
		      const teamMemberList = document.querySelector('.team-status ul');

		      if (teamMemberList) {
		          const newMemberElement = document.createElement('li');
		          newMemberElement.innerHTML = `
		              <div class="profile-info" data-user-id="${newMember.userId}" data-status="${newMember.status}">
		                  <div class="profile-photo">
		                      <div id="profilePhotoWrapper">
		                          <div class="profileInitial" style="background-color:${newMember.profileColor}">
		                              ${newMember.username.substring(0, 2)}
		                          </div>
		                          <div class="status-indicator ${newMember.status}" id="status-indicator-${newMember.userId}"></div>
		                      </div>
		                  </div>
		                  <div class="text-info">
		                      <span class="username">${newMember.username}</span>
		                      <span class="role">팀원</span>
		                      <span class="status-text">
		                          ${newMember.status === 'active' ? '활동 중' : (newMember.status === 'away' ? '자리 비움' : '오프라인')}
		                      </span>
		                  </div>
		              </div>
		          `;
		          teamMemberList.appendChild(newMemberElement);

		          console.log(`새 팀원 추가됨: ${newMember.username}`);
		      }
		  }

		function refreshTeamStatus(projectId) {
		    fetch(`/home/team-status?projectId=${projectId}`)
		        .then(response => response.text())
		        .then(html => {
		            const parser = new DOMParser();
		            const doc = parser.parseFromString(html, 'text/html');
		            const newTeamStatus = doc.querySelector('.team-status');

		            const teamStatusElement = document.querySelector('.team-status');
		            if (teamStatusElement && newTeamStatus) {
		                // 기존 .team-status 내부의 내용만 교체
		                teamStatusElement.innerHTML = newTeamStatus.innerHTML;
		            }
		        })
		        .catch(error => console.error('팀 상태 새로고침 중 오류:', error));
		}

}

window.addEventListener("beforeunload", function () {
    // 서버에 로그아웃 요청 전송
    navigator.sendBeacon('/user/logout-auto', JSON.stringify({
        userId: currentUser.userId
    }));
});

