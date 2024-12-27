package com.cjt.tuesday.controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cjt.tuesday.dtos.TeamChatMessageDto;
import com.cjt.tuesday.service.TeamChatService;

@RestController
@RequestMapping("/api/chat")
public class TeamChatController {

    private final TeamChatService teamChatService;
    private final SimpMessagingTemplate messagingTemplate;

    public TeamChatController(TeamChatService teamChatService, SimpMessagingTemplate messagingTemplate) {
        this.teamChatService = teamChatService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat/send")
    public void handleMessage(TeamChatMessageDto message) {        
        // 메시지를 데이터베이스에 저장
        teamChatService.saveMessage(message);
        
        // 특정 경로로 메시지 브로드캐스트
        messagingTemplate.convertAndSend("/topic/chat/" + message.getProjectId(), message);
    }

    @GetMapping("/{projectId}")
    public List<TeamChatMessageDto> getMessages(@PathVariable Integer projectId) {
        List<TeamChatMessageDto> messages = teamChatService.getMessagesByProjectId(projectId);
        return messages;
    }
    
    // 메시지 읽음 상태 업데이트
    @PostMapping("/read/{messageId}")
    public ResponseEntity<Void> markMessageAsRead(@PathVariable int messageId) {
        teamChatService.markMessageAsRead(messageId);
        return ResponseEntity.ok().build();
    }

    // 읽지 않은 메시지 개수 조회
    @GetMapping("/unread/{projectId}")
    public ResponseEntity<Integer> getUnreadMessageCount(@PathVariable int projectId) {
        int unreadCount = teamChatService.getUnreadMessageCount(projectId);
        return ResponseEntity.ok(unreadCount);
    }
}