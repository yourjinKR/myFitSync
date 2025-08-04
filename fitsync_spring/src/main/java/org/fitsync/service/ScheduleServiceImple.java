package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.ScheduleVO;
import org.fitsync.mapper.ScheduleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class ScheduleServiceImple implements ScheduleService {

	@Autowired
	private ScheduleMapper mapper;
	
    @Override
    public List<ScheduleVO> getSchedulesByTrainer(int trainerIdx) {
        return mapper.selectByTrainerIdx(trainerIdx);
    }

    @Override
    public int insertSchedule(ScheduleVO vo) {
        return mapper.insertSchedule(vo);
    }

    @Override
    public int deleteSchedule(int scheduleIdx) {
        return mapper.deleteSchedule(scheduleIdx);
    }
    
    @Override
    public void updateSchedule(ScheduleVO vo) {
    	mapper.updateSchedule(vo);
    }
    
    @Override
    public List<String> getScheduleDates(int memberIdx) {
    	return mapper.selectScheduleDates(memberIdx);
    }
    
    @Override
    public List<ScheduleVO> getSchedulesByDate(int memberIdx, String date) {
    	return mapper.selectSchedulesByDate(memberIdx, date);
    }
    @Override
    public void confirmSchedule(int scheduleIdx) {
    	mapper.updateScheduleChecked(scheduleIdx);
    }
    
    @Override
    public ScheduleVO getNextScheduleForUser(int userIdx) {
        return mapper.selectNextScheduleByUserIdx(userIdx);
    }
}