package org.fitsync.mapper;

import java.util.List;

import org.fitsync.domain.ChatAttachVO;

public interface ChatAttachMapper {
	
	// 첨부파일 저장
    public int insertAttach(ChatAttachVO vo);
    // 첨부파일 상세 조회
    public ChatAttachVO getAttach(int attach_idx);
    // 메시지별 첨부파일 목록 조회
    public List<ChatAttachVO> getAttachList(int message_idx);
    // 첨부파일 삭제
    public int deleteAttach(int attach_idx);
    
}