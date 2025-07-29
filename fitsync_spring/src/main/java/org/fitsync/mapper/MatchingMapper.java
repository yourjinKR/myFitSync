package org.fitsync.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.fitsync.domain.MatchingVO;

public interface MatchingMapper {
    
    public List<MatchingVO> getMatchedMembers(@Param("trainerIdx") int trainerIdx);
    public MatchingVO selectMatchingByTrainerAndUser(@Param("userIdx") int userIdx);
    public void updateMatchingRemainMinusOne(@Param("matchingIdx") int matchingIdx);
    
    // 매칭 생성
    public int insertMatching(MatchingVO matching);
    // 매칭 조회
    public MatchingVO getMatching(@Param("matching_idx") int matching_idx);
    // 매칭 완료 처리
    public int updateMatchingComplete(@Param("matching_idx") int matching_idx);
    // 특정 트레이너-회원간 완료된 매칭 개수 조회
    public int countCompletedMatchingBetween(@Param("trainer_idx") int trainer_idx, @Param("user_idx") int user_idx);
    
}