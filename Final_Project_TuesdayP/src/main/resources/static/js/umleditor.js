const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('color-picker');
const lineWidth = document.getElementById('line-width');
const shapeSize = document.getElementById('shape-size');
const clearButton = document.getElementById('clear-canvas');
const tools = document.querySelectorAll('.tool-btn');
const shapeSubmenu = document.getElementById('shape-submenu');
const shapeTool = document.getElementById('shape-tool');
const shapeTools = document.querySelectorAll('.submenu-btn');
const textboxTool = document.getElementById('textbox-tool'); // 텍스트박스 버튼
const drawTableButton = document.getElementById("draw-table-button");
let currentTool = 'null';
let isDrawing = false;
let isDragging = false;
let startX, startY;
let shapes = [];
let history = []; // 작업 이력을 저장할 배열
let isDraggingTable = false; // 표 이동 상태
let isResizingTable = false; // 표 크기 조정 상태
let selectedTable = null; // 선택된 표
let offsetX, offsetY; // 마우스와 표의 거리
let resizeStartX, resizeStartY; // 크기 조정 시작점




// 되돌리기 버튼 생성
const undoButton = document.createElement('button');
undoButton.id = 'undo-button';
undoButton.textContent = '되돌리기';
undoButton.classList.add('tool-btn');
clearButton.parentNode.insertBefore(undoButton, clearButton.nextSibling);

function Shape(type, x, y, size, color, lineWidth, text = "") {
	this.type = type;
	this.x = x;
	this.y = y;
	this.size = size;
	this.color = color;
	this.lineWidth = lineWidth;
    this.text = text; // 텍스트 속성 추가
}

function drawShape(shape) {
	ctx.lineWidth = shape.lineWidth;
	ctx.strokeStyle = shape.color;
	ctx.fillStyle = shape.color;

	switch (shape.type) {
		case 'square':
			ctx.strokeRect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
			break;
		case 'rectangle1':
			drawRectangle1(ctx, shape.x, shape.y, shape.size);
			break;
		case 'rectangle2':
			drawRectangle2(ctx, shape.x, shape.y, shape.size);
			break;
		case 'triangle':
			drawTriangle(ctx, shape.x, shape.y, shape.size);
			break;
		case 'circle':
			ctx.beginPath();
			ctx.arc(shape.x, shape.y, shape.size / 2, 0, Math.PI * 2);
			ctx.stroke();
			break;
		case 'diamond':
			drawDiamond(ctx, shape.x, shape.y, shape.size);
			break;
		case 'star':
			drawStar(ctx, shape.x, shape.y, 5, shape.size / 2, shape.size / 4);
			break;
		case 'hexagon':
			drawHexagon(ctx, shape.x, shape.y, shape.size / 2);
			break;
		case 'actor':
			drawActor(ctx, shape.x, shape.y, shape.size);
			break;
		case 'ellipse':
			drawEllipse(ctx, shape.x, shape.y, shape.size * 0.8, shape.size / 2);
			break;
		case 'arrow':
			drawArrow(ctx, shape.x - shape.size / 2, shape.y, shape.x + shape.size / 2, shape.y);
			break;
		case "textbox":
            ctx.font = `${shape.size}px Arial`;
            ctx.fillStyle = shape.color;
            ctx.textBaseline = "top";
            ctx.fillText(shape.text, shape.x, shape.y);
            break;
	}
}
// 표 그리기 버튼 클릭 이벤트
drawTableButton.addEventListener("click", () => {
    const rows = prompt("행(Row) 개수를 입력하세요:", 3); // 행 개수 입력
    const cols = prompt("열(Column) 개수를 입력하세요:", 3); // 열 개수 입력

    if (rows && cols && !isNaN(rows) && !isNaN(cols)) {
        drawTable(100, 100, parseInt(rows), parseInt(cols), 500, 300); // 표 그리기
    } else {
        alert("올바른 숫자를 입력하세요.");
    }
});

function drawTable(x, y, rows, cols, width, height) {
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";

    // 가로선 그리기
    for (let i = 0; i <= rows; i++) {
        const lineY = y + i * cellHeight;
        ctx.moveTo(x, lineY);
        ctx.lineTo(x + width, lineY);
    }

    // 세로선 그리기
    for (let j = 0; j <= cols; j++) {
        const lineX = x + j * cellWidth;
        ctx.moveTo(lineX, y);
        ctx.lineTo(lineX, y + height);
    }

    ctx.stroke();
    ctx.closePath();

    // 크기 조정 핸들 그리기
    ctx.fillStyle = "blue";
    ctx.fillRect(x + width - 10, y + height - 10, 10, 10);
}

