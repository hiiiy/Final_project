package com.cjt.tuesday.dtos;


import java.security.Timestamp;
import java.time.LocalDate;

import lombok.Data;

@Data
public class ProjectDto {
    private Integer id;
    private String name;
    private Integer userId;
    private Integer teamLeaderId; // 팀장 ID
    private LocalDate startDate;
    private LocalDate endDate;
}
