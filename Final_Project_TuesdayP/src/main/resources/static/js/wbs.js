// 프로젝트 시작일 및 종료일 가져오기
let projectStartDate = document.getElementById('project-start-date').value;
let projectEndDate = document.getElementById('project-end-date').value;


console.log('프로젝트 시작일:', projectStartDate, '종료일:', projectEndDate);

let wbsChart;

let stompClient; // WebSocket 클라이언트

// WebSocket 연결 설정 및 실시간 업데이트 수신
function initializeWebSocket() {
    if (stompClient && stompClient.connected) {
        console.warn('WebSocket이 이미 연결되어 있습니다.');
        return;
    }

    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
        console.log('WebSocket 연결 성공');

        stompClient.subscribe('/topic/wbs-updates', (message) => {
            const data = JSON.parse(message.body);
            console.log('WebSocket 메시지 수신:', data);

            if (typeof data === 'number') {
                handleDeleteTask(data); // 삭제된 작업 처리
            } else {
                handleAddOrUpdateTask(data); // 추가 또는 수정된 작업 처리
            }
        });
    }, (error) => {
        console.error('WebSocket 연결 실패:', error);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await fetchWbsData(); // WBS 데이터 가져오기
        renderWbsTable(data); // 테이블 초기화
        initializeWebSocket(); // WebSocket 연결
        await initializeChartWithDynamicDates(); // 그래프 초기화
        updateChart(data); // 그래프 데이터 업데이트
        console.log('DOMContentLoaded 초기화 완료');
    } catch (error) {
        console.error('초기화 중 오류 발생:', error);
    }
});


// WBS 데이터를 가져와 테이블 렌더링
async function fetchWbsData() {
    const projectId = document.getElementById('project-id').value;

    try {
        const response = await fetch(`/api/wbs/${projectId}`);
        if (!response.ok) {
            throw new Error(`API 호출 실패: ${response.status}`);
        }

        const data = await response.json();
        if (!data || data.length === 0) {
            console.warn('WBS 데이터가 비어 있습니다.');
        } else {
            console.log('WBS 데이터:', data);
        }
        renderWbsTable(data);
        return data;
    } catch (error) {
        console.error('WBS 데이터를 가져오는 중 오류 발생:', error);
        return []; // 빈 배열 반환
    }
}

function transformDataForGantt(tasks) {
    return tasks.map((task) => ({
        x: [task.startDate, task.endDate], // 시작일과 종료일
        y: task.taskName, // 작업 이름
    }));
}



// WBS 테이블 렌더링
function renderWbsTable(data) {
    const tbody = document.querySelector('#wbs-table tbody');
    tbody.innerHTML = '';
    data.forEach(task => addWbsRow(task));
}

function formatTimestampToDate(timestamp) {
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0]; // yyyy-MM-dd 형식 반환
}


function addWbsRow(task) {
    const tbody = document.querySelector('#wbs-table tbody');
    const row = document.createElement('tr');
    row.id = `wbs-row-${task.id}`;

    row.innerHTML = `
        <td>${task.taskName || '없음'}</td>
        <td>${task.assignee || '미정'}</td>
        <td>${task.status || '미정'}</td>
        <td>${formatTimestampToDate(task.startDate) || '미정'}</td>
        <td>${formatTimestampToDate(task.endDate) || '미정'}</td>
        <td>
            <button onclick="openEditWbsModal(${task.id})">수정</button>
            <button onclick="deleteTask(${task.id})">삭제</button>
        </td>
    `;
    tbody.appendChild(row);
}

// WBS 테이블 행 업데이트
function updateWbsRow(row, task) {
    row.innerHTML = `
        <td>${task.taskName || '없음'}</td>
        <td>${task.assignee || '미정'}</td>
        <td>${task.status || '미정'}</td>
        <td>${formatTimestampToDate(task.startDate) || '미정'}</td>
        <td>${formatTimestampToDate(task.endDate) || '미정'}</td>
        <td>
            <button onclick="openEditWbsModal(${task.id})">수정</button>
            <button onclick="deleteTask(${task.id})">삭제</button>
        </td>
    `;
}


