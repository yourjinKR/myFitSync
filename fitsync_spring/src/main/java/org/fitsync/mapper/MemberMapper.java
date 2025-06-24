package org.fitsync.mapper;

import org.fitsync.domain.MemberVO;

public interface MemberMapper {
	// 유저 존재여부
	public int getFindUser(String member_email);
	// 유저 idx
	public int getUserIdx(String member_email);
	// 유저 추가
	public int insertUser(MemberVO vo);
	// 추가입력여부
	public int getFindInfo(String member_email);
	// 추가 정보입력
	public int updateInfo(MemberVO mvo);
}
