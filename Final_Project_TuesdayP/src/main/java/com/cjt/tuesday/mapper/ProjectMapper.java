package com.cjt.tuesday.mapper;

import com.cjt.tuesday.dtos.ProjectDto;
import com.cjt.tuesday.dtos.UserDto;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ProjectMapper {

	// 사용자 ID로 프로젝트 목록 가져오기
	List<ProjectDto> findProjectsByUserId(@Param("userId") Integer userId);

	List<ProjectDto> findAccessibleProjects(@Param("userId") Integer userId);


	// 프로젝트 ID로 단일 프로젝트 가져오기
	ProjectDto findProjectById(@Param("projectId") Integer projectId);

	// 프로젝트 이름 가져오기
	String findProjectNameById(@Param("projectId") Integer projectId);

	// 새 프로젝트 추가
	void addProject(ProjectDto project);

	// 프로젝트 이름 업데이트
	void updateProjectName(@Param("projectId") Integer projectId, @Param("name") String name);

	// 프로젝트 삭제
	void deleteProject(@Param("projectId") Integer projectId);

	UserDto findTeamLeader(@Param("projectId") Integer projectId);
	// 프로젝트에 속한 팀원 목록 가져오기
	List<UserDto> findTeamMembersByProjectId(@Param("projectId") Integer projectId);
}