function updateWbsTable(wbsData) {
    const tableBody = document.querySelector('#wbs-table tbody');
    tableBody.innerHTML = ''; // 기존 데이터를 초기화

    wbsData.forEach(task => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${task.taskName}</td>
            <td>${task.assignee}</td>
            <td>${task.status}</td>
            <td>${task.startDate}</td>
            <td>${task.endDate}</td>
            <td>
                <button onclick="editTask('${task.id}')">수정</button>
                <button onclick="deleteTask('${task.id}')">삭제</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

async function handleAddOrUpdateTask(task) {
    console.log('handleAddOrUpdateTask 호출:', task);

    // 기존 작업 행 업데이트 또는 새 작업 추가
    const existingRow = document.querySelector(`#wbs-row-${task.id}`);
    if (existingRow) {
        console.log('기존 WBS 행 수정:', task.id);
        updateWbsRow(existingRow, task);
    } else {
        console.log('새로운 WBS 행 추가:', task.id);
        addWbsRow(task);
    }

    // 그래프 업데이트
    const tasks = await fetchWbsData(); // 비동기 데이터 로드
    updateChart(tasks); // 차트 업데이트
}

async function handleDeleteTask(taskId) {
    console.log('삭제된 작업 처리 시작:', taskId);

    // 테이블 행 삭제
    const rowToDelete = document.querySelector(`#wbs-row-${taskId}`);
    if (rowToDelete) {
        console.log('WBS 테이블에서 작업 삭제:', taskId);
        rowToDelete.remove();
    } else {
        console.warn('WBS 테이블에서 작업을 찾을 수 없습니다:', taskId);
    }

    // 그래프 업데이트
    const tasks = await fetchWbsData(); // 비동기 데이터 로드
    updateChart(tasks); // 차트 업데이트
}


// 모달 닫기 함수
function closeAddWbsModal() {
    const addWbsModal = document.getElementById('add-wbs-modal');
    if (addWbsModal) {
        addWbsModal.style.display = 'none';
    }
}

function closeEditWbsModal() {
    const editWbsModal = document.getElementById('edit-wbs-modal');
    if (editWbsModal) {
        editWbsModal.style.display = 'none';
    }
}

// 모달 열기 함수
function openAddWbsModal() {
    const addWbsModal = document.getElementById('add-wbs-modal');
    if (addWbsModal) {
        addWbsModal.style.display = 'block';
    }
}

function openEditWbsModal(taskId) {
    const editWbsModal = document.getElementById('edit-wbs-modal');
    const row = document.querySelector(`#wbs-row-${taskId}`);
    if (!row) {
        console.error(`작업 ID ${taskId}에 대한 행을 찾을 수 없습니다.`);
        return;
    }

    const task = {
        id: taskId,
        taskName: row.children[0].innerText,
        assignee: row.children[1].innerText,
        status: row.children[2].innerText,
        startDate: row.children[3].innerText,
        endDate: row.children[4].innerText,
    };

    // 모달의 입력 필드에 데이터 채우기
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-taskName').value = task.taskName;
    document.getElementById('edit-assignee').value = task.assignee;
    document.getElementById('edit-status').value = task.status;
    document.getElementById('edit-startDate').value = task.startDate;
    document.getElementById('edit-endDate').value = task.endDate;

    if (editWbsModal) {
        editWbsModal.style.display = 'block';
    }
}

async function initializeChartWithDynamicDates() {
    const projectId = document.getElementById('project-id').value;
    const project = await fetchProjectDates(projectId);

    if (!project) {
        console.error('프로젝트 데이터를 가져오지 못했습니다. 기본값을 사용합니다.');
        return;
    }

    const ctx = document.getElementById('wbs-chart').getContext('2d');
    wbsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: [
                {
                    label: '작업 기간',
                    data: [], // 데이터는 나중에 추가
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    barThickness: 20,
                },
            ],
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day', // 단위를 일로 설정
                        tooltipFormat: 'yyyy-MM-dd',
                    },
                    min: project.startDate, // 프로젝트 시작일
                    max: project.endDate,   // 프로젝트 종료일
                    title: { display: true, text: '날짜' },
                },
                y: {
                    title: { display: true, text: '작업' },
                    ticks: { autoSkip: false, maxRotation: 0, minRotation: 0 },
                },
            },
            plugins: {
				tooltip: {
				    callbacks: {
				        label: function (context) {
				            const start = new Date(context.raw.x[0]);
				            const end = new Date(context.raw.x[1]);
				            
				            // 작업 기간 계산 (일 수)
				            const differenceInTime = end - start;
				            const days = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24)); // 밀리초 -> 일
				            
				            // 시작일과 종료일 포맷팅
				            const startFormatted = start.toISOString().split('T')[0]; // yyyy-MM-dd 형식
				            const endFormatted = end.toISOString().split('T')[0]; // yyyy-MM-dd 형식
				            
				            // 툴팁에 표시될 내용 반환
				            return `작업 기간: ${startFormatted} ~ ${endFormatted} (${days}일)`;
				        },
				    },
                },
                legend: { display: false }, // 범례 비활성화
            },
        },
    });
}








