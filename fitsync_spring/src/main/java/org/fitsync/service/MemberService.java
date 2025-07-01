package org.fitsync.service;

import java.util.List;
import java.util.Map;

import org.fitsync.domain.AwardsVO;
import org.fitsync.domain.MemberVO;
import org.fitsync.domain.ReviewVO;

public interface MemberService {
	// 유저 존재여부
	public MemberVO getFindUser(String member_email);
	// 유저 추가 입력
	public boolean insertUser(Map<String, String> body);
	
    public MemberVO getTrainerByIdx(int memberIdx);
    public List<AwardsVO> getAwardsByMemberIdx(int memberIdx);
    public List<ReviewVO> getReviewsByMemberIdx(int memberIdx);
	// 트레이너 목록 가져오기
	public List<MemberVO> getTrainerList();
}
