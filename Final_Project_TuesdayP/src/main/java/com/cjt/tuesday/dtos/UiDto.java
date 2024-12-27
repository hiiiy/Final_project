package com.cjt.tuesday.dtos;

import lombok.Data;

@Data
public class UiDto {
	private String action;      // 수행할 작업 (예: addSlide, addText 등)
	private String slideId;     // 슬라이드 ID
	private String elementId;   // 요소 ID (텍스트 등)
	private String content;     // 텍스트 또는 기타 내용
	private String shapeType;   // 도형 유형 (사각형, 원 등)
}
