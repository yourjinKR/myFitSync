package org.fitsync.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.log4j.Log4j;

import org.fitsync.domain.ApiLogVO;
import org.fitsync.domain.ApiResponseDTO;
import org.fitsync.mapper.PtMapper;
import org.fitsync.service.AIServiceImple;
import org.fitsync.service.ApiLogServiceImple;
import org.fitsync.service.PaymentServiceImple;

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
	@Autowired
	private PaymentServiceImple payService;
	
	public String getWorkoutNamesJsonArray() {
	    List<String> names = ptMapper.getWorkOutName();
	    String jsonArray = names.stream()
	        .map(name -> "\"" + name + "\"")
	        .collect(Collectors.joining(", ", "[", "]"));
	    return jsonArray;
	}
	
	@GetMapping(value = "/getTextReact", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
	public String getText() {
		return getWorkoutNamesJsonArray();
	}


	@PostMapping(value = "/getAiTest", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
	public ResponseEntity<ApiResponseDTO> askAI(@RequestBody Map<String, String> request, HttpSession session) {
		Object memberIdx = session.getAttribute("member_idx");
		
	    try {
	        String userMessage = request.get("message");
	        if (userMessage == null || userMessage.trim().isEmpty()) {
	            return ResponseEntity.badRequest()
	                .body(new ApiResponseDTO("메시지가 비어 있습니다.", null));
	        }

	        ApiResponseDTO response = aiService.requestAIResponse(userMessage, (int)memberIdx);
	        return ResponseEntity.ok(response);

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(500)
	            .body(new ApiResponseDTO("AI 처리 중 오류 발생: " + e.getMessage(), null));
	    }
	}
	
	@PostMapping(value = "/createRoutine", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
	public ResponseEntity<ApiResponseDTO> createRoutine(@RequestBody Map<String, String> request, HttpSession session) {
		Object memberIdx = session.getAttribute("member_idx");
		
	    try {
	    	if (memberIdx == null) {
	    		return ResponseEntity.badRequest()
		                .body(new ApiResponseDTO("memberIdx 세션 정보가 없습니다.", null));
	    	}
	    	
	        String userMessage = request.get("message");
	        if (userMessage == null || userMessage.trim().isEmpty()) {
	            return ResponseEntity.badRequest()
	                .body(new ApiResponseDTO("메시지가 비어 있습니다.", null));
	        }
	        
	        // 잔여 토큰 확인
	        Map<String, Object> subStatus = payService.checkSubscriptionStatus((int) memberIdx);
	        
	        System.out.println(subStatus);
	        
	        boolean isSub = (boolean)subStatus.get("isSubscriber");
	        boolean isLog = (boolean)subStatus.get("isLog");
	        
	        if (!isSub) {
	        	if (isLog) return ResponseEntity.badRequest().body(new ApiResponseDTO("미구독 유저입니다.", null));
	        	System.out.println("최초 1회 요청 서비스 실행함");
	        }
	        else if (isSub && (double)subStatus.get("totalCost") > 3) {
	        	return ResponseEntity.badRequest()
		                .body(new ApiResponseDTO("사용량이 초과되어 서비스를 사용할 수 없습니다.", null));
	        } 

	        ApiResponseDTO response = aiService.requestAIResponse(userMessage, (int)memberIdx);
	        return ResponseEntity.ok(response);

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(500)
	            .body(new ApiResponseDTO("AI 처리 중 오류 발생: " + e.getMessage(), null));
	    }
	}
	
	@GetMapping(value = "/apilog/{memberIdx}", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
	public ResponseEntity<?> getApiLogByMemberIdx(@PathVariable int memberIdx, HttpSession session) {
		int sessionMemberIdx = (int) session.getAttribute("member_idx");
		
		try {
			if (memberIdx != sessionMemberIdx) {
			    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
			        .body(Map.of("message", "권한이 없습니다."));
			}
			
			List<ApiLogVO> list = apiLogService.getByMemberId(sessionMemberIdx);
			return ResponseEntity.ok(list);
			
		} catch (Exception e) {
			Map<String, Object> errorBody = new HashMap<>();
	        errorBody.put("message", "AI 처리 중 오류 발생: " + e.getMessage());
	        errorBody.put("success", false);
	        return ResponseEntity.status(500).body(errorBody);
		}
	}
	
}
