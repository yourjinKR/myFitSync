package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.ScheduleVO;

public interface ScheduleService {
    
	public List<ScheduleVO> getSchedulesByTrainer(int trainerIdx);
    
    public int insertSchedule(ScheduleVO vo);
    
    public int deleteSchedule(int scheduleIdx);
}
