package com.cjt.tuesday.dtos;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class TeamChatMessageDto {
    private Integer projectId; // 프로젝트 ID
    private Integer userId;    // 사용자 ID
    private String username;   // 사용자 이름
    private String message;    // 메시지 내용
    private LocalDateTime  timestamp;  // 메시지 전송 시간
}
