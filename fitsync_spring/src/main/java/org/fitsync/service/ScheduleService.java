package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.ScheduleVO;

public interface ScheduleService {
  
	// 스케줄 조회
	public List<ScheduleVO> getSchedulesByTrainer(int trainerIdx);
    // 스케줄 등록
    public int insertSchedule(ScheduleVO vo);
    // 스케줄 삭제
    public int deleteSchedule(int scheduleIdx);
    // 스케줄 수정
    public void updateSchedule(ScheduleVO vo);
    // PT 예약 날짜 리스트
    public List<String> getScheduleDates(int memberIdx);
    // 특정 날짜 PT 예약 조회
    public List<ScheduleVO> getSchedulesByDate(int memberIdx, String date);
}
