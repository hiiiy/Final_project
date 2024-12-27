package com.cjt.tuesday.mapper;

import com.cjt.tuesday.dtos.InvitationDto;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface InvitationMapper {

	InvitationDto getInvitationById(@Param("id") Integer id);
	
	InvitationDto findInvitationById(@Param("id") Integer id);
	
    void addToProjectMembers(@Param("projectId") Integer projectId, @Param("userId") Integer userId);


	// 초대 생성
	void saveInvitation(InvitationDto invitation); // 기존 createInvitation을 saveInvitation으로 수정
	// 초대 상태 업데이트
	void updateInvitationStatus(@Param("id") Integer id, @Param("status") String status);
	
    // 초대 상태가 accepted인 초대 목록 조회
    List<InvitationDto> findAcceptedInvitationsByEmail(@Param("email") String email);

	
	// 초대 삭제
	void deleteInvitation(@Param("id") Integer id);
	
	
	// 이메일 기반으로 프로젝트 멤버 추가
	void addUserToProjectByEmail(@Param("projectId") Integer projectId, @Param("email") String email);
	// 초대 ID 기반으로 프로젝트 멤버 추가
	void addUserToProjectByInvitationId(@Param("id") Integer id);


	// 초대 수락 시 팀원 추가

	// 특정 프로젝트의 초대 목록 가져오기
	List<InvitationDto> getInvitationsByProjectId(@Param("projectId") Integer projectId);
	// 특정 사용자의 초대 목록 가져오기
	List<InvitationDto> getInvitationsByRecipientEmail(@Param("recipientEmail") String recipientEmail);

}
