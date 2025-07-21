package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.AwardsVO;

public interface AwardsService {

	public int insertAward(AwardsVO vo);
	
	public List<AwardsVO> getApprovedAwards(int trainerIdx);
	
}