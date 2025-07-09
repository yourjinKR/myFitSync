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
}
