let stompClient; // WebSocket 클라이언트 변수
let selectedSlide = null; // 현재 선택된 슬라이드
let slideCounter = 1; // 슬라이드 번호를 관리하는 전역 변수
let selectedElement = null; // 현재 선택된 요소를 관리하는 전역 변수
let currentSlideIndex = 0; // 현재 슬라이드 인덱스

document.addEventListener("DOMContentLoaded", () => {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket); // WebSocket 클라이언트 초기화

    stompClient.connect({}, () => {
        console.log("uipagesocket 연결 완료.");

        // WebSocket 메시지 구독
        stompClient.subscribe('/topic/uiUpdates', (message) => {
            const uiData = JSON.parse(message.body);
            handleUiUpdate(uiData);
        });

        // 슬라이드 추가 버튼 클릭 이벤트
        document.getElementById("addSlide").addEventListener("click", () => {
            const slideId = `slide-${Date.now()}`;
            const uiAction = {
                action: "addSlide",
                slideId: slideId,
                content: null,
                shapeType: null
            };
            stompClient.send("/app/uiAction", {}, JSON.stringify(uiAction));
        });

        // 텍스트 추가 버튼 클릭 이벤트
		document.getElementById("addText").addEventListener("click", () => {
		    if (selectedSlide) {
		        const textContent = "새로운 텍스트 내용";
		        const newText = addTextToSlideDOM(selectedSlide.id, textContent); // 텍스트 추가 및 DOM 요소 반환
		        if (newText) {
		            const uiAction = {
		                action: "addText",
		                slideId: selectedSlide.id,
		                elementId: newText.id, // 생성된 텍스트의 ID를 포함
		                content: textContent,
		                shapeType: null
		            };
		            stompClient.send("/app/uiAction", {}, JSON.stringify(uiAction)); // WebSocket 메시지 전송
		        }
		    } else {
		        alert("텍스트를 추가할 슬라이드를 선택해주세요!");
		    }
		});

		
		// 이미지 추가 버튼 클릭 이벤트
		document.getElementById("addImage").addEventListener("click", () => {
		    if (!selectedSlide) {
		        alert("이미지를 추가할 슬라이드를 선택해주세요!"); // 전역 변수 selectedSlide 사용
		        return;
		    }
		    document.getElementById("imageUpload").click(); // 파일 선택 창 열기
		});
		
		// 이미지 업로드 처리
		document.getElementById("imageUpload").addEventListener("change", (event) => {
		    const file = event.target.files[0]; // 지역 변수: 선택된 파일
		    if (file) {
		        const reader = new FileReader(); // 지역 변수: 파일 읽기 객체
		        reader.onload = (e) => {
		            const imageData = e.target.result; // 지역 변수: Base64 인코딩된 이미지 데이터

		            // WebSocket 메시지 전송
		            const uiAction = { // 지역 변수: WebSocket 메시지 데이터
		                action: "addImage",
		                slideId: selectedSlide.id, // 전역 변수 selectedSlide 사용
		                content: imageData,
		                shapeType: null
		            };
		            stompClient.send("/app/uiAction", {}, JSON.stringify(uiAction)); // 전역 변수 stompClient 사용
		        };
		        reader.readAsDataURL(file); // 파일을 Base64로 읽기
		    }
		});
		
		// 도형 추가 버튼 변경 이벤트
		document.getElementById("addShape").addEventListener("change", (event) => {
		    const shapeType = event.target.value; // 지역 변수: 선택된 도형 유형
		    if (!shapeType) return; // 아무 것도 선택하지 않으면 종료

		    if (!selectedSlide) {
		        alert("도형을 추가할 슬라이드를 선택해주세요!"); // 전역 변수 selectedSlide 사용
		        event.target.value = ""; // 선택 초기화
		        return;
		    }

		    // WebSocket 메시지 전송
		    const uiAction = { // 지역 변수: WebSocket 메시지 데이터
		        action: "addShape",
		        slideId: selectedSlide.id, // 전역 변수 selectedSlide 사용
		        content: null,
		        shapeType: shapeType // 도형 유형 전달
		    };
		    stompClient.send("/app/uiAction", {}, JSON.stringify(uiAction)); // 전역 변수 stompClient 사용
		    event.target.value = ""; // 선택 초기화
		});
		
		// 선택 요소 삭제 버튼 클릭 이벤트
		document.getElementById("deleteElement").addEventListener("click", () => {
		    if (!selectedElement) {
		        alert("삭제할 요소를 선택해주세요!");
		        return;
		    }

		    // WebSocket 메시지 전송
		    const uiAction = { // 지역 변수: WebSocket 메시지 데이터
		        action: "deleteElement",
		        slideId: selectedElement.parentElement.id, // 전역 변수 selectedElement 사용
		        content: null,
		        elementId: selectedElement.id // 전역 변수 selectedElement 사용
		    };
		    stompClient.send("/app/uiAction", {}, JSON.stringify(uiAction));

		    // 로컬에서도 삭제
		    selectedElement.remove();
		    selectedElement = null; // 선택 초기화
		});
		
		// 슬라이드 삭제 버튼 클릭 이벤트
		document.getElementById("deleteSlide").addEventListener("click", () => {
		    if (!selectedSlide) {
		        alert("삭제할 슬라이드를 선택해주세요!");
		        return;
		    }

		    const slideId = selectedSlide.id; // 지역 변수: 삭제할 슬라이드 ID

		    // WebSocket 메시지 전송
		    const uiAction = { // 지역 변수: WebSocket 메시지 데이터
		        action: "deleteSlide",
		        slideId: slideId,
		        content: null,
		        shapeType: null
		    };
		    stompClient.send("/app/uiAction", {}, JSON.stringify(uiAction));

		    // 로컬에서도 삭제
		    selectedSlide.remove();
		    selectedSlide = null; // 선택 초기화
		});
		
		// 슬라이드 위로 이동 버튼 클릭 이벤트
		document.getElementById("moveSlideUp").addEventListener("click", () => {
		    if (!selectedSlide) {
		        alert("이동할 슬라이드를 선택해주세요!");
		        return;
		    }

		    const prevSlide = selectedSlide.previousElementSibling; // 지역 변수: 이전 슬라이드
		    if (!prevSlide) {
		        alert("이 슬라이드는 이미 최상단에 있습니다.");
		        return;
		    }

		    // DOM에서 슬라이드 순서 변경
		    selectedSlide.parentNode.insertBefore(selectedSlide, prevSlide); // DOM 순서 변경

		    // WebSocket 메시지 전송
		    const uiAction = { // 지역 변수: WebSocket 메시지 데이터
		        action: "moveSlideUp",
		        slideId: selectedSlide.id,
		        content: null,
		        shapeType: null
		    };
		    stompClient.send("/app/uiAction", {}, JSON.stringify(uiAction));
		});

		// 슬라이드 아래로 이동 버튼 클릭 이벤트
		document.getElementById("moveSlideDown").addEventListener("click", () => {
		    if (!selectedSlide) {
		        alert("이동할 슬라이드를 선택해주세요!");
		        return;
		    }

		    const nextSlide = selectedSlide.nextElementSibling; // 지역 변수: 다음 슬라이드
		    if (!nextSlide) {
		        alert("이 슬라이드는 이미 최하단에 있습니다.");
		        return;
		    }

		    // DOM에서 슬라이드 순서 변경
		    selectedSlide.parentNode.insertBefore(nextSlide, selectedSlide); // DOM 순서 변경

		    // WebSocket 메시지 전송
		    const uiAction = { // 지역 변수: WebSocket 메시지 데이터
		        action: "moveSlideDown",
		        slideId: selectedSlide.id,
		        content: null,
		        shapeType: null
		    };
		    stompClient.send("/app/uiAction", {}, JSON.stringify(uiAction));
		});
		// 프레젠테이션 시작 버튼 클릭 이벤트
		document.getElementById("startPresentation").addEventListener("click", () => {
		    const slides = document.querySelectorAll("#slideContainer .slide"); // 지역 변수: 슬라이드 배열
		    if (slides.length === 0) {
		        alert("프레젠테이션할 슬라이드가 없습니다!");
		        return;
		    }

		    currentSlideIndex = 0; // 첫 번째 슬라이드부터 시작

		    // WebSocket 메시지 전송
		    const uiAction = { // 지역 변수: WebSocket 메시지 데이터
		        action: "startPresentation",
		        slideId: slides[currentSlideIndex].id,
		        content: null,
		        shapeType: null
		    };
		    stompClient.send("/app/uiAction", {}, JSON.stringify(uiAction));

		    enterPresentationMode(slides[currentSlideIndex].id); // 로컬에서 프레젠테이션 시작
		});
		// 이전 슬라이드
		document.getElementById("prevSlide").addEventListener("click", () => {
		    const slides = document.querySelectorAll("#slideContainer .slide"); // 지역 변수
		    if (currentSlideIndex > 0) {
		        currentSlideIndex--;

		        // WebSocket 메시지 전송
		        const uiAction = {
		            action: "navigateSlide",
		            slideId: slides[currentSlideIndex].id,
		            content: null,
		            shapeType: null
		        };
		        stompClient.send("/app/uiAction", {}, JSON.stringify(uiAction));

		        enterPresentationMode(slides[currentSlideIndex].id); // 로컬에서 슬라이드 변경
		    }
		});

		// 다음 슬라이드
		document.getElementById("nextSlide").addEventListener("click", () => {
		    const slides = document.querySelectorAll("#slideContainer .slide"); // 지역 변수
		    if (currentSlideIndex < slides.length - 1) {
		        currentSlideIndex++;

		        // WebSocket 메시지 전송
		        const uiAction = {
		            action: "navigateSlide",
		            slideId: slides[currentSlideIndex].id,
		            content: null,
		            shapeType: null
		        };
		        stompClient.send("/app/uiAction", {}, JSON.stringify(uiAction));

		        enterPresentationMode(slides[currentSlideIndex].id); // 로컬에서 슬라이드 변경
		    }
		});

		// 프레젠테이션 종료
		document.getElementById("exitPresentation").addEventListener("click", () => {
		    const presentationMode = document.getElementById("presentationMode"); // 지역 변수
		    presentationMode.classList.add("hidden"); // 프레젠테이션 모드 숨김

		    // WebSocket 메시지 전송
		    const uiAction = {
		        action: "exitPresentation",
		        slideId: null,
		        content: null,
		        shapeType: null
		    };
		    stompClient.send("/app/uiAction", {}, JSON.stringify(uiAction));
		});
		
		// PPT 출력 버튼 클릭 이벤트
		document.getElementById("exportPPT").addEventListener("click", async () => {
		    const slides = document.querySelectorAll("#slideContainer .slide"); // 지역 변수: 슬라이드 배열
		    if (slides.length === 0) {
		        alert("PPT로 출력할 슬라이드가 없습니다!");
		        return;
		    }

		    const zip = new JSZip(); // 지역 변수: ZIP 인스턴스
		    const pptx = zip.folder("PPT"); // 지역 변수: PPT 폴더 생성

		    // 슬라이드마다 이미지 캡처
		    for (let i = 0; i < slides.length; i++) {
		        const slide = slides[i]; // 지역 변수: 현재 슬라이드
		        const canvas = await html2canvas(slide); // 지역 변수: 캡처된 캔버스
		        const imageData = canvas.toDataURL("image/png"); // 지역 변수: Base64 PNG 데이터

		        // 이미지 파일 추가
		        pptx.file(`slide-${i + 1}.png`, imageData.split(",")[1], { base64: true });
		    }

		    // ZIP 파일 다운로드
		    zip.generateAsync({ type: "blob" }).then((content) => {
		        saveAs(content, "presentation.zip"); // ZIP 파일 저장
		    });
		});

    });

    // WebSocket 메시지에 따른 DOM 업데이트 처리
    function handleUiUpdate(uiData) {
        console.log("UI Update Action Received:", uiData); // 수신 메시지 디버깅

        switch (uiData.action) {
            case "addSlide":
                addSlideToDOM(uiData.slideId);
                break;
            case "addText":
                addTextToSlideDOM(uiData.slideId, uiData.content);
                break;
            case "moveText":
				console.log(`Received moveText: slideId=${uiData.slideId}, textId=${uiData.textId}, offsetX=${uiData.offsetX}, offsetY=${uiData.offsetY}`);
				moveTextInDOM(uiData.slideId, uiData.textId, uiData.offsetX, uiData.offsetY);
                break;
			case "addImage":
				addImageToSlideDOM(uiData.slideId, uiData.content); // 전역 변수 활용 필요 없음
				break;
			case "addShape":
				 addShapeToSlideDOM(uiData.slideId, uiData.shapeType);
				 break;
			case "deleteElement":
				  deleteElementFromSlideDOM(uiData.slideId, uiData.elementId);
				  break;
			case "deleteSlide":
				  deleteSlideFromDOM(uiData.slideId);
				  break;
			case "moveSlideUp":
				  moveSlideUpInDOM(uiData.slideId);
				  break;
			case "moveSlideDown":
				  moveSlideDownInDOM(uiData.slideId);
				  break;
			case "startPresentation":
				  enterPresentationMode(uiData.slideId);
				  break;
			case "navigateSlide":
				  enterPresentationMode(uiData.slideId);
				  break;
			case "exitPresentation":
				  exitPresentationMode();
				  break;

            default:
                console.warn(`Unknown action: ${uiData.action}`);
        }
    }

    // 슬라이드를 DOM에 추가
	function addSlideToDOM(slideId) {
	    const slideContainer = document.getElementById("slideContainer");
	    const newSlide = document.createElement("div");
	    newSlide.id = slideId;
	    newSlide.className = "slide";

	    // 슬라이드 콘텐츠 (번호 추가)
	    const slideNumber = document.createElement("div"); // 지역 변수
	    slideNumber.className = "slide-number";
	    slideNumber.textContent = slideCounter; // 슬라이드 번호 설정
	    newSlide.appendChild(slideNumber);

	    console.log("Slide added with ID:", slideId, "and number:", slideCounter); // 디버깅 로그

	    newSlide.addEventListener("click", () => {
	        if (selectedSlide) {
	            selectedSlide.classList.remove("selected");
	        }
	        selectedSlide = newSlide;
	        newSlide.classList.add("selected");
	    });

	    slideContainer.appendChild(newSlide);
	    slideCounter++; // 다음 슬라이드 번호로 증가
	}


    // 슬라이드에 텍스트를 추가
	function addTextToSlideDOM(slideId, textContent) {
	    const slide = document.getElementById(slideId);
	    if (slide) {
	        const newText = document.createElement("p");
	        newText.textContent = textContent;
	        newText.contentEditable = true; // 텍스트 수정 가능
	        newText.className = "draggable";
	        newText.id = `text-${Date.now()}`; // 고유 ID 설정
	        console.log("Adding text with ID:", newText.id, "to slideId:", slideId); // 디버깅 로그
	        slide.appendChild(newText);

	        makeDraggable(newText); // 드래그 가능 설정
	        return newText; // 새로 추가된 텍스트 반환
	    } else {
	        console.error(`Slide not found for slideId: ${slideId}`);
	        return null; // 슬라이드가 없으면 null 반환
	    }
	}





    // 텍스트 위치 업데이트
	function moveTextInDOM(slideId, elementId, offsetX, offsetY) {
	    console.log(`Moving Text: slideId=${slideId}, elementId=${elementId}, offsetX=${offsetX}, offsetY=${offsetY}`);
	    const slide = document.getElementById(slideId);
	    if (slide) {
	        const element = document.getElementById(elementId);
	        if (element) {
	            element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
	        } else {
	            console.error(`Element not found for elementId: ${elementId}`);
	        }
	    } else {
	        console.error(`Slide not found for slideId: ${slideId}`);
	    }
	}


	
	function addImageToSlideDOM(slideId, imageData) {
	    const slide = document.getElementById(slideId); // 지역 변수
	    if (slide) {
	        const img = document.createElement("img"); // 지역 변수
	        img.src = imageData;
	        img.className = "draggable"; // 드래그 가능하도록 설정
	        img.style.maxWidth = "100%"; // 슬라이드 내에서 이미지 크기 제한
	        img.style.maxHeight = "100%";
	        slide.appendChild(img);

	        makeDraggable(img); // 이미지 드래그 가능
	    } else {
	        console.error(`Slide not found for slideId: ${slideId}`);
	    }
	}
	function addShapeToSlideDOM(slideId, shapeType) {
	    const slide = document.getElementById(slideId); // 지역 변수: 슬라이드 DOM 요소
	    if (slide) {
	        const shape = document.createElement("div"); // 지역 변수: 새로 생성된 도형 요소
	        shape.className = `shape ${shapeType}`; // 도형 유형 클래스 추가
	        shape.style.position = "absolute"; // 도형 이동 가능
	        shape.style.width = "100px"; // 기본 크기 설정
	        shape.style.height = "100px";

	        // 도형 스타일 설정
	        switch (shapeType) {
	            case "rectangle":
	                shape.style.backgroundColor = "#3498db";
	                break;
	            case "circle":
	                shape.style.borderRadius = "50%";
	                shape.style.backgroundColor = "#2ecc71";
	                break;
	            case "triangle":
	                shape.style.width = "0";
	                shape.style.height = "0";
	                shape.style.borderLeft = "50px solid transparent";
	                shape.style.borderRight = "50px solid transparent";
	                shape.style.borderBottom = "100px solid #e74c3c";
	                break;
	            default:
	                console.error(`Unknown shapeType: ${shapeType}`);
	                return;
	        }

	        slide.appendChild(shape); // 슬라이드에 도형 추가
	        makeDraggable(shape); // 도형 드래그 가능
	    } else {
	        console.error(`Slide not found for slideId: ${slideId}`);
	    }
	}
	
	function deleteElementFromSlideDOM(slideId, elementId) {
	    const slide = document.getElementById(slideId); // 지역 변수: 슬라이드 DOM 요소
	    if (slide) {
	        const element = document.getElementById(elementId); // 지역 변수: 삭제할 요소
	        if (element) {
	            element.remove();
	        } else {
	            console.error(`Element not found for elementId: ${elementId}`);
	        }
	    } else {
	        console.error(`Slide not found for slideId: ${slideId}`);
	    }
	}
	
	function deleteSlideFromDOM(slideId) {
	    const slide = document.getElementById(slideId); // 지역 변수: 삭제할 슬라이드 DOM 요소
	    if (slide) {
	        slide.remove();
	    } else {
	        console.error(`Slide not found for slideId: ${slideId}`);
	    }
	}
	function moveSlideUpInDOM(slideId) {
	    const slide = document.getElementById(slideId); // 지역 변수: 이동할 슬라이드 DOM 요소
	    if (slide) {
	        const prevSlide = slide.previousElementSibling; // 지역 변수: 이전 슬라이드
	        if (prevSlide) {
	            slide.parentNode.insertBefore(slide, prevSlide); // DOM 순서 변경
	        } else {
	            console.warn(`Slide ${slideId} is already at the top.`);
	        }
	    } else {
	        console.error(`Slide not found for slideId: ${slideId}`);
	    }
	}

	function moveSlideDownInDOM(slideId) {
	    const slide = document.getElementById(slideId); // 지역 변수: 이동할 슬라이드 DOM 요소
	    if (slide) {
	        const nextSlide = slide.nextElementSibling; // 지역 변수: 다음 슬라이드
	        if (nextSlide) {
	            slide.parentNode.insertBefore(nextSlide, slide); // DOM 순서 변경
	        } else {
	            console.warn(`Slide ${slideId} is already at the bottom.`);
	        }
	    } else {
	        console.error(`Slide not found for slideId: ${slideId}`);
	    }
	}

	function enterPresentationMode(slideId) {
	    const presentationMode = document.getElementById("presentationMode"); // 지역 변수
	    const currentSlide = document.getElementById("currentSlide"); // 지역 변수

	    const slide = document.getElementById(slideId); // 지역 변수: 표시할 슬라이드
	    if (!slide) {
	        console.error(`Slide not found for slideId: ${slideId}`);
	        return;
	    }

	    // 슬라이드 콘텐츠 복사
	    currentSlide.innerHTML = slide.innerHTML;

	    // 프레젠테이션 모드 활성화
	    presentationMode.classList.remove("hidden");
	}
	
	function exitPresentationMode() {
	    const presentationMode = document.getElementById("presentationMode"); // 지역 변수
	    presentationMode.classList.add("hidden"); // 프레젠테이션 모드 숨김
	}


});

