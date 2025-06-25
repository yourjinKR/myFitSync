package org.fitsync.mapper;

import org.fitsync.domain.MemberVO;

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
}
