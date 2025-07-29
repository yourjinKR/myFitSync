package org.fitsync.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.fitsync.domain.AwardsVO;
import org.fitsync.domain.ChatAttachVO;
import org.fitsync.domain.MemberVO;
import org.fitsync.domain.ReviewVO;
import org.fitsync.domain.SearchCriteria;

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
    // 트레이너  프로필 조회
    public MemberVO selectTrainerByIdx(@Param("member_idx") int member_idx);
    // 트레이너의 자격증/수상경력/학위 조회
    public List<AwardsVO> selectAwardsByMemberIdx(@Param("trainer_idx") int trainer_idx);
    // 트레이너의 리뷰 목록 조회
    public List<ReviewVO> selectReviewsByTrainerIdx(@Param("trainer_idx") int trainer_idx);
    // 트레이너 프로필 수정
    public void updateTrainerProfile(MemberVO member);
	
	// 트레이너 목록 가져오기
	public List<MemberVO> getTrainerList(SearchCriteria cri);
	
	// AI 요청시 필요 정보
	public MemberVO getMemberForAIRecommendation(int memberIdx);
	
	// 유저 정보 불러오기
	public MemberVO selectMemberByIdx(@Param("member_idx") int memberIdx);
	
	// 멤버 프로필 사진 변경
    public void updateMemberProfileImage(@Param("memberIdx") int memberIdx,
            @Param("imageUrl") String imageUrl);
}
