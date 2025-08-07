package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.MatchingVO;
import org.fitsync.domain.MemberVO;

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
    // 특정 회원의 모든 진행중인 매칭 확인
    public boolean hasAnyActiveMatchingForUser(int user_idx);
	// 리뷰 작성 여부 확인
    public boolean hasCompletedMatching(int trainerIdx, int memberIdx);
    // Main 화면용 매칭 조회
    public MatchingVO findCompletedMatchingByMemberIdx(int memberIdx);
    public MemberVO getMatchedTrainerInfoByUserIdx(int userIdx);
    
}
