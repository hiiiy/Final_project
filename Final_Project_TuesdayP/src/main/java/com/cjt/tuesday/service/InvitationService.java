package com.cjt.tuesday.service;

import com.cjt.tuesday.dtos.InvitationDto;
import com.cjt.tuesday.dtos.UserDto;
import com.cjt.tuesday.mapper.InvitationMapper;
import com.cjt.tuesday.mapper.ProjectMapper;
import com.cjt.tuesday.mapper.UserMapper;
import com.cjt.tuesday.service.EmailService;

import jakarta.servlet.http.HttpSession;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InvitationService {

	@Autowired
	private InvitationMapper invitationMapper;

	@Autowired
	private ProjectMapper projectMapper;

	@Autowired
	private UserMapper userMapper;

	@Autowired
	private EmailService emailService;

	// 새거 초대 전송
	public void sendInvitation(Integer projectId, Integer senderId, String recipientEmail) {
		String projectName = projectMapper.findProjectNameById(projectId);

		InvitationDto invitation = new InvitationDto();
		invitation.setProjectId(projectId);
		invitation.setSenderId(senderId);
		invitation.setRecipientEmail(recipientEmail);
		invitation.setStatus("sent");

		invitationMapper.saveInvitation(invitation);
		
		//서버를 킨 경우 서버 킨 사람의 IP로.
		//port번호 확인. 조재희 port번호는 80
		String acceptUrl = "http://192.168.22.108:80/invitations/accept?id=" + invitation.getId();
		String declineUrl = "http://192.168.22.108:80/invitations/decline?id=" + invitation.getId();

		String subject = "프로젝트 초대: " + projectName;
		String htmlContent = String.format(
				"<p>프로젝트 <strong>%s</strong>에 초대되었습니다.</p>" +
						"<a href='%s'>초대 수락</a> | <a href='%s'>초대 거절</a>",
						projectName, acceptUrl, declineUrl
				);

		emailService.sendEmail(recipientEmail, subject, htmlContent);
	}

	 // 초대 상태만 accepted로 업데이트
    public InvitationDto acceptInvitation(Integer id) {
        InvitationDto invitation = invitationMapper.findInvitationById(id);
        if (invitation == null) {
            throw new RuntimeException("해당 초대를 찾을 수 없습니다.");
        }

        if (!"sent".equals(invitation.getStatus())) {
            throw new RuntimeException("이미 처리된 초대입니다.");
        }

        // 초대 상태를 accepted로 업데이트
        invitationMapper.updateInvitationStatus(id, "accepted");

        return invitation;
    }

    // 로그인 후 project_members에 사용자 추가
    public void addUserToProjects(String email) {
        List<InvitationDto> acceptedInvitations = invitationMapper.findAcceptedInvitationsByEmail(email);

        for (InvitationDto invitation : acceptedInvitations) {
            // 프로젝트 멤버에 추가
            invitationMapper.addToProjectMembers(invitation.getProjectId(), invitation.getRecipientId());
            
            // 초대 상태를 completed로 업데이트
            invitationMapper.updateInvitationStatus(invitation.getId(), "completed");
        }
    }


    // accepted 상태의 초대 확인
    public boolean hasAcceptedInvitations(String email) {
        return !invitationMapper.findAcceptedInvitationsByEmail(email).isEmpty();
    }

	// 초대 거절
	public void declineInvitation(Integer id) {
	    // 초대 정보 가져오기
	    InvitationDto invitation = invitationMapper.findInvitationById(id);

	    if (invitation == null) {
	        throw new RuntimeException("해당 초대를 찾을 수 없습니다.");
	    }

	    if (!"sent".equals(invitation.getStatus())) {
	        throw new RuntimeException("이미 처리된 초대입니다.");
	    }

	    // 초대 상태를 'declined'로 업데이트
	    invitationMapper.updateInvitationStatus(id, "declined");
	}	
}
