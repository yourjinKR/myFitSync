package org.fitsync.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.fitsync.domain.GymVO;
import org.fitsync.domain.SearchCriteria;

public interface GymMapper {
    // 체육관 등록
    void insertGym(GymVO gym);

    // 체육관 전체 목록 조회
    List<GymVO> selectAllGyms(SearchCriteria cri);
    
    // 갯수 조회
    int countAllGyms(SearchCriteria cri);

    // 체육관 단건 조회
    GymVO selectGymById(int gym_idx);

    // 체육관 정보 수정
    int updateGym(GymVO gym);

    // 체육관 삭제
    int deleteGym(int gym_idx);
    
    // 외래키 삭제
    int clearMemberGymReference(int gym_idx);
    
    // 유저 멤버로 체육관 찾기
    GymVO selectGymByMemberId(int member_idx);
}
