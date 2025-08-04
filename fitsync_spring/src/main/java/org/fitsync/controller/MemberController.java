package org.fitsync.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.servlet.http.Cookie;

import org.fitsync.domain.BodyVO;
import org.fitsync.domain.ChatAttachVO;
import org.fitsync.domain.MemberVO;
import org.fitsync.domain.ReportVO;
import org.fitsync.domain.SearchCriteria;
import org.fitsync.service.BodyService;
import org.fitsync.service.BodyServiceImple;
import org.fitsync.service.CloudinaryService;
import org.fitsync.service.MemberServiceImple;
import org.fitsync.service.ReportService;
import org.fitsync.service.ReportServiceImple;
import org.fitsync.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.log4j.Log4j;

@Log4j
@RestController
@RequestMapping("/member")
public class MemberController {
	
	@Autowired
	private MemberServiceImple service;
	@Autowired
	private BodyServiceImple bodyService;
	@Autowired
	private ReportServiceImple reportService;
	@Autowired
	private JwtUtil jwtUtil;
	
	@PostMapping("/register")
	public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body, HttpSession session) {
	    MemberVO vo = service.getFindUser(body.get("member_email"));
	    Map<String, Object> result = new HashMap<>();
	    if (vo == null) {
	        // 회원가입 처리
	        if(service.insertUser(body)) {
	        	vo = service.getFindUser(body.get("member_email")); // 새로 가입한 사용자 정보 조회
	        	// JWT 생성
	        	// 제재 정보 확인
            	ReportVO rvo = reportService.getBlockData(vo.getMember_idx());
            	
                // JWT 생성 (member_idx만 저장)
            	String jwt = jwtUtil.generateToken(
                    vo.getMember_idx(),
                    rvo.getReport_time(),
                    rvo.getBlock_count(),
                    vo.getMember_email()
                );
                
	        	// HttpOnly 쿠키 생성
	        	ResponseCookie cookie = ResponseCookie.from("accessToken", jwt)
	        			.httpOnly(true)
	        			.secure(false) // 배포시 true
	        			.path("/")
	        			.maxAge(7 * 24 * 60 * 60)
	        			.build();
	        	
	        	Map<String, Object> user = new HashMap<>();
	        	user.put("member_email", vo.getMember_email());
	        	user.put("member_name", vo.getMember_name());
	        	user.put("member_image", vo.getMember_image());
	        	user.put("member_type", vo.getMember_type());
	        	user.put("isLogin", true);
	        	
	        	result.put("success", true);
	        	result.put("message", "회원가입 성공");
	        	result.put("user", user);
	        	return ResponseEntity.ok()
	        			.header(HttpHeaders.SET_COOKIE, cookie.toString() + "; SameSite=Lax")
	        			.body(result);
	        }else {
	        	return ResponseEntity.ok(result);
	        }
	    } else {
	        result.put("success", false);
	        result.put("message", "이미 가입된 이메일입니다.");
	        return ResponseEntity.ok(result);
	    }
	}
	
	@GetMapping(value = "/logout")
    public ResponseEntity<Map<String, Object>> googleLogOut() {
    	ResponseCookie cookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .build();
    	
    	 return ResponseEntity.ok()
    	            .header(HttpHeaders.SET_COOKIE, cookie.toString() + "; SameSite=Lax")
    	            .body(Map.of("message", "로그아웃 되었습니다"));
    }

    @GetMapping("/check")
    public Map<String, Object> checkLogin(HttpServletRequest request) {
        Map<String, Object> result = new HashMap<>();
        String token = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        boolean isLogin = token != null && jwtUtil.validate(token);
        result.put("isLogin", isLogin);
        return result;
    }
	
	// 유저 정보 불러오기 임시
	@GetMapping(value = "/getMemberInfoWithBody")
    public ResponseEntity<Map<String, Object>> getMemberInfoWithBody(HttpSession session) {
		Object memberIdx = session.getAttribute("member_idx");
		
		MemberVO member = service.getMemberForAIRecommendation((int) memberIdx);
		log.info("Member Info: " + member);
		BodyVO body = bodyService.getLatestBodyByMemberIdx((int) memberIdx);
		
		Map<String, Object> result = new HashMap<>();
		result.put("member", member);
		result.put("body", body);
		return ResponseEntity.ok(result);
    }

	// 트레이너 목록 가져오기
	@GetMapping("/trainers")
	public ResponseEntity<List<MemberVO>> getTrainerList(@ModelAttribute SearchCriteria cri) {
        List<MemberVO> trainers = service.getTrainerList(cri);
        return ResponseEntity.ok(trainers);
	}
	
	// 멤버 프로필사진 수정
    @PostMapping("/update-profile-image")
    public ResponseEntity<?> updateProfileImage(
            @RequestParam("file") MultipartFile file,
            HttpSession session) {

        Object sessionIdx = session.getAttribute("member_idx");
        if (sessionIdx == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        int memberIdx = Integer.parseInt(sessionIdx.toString());

        try {
            String imageUrl = service.updateProfileImage(memberIdx, file);
            return ResponseEntity.ok(imageUrl);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("이미지 업로드 실패: " + e.getMessage());
        }
    }
    
    // 프로필 신고
    @PostMapping("/report/profile")
    public ResponseEntity<?> reportUser(@RequestBody Map<String, Object> data, HttpSession session) {
        Object sessionIdx = session.getAttribute("member_idx");
        if (sessionIdx == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        int reporterIdx = Integer.parseInt(sessionIdx.toString());

        // 필수 값 체크
        if (!data.containsKey("report_sanction") || !data.containsKey("report_category") || !data.containsKey("report_content")) {
            return ResponseEntity.badRequest().body("필수 신고 정보가 누락되었습니다.");
        }

        Integer targetIdx = null;
        try {
            targetIdx = Integer.parseInt(data.get("report_sanction").toString()); // 신고 대상자 member_idx
            System.out.println(targetIdx);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("신고 대상자 ID가 유효하지 않습니다.");
        }
        
        ReportVO report = new ReportVO();
        report.setIdx_num(reporterIdx); // 게시물 신고가 아니라면 0 또는 null
        report.setReport_category((String) data.get("report_category"));
        report.setReport_content((String) data.get("report_content"));
        report.setReport_hidden((Integer) data.getOrDefault("report_hidden", 0));
        report.setMember_idx(reporterIdx);       
        report.setReport_sanction(targetIdx);   

        reportService.insertReport(report);
        return ResponseEntity.ok("신고가 접수되었습니다.");
    }
    
    // 리뷰 신고
    @PostMapping("/report/review")
    public ResponseEntity<?> reportReview(@RequestBody Map<String, Object> data, HttpSession session) {
        System.out.println("신고 요청 데이터: " + data);

        Object sessionIdx = session.getAttribute("member_idx");
        if (sessionIdx == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        int reporterIdx = Integer.parseInt(sessionIdx.toString());

        if (data == null
            || !data.containsKey("idx_num")
            || !data.containsKey("report_category")
            || !data.containsKey("report_content")
            || data.get("idx_num") == null
            || data.get("report_category") == null
            || data.get("report_content") == null
        ) {
            return ResponseEntity.badRequest().body("필수 신고 정보가 누락되었습니다.");
        }

        Integer reviewIdx = null;
        try {
            reviewIdx = Integer.parseInt(data.get("idx_num").toString());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("리뷰 ID가 유효하지 않습니다.");
        }

        String category = data.get("report_category").toString();
        String content = data.get("report_content").toString();
        System.out.println("idx_num 값: " + data.get("idx_num"));
        int reportHidden = 0;
        try {
            Object rh = data.get("report_hidden");
            if (rh != null && !rh.toString().isEmpty()) {
                reportHidden = Integer.parseInt(rh.toString());
            }
        } catch (Exception ignored) {}

        ReportVO report = new ReportVO();
        report.setIdx_num(reviewIdx);
        report.setReport_category(category);
        report.setReport_content(content);
        report.setReport_hidden(reportHidden);
        report.setMember_idx(reporterIdx);

        try {
            reportService.insertReport(report);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
        }

        return ResponseEntity.ok("리뷰 신고가 접수되었습니다.");
    }



}