function drawRectangle1(ctx, x, y, size) {
	ctx.beginPath();
	ctx.moveTo(x - size, y - size / 2); // 왼쪽 위
	ctx.lineTo(x + size, y - size / 2); // 오른쪽 위
	ctx.lineTo(x + size, y + size / 2); // 오른쪽 아래
	ctx.lineTo(x - size, y + size / 2); // 왼쪽 아래
	ctx.closePath();
	ctx.stroke();
}

function drawRectangle2(ctx, x, y, size) {
	ctx.beginPath();
    ctx.moveTo(x - size / 2, y - size); // 왼쪽 위
    ctx.lineTo(x + size / 2, y - size); // 오른쪽 위
    ctx.lineTo(x + size / 2, y + size); // 오른쪽 아래
    ctx.lineTo(x - size / 2, y + size); // 왼쪽 아래
    ctx.closePath();
    ctx.stroke();
}

function drawTriangle(ctx, x, y, size) {
	ctx.beginPath();
	ctx.moveTo(x, y - size / 2);
	ctx.lineTo(x + size / 2, y + size / 2);
	ctx.lineTo(x - size / 2, y + size / 2);
	ctx.closePath();
	ctx.stroke();
}

function drawDiamond(ctx, x, y, size) {
	ctx.beginPath();
	ctx.moveTo(x, y - size / 2);
	ctx.lineTo(x + size / 2, y);
	ctx.lineTo(x, y + size / 2);
	ctx.lineTo(x - size / 2, y);
	ctx.closePath();
	ctx.stroke();
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
	let rot = Math.PI / 2 * 3;
	let x = cx;
	let y = cy;
	let step = Math.PI / spikes;

	ctx.beginPath();
	ctx.moveTo(cx, cy - outerRadius);
	for (let i = 0; i < spikes; i++) {
		x = cx + Math.cos(rot) * outerRadius;
		y = cy + Math.sin(rot) * outerRadius;
		ctx.lineTo(x, y);
		rot += step;

		x = cx + Math.cos(rot) * innerRadius;
		y = cy + Math.sin(rot) * innerRadius;
		ctx.lineTo(x, y);
		rot += step;
	}
	ctx.lineTo(cx, cy - outerRadius);
	ctx.closePath();
	ctx.stroke();
}

function drawHexagon(ctx, x, y, size) {
	ctx.beginPath();
	for (let i = 0; i < 6; i++) {
		ctx.lineTo(x + size * Math.cos(i * 2 * Math.PI / 6), y + size * Math.sin(i * 2 * Math.PI / 6));
	}
	ctx.closePath();
	ctx.stroke();
}

function drawActor(ctx, x, y, size) {
	const scale = size / 50;
	// Head
	ctx.beginPath();
	ctx.arc(x, y - 30 * scale, 10 * scale, 0, Math.PI * 2);
	ctx.stroke();

	// Body
	ctx.beginPath();
	ctx.moveTo(x, y - 20 * scale);
	ctx.lineTo(x, y + 10 * scale);
	ctx.stroke();

	// Arms
	ctx.beginPath();
	ctx.moveTo(x - 20 * scale, y - 10 * scale);
	ctx.lineTo(x + 20 * scale, y - 10 * scale);
	ctx.stroke();

	// Legs
	ctx.beginPath();
	ctx.moveTo(x, y + 10 * scale);
	ctx.lineTo(x - 10 * scale, y + 30 * scale);
	ctx.moveTo(x, y + 10 * scale);
	ctx.lineTo(x + 10 * scale, y + 30 * scale);
	ctx.stroke();
}

function drawEllipse(ctx, x, y, radiusX, radiusY) {
	ctx.beginPath();
	ctx.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
	ctx.stroke();
}

function drawArrow(ctx, fromx, fromy, tox, toy) {
    const headlen = 15; // 화살표 머리 길이
    const headAngle = Math.PI / 8; // 화살표 머리 각도
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);

    // 화살표 몸체
    ctx.beginPath();
    ctx.lineWidth = 2; // 화살표 선 두께
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.stroke();

    // 화살표 머리
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(
        tox - headlen * Math.cos(angle - headAngle),
        toy - headlen * Math.sin(angle - headAngle)
    );
    ctx.lineTo(
        tox - headlen * Math.cos(angle + headAngle),
        toy - headlen * Math.sin(angle + headAngle)
    );
    ctx.lineTo(tox, toy);
    ctx.closePath();
    ctx.fill(); // 머리를 채우기
}



