let slides = [];
let currentSlideIndex = 0;
let selectedElement = null;

document.addEventListener('DOMContentLoaded', () => {
    const addSlideBtn = document.getElementById('addSlide');
    const addTextBtn = document.getElementById('addText');
    const addImageBtn = document.getElementById('addImage');
    const addShapeSelect = document.getElementById('addShape');
    const deleteElementBtn = document.getElementById('deleteElement');
    const deleteSlideBtn = document.getElementById('deleteSlide');
    const moveSlideUpBtn = document.getElementById('moveSlideUp');
    const moveSlideDownBtn = document.getElementById('moveSlideDown');
    const startPresentationBtn = document.getElementById('startPresentation');
    const prevSlideBtn = document.getElementById('prevSlide');
    const nextSlideBtn = document.getElementById('nextSlide');
    const exitPresentationBtn = document.getElementById('exitPresentation');
    const imageUpload = document.getElementById('imageUpload');
    const sizeAdjust = document.getElementById('sizeAdjust');
    const colorPicker = document.getElementById('colorPicker');
    const exportPPTBtn = document.getElementById('exportPPT');
    const slideContainer = document.getElementById('slideContainer');

    addSlideBtn.addEventListener('click', addSlide);
    addTextBtn.addEventListener('click', () => addText(currentSlideIndex));
    addImageBtn.addEventListener('click', () => imageUpload.click());
    imageUpload.addEventListener('change', (e) => addImage(e, currentSlideIndex));
    addShapeSelect.addEventListener('change', (e) => addShape(e, currentSlideIndex));
    deleteElementBtn.addEventListener('click', deleteSelectedElement);
    deleteSlideBtn.addEventListener('click', deleteSlide);
    moveSlideUpBtn.addEventListener('click', moveSlideUp);
    moveSlideDownBtn.addEventListener('click', moveSlideDown);
    startPresentationBtn.addEventListener('click', startPresentation);
    prevSlideBtn.addEventListener('click', showPreviousSlide);
    nextSlideBtn.addEventListener('click', showNextSlide);
    exitPresentationBtn.addEventListener('click', exitPresentation);
    sizeAdjust.addEventListener('input', adjustSize);
    colorPicker.addEventListener('input', changeColor);
    exportPPTBtn.addEventListener('click', exportToPDF);

    slideContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('slide')) {
            const index = Array.from(slideContainer.children).indexOf(e.target);
            switchToSlide(index);
        }
    });

    document.addEventListener('keydown', handleKeyDown);

    addSlide(); // 초기 슬라이드 추가
});

function addSlide() {
    const slideContainer = document.getElementById('slideContainer');
    const slideDiv = document.createElement('div');
    slideDiv.className = 'slide';
    slideDiv.innerHTML = `
        <div class="slide-content"></div>
        <div class="slide-number">${slides.length + 1}</div>
    `;
    slideContainer.appendChild(slideDiv);
    slides.push({
        element: slideDiv,
        content: []
    });
    switchToSlide(slides.length - 1);
}

function switchToSlide(index) {
    if (index < 0 || index >= slides.length) return;
    currentSlideIndex = index;
    updateSlideNumbers();
    updateCurrentSlide();
}

function addText(slideIndex) {
    const textElement = document.createElement('div');
    textElement.className = 'text';
    textElement.contentEditable = true;
    textElement.textContent = '텍스트를 입력하세요';
    textElement.style.position = 'absolute';
    textElement.style.left = '10px';
    textElement.style.top = '10px';
    slides[slideIndex].content.push({
        type: 'text',
        element: textElement
    });
    renderSlideContent(slideIndex);
    makeElementDraggable(textElement);
    textElement.focus();
}

function addImage(event, slideIndex) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgElement = document.createElement('img');
            imgElement.src = e.target.result;
            imgElement.style.position = 'absolute';
            imgElement.style.left = '10px';
            imgElement.style.top = '10px';
            imgElement.style.maxWidth = '100%';
            imgElement.style.maxHeight = '100%';
            slides[slideIndex].content.push({
                type: 'image',
                element: imgElement
            });
            renderSlideContent(slideIndex);
            makeElementDraggable(imgElement);
        }
        reader.readAsDataURL(file);
    }
}

function addShape(event, slideIndex) {
    const shapeType = event.target.value;
    if (shapeType) {
        const shapeElement = document.createElement('div');
        shapeElement.className = `shape ${shapeType}`;
        shapeElement.style.position = 'absolute';
        shapeElement.style.left = '10px';
        shapeElement.style.top = '10px';
        slides[slideIndex].content.push({
            type: 'shape',
            element: shapeElement
        });
        renderSlideContent(slideIndex);
        makeElementDraggable(shapeElement);
        event.target.value = ''; // Reset select
    }
}

