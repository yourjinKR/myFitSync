package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.MatchingVO;
import org.fitsync.mapper.MatchingMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class MatchingServiceImple implements MatchingService {
	
	@Autowired
	private MatchingMapper mapper;
	
    @Override
    public List<MatchingVO> getMatchedMembers(int trainerIdx) {
        return mapper.getMatchedMembers(trainerIdx);
    }
    @Override
    public MatchingVO getMatchingByTrainerAndUser(int userIdx) {
        return mapper.selectMatchingByTrainerAndUser(userIdx);
    }

    @Override
    public void decreaseMatchingRemain(int matchingIdx) {
        mapper.updateMatchingRemainMinusOne(matchingIdx);
    }
	
}