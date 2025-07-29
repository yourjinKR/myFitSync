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
    
    // 매칭 생성
    public MatchingVO createMatching(MatchingVO matching);
    // 매칭 조회
    public MatchingVO getMatching(int matching_idx);
    // 매칭 완료 처리
    public boolean acceptMatching(int matching_idx, int user_idx);
    // 특정 트레이너-회원간 완료된 매칭 존재 여부 확인
    public boolean hasCompletedMatchingBetween(int trainer_idx, int user_idx);
	
}
