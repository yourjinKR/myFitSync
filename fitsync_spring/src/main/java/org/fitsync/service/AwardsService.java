package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.AwardsVO;

public interface AwardsService {

	public int insertAward(AwardsVO vo);
	
	public List<AwardsVO> getApprovedAwards(int trainerIdx);
	// 경력 요청 리스트
	public List<AwardsVO> getAwards();
	// 경력 승인
	public boolean updateAwards(AwardsVO vo);
	
}