function makeDraggable(element) {
    element.style.position = "absolute";
    element.style.cursor = "move";

    let offsetX = 0, offsetY = 0, initialX, initialY;

    element.addEventListener("mousedown", (e) => {
        e.preventDefault();
        initialX = e.clientX - offsetX;
        initialY = e.clientY - offsetY;

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });

    element.addEventListener("click", (e) => {
        e.stopPropagation();
        if (window.selectedElement) {
            window.selectedElement.classList.remove("selected");
        }
        window.selectedElement = element; // 전역 선택 요소 업데이트
        element.classList.add("selected"); // 선택된 스타일 적용
    });

    function onMouseMove(e) {
        offsetX = e.clientX - initialX;
        offsetY = e.clientY - initialY;
        element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }

    function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        if (!window.stompClient || !window.stompClient.connected) {
            console.error("WebSocket is not connected.");
            return;
        }

        if (element.id && element.parentElement) {
            const updateData = {
                action: "moveText",
                slideId: element.parentElement.id,
                elementId: element.id,
                offsetX: offsetX,
                offsetY: offsetY
            };
            console.log("Sending WebSocket message:", updateData); // 디버깅 로그 추가
            window.stompClient.send("/app/uiAction", {}, JSON.stringify(updateData));
        } else {
            console.error(
                "Failed to send WebSocket message.",
                "Element ID:", element.id,
                "Parent ID:", element.parentElement ? element.parentElement.id : null
            );
        }
    }
}