// 텍스트박스 그리기 함수 업데이트
function drawTextBox(ctx, x, y, text, size) {
	ctx.font = `${size}px Arial`;
	ctx.fillStyle = 'black';
	ctx.textBaseline = 'top';
	ctx.fillText(text, x, y);
}

function redrawCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	shapes.forEach(shape => drawShape(shape));
	 if (shape.type === "table") {
            // 표 다시 그리기
            drawTable(shape.x, shape.y, shape.rows, shape.cols, shape.width, shape.height);
        } else {
            // 다른 도형 그리기
            drawShape(shape);
        }
        shapes.forEach((shape) => {
        if (shape.type === "table") {
            drawTable(shape.x, shape.y, shape.rows, shape.cols, shape.width, shape.height);
        } else {
            drawShape(shape);
        }
    });
}

canvas.addEventListener('mousedown', (e) => {
	const rect = canvas.getBoundingClientRect();
	const x = e.clientX - rect.left; // 캔버스 내부 좌표로 변환
	const y = e.clientY - rect.top;
	// 기존 도형을 드래그하는 경우
	for (let i = shapes.length - 1; i >= 0; i--) {
		const shape = shapes[i];
		if (Math.abs(x - shape.x) < shape.size / 2 && Math.abs(y - shape.y) < shape.size / 2) {
			isDragging = true;
			startX = x - shape.x;
			startY = y - shape.y;
			shapes.push(shapes.splice(i, 1)[0]); // Move shape to end of array
			return;
		}
	}
	// 새로운 도형 생성
	isDrawing = true;
	const newShape = new Shape(currentTool, x, y, parseInt(shapeSize.value), colorPicker.value, parseInt(lineWidth.value));
	shapes.push(newShape);
	drawShape(newShape);
	
	 // 기존 표 선택
    selectedTable = null;
    for (const shape of shapes) {
        if (shape.type === "table") {
            const insideTable =
                mouseX >= shape.x &&
                mouseX <= shape.x + shape.width &&
                mouseY >= shape.y &&
                mouseY <= shape.y + shape.height;

            const resizingArea =
                mouseX >= shape.x + shape.width - 10 &&
                mouseX <= shape.x + shape.width &&
                mouseY >= shape.y + shape.height - 10 &&
                mouseY <= shape.y + shape.height;

            if (resizingArea) {
                // 크기 조정 모드
                isResizingTable = true;
                resizeStartX = mouseX;
                resizeStartY = mouseY;
                selectedTable = shape;
                return;
            } else if (insideTable) {
                // 표 이동 모드
                isDraggingTable = true;
                offsetX = mouseX - shape.x;
                offsetY = mouseY - shape.y;
                selectedTable = shape;
                return;
            }
        }
    }
});

// 되돌리기 버튼 동작
undoButton.addEventListener('click', () => {
	if (shapes.length > 0) {
		history.push([...shapes]); // 현재 상태를 저장
		shapes.pop(); // 마지막 도형 삭제
		redrawCanvas(); // 캔버스 갱신
	}
});
canvas.addEventListener('mousemove', (e) => {
	if (!isDrawing && !isDragging) return;

	const rect = canvas.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;

	if (isDragging) {
		shapes[shapes.length - 1].x = x - startX;
		shapes[shapes.length - 1].y = y - startY;
	} else {
		shapes[shapes.length - 1].x = x;
		shapes[shapes.length - 1].y = y;
	}
	
	const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

	 if (isDraggingTable) {
        // 표 이동
        selectedTable.x = mouseX - offsetX;
        selectedTable.y = mouseY - offsetY;
        redrawCanvas();
    } else if (isResizingTable) {
        // 표 크기 조정
        const newWidth = selectedTable.width + (mouseX - resizeStartX);
        const newHeight = selectedTable.height + (mouseY - resizeStartY);

        if (newWidth > 50 && newHeight > 50) {
            selectedTable.width = newWidth;
            selectedTable.height = newHeight;
            resizeStartX = mouseX;
            resizeStartY = mouseY;
//            redrawCanvas();
        }
    }

	redrawCanvas();
});

canvas.addEventListener('mouseup', () => {
	isDrawing = false;
	isDragging = false;
});

canvas.addEventListener('mouseout', () => {
	isDrawing = false;
	isDragging = false;
	
	isDraggingTable = false;
    isResizingTable = false;
    selectedTable = null;
});

