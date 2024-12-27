package com.cjt.tuesday.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cjt.tuesday.dtos.WbsDto;
import com.cjt.tuesday.service.WbsService;

@RestController
@RequestMapping("/api/wbs")
public class WbsController {

    @Autowired
    private WbsService wbsService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // 특정 Project ID의 WBS 목록 조회
    @GetMapping("/{projectId}")
    public List<WbsDto> getWbsByProjectId(@PathVariable Integer projectId) {
        return wbsService.getWbsByProjectId(projectId);
    }

    // 특정 WBS 작업 조회
    @GetMapping("/task/{id}")
    public WbsDto getWbsById(@PathVariable Integer id) {
        return wbsService.getWbsById(id);
    }

    // 작업 추가
    @PostMapping
    public ResponseEntity<WbsDto> addWbs(@RequestBody WbsDto wbs) {
        wbsService.addWbs(wbs);
        messagingTemplate.convertAndSend("/topic/wbs-updates", wbs);
        return ResponseEntity.ok(wbs);
    }


    // 작업 수정
    @PutMapping
    public ResponseEntity<WbsDto> updateWbs(@RequestBody WbsDto wbs) {
        wbsService.updateWbs(wbs);
        messagingTemplate.convertAndSend("/topic/wbs-updates", wbs);
        return ResponseEntity.ok(wbs);
    }
    
    // 작업 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWbs(@PathVariable Integer id) {
        wbsService.deleteWbs(id);
        messagingTemplate.convertAndSend("/topic/wbs-updates", id); // 삭제된 작업 ID 전송
        return ResponseEntity.ok().build();
    }
}
