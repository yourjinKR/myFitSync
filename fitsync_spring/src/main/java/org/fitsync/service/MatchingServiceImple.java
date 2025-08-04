package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.MatchingVO;
import org.fitsync.domain.MemberVO;
import org.fitsync.mapper.MatchingMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class MatchingServiceImple implements MatchingService {
    
    @Autowired
    private MatchingMapper mapper;
    
    @Override
    public List<MatchingVO> getMatchedMembers(int trainerIdx) {
        return mapper.getMatchedMembers(trainerIdx);
    }
    
    @Override
    public MatchingVO getMatchingByTrainerAndUser(int userIdx) {
        return mapper.selectMatchingByTrainerAndUser(userIdx);
    }

    @Override
    @Transactional
    public void decreaseMatchingRemain(int matchingIdx) {
        int remain = mapper.selectMatchingRemain(matchingIdx);

        if (remain <= 0) {
            return;
        }

        mapper.updateMatchingRemainMinusOne(matchingIdx);

        int newRemain = remain - 1;

        if (newRemain == 0) {
            mapper.updateMatchingCompleteTo1(matchingIdx, 2);
        }
    }
    
    @Override
    public MatchingVO createMatching(MatchingVO matching) {
        log.info("매칭 생성: " + matching);
        
        int result = mapper.insertMatching(matching);
        if (result > 0) {
            return mapper.getMatching(matching.getMatching_idx());
        }
        return null;
    }
    
    @Override
    public boolean acceptMatching(int matching_idx, int user_idx) {
        log.info("매칭 수락: matching_idx=" + matching_idx + ", user_idx=" + user_idx);
        
        // 매칭 정보 확인
        MatchingVO matching = mapper.getMatching(matching_idx);
        if (matching == null || matching.getUser_idx() != user_idx) {
            log.warn("매칭 정보가 올바르지 않습니다.");
            return false;
        }
        
        // 해당 트레이너와 이미 완료된 매칭이 있는지 확인
        if (hasCompletedMatchingBetween(matching.getTrainer_idx(), user_idx)) {
            log.warn("해당 트레이너와 이미 완료된 매칭이 존재합니다.");
            return false;
        }
        
        // 매칭 완료 처리
        int result = mapper.updateMatchingComplete(matching_idx);
        return result > 0;
    }
    
    @Override
    public MatchingVO getMatching(int matching_idx) {
        return mapper.getMatching(matching_idx);
    }
    
    @Override
    public boolean hasCompletedMatchingBetween(int trainer_idx, int user_idx) {
        
        int count = mapper.countCompletedMatchingBetween(trainer_idx, user_idx);
        return count > 0;
    }
    
    @Override
    public boolean hasCompletedMatching(int trainerIdx, int memberIdx) {
        return mapper.countEligibleMatchingWithoutReview(trainerIdx, memberIdx) > 0;
    }
    
    @Override
    public MatchingVO findCompletedMatchingByMemberIdx(int memberIdx) {
        return mapper.selectCompletedMatchingByMemberIdx(memberIdx);
    }
    
    @Override
    public MemberVO getMatchedTrainerInfoByUserIdx(int userIdx) {
        return mapper.selectMatchedTrainerByUserIdx(userIdx);
    }
}