package org.fitsync.service;

import java.sql.Date;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Map;

import org.fitsync.domain.AwardsVO;
import org.fitsync.domain.BodyVO;
import org.fitsync.domain.ChatAttachVO;
import org.fitsync.domain.MemberVO;
import org.fitsync.domain.ReviewVO;
import org.fitsync.domain.SearchCriteria;
import org.fitsync.mapper.BodyMapper;
import org.fitsync.mapper.ChatAttachMapper;
import org.fitsync.mapper.MemberMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class MemberServiceImple implements MemberService {

	@Autowired
	private MemberMapper mapper;
	@Autowired
	private BodyMapper bodymapper;
	@Autowired
	private CloudinaryService cloudinaryService;
	@Autowired
	private Cloudinary cloudinary;
	@Autowired
	private ChatAttachMapper chatAttachMapper;
	
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
		mvo.setMember_gender(body.get("member_gender"));
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
		java.util.Date utilDate = null;
		try {
			utilDate = sdf.parse(body.get("member_birth"));
		} catch (ParseException e) {
			e.printStackTrace();
		}
		java.sql.Date sqlDate = new java.sql.Date(utilDate.getTime());
		mvo.setMember_birth(sqlDate);
		mvo.setMember_activity_area(body.get("member_activity_area"));
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
	
	// 트레이너 프로필 조회
    @Override
    public MemberVO getTrainerByIdx(int memberIdx) {
        return mapper.selectTrainerByIdx(memberIdx);
    }
    // 트레이너의 자격증/수상경력/학위 조회
    @Override
    public List<AwardsVO> getAwardsByMemberIdx(int memberIdx) {
        return mapper.selectAwardsByMemberIdx(memberIdx);
    }
    // 트레이너의 리뷰 목록 조회
    @Override
    public List<ReviewVO> getReviewsByMemberIdx(int memberIdx) {
    	return mapper.selectReviewsByTrainerIdx(memberIdx);
    }
    
    @Override
    @Transactional
    public void updateTrainerProfile(MemberVO member) {
        try {
            mapper.updateTrainerProfile(member);
            System.out.println(">>> 업데이트 성공");
        } catch (Exception e) {
            e.printStackTrace();
        }

    }
    
	// 트레이너 목록 가져오기
	@Override
	public List<MemberVO> getTrainerList(SearchCriteria cri) {
	    return mapper.getTrainerList(cri);
	}
	
	// AI 요청시 필요 정보
	@Override
	public MemberVO getMemberForAIRecommendation(int memberIdx) {
		log.info(mapper.getMemberForAIRecommendation(memberIdx));
		return mapper.getMemberForAIRecommendation(memberIdx);
	}
	
	// 유저 정보 가져오기
	@Override
	public MemberVO getMemberByIdx(int memberIdx) {
		return mapper.selectMemberByIdx(memberIdx);
	}
	
	// 회원 프로필 사진 변경
	@Override
	public String updateProfileImage(int memberIdx, MultipartFile file) throws Exception {
	    // 1. 기존 프로필 이미지 정보 가져오기
	    ChatAttachVO oldAttach = chatAttachMapper.selectProfileImageByMemberIdx(memberIdx);

	    // 2. 새 이미지 업로드 및 chatattach 저장
	    ChatAttachVO newAttach = cloudinaryService.uploadFile(file);

	    // 3. member 테이블 프로필 이미지 URL 업데이트
	    mapper.updateMemberProfileImage(memberIdx, newAttach.getCloudinary_url());

	    // 4. 기존 이미지 삭제 처리 (있을 경우)
	    if (oldAttach != null && oldAttach.getCloudinary_public_id() != null) {
	        // chatattach 테이블에서 삭제
	    	chatAttachMapper.deleteAttach(oldAttach.getAttach_idx());

	        // 클라우디너리에서 삭제 (메소드 직접 호출)
	        cloudinary.uploader().destroy(oldAttach.getCloudinary_public_id(), ObjectUtils.emptyMap());
	    }

	    // 5. 프론트에 새 이미지 URL 반환
	    return newAttach.getCloudinary_url();
	}
	
	@Override
	public void updateProfileVisibility(int memberIdx, boolean memberHidden) {
	    mapper.updateProfileVisibility(memberIdx, memberHidden ? 1 : 0);
	}
	
}