package com.cjt.tuesday.service;

import com.cjt.tuesday.dtos.ProjectDto;
import com.cjt.tuesday.dtos.UserDto;
import com.cjt.tuesday.mapper.ProjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ProjectService {

    @Autowired
    private ProjectMapper projectMapper;

    // 사용자 ID로 프로젝트 목록 가져오기
    public List<ProjectDto> getProjectsByUserId(Integer userId) {
        return projectMapper.findProjectsByUserId(userId);
    }

    public List<ProjectDto> getAccessibleProjects(Integer userId) {
        // 사용자가 생성한 프로젝트 + 초대받아 참여한 프로젝트
        return projectMapper.findAccessibleProjects(userId);
    }

	/*
	 * // 프로젝트 ID로 팀장 정보 가져오기 public UserDto getTeamLeaderByProjectId(Integer
	 * projectId) { return projectMapper.findTeamLeader(projectId); }
	 * 
	 * // 프로젝트 ID로 팀원 정보 가져오기 public List<UserDto> getTeamMembers(Integer projectId)
	 * { return projectMapper.findTeamMembersByProjectId(projectId); }
	 */


    // 팀장 정보 가져오기
    public UserDto getTeamLeaderByProjectId(Integer projectId) {
        return projectMapper.findTeamLeader(projectId);
    }

    // 팀원 목록 가져오기
    public List<UserDto> getTeamMembersByProjectId(Integer projectId) {
        return projectMapper.findTeamMembersByProjectId(projectId);
    }
    // 프로젝트 ID로 프로젝트 정보 가져오기
    public ProjectDto getProjectById(Integer projectId) {
        return projectMapper.findProjectById(projectId);
    }

    // 새 프로젝트 추가
    public void addProject(ProjectDto project, Integer userId) {
        if (userId == null) {
            throw new IllegalArgumentException("사용자 ID가 필요합니다.");
        }
        
        if (project.getStartDate() == null) {
            project.setStartDate(LocalDate.now()); // 시작 날짜 기본값
        }

        if (project.getEndDate() == null) {
            project.setEndDate(project.getStartDate().plusDays(30)); // 종료 날짜 기본값
        }

        // 팀장 ID와 사용자 ID를 설정
        project.setUserId(userId);
        project.setTeamLeaderId(userId);

        // 프로젝트 삽입
        projectMapper.addProject(project);
    }

    // 프로젝트 이름 업데이트
    public void updateProjectName(Integer projectId, String name) {
        projectMapper.updateProjectName(projectId, name);
    }

    // 프로젝트 삭제
    public void deleteProject(Integer projectId) {
        projectMapper.deleteProject(projectId);
    }
}
