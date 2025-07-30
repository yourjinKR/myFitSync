package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.GymVO;
import org.fitsync.domain.SearchCriteria;
import org.fitsync.mapper.GymMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class GymServiceImple implements GymService {

    @Autowired
    private GymMapper gymMapper;

    @Override
    public void registerGym(GymVO gym) {
        gymMapper.insertGym(gym);
    }

    @Override
    public List<GymVO> getAllGyms(SearchCriteria cri) {
        return gymMapper.selectAllGyms(cri);
    }
    
    @Override
    public int getGymCount(SearchCriteria cri) {
    	return gymMapper.countAllGyms(cri);
    }

    @Override
    public GymVO getGymById(int gym_idx) {
        return gymMapper.selectGymById(gym_idx);
    }

    @Override
    public boolean updateGym(GymVO gym) {
        return gymMapper.updateGym(gym) > 0;
    }

    @Override
    @Transactional
    public boolean deleteGym(int gym_idx) {
        try {
            gymMapper.clearMemberGymReference(gym_idx);

            int rows = gymMapper.deleteGym(gym_idx);

            return rows > 0;

        } catch (Exception e) {
            log.error("체육관 삭제 중 오류 발생", e);
            throw new RuntimeException("체육관 삭제 실패", e);
        }
    }
    
    @Override
    public GymVO getGymByMemberId(int member_idx) {
    	return gymMapper.selectGymByMemberId(member_idx);
    }
}