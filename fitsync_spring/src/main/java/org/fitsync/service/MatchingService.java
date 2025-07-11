package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.MatchingVO;

public interface MatchingService {
	
	// 매칭된 회원 조회
	public List<MatchingVO> getMatchedMembers(int trainerIdx);
}
