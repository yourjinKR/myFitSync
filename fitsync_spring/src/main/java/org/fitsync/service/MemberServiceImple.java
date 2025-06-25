package org.fitsync.service;

import java.util.Map;

import org.fitsync.domain.BodyVO;
import org.fitsync.domain.MemberVO;
import org.fitsync.mapper.BodyMapper;
import org.fitsync.mapper.MemberMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class MemberServiceImple implements MemberService {

	@Autowired
	private MemberMapper mapper;
	
	@Autowired
	private BodyMapper bodymapper;
	
	// 유저 존재여부
	@Override
	public MemberVO getFindUser(String member_email) {
		MemberVO vo = mapper.getFindUser(member_email); 
		return vo;
	}
	
	// 유저 추가
	@Override
	public boolean insertUser(MemberVO vo) {
		return mapper.insertUser(vo) > 0 ? true : false;
	}
	// 추가입력여부
	@Override
	public boolean getFindInfo(String member_email) {
		return mapper.getFindInfo(member_email) > 0 ? true : false;
	}
	
	// 유저 추가정보 입력
	@Override
	@Transactional
	public boolean insertInfo(Map<String, String> body, int idx) {
		MemberVO mvo = new MemberVO();
		BodyVO bvo = new BodyVO();
		int result = 0;
		mvo.setMember_idx(idx);
		mvo.setMember_purpose(body.get("member_purpose"));
		mvo.setMember_disease(body.get("member_disease"));
		mvo.setMember_time(body.get("member_time_start")+"~"+body.get("member_time_end"));
		result = mapper.updateInfo(mvo);
		bvo.setMember_idx(idx);
		bvo.setBody_bmi(body.get("body_bmi") != null && body.get("body_bmi") != "" ? Double.parseDouble(body.get("body_bmi")) : 0.0);
		bvo.setBody_fat(body.get("body_fat") != null && body.get("body_fat") != "" ? Double.parseDouble(body.get("body_fat")) : 0.0);
		bvo.setBody_height(Double.parseDouble(body.get("body_height")));
		bvo.setBody_weight(Double.parseDouble(body.get("body_weight")));
		bvo.setBody_skeletal_muscle(body.get("body_skeletal_muscle") != null && body.get("body_skeletal_muscle") != "" ? Double.parseDouble(body.get("body_skeletal_muscle")) : 0.0);
		bvo.setBody_fat_percentage(body.get("body_fat_percentage") != null && body.get("body_fat_percentage") != "" ? Double.parseDouble(body.get("body_fat_percentage")) : 0.0);
		result = result + bodymapper.insertBody(bvo);
		return result == 2 ? true : false;
	}
}