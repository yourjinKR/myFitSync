package org.fitsync.service;

import java.util.List;
import java.util.Map;

import org.fitsync.domain.AwardsVO;
import org.fitsync.domain.BodyVO;
import org.fitsync.domain.MemberVO;
import org.fitsync.domain.ReviewVO;
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
	
	// 유저 추가정보 입력
	@Override
	@Transactional
	public boolean insertUser(Map<String, String> body) {
		int result = 0;
		MemberVO mvo = new MemberVO();
		mvo.setMember_type(body.get("member_type"));
		mvo.setMember_email(body.get("member_email"));
		mvo.setMember_name(body.get("member_name"));
		mvo.setMember_image(body.get("member_image"));
		mvo.setMember_time(body.get("member_time_start")+"~"+body.get("member_time_end"));

		if(body.get("member_type").equals("user")) {
			mvo.setMember_purpose(body.get("member_purpose"));
			mvo.setMember_disease(body.get("member_disease"));
			result = mapper.insertMemberInfo(mvo);
			
			int member_idx = mapper.getUserIdx(mvo.getMember_email());

			BodyVO bvo = new BodyVO();
			bvo.setMember_idx(member_idx);
			bvo.setBody_bmi(body.get("body_bmi") != null && body.get("body_bmi") != "" ? Double.parseDouble(body.get("body_bmi")) : 0.0);
			bvo.setBody_fat(body.get("body_fat") != null && body.get("body_fat") != "" ? Double.parseDouble(body.get("body_fat")) : 0.0);
			bvo.setBody_height(Double.parseDouble(body.get("body_height")));
			bvo.setBody_weight(Double.parseDouble(body.get("body_weight")));
			bvo.setBody_skeletal_muscle(body.get("body_skeletal_muscle") != null && body.get("body_skeletal_muscle") != "" ? Double.parseDouble(body.get("body_skeletal_muscle")) : 0.0);
			bvo.setBody_fat_percentage(body.get("body_fat_percentage") != null && body.get("body_fat_percentage") != "" ? Double.parseDouble(body.get("body_fat_percentage")) : 0.0);
			result = result + bodymapper.insertBody(bvo);
			return result == 2 ? true : false;
		}else {
			mvo.setMember_day(body.get("member_day"));
			mvo.setMember_activity_area(body.get("member_activity_area"));
			mvo.setMember_info(body.get("member_info"));
			result = mapper.insertTrainerInfo(mvo);
			return result == 1 ? true : false;
		}
	}
	
    @Override
    public MemberVO getTrainerByIdx(int memberIdx) {
        return mapper.selectTrainerByIdx(memberIdx);
    }

    @Override
    public List<AwardsVO> getAwardsByMemberIdx(int memberIdx) {
        return mapper.selectAwardsByMemberIdx(memberIdx);
    }

    @Override
    public List<ReviewVO> getReviewsByMemberIdx(int memberIdx) {
        return mapper.selectReviewsByMemberIdx(memberIdx);
    }
}