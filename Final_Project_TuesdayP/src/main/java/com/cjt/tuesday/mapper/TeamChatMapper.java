package com.cjt.tuesday.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.cjt.tuesday.dtos.TeamChatMessageDto;

@Mapper
public interface TeamChatMapper {

	// 채팅 메시지 저장
	void insertMessage(TeamChatMessageDto message);

	// 특정 프로젝트의 채팅 메시지 조회
	List<TeamChatMessageDto> findMessagesByProjectId(@Param("projectId") int projectId);
	
    // 메시지 읽음 상태 업데이트 (메시지 ID로 read_count 증가)
    void incrementReadCount(@Param("messageId") int messageId);

    // 특정 프로젝트의 읽지 않은 메시지 개수 조회
    int countUnreadMessages(@Param("projectId") int projectId);

}