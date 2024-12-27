package com.cjt.tuesday.mapper;

import com.cjt.tuesday.dtos.PasswordResetTokenDto;
import com.cjt.tuesday.dtos.UserDto;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.data.repository.query.Param;

@Mapper
public interface UserMapper {
	
    void updateStatus(@Param("userId") Integer userId, @Param("status") String status);
    // 모든 사용자 조회
    List<UserDto> getAllUsers();
    
    // 사용자 ID로 사용자 정보 조회
    UserDto findUserById(@Param("userId") Integer userId);
    
	// 이메일로 사용자 조회
	UserDto findUserByEmail(String email);
	
    // 사용자 ID로 마지막 방문한 프로젝트 ID 조회
    Integer getLastProjectId(@Param("userId") Integer userId);
    
    // 사용자 상태 업데이트
    void updateUserStatus(@Param("userId") Integer userId, @Param("status") String status);


	// 사용자 추가 (회원가입)
	void addUser(UserDto userDto);

	void updateUser(UserDto userDto);

	public UserDto getUser(int userId);
	

	void updateTitle(@Param("userId") Integer userId, @Param("title") String title);

	void updatePasswordByEmail(@Param("email") String email, @Param("password") String password);

	// 비밀번호 재설정 토큰 저장
	void savePasswordResetToken(@Param("userId") Integer userId, 
			@Param("token") String token, 
			@Param("expiresAt") LocalDateTime expiresAt);

	// 토큰으로 사용자 ID 조회
	Integer findUserIdByToken(String token);

	PasswordResetTokenDto findPasswordResetToken(String token);
	
	int updatePassword(@Param("userId") Integer userId, @Param("password") String password);
	
	void deletePasswordResetToken(String token);


}

