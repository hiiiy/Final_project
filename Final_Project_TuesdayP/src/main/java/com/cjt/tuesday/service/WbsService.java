package com.cjt.tuesday.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cjt.tuesday.dtos.ProjectDto;
import com.cjt.tuesday.dtos.WbsDto;
import com.cjt.tuesday.mapper.WbsMapper;

@Service
public class WbsService {

	@Autowired
	private WbsMapper wbsMapper;

	public List<WbsDto> getWbsByProjectId(Integer projectId) {
		return wbsMapper.findWbsByProjectId(projectId);
	}

	public WbsDto getWbsById(Integer id) {
		return wbsMapper.findWbsById(id);
	}

	public WbsDto addWbs(WbsDto wbs) {
	    // 프로젝트 기간 가져오기
	    ProjectDto projectDates = wbsMapper.findProjectDates(wbs.getProjectId());
	    LocalDate projectStartDate = projectDates.getStartDate();
	    LocalDate projectEndDate = projectDates.getEndDate();

	    // 작업 시작일과 종료일 문자열을 LocalDate로 변환
	    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	    LocalDate taskStartDate = LocalDate.parse(wbs.getStartDate(), formatter);
	    LocalDate taskEndDate = LocalDate.parse(wbs.getEndDate(), formatter);

	    // 작업 시작일과 종료일 검증
	    if (taskStartDate.isBefore(projectStartDate) || taskEndDate.isAfter(projectEndDate)) {
	        throw new IllegalArgumentException(
	            String.format("작업의 날짜는 프로젝트 기간(%s ~ %s) 내에 있어야 합니다.",
	                          projectStartDate.format(formatter),
	                          projectEndDate.format(formatter))
	        );
	    }

	    wbsMapper.insertWbs(wbs);
	    return wbs;
	}


	public void updateWbs(WbsDto wbs) {
		wbsMapper.updateWbs(wbs);
	}

	public void deleteWbs(Integer id) {
		wbsMapper.deleteWbs(id);
	}
}
