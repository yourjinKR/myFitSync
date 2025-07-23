package org.fitsync.controller;

import org.fitsync.domain.PtVO;
import org.fitsync.domain.RecordSetVO;
import org.fitsync.domain.RecordVO;
import org.fitsync.domain.ScheduleVO;
import org.fitsync.service.BodyService;
import org.fitsync.service.MemberService;
import org.fitsync.service.PtService;
import org.fitsync.service.RecordService;
import org.fitsync.service.RecordSetService;
import org.fitsync.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    private MemberService memberService;
    @Autowired
    private BodyService bodyService;

    // 1. 운동 기록 날짜 리스트
    @GetMapping("/{memberIdx}/records/dates")
    public List<String> getRecordDates(@PathVariable int memberIdx) {
        return recordService.getRecordDates(memberIdx);
    }

    // 2. PT 예약 날짜 리스트
    @GetMapping("/{memberIdx}/schedules/dates")
    public List<String> getScheduleDates(@PathVariable int memberIdx) {
        return scheduleService.getScheduleDates(memberIdx);
    }

    // 3. 특정 날짜 운동 기록 조회
    @GetMapping("/{memberIdx}/records")
    public List<RecordVO> getRecordsByDate(@PathVariable int memberIdx,
                                           @RequestParam String date) {
        return recordService.getRecordsByDate(memberIdx, date);
    }

    // 4. 특정 날짜 PT 예약 조회
    @GetMapping("/{memberIdx}/schedules")
    public List<ScheduleVO> getSchedulesByDate(@PathVariable int memberIdx,
                                               @RequestParam String date) {
        return scheduleService.getSchedulesByDate(memberIdx, date);
    }
    
    @GetMapping("/record/{recordId}")
    public ResponseEntity<RecordVO> getRecordById(@PathVariable("recordId") int recordId) {
        RecordVO record = recordService.getRecordById(recordId);
        if (record != null) {
            return ResponseEntity.ok(record);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/recordset/{recordId}")
    public ResponseEntity<List<RecordSetVO>> getRecordSetsByRecordId(@PathVariable("recordId") int recordId) {
        List<RecordSetVO> sets = recordSetService.getRecordSetsByRecordId(recordId);
        return ResponseEntity.ok(sets);
    }
    
    @GetMapping("/pt/{ptId}")
    public ResponseEntity<PtVO> getPtById(@PathVariable("ptId") int ptId) {
        PtVO pt = ptService.getPtById(ptId);
        if (pt != null) {
            return ResponseEntity.ok(pt);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
