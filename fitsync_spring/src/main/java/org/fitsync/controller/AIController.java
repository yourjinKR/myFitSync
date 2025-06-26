package org.fitsync.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.fitsync.service.AIServiceImple;

@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "*")
public class AIController {
	@GetMapping(value = "/getTextReact", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
	public String getText() {
		return "안녕하세요 AI 컨트롤러 테스트 문구입니다.";
	}
	
	@Autowired
	private AIServiceImple aiService;

    @PostMapping(value = "/getAiTest", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntity<String> askAI(@RequestBody Map<String, String> request) {
        try {
            String userMessage = request.get("message");
            if (userMessage == null || userMessage.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("메시지가 비어 있습니다.");
            }

            String response = aiService.requestAIResponse(userMessage);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // 또는 log.error
            return ResponseEntity.status(500).body("AI 처리 중 오류 발생: " + e.getMessage());
        }
    }
}
