package com.cjt.tuesday.controller;

import com.cjt.tuesday.dtos.ProjectDto;
import com.cjt.tuesday.dtos.UserDto;
import com.cjt.tuesday.service.ProjectService;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Controller
@RequestMapping("/project")
public class ProjectController {

	@Autowired
	private ProjectService projectService;

	// 프로젝트 목록 페이지
	@GetMapping("/list")
    public String projectList(HttpSession session, Model model) {
        UserDto user = (UserDto) session.getAttribute("userDto");
        if (user == null) {
            return "redirect:/user/login";
        }

        // 사용자 ID로 프로젝트 목록 가져오기 (직접 생성하거나 초대받은 프로젝트)
        List<ProjectDto> projects = projectService.getAccessibleProjects(user.getUserId());
        model.addAttribute("projects", projects);

        return "project/project"; // 수정된 경로로 템플릿 렌더링 (project/project.html)
    }

	// 새 프로젝트 추가 페이지
    @GetMapping("/add")
    public String addProjectPage(HttpSession session) {
        UserDto user = (UserDto) session.getAttribute("userDto");
        if (user == null) {
            return "redirect:/user/login";
        }
        return "project/project-add"; // 수정된 경로로 템플릿 렌더링 (project/project-add.html)
    }

	// 새 프로젝트 추가 처리
 // 새 프로젝트 추가 처리
    @PostMapping("/add")
    public String addProject(@RequestParam String name, 
                             @RequestParam(required = false) String description, 
                             @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate, 
                             @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate, 
                             HttpSession session) {
        UserDto currentUser = (UserDto) session.getAttribute("userDto");

        if (currentUser == null) {
            return "redirect:/user/login";
        }

        ProjectDto project = new ProjectDto();
        project.setName(name);

        // 현재 날짜로 기본값 설정
        if (startDate == null) {
            startDate = LocalDate.now();
        }
        project.setStartDate(startDate);

        if (endDate == null) {
            endDate = startDate.plusDays(30); // 기본적으로 30일 후로 설정
        }
        project.setEndDate(endDate);

        // 현재 사용자의 userId를 전달
        projectService.addProject(project, currentUser.getUserId());

        return "redirect:/project/list"; // 목록 페이지로 리디렉션
    }



	// 프로젝트 이름 수정 처리
    @PostMapping("/update")
    public String updateProject(@RequestParam Integer projectId,
                                @RequestParam String name,
                                HttpSession session) {
        UserDto user = (UserDto) session.getAttribute("userDto");
        if (user == null) {
            return "redirect:/user/login";
        }

        projectService.updateProjectName(projectId, name);
        return "redirect:/project/list"; // 목록 페이지로 리디렉션
    }

	// 프로젝트 삭제 처리
    @PostMapping("/delete")
    public String deleteProject(@RequestParam Integer projectId, HttpSession session) {
        UserDto user = (UserDto) session.getAttribute("userDto");
        if (user == null) {
            return "redirect:/user/login";
        }

        projectService.deleteProject(projectId);
        return "redirect:/project/list"; // 목록 페이지로 리디렉션
    }
    
 // 특정 프로젝트의 시작일 및 종료일 반환
    @GetMapping("/{projectId}/dates")
    @ResponseBody
    public ProjectDto getProjectDates(@PathVariable Integer projectId, HttpSession session) {
        UserDto user = (UserDto) session.getAttribute("userDto");
        if (user == null) {
            throw new RuntimeException("사용자가 로그인하지 않았습니다."); // 예외 처리
        }

        ProjectDto project = projectService.getProjectById(projectId);
        if (project == null) {
            throw new RuntimeException("프로젝트를 찾을 수 없습니다."); // 예외 처리
        }

        return project; // JSON 형식으로 반환
    }

}
