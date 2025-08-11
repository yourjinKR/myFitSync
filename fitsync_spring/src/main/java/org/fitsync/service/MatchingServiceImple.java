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
    
    // 특정 트레이너와 매칭된 회원 목록 조회
    @Override
    public List<MatchingVO> getMatchedMembers(int trainerIdx) {
        return mapper.getMatchedMembers(trainerIdx);
    }
    
    // 특정 회원의 매칭 정보 조회 (트레이너와의 매칭 관계)
    @Override
    public MatchingVO getMatchingByTrainerAndUser(int userIdx) {
        return mapper.selectMatchingByTrainerAndUser(userIdx);
    }

    // 매칭의 남은 횟수 차감 처리 - PT 수업이 완료될 때마다 남은 횟수를 1회씩 차감해서 0이 되면 매칭을 완료 상태(2)로 변경
    @Override
    @Transactional
    public void decreaseMatchingRemain(int matchingIdx) {
        // 현재 남은 횟수 조회
        int remain = mapper.selectMatchingRemain(matchingIdx);

        // 남은 횟수가 0 이하면 더 이상 차감하지 않음
        if (remain <= 0) {
            return;
        }

        // 남은 횟수 1회 차감
        mapper.updateMatchingRemainMinusOne(matchingIdx);

        int newRemain = remain - 1;

        // 남은 횟수가 0이 되면 매칭 완료 상태로 변경
        if (newRemain == 0) {
            mapper.updateMatchingCompleteTo1(matchingIdx, 2);
        }
    }
    
    // 새로운 매칭 생성 - 트레이너가 회원에게 PT 매칭을 제안할 때 사용
    @Override
    public MatchingVO createMatching(MatchingVO matching) {
        int result = mapper.insertMatching(matching);
        if (result > 0) {
            return mapper.getMatching(matching.getMatching_idx());
        }
        return null;
    }
    
    // 매칭 수락 처리 - 회원이 트레이너의 매칭 제안을 수락할 때 사용 - 다른 진행중인 매칭이 있는지 확인 후 수락 처리
    @Override
    public boolean acceptMatching(int matching_idx, int user_idx) {
        // 매칭 정보 확인 - 존재 여부와 권한 검증
        MatchingVO matching = mapper.getMatching(matching_idx);
        if (matching == null || matching.getUser_idx() != user_idx) {
            return false;
        }
        
        // 이미 진행중인 다른 매칭이 있는지 확인
        if (hasAnyActiveMatchingForUser(user_idx)) {
            return false;
        }
        
        // 매칭 상태를 수락됨(1)으로 변경
        int result = mapper.updateMatchingComplete(matching_idx);
        return result > 0;
    }
    
    // 특정 매칭 정보 조회
    @Override
    public MatchingVO getMatching(int matching_idx) {
        return mapper.getMatching(matching_idx);
    }
    
    // 특정 회원의 모든 진행중인 매칭 확인 - 회원이 현재 진행중인 PT가 있는지 확인 - 매칭 상태가 1(수락됨)
    @Override
    public boolean hasAnyActiveMatchingForUser(int user_idx) {
        int count = mapper.countAnyActiveMatchingForUser(user_idx);
        return count > 0;
    }
    
    // 특정 트레이너와 회원 간의 완료된 매칭 확인 - 리뷰 작성 등에서 매칭 완료 여부 확인용
    @Override
    public boolean hasCompletedMatching(int trainerIdx, int memberIdx) {
        return mapper.countEligibleMatchingWithoutReview(trainerIdx, memberIdx) > 0;
    }
    
    // 특정 회원의 완료된 매칭 정보 조회
    @Override
    public MatchingVO findCompletedMatchingByMemberIdx(int memberIdx) {
        return mapper.selectCompletedMatchingByMemberIdx(memberIdx);
    }
    
    // 특정 회원과 매칭된 트레이너 정보 조회
    @Override
    public MemberVO getMatchedTrainerInfoByUserIdx(int userIdx) {
        return mapper.selectMatchedTrainerByUserIdx(userIdx);
    }
}