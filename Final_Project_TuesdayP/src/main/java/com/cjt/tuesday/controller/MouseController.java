package com.cjt.tuesday.controller;


import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.cjt.tuesday.dtos.MousePosition;


@Controller
public class MouseController {

    @MessageMapping("/mouse")
    @SendTo("/topic/mouse")
    public MousePosition handleMousePosition(MousePosition mousePosition) {
        return mousePosition; // 메시지를 브로드캐스트
    }
}