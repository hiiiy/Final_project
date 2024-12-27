package com.cjt.tuesday.controller;

import com.cjt.tuesday.command.AddUserCommand;
import com.cjt.tuesday.command.LoginCommand;
import com.cjt.tuesday.dtos.UserDto;
import com.cjt.tuesday.service.InvitationService;
import com.cjt.tuesday.service.UserService;
import com.cjt.tuesday.mapper.UserMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/user")
public class UserController {

	@Autowired
	private UserService userService;

	@Autowired
	private InvitationService invitationService;

	@Autowired
	private UserMapper userMapper;

	@Autowired
	private SimpMessagingTemplate messagingTemplate;

	// 로그인 폼 이동
	@GetMapping("/login")
	public String loginForm(Model model) {
		model.addAttribute("loginCommand", new LoginCommand());
		return "user/login"; // 로그인 폼 렌더링
	}

	@PostMapping("/login")
	public String login(@RequestParam String email, 
			@RequestParam String password, 
			HttpSession session, 
			RedirectAttributes redirectAttributes) {
		try {
			UserDto user = userService.login(email, password);

			if (user != null) {
				session.setAttribute("userDto", user);

				// WebSocket 메시지 전송
				messagingTemplate.convertAndSend("/topic/status", user);

				// 초대 상태가 accepted인 경우 팀원으로 추가
				if (invitationService.hasAcceptedInvitations(email)) {
					invitationService.addUserToProjects(email);
				}

				// 마지막 프로젝트 ID로 리디렉션
				if (user.getLastProjectId() != null) {
					return "redirect:/home?projectId=" + user.getLastProjectId();
				} else {
					return "redirect:/project/list"; // 기본 프로젝트 목록 페이지로 이동
				}
			} else {
				redirectAttributes.addFlashAttribute("errorMessage", "잘못된 이메일 또는 비밀번호입니다.");
				return "redirect:/user/login";
			}
		} catch (Exception e) {
		    e.printStackTrace(); // 콘솔에 예외 출력
			redirectAttributes.addFlashAttribute("errorMessage", "잘못된 이메일 또는 비밀번호입니다.");
			return "redirect:/user/login";
		}
	}


	// 회원가입 폼 이동
	@GetMapping("/addUser")
	public String addUserForm(Model model) {
		System.out.println("회원가입 폼 이동");
		model.addAttribute("addUserCommand", new AddUserCommand());
		return "user/addUserForm"; // 회원가입 폼 렌더링
	}

