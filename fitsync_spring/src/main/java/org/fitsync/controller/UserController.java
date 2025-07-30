package org.fitsync.controller;

import org.fitsync.domain.BodyVO;
import org.fitsync.domain.MatchingVO;
import org.fitsync.domain.MemberVO;
import org.fitsync.domain.PtVO;
import org.fitsync.domain.RecordSetVO;
import org.fitsync.domain.RecordVO;
import org.fitsync.domain.ReviewVO;
import org.fitsync.domain.ScheduleVO;
import org.fitsync.service.BodyService;
import org.fitsync.service.MatchingService;
import org.fitsync.service.MemberService;
import org.fitsync.service.PtService;
import org.fitsync.service.RecordService;
import org.fitsync.service.RecordSetService;
import org.fitsync.service.ReviewService;
import org.fitsync.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.extern.log4j.Log4j;

import java.util.List;

import javax.servlet.http.HttpSession;

@Log4j
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private RecordService recordService;
    @Autowired
    private RecordSetService recordSetService;
    @Autowired
    private PtService ptService;
    @Autowired
    private ScheduleService scheduleService;
    @Autowired
    private MatchingService matchingService;
    @Autowired
    private BodyService bodyService;
    @Autowired
    private MemberService memberService;
    @Autowired
    private ReviewService reviewService;

    // 운동 기록 날짜 리스트
    @GetMapping("/{memberIdx}/records/dates")
    public List<String> getRecordDates(@PathVariable int memberIdx) {
        return recordService.getRecordDates(memberIdx);
    }
    // PT 예약 날짜 리스트
    @GetMapping("/{memberIdx}/schedules/dates")
    public List<String> getScheduleDates(@PathVariable int memberIdx) {
        return scheduleService.getScheduleDates(memberIdx);
    }
    // 특정 날짜 운동 기록 조회
    @GetMapping("/{memberIdx}/records")
    public List<RecordVO> getRecordsByDate(@PathVariable int memberIdx,
                                           @RequestParam String date) {
        return recordService.getRecordsByDate(memberIdx, date);
    }
    // 특정 날짜 PT 예약 조회
    @GetMapping("/{memberIdx}/schedules")
    public List<ScheduleVO> getSchedulesByDate(@PathVariable int memberIdx,
                                               @RequestParam String date) {
        return scheduleService.getSchedulesByDate(memberIdx, date);
    }
    // 운동기록 정보 조회
    @GetMapping("/record/{recordId}")
    public ResponseEntity<RecordVO> getRecordById(@PathVariable("recordId") int recordId) {
        RecordVO record = recordService.getRecordById(recordId);
        if (record != null) {
            return ResponseEntity.ok(record);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    // 기록에 대한 세트 정보 조회
    @GetMapping("/recordset/{recordId}")
    public ResponseEntity<List<RecordSetVO>> getRecordSetsByRecordId(@PathVariable("recordId") int recordId) {
        List<RecordSetVO> sets = recordSetService.getRecordSetsByRecordId(recordId);
        return ResponseEntity.ok(sets);
    }
    // 운동 정보 조회(종목)
    @GetMapping("/pt/{ptId}")
    public ResponseEntity<PtVO> getPtById(@PathVariable("ptId") int ptId) {
        PtVO pt = ptService.getPtById(ptId);
        if (pt != null) {
            return ResponseEntity.ok(pt);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    // 스케줄 확인처리
    @PutMapping("/schedule/check/{scheduleIdx}")
    public ResponseEntity<?> updateScheduleCheck(@PathVariable int scheduleIdx) {
        try {
            scheduleService.confirmSchedule(scheduleIdx);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("스케줄 확인 실패");
        }
    }
    // 트레이너/회원 기반 매칭 정보 조회
    @GetMapping("/matched-member/{userIdx}")
    public ResponseEntity<MatchingVO> getMatchingInfo(
            @PathVariable int userIdx
    ) {
        try {
            MatchingVO matching = matchingService.getMatchingByTrainerAndUser(userIdx);
            return ResponseEntity.ok(matching);
        } catch (Exception e) {
        	 e.printStackTrace();
        	return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    // PT 횟수 차감
    @PutMapping("/matching/decrease/{matchingIdx}")
    public ResponseEntity<?> decreaseMatchingRemain(@PathVariable int matchingIdx) {
        try {
            matchingService.decreaseMatchingRemain(matchingIdx);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
        	e.printStackTrace();
        	return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("매칭 차감 실패");
        }
    }
    
    // 인바디 데이터 불러오기
    @GetMapping("body/{member_idx}")
    public ResponseEntity<List<BodyVO>> getBodyList(@PathVariable("member_idx") int member_idx) {
        List<BodyVO> list = bodyService.getBodyListByMemberIdx(member_idx);
        return ResponseEntity.ok(list);
    }
    
    // 인바디 데이터 추가 등록
    @PostMapping("/body/{member_idx}")
    public ResponseEntity<String> insertBody(@PathVariable int member_idx, @RequestBody BodyVO vo) {
        try {
            vo.setMember_idx(member_idx);
            bodyService.insertBody(vo);
            return ResponseEntity.ok("success");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("fail");
        }
    }
    
    // 최신 body 정보 조회
    @GetMapping("/latest/{memberIdx}")
    public ResponseEntity<?> getLatestBodyByMember(@PathVariable("memberIdx") int memberIdx) {
        try {
            BodyVO latestBody = bodyService.getLatestBodyByMemberIdx(memberIdx);
            if (latestBody == null) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body("최신 인바디 데이터가 없습니다.");
            }
            return ResponseEntity.ok(latestBody);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("서버 오류 발생: " + e.getMessage());
        }
    }
    
    // 최신 인바디 정보 수정
    @PatchMapping("body/{bodyIdx}")
    public ResponseEntity<?> updateBodyData(
        @PathVariable("bodyIdx") int bodyIdx,
        @RequestBody BodyVO updatedBody
    ) {
        try {
            updatedBody.setBody_idx(bodyIdx);
            int result = bodyService.updateBodyData(updatedBody);

            if (result > 0) {
                return ResponseEntity.ok("수정이 완료되었습니다.");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("수정에 실패했습니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("서버 오류 발생: " + e.getMessage());
        }
    }
    
    // 유저 정보 불러오기
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(HttpSession session) {
        Object sessionIdx = session.getAttribute("member_idx");

        if (sessionIdx == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        int memberIdx = Integer.parseInt(sessionIdx.toString());

        MemberVO user = memberService.getMemberByIdx(memberIdx);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("회원 정보를 찾을 수 없습니다.");
        }

        return ResponseEntity.ok(user);
    }
    
    // 리뷰 작성 가능여부 확인
    @GetMapping("/check-review-eligibility")
    public ResponseEntity<?> checkReviewEligibility(
        @RequestParam int trainerIdx,
        @RequestParam int memberIdx
    ) {
        boolean eligible = matchingService.hasCompletedMatching(trainerIdx, memberIdx);
        return ResponseEntity.ok(eligible);
    }
    
    // 리뷰 등록
    @PostMapping("/reviewinsert")
    public ResponseEntity<?> insertReview(@RequestBody ReviewVO reviewVO) {
        try {
            // reviewVO에는 member_idx가 있음
            int memberIdx = reviewVO.getMember_idx();

            // member_idx로 매칭 정보 조회 (매칭 완료 상태인 것)
            MatchingVO matching = matchingService.findCompletedMatchingByMemberIdx(memberIdx);
            if (matching == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("완료된 매칭 정보가 없습니다.");
            }

            // 매칭 idx를 reviewVO에 넣고
            reviewVO.setMatching_idx(matching.getMatching_idx());

            // 리뷰 공개 상태 기본값 설정
            reviewVO.setReview_hidden("0");

            reviewService.insertReview(reviewVO);
            return ResponseEntity.ok("리뷰 등록 성공");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("리뷰 등록 실패: " + e.getMessage());
        }
    }


    
}
