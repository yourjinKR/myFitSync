package org.fitsync.service;

import java.util.List;

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
        log.info("메시지 신고 등록: messageIdx=" + messageIdx + ", memberIdx=" + memberIdx);
        
        try {
            // 중복 신고 체크
            int duplicateCount = mapper.checkDuplicateReport(messageIdx, memberIdx, "message");
            if (duplicateCount > 0) {
                log.warn("이미 신고한 메시지입니다: messageIdx=" + messageIdx + ", memberIdx=" + memberIdx);
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
                log.info("메시지 신고 등록 완료: " + reportVO);
                return true;
            } else {
                log.error("메시지 신고 등록 실패");
                return false;
            }
            
        } catch (Exception e) {
            log.error("메시지 신고 등록 중 오류 발생: " + e.getMessage(), e);
            throw new RuntimeException("신고 등록에 실패했습니다.", e);
        }
    }

	// 신고 제재 업데이트
	@Override
	public boolean updateReport(int report_idx, int member_idx) {
		ReportVO vo = new ReportVO();
		vo.setReport_sanction(member_idx);
		vo.setReport_idx(report_idx);
		return mapper.updateReport(vo) > 0;
	}
	
	@Override
	public boolean updateReport(int report_idx, int member_idx, int report_data_idx) {
		ReportVO vo = new ReportVO();
		vo.setReport_sanction(member_idx);
		vo.setReport_idx(report_idx);
		if(mapper.updateReport(vo) > 0) {
			return reviewMapper.reviewHidden(report_data_idx) > 0;
		}else {		
			return false;
		}
	}
}