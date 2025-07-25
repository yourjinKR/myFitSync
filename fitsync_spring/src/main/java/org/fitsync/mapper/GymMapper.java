package org.fitsync.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.fitsync.domain.GymVO;

public interface GymMapper {
    // 체육관 등록
    void insertGym(GymVO gym);

    // 체육관 전체 목록 조회
    List<GymVO> selectAllGyms();

    // 체육관 단건 조회
    GymVO selectGymById(int gym_idx);

    // 체육관 정보 수정
    int updateGym(GymVO gym);

    // 체육관 삭제
    int deleteGym(int gym_idx);
}