	// 회원가입 처리
	@PostMapping("/addUser")
	public String addUser(@Validated AddUserCommand addUserCommand,
			BindingResult result,
			RedirectAttributes redirectAttributes,
			Model model) {
		if (result.hasErrors()) {
			model.addAttribute("errors", result.getFieldErrors());
			model.addAttribute("addUserCommand", addUserCommand); // 입력 값 유지
			System.out.println("회원가입 유효성 검사 실패");
			return "user/addUserForm"; // 유효성 검사 실패 시 회원가입 폼으로 돌아감
		}

		try {
			userService.addUser(addUserCommand);
			System.out.println("회원가입 성공");
			// 성공 상태 플래그 전달
			redirectAttributes.addFlashAttribute("signupSuccess", true);
			return "redirect:/user/login"; // 회원가입 성공 후 로그인 페이지로 이동
		} catch (Exception e) {
			System.out.println("회원가입 중 오류 발생");
			model.addAttribute("error", "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
			e.printStackTrace();
			return "user/addUserForm";
		}
	}

	//이메일 중복체크
	@GetMapping("/emailChk")
	@ResponseBody
	public Map<String, Boolean> emailChk(@RequestParam String email) {
		boolean isDuplicate = userService.isEmailDuplicate(email);
		Map<String, Boolean> response = new HashMap<>();
		response.put("isDuplicate", isDuplicate);
		return response;
	}

	// 로그아웃 처리
	@GetMapping("/logout")
	public String logout(HttpSession session) {
	    UserDto user = (UserDto) session.getAttribute("userDto");

	    if (user != null) {
	        userService.logout(user.getUserId()); // userId 전달

	        // WebSocket 메시지 전송
	        messagingTemplate.convertAndSend("/topic/status", user);

	        session.invalidate(); // 세션 무효화
	    }

	    return "redirect:/user/login";
	}

	@PostMapping("/logout-auto")
	public ResponseEntity<String> autoLogout(@RequestBody Map<String, Integer> payload) {
	    Integer userId = payload.get("userId");

	    if (userId != null) {
	        UserDto user = userService.findUserById(userId);
	        if (user != null) {
	            userService.logout(userId);

	            // WebSocket 메시지 전송
	            messagingTemplate.convertAndSend("/topic/status", user);

	            return ResponseEntity.ok("로그아웃 처리 완료");
	        }
	    }

	    return ResponseEntity.badRequest().body("유효하지 않은 요청");
	}



	@GetMapping("/profile")
	public String userProfile(HttpSession session, Model model) {
		UserDto userDto = (UserDto) session.getAttribute("userDto");
		if (userDto == null) {
			return "redirect:/user/login";
		}

		// 값 확인을 위해 로그 출력
		System.out.println("Profile Color: " + userDto.getProfileColor());

		model.addAttribute("user", userDto);
		model.addAttribute("profileColor", userDto.getProfileColor());
		return "user/profile";
	}

	@PostMapping("/profile")
	public String updateProfile(@Validated UserDto updatedUser,
			BindingResult result,
			HttpSession session,
			Model model) {
		// 유효성 검사
		if (result.hasErrors()) {
			return "user/profile"; // 유효성 검사 실패 시 프로필 페이지로 이동
		}

		// 세션에서 사용자 정보 확인
		UserDto userDto = (UserDto) session.getAttribute("userDto");
		if (userDto == null) {
			return "redirect:/user/login"; // 세션 정보가 없으면 로그인 페이지로 리다이렉트
		}

		try {
			// 사용자 정보 업데이트
			userDto.setUsername(updatedUser.getUsername());
			userDto.setTitle(updatedUser.getTitle());
			userService.updateUser(userDto);

			// 세션 정보 업데이트
			session.setAttribute("userDto", userDto);
			model.addAttribute("successMessage", "프로필이 성공적으로 업데이트되었습니다.");
		} catch (Exception e) {
			model.addAttribute("errorMessage", "프로필 업데이트 중 오류가 발생했습니다.");
		}

		return "user/profile"; // 업데이트 후 프로필 페이지로 이동
	}

	@PostMapping("/updateTitle")
	public String updateTitle(@RequestParam("title") String title,
			HttpSession session,
			RedirectAttributes redirectAttributes) {
		// 현재 로그인한 사용자 가져오기
		UserDto userDto = (UserDto) session.getAttribute("userDto");
		if (userDto == null) {
			redirectAttributes.addFlashAttribute("errorMessage", "로그인 세션이 만료되었습니다.");
			return "redirect:/user/profile";
		}

		// 직책 변경 처리
		try {
			userService.updateUserTitle(userDto.getUserId(), title);
			userDto.setTitle(title); // 세션 정보 업데이트
			session.setAttribute("userDto", userDto);
			redirectAttributes.addFlashAttribute("successMessage", "직책이 변경되었습니다.");
		} catch (Exception e) {
			e.printStackTrace();
			redirectAttributes.addFlashAttribute("errorMessage", "직책 변경 중 오류가 발생했습니다.");
		}

		return "redirect:/user/profile"; // 프로필 페이지로 리디렉션
	}

	@PostMapping("/changePassword")
	public String changePassword(@RequestParam("currentPassword") String currentPassword,
			@RequestParam("newPassword") String newPassword,
			HttpSession session, RedirectAttributes redirectAttributes) {
		UserDto user = (UserDto) session.getAttribute("userDto");
		if (user == null) {
			redirectAttributes.addFlashAttribute("errorMessage", "로그인 세션이 만료되었습니다.");
			return "redirect:/user/login";
		}

		try {
			userService.changePassword(user.getEmail(), currentPassword, newPassword);
			redirectAttributes.addFlashAttribute("successMessage", "비밀번호가 변경되었습니다.");
		} catch (Exception e) {
			redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
		}

		return "redirect:/user/profile";
	}

	//비밀번호를 잊으셨나요?
	@GetMapping("/forgotPassword")
	public String showForgotPasswordForm(Model model) {
		return "user/forgotPassword"; // forgotPassword.html 템플릿 반환
	}

	// 비밀번호 재설정 요청 처리
	@PostMapping("/requestPasswordReset")
	public String requestPasswordReset(@RequestParam("email") String email, Model model) {
		try {
			userService.sendPasswordResetEmail(email);
			model.addAttribute("successMessage", "비밀번호 재설정 링크가 이메일로 발송되었습니다.");
		} catch (Exception e) {
			model.addAttribute("errorMessage", e.getMessage());
		}
		return "user/forgotPassword";
	}

	//비밀번호 재설성 요청 후 처리.

	@GetMapping("/resetPassword")
	public String showResetPasswordPage(@RequestParam("token") String token, Model model) {
		// 토큰 값 확인
		if (token == null || token.isEmpty()) {
			model.addAttribute("errorMessage", "잘못된 접근입니다. 유효하지 않은 토큰입니다.");
			return "error/invalidToken"; // 에러 페이지를 렌더링
		}

		// 추가 검증 로직 (선택 사항)
		System.out.println("Received token: " + token);

		// 토큰 유효성 확인 및 페이지 렌더링
		model.addAttribute("token", token); // 토큰 값을 뷰로 전달
		return "user/resetPassword"; // 비밀번호 재설정 페이지
	}


	@PostMapping("/resetPassword")
	public String resetPassword(@RequestParam("token") String token,
			@RequestParam("password") String password,
			@RequestParam("confirmPassword") String confirmPassword,
			Model model) {
		System.out.println("[INFO] POST /resetPassword - Token received: " + token);

		try {
			// 비밀번호 확인
			if (!password.equals(confirmPassword)) {
				System.out.println("[ERROR] Passwords do not match.");
				model.addAttribute("errorMessage", "비밀번호가 일치하지 않습니다.");
				model.addAttribute("token", token);
				return "user/resetPassword";
			}

			// 비밀번호 재설정
			System.out.println("[INFO] Validating token and resetting password.");
			userService.resetPassword(token, password);

			System.out.println("[INFO] Password reset successful.");
			model.addAttribute("successMessage", "비밀번호가 성공적으로 재설정되었습니다.");
			return "user/login"; // 성공 시 로그인 페이지로 이동
		} catch (Exception e) {
			System.err.println("[ERROR] Password reset failed: " + e.getMessage());
			e.printStackTrace();
			model.addAttribute("errorMessage", e.getMessage());
			model.addAttribute("token", token);
			return "user/resetPassword";
		}
	}

}