function updateChart(tasks) {
    const ganttData = tasks.map((task) => ({
        x: [task.startDate, task.endDate], // 시작일과 종료일
        y: task.taskName, // 작업 이름
    }));

    wbsChart.data.datasets[0].data = ganttData;
    wbsChart.update(); // 차트 업데이트
}


async function fetchProjectDates(projectId) {
    try {
        const response = await fetch(`/project/${projectId}/dates`);
        if (!response.ok) {
            throw new Error(`프로젝트 날짜 API 호출 실패: ${response.status}`);
        }
        const project = await response.json();
        console.log('프로젝트 날짜:', project);
        return project;
    } catch (error) {
        console.error('프로젝트 날짜를 가져오는 중 오류 발생:', error);
        return null;
    }
}




// 작업 추가 요청
document.getElementById('add-wbs-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // 기본 폼 제출 방지

    const taskNameField = document.getElementById('taskName');
    const startDateField = document.getElementById('startDate');
    const endDateField = document.getElementById('endDate');

    const taskName = taskNameField.value.trim();
    const startDate = new Date(startDateField.value);
    const endDate = new Date(endDateField.value);

    // 프로젝트 시작일과 종료일
    const projectStartDate = new Date(document.getElementById('project-start-date').value);
    const projectEndDate = new Date(document.getElementById('project-end-date').value);

    // 날짜를 yyyy-MM-dd 형식으로 변환
    const formatDate = (date) => date.toISOString().split('T')[0];

    // 모든 필드의 스타일 초기화
    taskNameField.style.border = '';
    startDateField.style.border = '';
    endDateField.style.border = '';

    // 유효성 검사
    if (!taskName) {
        alert('작업 이름을 입력하세요.');
        taskNameField.style.border = '2px solid red'; // 강조
        taskNameField.focus();
        return;
    }

    if (!startDateField.value) {
        alert('시작일을 선택하세요.');
        startDateField.style.border = '2px solid red'; // 강조
        startDateField.focus();
        return;
    }

    if (!endDateField.value) {
        alert('종료일을 선택하세요.');
        endDateField.style.border = '2px solid red'; // 강조
        endDateField.focus();
        return;
    }

    if (startDate < projectStartDate || endDate > projectEndDate) {
        alert(`작업의 날짜는 프로젝트 기간(${formatDate(projectStartDate)} ~ ${formatDate(projectEndDate)}) 내에 있어야 합니다.`);
        startDateField.style.border = '2px solid red'; // 시작일 강조
        endDateField.style.border = '2px solid red'; // 종료일 강조
        return;
    }

    if (startDate > endDate) {
        alert('시작일은 종료일보다 늦을 수 없습니다.');
        startDateField.style.border = '2px solid red'; // 시작일 강조
        endDateField.style.border = '2px solid red'; // 종료일 강조
        return;
    }

    // 유효성 검사가 완료되면 작업 데이터를 서버로 전송
    const task = {
        projectId: document.getElementById('project-id').value,
        taskName,
        assignee: document.getElementById('assignee').value,
        status: document.getElementById('status').value,
        startDate: startDateField.value,
        endDate: endDateField.value,
    };

    try {
        const response = await fetch('/api/wbs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });

        if (!response.ok) {
            throw new Error(`작업 추가 실패: ${response.status}`);
        }

        console.log('작업 추가 성공');
        fetchWbsData(); // WBS 데이터를 새로 고침
        closeAddWbsModal(); // 모달 닫기
    } catch (error) {
        console.error('작업 추가 중 오류 발생:', error);
    }
});




