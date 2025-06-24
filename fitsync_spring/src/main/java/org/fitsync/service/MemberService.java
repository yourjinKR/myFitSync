package org.fitsync.service;

import java.util.Map;

import org.fitsync.domain.MemberVO;

public interface MemberService {
	// 유저 존재여부
	public int getFindUser(String member_email);
	// 유저 추가
	public boolean insertUser(MemberVO vo);
	// 추가입력여부
	public boolean getFindInfo(String member_email);
	// 유저 추가정보 입력
	public boolean insertInfo(Map<String, String> body, int idx);
}
