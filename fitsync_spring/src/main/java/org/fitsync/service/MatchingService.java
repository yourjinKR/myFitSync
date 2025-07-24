package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.MatchingVO;

public interface MatchingService {
	
	// 매칭된 회원 조회
	public List<MatchingVO> getMatchedMembers(int trainerIdx);
	// 트레이너/회원 기반 매칭 정보 조회
    public MatchingVO getMatchingByTrainerAndUser(int userIdx);
    // PT 횟수 차감
    public void decreaseMatchingRemain(int matchingIdx);
	
}
