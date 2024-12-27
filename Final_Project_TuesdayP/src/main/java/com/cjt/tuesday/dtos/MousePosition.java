package com.cjt.tuesday.dtos;

import lombok.Data;

@Data
public class MousePosition {
    private String userId;
    private String username; // 사용자 이름 추가
    private double x;
    private double y;
    private String color;
}
