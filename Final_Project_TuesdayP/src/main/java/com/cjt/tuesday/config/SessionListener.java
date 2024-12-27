package com.cjt.tuesday.config;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.cjt.tuesday.mapper.UserMapper;
import com.cjt.tuesday.service.UserService;
import com.cjt.tuesday.dtos.UserDto;

import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;
import org.springframework.stereotype.Component;

@Component
public class SessionListener implements HttpSessionListener {

    private final UserService userService;

    public SessionListener(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent event) {
        // 세션 만료 시 사용자 상태를 inactive로 변경
        UserDto user = (UserDto) event.getSession().getAttribute("userDto");
        if (user != null) {
            userService.logout(user.getUserId());
            System.out.println("세션 만료: 사용자 상태가 inactive로 업데이트되었습니다. UserID: " + user.getUserId());
        }
    }
}
