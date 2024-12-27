package com.cjt.tuesday.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDto {
    private Integer userId; // 사용자 고유 ID
    private String username; // 사용자 이름
    private String email; // 이메일
    private String password; // 암호화된 비밀번호
    private String title; // 직책
    private String status; // 사용자 상태
    private LocalDateTime createdAt; // 생성 시간
    private LocalDateTime updatedAt; // 수정 시간
    private String profileColor; // 프로필 색상
    private Integer lastProjectId; // 마지막으로 방문한 프로젝트 ID

}