// 텍스트박스 버튼 이벤트
textboxTool.addEventListener("click", () => {
    currentTool = "textbox"; // 현재 도구를 텍스트박스로 설정
});

// 텍스트 입력 필드 생성 및 입력 처리
canvas.addEventListener("click", (e) => {
    if (currentTool !== "textbox") return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left; // 클릭한 x 좌표
    const y = e.clientY - rect.top; // 클릭한 y 좌표

    // 입력 필드 생성
    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "absolute";
    input.style.left = `${e.clientX}px`;
    input.style.top = `${e.clientY}px`;
    input.style.font = "16px Arial";
    input.style.border = "1px solid #ccc";
    input.style.outline = "none";
    input.style.padding = "2px";

    document.body.appendChild(input);
    input.focus();

    // 텍스트 입력 완료 시
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && input.value.trim() !== "") {
            // 입력된 텍스트를 shapes 배열에 추가
            const newText = new Shape(
                "textbox",
                x,
                y,
                16, // 기본 폰트 크기
                "black", // 기본 텍스트 색상
                1,
                input.value // 입력된 텍스트 저장
            );
            shapes.push(newText);

            redrawCanvas(); // 캔버스 다시 그리기
            document.body.removeChild(input); // 입력 필드 제거
        }
    });

    // 입력 필드 외부 클릭 시 제거
    input.addEventListener("blur", () => {
        document.body.removeChild(input);
    });
});



clearButton.addEventListener('click', () => {
	if (shapes.length > 0) {
		history.push([...shapes]); // 지우기 전에 상태 저장
	}
	shapes = []; // 모든 도형 삭제
	redrawCanvas(); // 캔버스 초기화
});

tools.forEach(tool => {
	tool.addEventListener('click', (e) => {
		tools.forEach(t => t.classList.remove('active'));
		e.target.classList.add('active');
		if (e.target.id === 'shape-tool') {
			shapeSubmenu.classList.toggle('active');
		} else {
			shapeSubmenu.classList.remove('active');
			currentTool = e.target.id.split('-')[0];
		}
	});
});

shapeTools.forEach(tool => {
	tool.addEventListener('click', (e) => {
		shapeTools.forEach(t => t.classList.remove('active'));
		e.target.classList.add('active');
		currentTool = e.target.id.split('-')[0];
	});
});

// Update shape size when slider changes
shapeSize.addEventListener('input', () => {
	if (shapes.length > 0) {
		shapes[shapes.length - 1].size = parseInt(shapeSize.value);
		redrawCanvas();
	}
});

// Update color when color picker changes
colorPicker.addEventListener('input', () => {
	if (shapes.length > 0) {
		shapes[shapes.length - 1].color = colorPicker.value;
		redrawCanvas();
	}
});

// Update line width when slider changes
lineWidth.addEventListener('input', () => {
	if (shapes.length > 0) {
		shapes[shapes.length - 1].lineWidth = parseInt(lineWidth.value);
		redrawCanvas();
	}
});

// PDF 저장 버튼
document.getElementById("save-pdf-button").addEventListener("click", () => {
    try {
        console.log("PDF 저장 버튼 클릭됨");
        const canvasData = canvas.toDataURL("image/png"); // 캔버스를 이미지로 변환
        const pdf = new jsPDF("landscape", "px", [canvas.width, canvas.height]); // PDF 생성
        pdf.addImage(canvasData, "PNG", 0, 0, canvas.width, canvas.height); // 이미지 삽입
        pdf.save("canvas_content.pdf"); // PDF 저장
    } catch (error) {
        console.error("PDF 저장 중 오류 발생:", error);
    }
});

// PPT 저장 버튼
document.getElementById("save-ppt-button").addEventListener("click", () => {
    try {
        console.log("PPT 저장 버튼 클릭됨");
        const pptx = new PptxGenJS(); // PptxGenJS 객체 생성
        const canvasData = canvas.toDataURL("image/png"); // 캔버스를 이미지 데이터로 변환
        const slide = pptx.addSlide(); // 새 슬라이드 생성
        slide.addImage({
            data: canvasData,
            x: 0.5, // 슬라이드에서 X 좌표
            y: 0.5, // 슬라이드에서 Y 좌표
            w: 9, // 너비
            h: 6, // 높이
        });
        pptx.writeFile("canvas_content.pptx"); // PPT 저장
    } catch (error) {
        console.error("PPT 저장 중 오류 발생:", error);
    }
});