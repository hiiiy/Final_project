package com.cjt.tuesday.mapper;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.cjt.tuesday.dtos.ProjectDto;
import com.cjt.tuesday.dtos.WbsDto;

@Mapper
public interface WbsMapper {
    List<WbsDto> findWbsByProjectId(int projectId);
    WbsDto findWbsById(int id);
    void insertWbs(WbsDto wbs);
    void updateWbs(WbsDto wbs);
    void deleteWbs(int id);

    ProjectDto findProjectDates(int projectId);
}