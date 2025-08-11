package org.fitsync.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.fitsync.domain.ChatAttachVO;
import org.fitsync.domain.MemberVO;
import org.fitsync.domain.MessageVO;
import org.fitsync.domain.ReportVO;
import org.fitsync.domain.ReviewVO;
import org.fitsync.mapper.ChatAttachMapper;
import org.fitsync.mapper.MatchingMapper;
import org.fitsync.mapper.MemberMapper;
import org.fitsync.mapper.MessageMapper;
import org.fitsync.mapper.ReportMapper;
import org.fitsync.mapper.ReviewMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
@Transactional
public class ReportServiceImple implements ReportService {
	
	@Autowired
	private ReportMapper mapper;
	@Autowired
	private MemberMapper memberMapper;
	@Autowired
	private ReviewMapper reviewMapper;
	@Autowired
	private MessageMapper messageMapper;
	@Autowired
	private ChatAttachMapper attachMapper;
	@Autowired
	private MatchingMapper matchMapper;
	
	@Override
	public List<ReportVO> getReport() {
		List<ReportVO> list = mapper.getReport();
		for (ReportVO vo : list) {
			if(vo.getReport_category().toLowerCase().equals("message")) {
				MessageVO mvo = messageMapper.getMessage(vo.getIdx_num());
				if(mvo != null) {
					MemberVO memvo = memberMapper.selectTrainerByIdx(mvo.getSender_idx());
					if(memvo != null) {
						vo.setReported(memvo);					
					}
					if(mvo.getAttach_idx() != null) {
						ChatAttachVO attach = attachMapper.getAttach(mvo.getAttach_idx());
						mvo.setAttach(attach);
					}else {
						List<MessageVO> history = messageMapper.getHistory(mvo.getMessage_idx());
						vo.setHistory_message(history);
					}
					vo.setMessage(mvo);
				}
			}else if(vo.getReport_category().toLowerCase().equals("member")) {
				MemberVO memvo = memberMapper.selectTrainerByIdx(vo.getIdx_num());
				if(memvo != null) {
					vo.setReported(memvo);					
				}
			}else {				
				ReviewVO rvo = reviewMapper.getReviewOne(vo.getIdx_num());
				MemberVO memvo = memberMapper.selectTrainerByIdx(rvo.getMember_idx());
				if(rvo != null) {
					vo.setReview(rvo);
					vo.setReported(memvo);
				}
			}
		}
		return list; // result 대신 list를 반환
	}

	@Override
    public boolean reportMessage(int messageIdx, String reportContent, int memberIdx) {
        try {
            // 중복 신고 체크
            int duplicateCount = mapper.checkDuplicateReport(messageIdx, memberIdx, "message");
            if (duplicateCount > 0) {
                return false; // 중복 신고
            }
            
            // 신고 등록
            ReportVO reportVO = new ReportVO();
            reportVO.setIdx_num(messageIdx);
            reportVO.setReport_category("message");
            reportVO.setReport_content(reportContent);
            reportVO.setMember_idx(memberIdx);
            
            int result = mapper.insertReport(reportVO);
            
            if (result > 0) {
                return true;
            } else {
                return false;
            }
            
        } catch (Exception e) {
            throw new RuntimeException("신고 등록에 실패했습니다.", e);
        }
    }

	// 신고 제재 업데이트
	@Override
	public boolean updateReport(int report_idx, int member_idx, int block_set) {
		ReportVO vo = new ReportVO();
		vo.setReport_sanction(member_idx);
		vo.setReport_idx(report_idx);
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("vo", vo);
		map.put("block_set", block_set);
		return mapper.updateReport(map) > 0;
	}
	
	@Override
	public boolean updateReport(int report_idx, int member_idx, int block_set, int report_data_idx) {
		ReportVO vo = new ReportVO();
		vo.setReport_sanction(member_idx);
		vo.setReport_idx(report_idx);
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("vo", vo);
		map.put("block_set", block_set);
		if(mapper.updateReport(map) > 0) {
			return reviewMapper.reviewHidden(report_data_idx) > 0;
		}else {		
			return false;
		}
	}
	
	// 제재정보
	@Override
	public ReportVO getBlockData(int member_idx) {
		return mapper.getBlockData(member_idx);
	}
	
	// 프로필 신고
	@Override
	public void insertReport(ReportVO report) {
		mapper.insertProfileReport(report);
	}
	
	// UserProfileModal 사용자 프로필 신고
	@Override
	public void insertUserProfileReport(ReportVO report) {
		mapper.insertUserProfileReport(report);
	}
}