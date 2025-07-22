package org.fitsync.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.fitsync.domain.ApiLogVO;
import org.fitsync.domain.ReportVO;
import org.fitsync.service.ApiLogServiceImple;
import org.fitsync.service.ReportServiceImple;
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

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {
	
	@Autowired
	ReportServiceImple rservice;
	
	@Autowired
	ApiLogServiceImple apiLogService;
	
    @GetMapping(value = "/test", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("test");
    }
	
    @GetMapping(value = "/getAllApi", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntity<List<ApiLogVO>> getAllApi() {
        return ResponseEntity.ok(apiLogService.selectApiList());
    }
    
	@PatchMapping(value = "/updateExceptionReason", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
	public ResponseEntity<String> updateExceptionReason(@RequestBody ApiLogVO log) {
	    try {
	    	apiLogService.updateExceptionReason(log);
	        return ResponseEntity.ok("예외 사유 업데이트 완료");
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("업데이트 실패: " + e.getMessage());
	    }
	}
	
	@PatchMapping(value = "/updateFeedBack", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
	public ResponseEntity<String> updateFeedBack(@RequestBody ApiLogVO log) {
	    try {
	    	apiLogService.updateFeedBack(log);
	        return ResponseEntity.ok("피드백 업데이트 완료");
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("업데이트 실패: " + e.getMessage());
	    }
	}

	
	@GetMapping("/report")
	public ResponseEntity<?> getReport(HttpSession session){
		Map<String, Object> result = new HashMap<String, Object>();
		List<ReportVO> vo =  rservice.getReport();
		if(vo != null) {
			result.put("success", true);
			result.put("vo", vo);
		}else {			
			result.put("success", false);
			result.put("msg", "데이터가 없습니다.");
		}
		return ResponseEntity.ok(result);
	}

}
