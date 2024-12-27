package com.cjt.tuesday.dtos;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class InvitationDto {
    private Integer id;                  // 초대 고유 ID
    private Integer projectId;           // 초대 대상 프로젝트 ID
    private Integer senderId;            // 초대를 보낸 사용자 ID
    private String recipientEmail;       // 초대받은 사용자의 이메일
    private Integer recipientId;         // 초대받은 사용자의 고유 ID (추가된 필드)
    private String status;               // 초대 상태 ('sent', 'accepted', 'declined')
    private LocalDateTime createdAt;     // 초대 생성 시간
    private LocalDateTime updatedAt;     // 초대 수정 시간
}
