package com.cjt.tuesday.controller;

import com.cjt.tuesday.dtos.ProjectDto;
import com.cjt.tuesday.dtos.UserDto;
import com.cjt.tuesday.dtos.WbsDto;
import com.cjt.tuesday.service.ProjectService;
import com.cjt.tuesday.service.WbsService;

import jakarta.servlet.http.HttpSession;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class HomeController {

	@Autowired
	private ProjectService projectService;

	@Autowired
	private WbsService wbsService;

	@GetMapping("/")
	public String root(HttpSession session) {
		UserDto user = (UserDto) session.getAttribute("userDto");
		if (user != null) {
			return "redirect:/project/list";
		}
		return "redirect:/user/login";
	}

	@GetMapping("/home")
	public String  home(@RequestParam Integer projectId, HttpSession session, Model model) {

		model.addAttribute("projectId", projectId);

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

		// 모델에 projectId 추가
		model.addAttribute("projectId", projectId);

		// 모델에 데이터 추가
		model.addAttribute("currentUser", currentUser);
		model.addAttribute("projectName", project.getName());
		model.addAttribute("teamLeader", teamLeader);
		model.addAttribute("teamMembers", teamMembers);


		return "home"; // home.html 렌더링
	}

	

	@GetMapping("/umlpage")
	public String getUMLPage(@RequestParam Integer projectId, HttpSession session, Model model) {

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

		// 모델에 projectId 추가
		model.addAttribute("projectId", projectId);

		// 모델에 데이터 추가
		model.addAttribute("currentUser", currentUser);
		model.addAttribute("projectName", project.getName());
		model.addAttribute("teamLeader", teamLeader);
		model.addAttribute("teamMembers", teamMembers);

		return "uml/umlpage";
	}

	@GetMapping("/wbspage")
	public String getWbsPage(@RequestParam Integer projectId, HttpSession session, Model model) {

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

		// 프로젝트 시작일 추가
		model.addAttribute("projectStartDate", project.getStartDate());
		model.addAttribute("projectEndDate", project.getEndDate());

		// 모델에 projectId 추가
		model.addAttribute("projectId", projectId);

		// 모델에 데이터 추가
		model.addAttribute("currentUser", currentUser);
		model.addAttribute("projectName", project.getName());
		model.addAttribute("teamLeader", teamLeader);
		model.addAttribute("teamMembers", teamMembers);

		return "wbs/wbspage";
	}
	
    // 팀 상태 부분만 반환
	   // team-status 섹션만 반환
    @GetMapping("/home/team-status")
    public String getTeamStatus(@RequestParam Integer projectId, Model model) {
        UserDto teamLeader = projectService.getTeamLeaderByProjectId(projectId);
        List<UserDto> teamMembers = projectService.getTeamMembersByProjectId(projectId);

        model.addAttribute("teamLeader", teamLeader);
        model.addAttribute("teamMembers", teamMembers);

        return "home :: teamStatus"; // home.html의 teamStatus 섹션만 반환
    }

}
