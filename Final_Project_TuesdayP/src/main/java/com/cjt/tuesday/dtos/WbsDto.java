package com.cjt.tuesday.dtos;

import lombok.Data;

@Data
public class WbsDto {
	private Integer id;           // ID
	private Integer projectId;    // 프로젝트 ID
	private String taskName;      // 작업 이름
	private String assignee;      // 담당자
	private String status;        // 상태
	private String startDate;     // 시작 날짜
	private String endDate;       // 종료 날짜
	private Integer duration;     // 작업 기간
	private Integer progress;     // 진행률
}
