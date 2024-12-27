async function fetchAndRenderMiniGantt() {
    const projectId = document.getElementById('project-id').value; // Hidden Input에서 Project ID 가져오기
    const response = await fetch(`/api/wbs/${projectId}`);
    const data = await response.json();
    renderMiniGantt(data);
}

// 간트차트 렌더링 함수
function renderMiniGantt(data) {
    const ganttContainer = document.getElementById('mini-gantt');
    ganttContainer.innerHTML = ''; // 초기화

    data.forEach(task => {
        const bar = document.createElement('div');
        bar.className = 'gantt-bar';
        bar.style.left = `${calculateLeft(task.startDate)}px`;
        bar.style.width = `${calculateWidth(task.startDate, task.endDate)}px`;
        bar.style.top = `${task.id * 30}px`; // 태스크마다 위치를 다르게 설정
        bar.textContent = task.taskName;

        ganttContainer.appendChild(bar);
    });
}

function calculateLeft(startDate) {
    const start = new Date(startDate).getTime();
    const baseDate = new Date('2024-01-01').getTime();
    return Math.max(0, (start - baseDate) / (1000 * 60 * 60 * 24)) * 10; // 하루당 10px
}

function calculateWidth(startDate, endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return Math.max(10, (end - start) / (1000 * 60 * 60 * 24)) * 10; // 하루당 10px
}

// 실행
fetchAndRenderMiniGantt();
