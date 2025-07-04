package org.fitsync.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.log4j.Log4j;

import org.fitsync.domain.ApiLogVO;
import org.fitsync.domain.ApiResponseDto;
import org.fitsync.mapper.PtMapper;
import org.fitsync.service.AIServiceImple;
import org.fitsync.service.ApiLogServiceImple;

@Log4j
@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "*")
public class AIController {
	@Autowired
	PtMapper ptMapper;
	@Autowired
	private AIServiceImple aiService;
	@Autowired
	private ApiLogServiceImple apiLogService;
	
	public String getWorkoutNamesJsonArray() {
	    List<String> names = ptMapper.getWorkOutName();
	    String jsonArray = names.stream()
	        .map(name -> "\"" + name + "\"")
	        .collect(Collectors.joining(", ", "[", "]"));
	    return jsonArray;
	}
	
	@GetMapping(value = "/getTextReact", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
	public String getText() {
		log.info(getWorkoutNamesJsonArray());
		
		return getWorkoutNamesJsonArray();
	}
	


	@PostMapping(value = "/getAiTest", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
	public ResponseEntity<ApiResponseDto> askAI(@RequestBody Map<String, String> request) {
	    try {
	        String userMessage = request.get("message");
	        if (userMessage == null || userMessage.trim().isEmpty()) {
	            return ResponseEntity.badRequest()
	                .body(new ApiResponseDto("메시지가 비어 있습니다.", null));
	        }

	        ApiResponseDto response = aiService.requestAIResponse(userMessage);
	        return ResponseEntity.ok(response);

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(500)
	            .body(new ApiResponseDto("AI 처리 중 오류 발생: " + e.getMessage(), null));
	    }
	}

	@PatchMapping("/updateExceptionReason")
	public ResponseEntity<String> updateExceptionReason(@RequestBody ApiLogVO log) {
	    try {
	    	apiLogService.updateExceptionReason(log);
	        return ResponseEntity.ok("예외 사유 업데이트 완료");
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("업데이트 실패: " + e.getMessage());
	    }
	}
}
