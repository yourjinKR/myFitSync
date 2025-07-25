package org.fitsync.service;

import java.util.List;
import org.fitsync.domain.GymVO;

public interface GymService {

    // 체육관 등록
    void registerGym(GymVO gym);

    // 체육관 전체 목록 조회
    List<GymVO> getAllGyms();

    // 체육관 단건 조회
    GymVO getGymById(int gym_idx);

    // 체육관 정보 수정
    boolean updateGym(GymVO gym);

    // 체육관 삭제
    boolean deleteGym(int gym_idx);
}
