package org.fitsync.service;

import java.util.Map;

import org.fitsync.domain.MemberVO;

public interface MemberService {
	// 유저 존재여부
	public MemberVO getFindUser(String member_email);
	// 유저 추가 입력
	public boolean insertUser(Map<String, String> body);
}