// 작업 수정 요청
document.getElementById('edit-wbs-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // 기본 폼 제출 방지

    const taskId = document.getElementById('edit-task-id').value;
    const taskNameField = document.getElementById('edit-taskName');
    const startDateField = document.getElementById('edit-startDate');
    const endDateField = document.getElementById('edit-endDate');

    const taskName = taskNameField.value.trim();
    const startDate = new Date(startDateField.value);
    const endDate = new Date(endDateField.value);

    // 프로젝트 시작일과 종료일 가져오기
    const projectStartDate = new Date(document.getElementById('project-start-date').value);
    const projectEndDate = new Date(document.getElementById('project-end-date').value);

    // 날짜 포맷팅 함수
    const formatDate = (date) => date.toISOString().split('T')[0];

    // 모든 필드의 스타일 초기화
    taskNameField.style.border = '';
    startDateField.style.border = '';
    endDateField.style.border = '';

    // 유효성 검사
    if (!taskName) {
        alert('작업 이름을 입력하세요.');
        taskNameField.style.border = '2px solid red'; // 강조
        taskNameField.focus();
        return;
    }

    if (!startDateField.value) {
        alert('시작일을 선택하세요.');
        startDateField.style.border = '2px solid red'; // 강조
        startDateField.focus();
        return;
    }

    if (!endDateField.value) {
        alert('종료일을 선택하세요.');
        endDateField.style.border = '2px solid red'; // 강조
        endDateField.focus();
        return;
    }

    if (startDate > endDate) {
        alert('시작일은 종료일보다 늦을 수 없습니다.');
        startDateField.style.border = '2px solid red'; // 시작일 강조
        endDateField.style.border = '2px solid red'; // 종료일 강조
        return;
    }

    if (startDate < projectStartDate || endDate > projectEndDate) {
        alert(`작업의 날짜는 프로젝트 기간(${formatDate(projectStartDate)} ~ ${formatDate(projectEndDate)}) 내에 있어야 합니다.`);
        startDateField.style.border = '2px solid red';
        endDateField.style.border = '2px solid red';
        return;
    }

    const task = {
        id: taskId,
        taskName,
        assignee: document.getElementById('edit-assignee').value,
        status: document.getElementById('edit-status').value,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
    };

    try {
        const response = await fetch('/api/wbs', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });

        if (!response.ok) {
            throw new Error(`작업 수정 실패: ${response.status}`);
        }

        console.log('작업 수정 성공');
        handleAddOrUpdateTask(task); // 수정된 작업을 UI에 반영
        closeEditWbsModal(); // 모달 닫기
    } catch (error) {
        console.error('작업 수정 중 오류 발생:', error);
    }
});



// 모달 외부 클릭 시 닫기 처리
window.addEventListener('click', (event) => {
    const addWbsModal = document.getElementById('add-wbs-modal');
    const editWbsModal = document.getElementById('edit-wbs-modal');

    if (event.target === addWbsModal) {
        closeAddWbsModal();
    }
    if (event.target === editWbsModal) {
        closeEditWbsModal();
    }
});


// 작업 삭제 요청
async function deleteTask(taskId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(`/api/wbs/${taskId}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error(`작업 삭제 실패: ${response.status}`);
        }

        console.log('작업 삭제 성공:', taskId);
        handleDeleteTask(taskId); // UI에서 즉시 반영
    } catch (error) {
        console.error('작업 삭제 중 오류 발생:', error);
    }
}