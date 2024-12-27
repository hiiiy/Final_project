package com.cjt.tuesday.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.cjt.tuesday.dtos.TeamChatMessageDto;
import com.cjt.tuesday.mapper.TeamChatMapper;

@Service
public class TeamChatService {

	private final TeamChatMapper teamChatMapper;

	public TeamChatService(TeamChatMapper teamChatMapper) {
		this.teamChatMapper = teamChatMapper;
	}

    public void saveMessage(TeamChatMessageDto message) {
        if (message.getTimestamp() == null) {
            message.setTimestamp(LocalDateTime.now()); // `LocalDateTime` 사용
        }
        teamChatMapper.insertMessage(message);
    }

    public List<TeamChatMessageDto> getMessagesByProjectId(int projectId) {
        List<TeamChatMessageDto> messages = teamChatMapper.findMessagesByProjectId(projectId);
        return messages;
    }
    
    // 메시지 읽음 상태 업데이트
    public void markMessageAsRead(int messageId) {
        teamChatMapper.incrementReadCount(messageId);
    }

    // 읽지 않은 메시지 개수 조회
    public int getUnreadMessageCount(int projectId) {
        return teamChatMapper.countUnreadMessages(projectId);
    }

}