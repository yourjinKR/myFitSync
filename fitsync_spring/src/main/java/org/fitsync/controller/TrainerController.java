package org.fitsync.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.fitsync.domain.AwardsVO;
import org.fitsync.domain.LessonVO;
import org.fitsync.domain.MemberVO;
import org.fitsync.domain.ReviewVO;
import org.fitsync.domain.ScheduleVO;
import org.fitsync.domain.TrainerProfileDTO;
import org.fitsync.service.LessonService;
import org.fitsync.service.MemberService;
import org.fitsync.service.RecordService;
import org.fitsync.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/trainer")
public class TrainerController {

    @Autowired
    private MemberService memberService;
    @Autowired
    private LessonService lessonService;
    @Autowired
    private ScheduleService scheduleService; 
    @Autowired
    private RecordService recordService;
   
    
    // 트레이너 프로필 조회
    @GetMapping("/profile/{trainerIdx}")
    public ResponseEntity<?> getTrainerProfileById(@PathVariable int trainerIdx) {
        MemberVO member = memberService.getTrainerByIdx(trainerIdx);
        if (member == null) {
            return ResponseEntity.status(404).body("Trainer not found");
        }

        List<AwardsVO> awards = memberService.getAwardsByMemberIdx(trainerIdx);
        List<ReviewVO> reviews = memberService.getReviewsByMemberIdx(trainerIdx);

        TrainerProfileDTO profile = new TrainerProfileDTO();
        profile.setMember(member);
        profile.setAwards(awards);
        profile.setReviews(reviews);

        return ResponseEntity.ok(profile);
    }
    
    // 트레이너 프로필 수정
    @PutMapping("/update/{trainerIdx}")
    public ResponseEntity<Map<String, Object>> updateTrainer(
        @PathVariable int trainerIdx,
        @RequestBody MemberVO member,
        HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        Object sessionIdx = session.getAttribute("member_idx");

        if (sessionIdx == null) {
            result.put("success", false);
            result.put("msg", "인증 정보 없음");
            return ResponseEntity.status(401).body(result);
        }

        int memberIdx = Integer.parseInt(sessionIdx.toString());
        if (memberIdx != trainerIdx) {
            result.put("success", false);
            result.put("msg", "수정 권한 없음");
            return ResponseEntity.status(403).body(result);
        }

        try {
            memberService.updateTrainerProfile(member);
            System.out.println("[백엔드] 수정 성공");

            result.put("success", true);
            result.put("msg", "수정 완료");
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("msg", "업데이트 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
	        }
	    }

    // 트레이너별 레슨 목록 조회
    @GetMapping("/lesson/{memberIdx}")
    public ResponseEntity<List<LessonVO>> getLessons(@PathVariable int memberIdx) {
        List<LessonVO> lessons = lessonService.getLessonsByMemberIdx(memberIdx);
        return ResponseEntity.ok(lessons);
    }

    // 트레이너별 레슨 저장(등록/수정)
    @PostMapping("/lesson/{memberIdx}")
    public ResponseEntity<Map<String, Object>> saveLessons(
            @PathVariable int memberIdx,
            @RequestBody List<LessonVO> lessons,
            HttpSession session) {
    	
        Map<String, Object> result = new HashMap<>();

        Object sessionIdx = session.getAttribute("member_idx");
        if (sessionIdx == null) {
            result.put("success", false);
            result.put("msg", "인증 정보 없음");
            return ResponseEntity.status(401).body(result);
        }

        int sessionMemberIdx = Integer.parseInt(sessionIdx.toString());
        if (sessionMemberIdx != memberIdx) {
            result.put("success", false);
            result.put("msg", "권한 없음");
            return ResponseEntity.status(403).body(result);
        }
        
        for (LessonVO l : lessons) {
            System.out.println("lesson: " + l);
        }

        try {
            lessonService.saveLessons(memberIdx, lessons);

            result.put("success", true);
            result.put("msg", "레슨 저장 완료");
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("msg", "레슨 저장 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }
    
    // 트레이너 스케줄 조회
    @GetMapping("/{trainerIdx}/schedule")
    public ResponseEntity<?> getSchedulesByTrainer(
            @PathVariable int trainerIdx,
            HttpSession session
    ) {
        Object sessionIdx = session.getAttribute("member_idx");
        if (sessionIdx == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        int memberIdx = Integer.parseInt(sessionIdx.toString());

        MemberVO loginUser = memberService.getTrainerByIdx(memberIdx);
        if (loginUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 로그인 정보입니다.");
        }

        if (!"trainer".equals(loginUser.getMember_type())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("트레이너만 접근 가능합니다.");
        }

        if (loginUser.getMember_idx() != trainerIdx) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("본인의 스케줄만 조회할 수 있습니다.");
        }

        List<ScheduleVO> schedules = scheduleService.getSchedulesByTrainer(trainerIdx);
        return ResponseEntity.ok(schedules);
    }

    // 스케줄 등록(매칭X)
    @PostMapping("/{trainerIdx}/schedule")
    public ResponseEntity<?> addSchedule(
        @PathVariable int trainerIdx,
        @RequestBody ScheduleVO vo) {

        // 스케줄에 trainerIdx 설정 (필요하면)
        vo.setTrainer_idx(trainerIdx);

        int result = scheduleService.insertSchedule(vo);

        if (result > 0) {
            return ResponseEntity.ok("스케줄 추가 성공");
        } else {
            return ResponseEntity.status(500).body("스케줄 추가 실패");
        }
    }
    
    // 스케줄 삭제
    @DeleteMapping("/{trainerIdx}/schedule/{scheduleIdx}")
    public ResponseEntity<?> deleteSchedule(
            @PathVariable int trainerIdx, 
            @PathVariable int scheduleIdx) {
        scheduleService.deleteSchedule(scheduleIdx);
        return ResponseEntity.ok("삭제 성공");
    }
    
    // 월별 운동기록 날짜 조회
    @GetMapping("/{memberIdx}/records")
    public ResponseEntity<?> getRecordDatesByMonth(
            @PathVariable int memberIdx,
            @RequestParam String month) {
        try {
            List<String> recordDates = recordService.getRecordDatesByMonth(memberIdx, month);
            return ResponseEntity.ok(recordDates);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("운동기록 날짜 조회 실패: " + e.getMessage());
        }
    }
    
    // 스케줄 수정
    @PutMapping("/schedule")
    public ResponseEntity<?> updateSchedule(@RequestBody ScheduleVO vo) {
        scheduleService.updateSchedule(vo);
        return ResponseEntity.ok("수정 완료");
    }
}
