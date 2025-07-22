package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.ChatAttachVO;
import org.fitsync.domain.MemberVO;
import org.fitsync.domain.MessageVO;
import org.fitsync.domain.ReportVO;
import org.fitsync.domain.ReviewVO;
import org.fitsync.mapper.ChatAttachMapper;
import org.fitsync.mapper.MemberMapper;
import org.fitsync.mapper.MessageMapper;
import org.fitsync.mapper.ReportMapper;
import org.fitsync.mapper.ReviewMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
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
	
	@Override
	public List<ReportVO> getReport() {
		List<ReportVO> list = mapper.getReport();
		for (ReportVO vo : list) {
			if(vo.getReport_category().equals("message")) {
				MessageVO mvo = messageMapper.getMessage(vo.getIdx_num());
				MemberVO memvo = memberMapper.selectTrainerByIdx(mvo.getReceiver_idx());
				if(memvo != null) {
					vo.setReported(memvo);					
				}
				if(mvo != null) {
					if(mvo.getAttach_idx() != null) {
						ChatAttachVO attach = attachMapper.getAttach(mvo.getAttach_idx());
						mvo.setAttach(attach);
					}
					vo.setMessage(mvo);
				}
			}else {
				MemberVO memvo = memberMapper.selectTrainerByIdx(vo.getIdx_num());
				if(memvo != null) {
					vo.setReported(memvo);					
				}
				ReviewVO rvo = reviewMapper.getReviewOne(vo.getIdx_num());
				if(rvo != null) {
					vo.setReview(rvo);
				}
			}
		}
		return list; // result 대신 list를 반환
	}
	
}