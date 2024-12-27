package com.cjt.tuesday.service;

import com.cjt.tuesday.command.AddUserCommand;
import com.cjt.tuesday.command.LoginCommand;
import com.cjt.tuesday.dtos.PasswordResetTokenDto;
import com.cjt.tuesday.dtos.UserDto;
import com.cjt.tuesday.mapper.UserMapper;
import com.cjt.tuesday.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

	@Autowired
	private UserMapper userMapper;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private EmailService emailService;

	@Autowired
	private SimpMessagingTemplate messagingTemplate;

	@Autowired
	private Environment env; // Spring 환경 변수 주입

	public UserDto findUserByEmail(String email) {
		return userMapper.findUserByEmail(email);
	}

	public UserService(UserMapper userMapper, EmailService emailService) {
		this.userMapper = userMapper;
		this.emailService = emailService;
	}

	// 로그인 처리
	public UserDto login(String email, String password) {
		// 데이터베이스에서 사용자 정보 조회
		UserDto userDto = userMapper.findUserByEmail(email);

		if (userDto != null && passwordEncoder.matches(password, userDto.getPassword())) {
			// 마지막 프로젝트 ID 설정
			Integer lastProjectId = userMapper.getLastProjectId(userDto.getUserId());

			userMapper.updateUserStatus(userDto.getUserId(), "active");
			userDto.setStatus("active");
			userDto.setLastProjectId(lastProjectId);

			return userDto; // 성공적으로 인증된 사용자 반환
		}

		throw new RuntimeException("잘못된 이메일 또는 비밀번호입니다.");
	}
	
    public boolean isPasswordCorrect(UserDto user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }

	public UserDto findUserById(Integer userId) {
		return userMapper.findUserById(userId);
	}

	// 로그아웃 처리
	public void logout(Integer userId) {
		// 사용자 상태를 inactive로 업데이트
		userMapper.updateUserStatus(userId, "inactive");
	}

	// 회원가입 처리
	public void addUser(AddUserCommand addUserCommand) throws Exception {
		// 이메일 중복 확인
		if (userMapper.findUserByEmail(addUserCommand.getEmail()) != null) {
			throw new Exception("이미 존재하는 이메일입니다.");
		}

		// UserDto로 변환
		UserDto userDto = new UserDto();
		userDto.setUsername(addUserCommand.getUsername());
		userDto.setEmail(addUserCommand.getEmail());
		userDto.setPassword(passwordEncoder.encode(addUserCommand.getPassword())); // 비밀번호 암호화
		userDto.setTitle(addUserCommand.getTitle());
		userDto.setStatus("active"); // 기본 상태 설정
		userDto.setProfileColor(generateProfileColor(addUserCommand.getEmail())); // 색상 생성

		// 데이터베이스에 저장
		userMapper.addUser(userDto);
		System.out.println("회원가입 성공: " + addUserCommand.getEmail());
	}

	// 사용자 고유 색상 생성
	private String generateProfileColor(String key) {
		int hash = key.hashCode();
		int r = (hash & 0xFF0000) >> 16; // Red
		int g = (hash & 0x00FF00) >> 8;  // Green
		int b = hash & 0x0000FF;         // Blue

		// 하얀색(#FFFFFF)에 가까운 색상 방지
		if (r > 200 && g > 200 && b > 200) {
			r = 200; g = 180; b = 150; // 임의로 색상을 조정
		}

		return "#" + String.format("%02X%02X%02X", r, g, b); // #RRGGBB 형식
	}

	public boolean isEmailDuplicate(String email) {
		return userMapper.findUserByEmail(email) != null;
	}

	// 모든 사용자 조회
	public List<UserDto> getAllUsers() {
		return userMapper.getAllUsers();
	}


	public UserDto getUser(int userId) {
		return userMapper.getUser(userId);
	}

	public void updateUser(UserDto userDto) {
		userMapper.updateUser(userDto);
	}

	public void updateUserTitle(Integer userId, String title) {
		userMapper.updateTitle(userId, title);
	}

	// 프로필에서 비밀번호 변경 처리
	public void changePassword(String email, String currentPassword, String newPassword) throws Exception {
		UserDto userDto = userMapper.findUserByEmail(email);
		if (userDto == null) {
			throw new Exception("사용자를 찾을 수 없습니다.");
		}

		// 현재 비밀번호 확인
		if (!passwordEncoder.matches(currentPassword, userDto.getPassword())) {
			throw new Exception("현재 비밀번호가 일치하지 않습니다.");
		}

		// 새 비밀번호로 업데이트
		String encodedNewPassword = passwordEncoder.encode(newPassword);
		userMapper.updatePasswordByEmail(email, encodedNewPassword);
	}

	//비밀번호를 잊으셨나요? 재설정.
	public void sendPasswordResetEmail(String email) throws Exception {
		UserDto userDto = userMapper.findUserByEmail(email);
		if (userDto == null) {
			throw new Exception("해당 이메일로 등록된 사용자가 없습니다.");
		}

		String resetToken = UUID.randomUUID().toString();
		LocalDateTime expiresAt = LocalDateTime.now().plusHours(1);
		userMapper.savePasswordResetToken(userDto.getUserId(), resetToken, expiresAt);

		// 동적으로 서버 URL 가져오기
		//와이파이마다 주소를 다르게 해야 함.
		String serverUrl = env.getProperty("app.server.url", "http://192.168.22.108:80");
		String resetLink = serverUrl + "/user/resetPassword?token=" + resetToken;

		String emailContent = String.format(
				"<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
						"  <h2>안녕하세요, %s님</h2>" +
						"  <p>비밀번호를 재설정하려면 아래 링크를 클릭하세요:</p>" +
						"  <a href='%s'>[비밀번호 재설정 하러가기]</a>" +
						"  <p style='margin-top: 20px;'>감사합니다.</p>" +
						"</div>",
						userDto.getUsername(), resetLink
				);

		emailService.sendEmail(email, "비밀번호 재설정 요청", emailContent);
		System.out.println("비밀번호 재설정 링크 발송: " + resetLink);
	}
	// 토큰 검증 메서드
	public boolean isValidPasswordResetToken(String token) {
		PasswordResetTokenDto resetToken = userMapper.findPasswordResetToken(token);

		System.out.println("[DEBUG] Reset token found: " + (resetToken != null));
		if (resetToken == null || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
			System.err.println("[ERROR] Token is invalid or expired.");
			return false;
		}
		System.out.println("[INFO] Token is valid.");
		return true;
	}

	@Transactional // 트랜잭션 관리 추가
	public void resetPassword(String token, String newPassword) throws Exception {
		System.out.println("[INFO] Validating token: " + token);

		// 1. 토큰 검증
		PasswordResetTokenDto resetToken = userMapper.findPasswordResetToken(token);
		if (resetToken == null) {
			System.err.println("[ERROR] Token not found or invalid.");
			throw new Exception("유효하지 않거나 만료된 토큰입니다.");
		}

		if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
			System.err.println("[ERROR] Token has expired.");
			throw new Exception("유효하지 않거나 만료된 토큰입니다.");
		}

		System.out.println("[INFO] Token is valid. User ID: " + resetToken.getUserId());

		// 2. 새 비밀번호 암호화
		String encryptedPassword = passwordEncoder.encode(newPassword);
		System.out.println("[DEBUG] Encrypted password: " + encryptedPassword);

		// 3. 비밀번호 업데이트 쿼리 실행
		int rowsAffected = userMapper.updatePassword(resetToken.getUserId(), encryptedPassword);
		System.out.println("[DEBUG] Rows affected by updatePassword: " + rowsAffected);

		if (rowsAffected == 0) {
			System.err.println("[ERROR] No rows were updated. Check the user ID.");
			throw new Exception("비밀번호 업데이트에 실패했습니다. 사용자 ID를 확인하세요.");
		}

		// 4. 업데이트된 비밀번호 검증
		UserDto updatedUser = userMapper.getUser(resetToken.getUserId());
		System.out.println("[INFO] Updated user password: " + updatedUser.getPassword());

		if (!passwordEncoder.matches(newPassword, updatedUser.getPassword())) {
			System.err.println("[ERROR] Password verification failed after update.");
			throw new Exception("비밀번호가 데이터베이스에 올바르게 저장되지 않았습니다.");
		}

		// 5. 토큰 삭제
		userMapper.deletePasswordResetToken(token);
		System.out.println("[INFO] Password reset token deleted.");
	}


}