function makeElementDraggable(element) {
    element.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('text') && e.target === document.activeElement) return;
        
        selectElement(element);
        
        const startX = e.clientX - element.offsetLeft;
        const startY = e.clientY - element.offsetTop;

        function moveElement(e) {
            element.style.left = (e.clientX - startX) + 'px';
            element.style.top = (e.clientY - startY) + 'px';
        }

        function stopMoving() {
            document.removeEventListener('mousemove', moveElement);
            document.removeEventListener('mouseup', stopMoving);
        }

        document.addEventListener('mousemove', moveElement);
        document.addEventListener('mouseup', stopMoving);
    });
}

function selectElement(element) {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
    }
    selectedElement = element;
    selectedElement.classList.add('selected');
    document.getElementById('editPanel').classList.remove('hidden');
}

function adjustSize(event) {
    if (selectedElement) {
        const size = event.target.value;
        selectedElement.style.transform = `scale(${size / 100})`;
    }
}

function changeColor(event) {
    if (selectedElement) {
        const color = event.target.value;
        if (selectedElement.classList.contains('text')) {
            selectedElement.style.color = color;
        } else {
            selectedElement.style.backgroundColor = color;
        }
    }
}

function deleteSelectedElement() {
    if (selectedElement) {
        const slideContent = slides[currentSlideIndex].content;
        const index = slideContent.findIndex(item => item.element === selectedElement);
        if (index !== -1) {
            slideContent.splice(index, 1);
        }
        renderSlideContent(currentSlideIndex);
        selectedElement = null;
        document.getElementById('editPanel').classList.add('hidden');
    }
}

function handleKeyDown(event) {
    if (event.key === 'Delete' && selectedElement) {
        deleteSelectedElement();
    }
}

function deleteSlide() {
    if (slides.length <= 1) return;
    slides[currentSlideIndex].element.remove();
    slides.splice(currentSlideIndex, 1);
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = slides.length - 1;
    }
    updateSlideNumbers();
    updateCurrentSlide();
}

function moveSlideUp() {
    if (currentSlideIndex <= 0) return;
    const temp = slides[currentSlideIndex];
    slides[currentSlideIndex] = slides[currentSlideIndex - 1];
    slides[currentSlideIndex - 1] = temp;
    slides[currentSlideIndex].element.parentNode.insertBefore(temp.element, slides[currentSlideIndex].element);
    currentSlideIndex--;
    updateSlideNumbers();
    updateCurrentSlide();
}

function moveSlideDown() {
    if (currentSlideIndex >= slides.length - 1) return;
    const temp = slides[currentSlideIndex];
    slides[currentSlideIndex] = slides[currentSlideIndex + 1];
    slides[currentSlideIndex + 1] = temp;
    slides[currentSlideIndex].element.parentNode.insertBefore(slides[currentSlideIndex].element, temp.element);
    currentSlideIndex++;
    updateSlideNumbers();
    updateCurrentSlide();
}

function updateSlideNumbers() {
    slides.forEach((slide, index) => {
        slide.element.querySelector('.slide-number').textContent = index + 1;
    });
}

function updateCurrentSlide() {
    slides.forEach((slide, index) => {
        if (index === currentSlideIndex) {
            slide.element.classList.add('current-slide');
        } else {
            slide.element.classList.remove('current-slide');
        }
    });
    renderSlideContent(currentSlideIndex);
}

function renderSlideContent(slideIndex) {
    const slideContent = slides[slideIndex].element.querySelector('.slide-content');
    slideContent.innerHTML = '';
    slides[slideIndex].content.forEach(item => {
        slideContent.appendChild(item.element);
    });
}

function startPresentation() {
    if (slides.length === 0) return;
    currentSlideIndex = 0;
    document.getElementById('app').classList.add('hidden');
    document.getElementById('presentationMode').classList.remove('hidden');
    showCurrentSlide();
}

function showCurrentSlide() {
    const currentSlide = slides[currentSlideIndex];
    const currentSlideDisplay = document.getElementById('currentSlide');
    currentSlideDisplay.innerHTML = '';
    
    const slideContent = document.createElement('div');
    slideContent.className = 'slide-content';
    currentSlide.content.forEach(item => {
        const clonedElement = item.element.cloneNode(true);
        slideContent.appendChild(clonedElement);
    });
    
    currentSlideDisplay.appendChild(slideContent);
    
    // Adjust the size of the elements to fit the presentation view
    const scaleFactor = Math.min(
        currentSlideDisplay.offsetWidth / currentSlide.element.offsetWidth,
        currentSlideDisplay.offsetHeight / currentSlide.element.offsetHeight
    );
    slideContent.style.transform = `scale(${scaleFactor})`;
    slideContent.style.transformOrigin = 'top left';
}

function showPreviousSlide() {
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
        showCurrentSlide();
    }
}

function showNextSlide() {
    if (currentSlideIndex < slides.length - 1) {
        currentSlideIndex++;
        showCurrentSlide();
    }
}

function exitPresentation() {
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('presentationMode').classList.add('hidden');
    updateCurrentSlide();
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('l', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const exportSlides = async () => {
        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i].element;
            const canvas = await html2canvas(slide, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            
            if (i < slides.length - 1) {
                pdf.addPage();
            }
        }
    };

    exportSlides().then(() => {
        pdf.save('presentation.pdf');
    });
}

