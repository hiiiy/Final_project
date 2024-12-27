package com.cjt.tuesday.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom("tuesdayhelp@naver.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // HTML 형식으로 이메일 내용 설정

            mailSender.send(mimeMessage);

            System.out.println("HTML 이메일 전송 성공: " + to);
        } catch (Exception e) {
            System.err.println("HTML 이메일 전송 실패: " + e.getMessage());
            throw new RuntimeException("HTML 이메일 전송 중 오류가 발생했습니다.");
        }
    }
}
