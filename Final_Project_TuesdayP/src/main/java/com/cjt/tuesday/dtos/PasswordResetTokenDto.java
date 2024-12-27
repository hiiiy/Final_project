package com.cjt.tuesday.dtos;

import java.time.LocalDateTime;

import lombok.Data;
@Data
public class PasswordResetTokenDto {
	private Integer userId;         // 사용자 ID
	private String token;           // 비밀번호 재설정 토큰
	private LocalDateTime expiresAt; // 만료 시간

}
