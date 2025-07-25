package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.GymVO;
import org.fitsync.mapper.GymMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
    public List<GymVO> getAllGyms() {
        return gymMapper.selectAllGyms();
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
    public boolean deleteGym(int gym_idx) {
        return gymMapper.deleteGym(gym_idx) > 0;
    }
}