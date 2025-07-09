package org.fitsync.mapper;

import java.util.List;

import org.fitsync.domain.ScheduleVO;

public interface ScheduleMapper {
    public List<ScheduleVO> selectByTrainerIdx(int trainerIdx);
    public int insertSchedule(ScheduleVO vo);
    public int deleteSchedule(int scheduleIdx);
    public void updateSchedule(ScheduleVO vo);
}
