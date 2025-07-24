package org.fitsync.controller;

import org.fitsync.domain.BodyVO;
import org.fitsync.domain.MatchingVO;
import org.fitsync.domain.PtVO;
import org.fitsync.domain.RecordSetVO;
import org.fitsync.domain.RecordVO;
import org.fitsync.domain.ScheduleVO;
import org.fitsync.service.BodyService;
import org.fitsync.service.MatchingService;
import org.fitsync.service.MemberService;
import org.fitsync.service.PtService;
import org.fitsync.service.RecordService;
import org.fitsync.service.RecordSetService;
import org.fitsync.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.extern.log4j.Log4j;

import java.util.List;

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
    
}
