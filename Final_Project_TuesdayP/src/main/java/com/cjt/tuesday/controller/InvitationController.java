package com.cjt.tuesday.controller;

import com.cjt.tuesday.dtos.InvitationDto;
import com.cjt.tuesday.dtos.ProjectDto;
import com.cjt.tuesday.dtos.UserDto;
import com.cjt.tuesday.service.InvitationService;
import com.cjt.tuesday.service.ProjectService;
import com.cjt.tuesday.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/invitations")
public class InvitationController {

	@Autowired
	private InvitationService invitationService;

	@Autowired
	private ProjectService projectService;

	@Autowired
	private UserService userService;
	
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

	//초대model.
	@GetMapping("/invite")
	public String getInvitePage(@RequestParam Integer projectId, HttpSession session, Model model) {

		System.out.println("Received projectId: " + projectId);
		model.addAttribute("projectId", projectId);

		// 현재 사용자 확인
		UserDto currentUser = (UserDto) session.getAttribute("userDto");

		if (projectId == null) {
			model.addAttribute("errorMessage", "프로젝트 ID가 제공되지 않았습니다.");
			return "redirect:/project/list"; // 프로젝트 목록으로 리디렉션
		}

		if (currentUser == null) {
			return "redirect:/user/login";
		}

		// 프로젝트 정보 가져오기
		ProjectDto project = projectService.getProjectById(projectId);

		if (project == null) {
			model.addAttribute("errorMessage", "존재하지 않는 프로젝트입니다.");
			return "redirect:/project/list";
		}

		// 팀장 정보 가져오기
		UserDto teamLeader = projectService.getTeamLeaderByProjectId(projectId);

		// 팀원 정보 가져오기
		List<UserDto> teamMembers = projectService.getTeamMembersByProjectId(projectId);

        List<UserDto> userList = userService.getAllUsers(); // 모든 사용자 조회


		// 로그 추가: 데이터 확인
		System.out.println("Current User: " + currentUser);
		System.out.println("Team Leader: " + (teamLeader != null ? teamLeader.getUsername() + ", Profile Color: " + teamLeader.getProfileColor() : "No team leader found"));
		System.out.println("Team Members:");
		if (teamMembers != null) {
			for (UserDto member : teamMembers) {
				System.out.println("- " + member.getUsername() + ", Profile Color: " + member.getProfileColor());
			}
		} else {
			System.out.println("No team members found");
		}

        model.addAttribute("userList", userList);

		// 모델에 projectId 추가
		model.addAttribute("projectId", projectId);

		// 모델에 데이터 추가
		model.addAttribute("currentUser", currentUser);
		model.addAttribute("projectName", project.getName());
		model.addAttribute("teamLeader", teamLeader);
		model.addAttribute("teamMembers", teamMembers);



		return "invitations/invite";
	}
	
	// 초대 전송
	@PostMapping("/send")
	public String sendInvitation(
			@RequestParam("projectId") Integer projectId,
			@RequestParam("recipientEmail") String recipientEmail,
			HttpSession session,
			RedirectAttributes redirectAttributes) {

		UserDto currentUser = (UserDto) session.getAttribute("userDto");
		if (currentUser == null) {
			return "redirect:/user/login"; // 로그인 페이지로 리디렉션
		}

		// 초대 메일 전송
		invitationService.sendInvitation(projectId, currentUser.getUserId(), recipientEmail);

		// 성공 메시지를 Flash Attribute로 추가
		redirectAttributes.addFlashAttribute("inviteSuccess", "초대 메일이 전송되었습니다.");
		return "redirect:/home?projectId=" + projectId; // 쿼리 파라미터 제거
	}
	
	//초대 수락
	@GetMapping("/accept")
	public String acceptInvitation(@RequestParam("id") Integer id, RedirectAttributes redirectAttributes) {
	    try {
	        InvitationDto invitation = invitationService.acceptInvitation(id);

	        // 초대 상태를 accepted로만 설정
	        redirectAttributes.addFlashAttribute("message", "초대를 수락하려면 로그인해주세요.");
	        return "redirect:/user/login"; // 로그인 페이지로 리디렉션
	    } catch (RuntimeException e) {
	        redirectAttributes.addFlashAttribute("error", "초대 수락 중 오류가 발생했습니다.");
	        return "redirect:/project/list";
	    }
	}

	
	// 초대 거절
	@GetMapping("/decline")
	public String declineInvitation(@RequestParam("id") Integer id, RedirectAttributes redirectAttributes) {
	    try {
	        // 초대 거절 처리
	        invitationService.declineInvitation(id);

	        // 성공 메시지 추가
	        redirectAttributes.addFlashAttribute("message", "초대를 거절하였습니다.");
	    } catch (Exception e) {
	        // 오류 처리
	        redirectAttributes.addFlashAttribute("error", "초대 거절 중 오류가 발생했습니다.");
	    }
	    return "redirect:/project/list"; // 프로젝트 목록 페이지로 리디렉션
	}

}
