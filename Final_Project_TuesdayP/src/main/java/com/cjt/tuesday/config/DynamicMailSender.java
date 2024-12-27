package com.cjt.tuesday.config;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

import java.util.Properties;

@Component
public class DynamicMailSender {

    public JavaMailSender createMailSender(String host, int port, String username, String password) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");

        // 보안 설정
        if (port == 465) { // SSL
            props.put("mail.smtp.ssl.enable", "true");
        } else if (port == 587) { // STARTTLS
            props.put("mail.smtp.starttls.enable", "true");
        }

        props.put("mail.debug", "true");
        return mailSender;
    }
}
