package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.AwardsVO;
import org.fitsync.mapper.AwardsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class AwardsServiceImple implements AwardsService {
	
	@Autowired
	private AwardsMapper mapper;

	@Override
	public int insertAward(AwardsVO vo) {
		return mapper.insertAward(vo);
	}
	
	@Override
	public List<AwardsVO> getApprovedAwards(int trainerIdx) {
		return mapper.selectApprovedAwards(trainerIdx);
	}

}
