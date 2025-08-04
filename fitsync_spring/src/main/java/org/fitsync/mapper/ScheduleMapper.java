package org.fitsync.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.fitsync.domain.ScheduleVO;

public interface ScheduleMapper {
    
	public List<ScheduleVO> selectByTrainerIdx(int trainerIdx);
    
	public int insertSchedule(ScheduleVO vo);
    
	public int deleteSchedule(int scheduleIdx);
    
	public void updateSchedule(ScheduleVO vo);
	
	public List<String> selectScheduleDates(int memberIdx);
    
    public List<ScheduleVO> selectSchedulesByDate(@Param("userIdx") int userIdx,
            @Param("date") String date);
    
    public void updateScheduleChecked(@Param("scheduleIdx") int scheduleIdx);
    
    public ScheduleVO selectNextScheduleByUserIdx(@Param("userIdx") int userIdx);
}
