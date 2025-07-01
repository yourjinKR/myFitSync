package org.fitsync.mapper;

import java.util.List;

import org.fitsync.domain.AwardsVO;
import org.fitsync.domain.MemberVO;
import org.fitsync.domain.ReviewVO;

public interface MemberMapper {
	// 유저 존재여부
	public MemberVO getFindUser(String member_email);
	// 유저 추가
	public int insertMemberInfo(MemberVO vo);
	// 트레이너 추가
	public int insertTrainerInfo(MemberVO vo);
	// 추가입력여부
	public int getUserIdx(String member_email);
	// 추가 정보입력
	public int updateInfo(MemberVO mvo);
	// 추가 정보입력
	public int updateTrainerInfo(MemberVO mvo);
    // 트레이너 단일 정보 조회
    public MemberVO selectTrainerByIdx(int member_idx);
    // 트레이너의 자격증/수상경력/학위 조회
    public List<AwardsVO> selectAwardsByMemberIdx(int member_idx);
    // 트레이너의 리뷰 목록 조회
    public List<ReviewVO> selectReviewsByMemberIdx(int member_idx);
	
}
