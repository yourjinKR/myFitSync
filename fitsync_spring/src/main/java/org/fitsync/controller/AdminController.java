package org.fitsync.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.fitsync.domain.ApiLogVO;
import org.fitsync.domain.AwardsVO;
import org.fitsync.domain.GymVO;
import org.fitsync.domain.PtVO;
import org.fitsync.domain.ReportVO;
import org.fitsync.service.ApiLogServiceImple;
import org.fitsync.service.AwardsServiceImple;
import org.fitsync.service.GymServiceImple;
import org.fitsync.service.PtServiceImple;
import org.fitsync.service.ReportServiceImple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {
	
	@Autowired
	ReportServiceImple rservice;
	@Autowired
	ApiLogServiceImple apiLogService;
	@Autowired
	AwardsServiceImple awardService;

	@Autowired
	GymServiceImple gymService;
	@Autowired
	PtServiceImple ptService;
	
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

	
	// 신고 목록 조회
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
	
	// 신고 제재 업데이트
	@PutMapping("/report/{report_idx}/{member_idx}")
	public ResponseEntity<?> updateReportBlock(@PathVariable int report_idx, @PathVariable int member_idx, HttpSession session){
		Map<String, Object> result = new HashMap<String, Object>();
		boolean update = rservice.updateReport(report_idx, member_idx);
		if(update) {
			result.put("success", true);
			result.put("msg", "제재되었습니다");
		}else {			
			result.put("success", false);
			result.put("msg", "요청에 실패하였습니다..");
		}
		return ResponseEntity.ok(result);
	}
	
	@PutMapping("/report/hidden/{report_idx}")
	public ResponseEntity<?> updateReport(@PathVariable int report_idx, HttpSession session){
		Map<String, Object> result = new HashMap<String, Object>();
		boolean update = rservice.updateReport(report_idx, -1);
		if(update) {
			result.put("success", true);
		}else {			
			result.put("success", false);
			result.put("msg", "요청에 실패하였습니다..");
		}
		return ResponseEntity.ok(result);
	}
	
	@GetMapping("/awards")
	public ResponseEntity<?> getAwards(HttpSession session){
		Map<String, Object> result = new HashMap<String, Object>();
		List<AwardsVO> vo = awardService.getAwards();
		if(vo != null) {
			result.put("success", true);
			result.put("vo", vo);
		}else {			
			result.put("success", false);
			result.put("msg", "데이터 호출에 실패하였습니다.");
		}
		return ResponseEntity.ok(result);
	} 
	
	@PutMapping("/awards")
	public ResponseEntity<?> updateAwards(@RequestBody AwardsVO vo, HttpSession session){
		Map<String, Object> result = new HashMap<String, Object>();
		boolean update = awardService.updateAwards(vo);
		if(update) {
			result.put("success", true);
		}else {			
			result.put("success", false);
		}
		return ResponseEntity.ok(result);
	} 
	
	// 체육관 추가
	@PostMapping("/gym")
	public ResponseEntity<?> addGym(@RequestBody GymVO gym) {
		System.out.println("gym !!!! : " + gym);
		Map<String, Object> result = new HashMap<>();
		try {
			gymService.registerGym(gym);
			result.put("success", true);
		} catch (Exception e) {
			result.put("success", false);
			result.put("msg", e.getMessage());
		}
		return ResponseEntity.ok(result);
	}
	
	@GetMapping("/workout")
	public ResponseEntity<?> getWorkOut(HttpSession session){
		Map<String, Object> result = new HashMap<String, Object>();
		List<PtVO> list = ptService.getWorkOut();
		if(list != null) {
			result.put("success", true);
			result.put("list", list);
		}else {			
			result.put("success", false);
			result.put("msg", "데이터 호출에 실패하였습니다.");
		}
		return ResponseEntity.ok(result);
	} 
	
	@PutMapping("/workout")
	public ResponseEntity<?> updateWorkOut(
	    @RequestParam("pt_idx") String ptIdx,
	    @RequestParam("pt_name") String ptName,
	    @RequestParam("pt_category") String ptCategory,
	    @RequestParam("pt_content") String ptContent,
	    @RequestParam(value = "pt_image_url", required = false) List<String> ptImageUrl,
	    @RequestParam(value = "pt_image", required = false) List<MultipartFile> ptImage,
	    HttpSession session
	) {
	    Map<String, Object> result = new HashMap<>();
	    System.out.println("pt_idx: " + ptIdx);
	    System.out.println("pt_name: " + ptName);
	    System.out.println("pt_category: " + ptCategory);
	    System.out.println("pt_content: " + ptContent);
	    System.out.println("pt_image_url: " + ptImageUrl);
	    System.out.println("pt_image: " + ptImage);
	    // 파일 저장 및 비즈니스 로직 처리
	    return ResponseEntity.ok(result);
	}

	// 체육관 가져오기
	@GetMapping("/gym")
	public ResponseEntity<?> getGym(@RequestBody int gym_idx) {
		GymVO gym = gymService.getGymById(gym_idx);
		Map<String, Object> result = new HashMap<>();
		result.put("success", true);
		result.put("data", gym);
		return ResponseEntity.ok(result);
	}

	// 체육관 목록 가져오기
	@GetMapping("/gyms")
	public ResponseEntity<?> getGymList() {
		List<GymVO> gyms = gymService.getAllGyms();
		Map<String, Object> result = new HashMap<>();
		result.put("success", true);
		result.put("data", gyms);
		return ResponseEntity.ok(result);
	}

	// 체육관 수정
	@PutMapping("/gym")
	public ResponseEntity<?> updateGym(@RequestBody GymVO gym) {
		boolean updated = gymService.updateGym(gym);
		Map<String, Object> result = new HashMap<>();
		result.put("success", updated);
		result.put("msg", updated ? "수정 완료" : "수정 실패");
		return ResponseEntity.ok(result);
	}

	// 체육관 삭제
	@DeleteMapping("/gym")
	public ResponseEntity<?> deleteGym(@RequestBody int gym_idx) {
		boolean deleted = gymService.deleteGym(gym_idx);
		Map<String, Object> result = new HashMap<>();
		result.put("success", deleted);
		result.put("msg", deleted ? "삭제 완료" : "삭제 실패");
		return ResponseEntity.ok(result);
	}


}