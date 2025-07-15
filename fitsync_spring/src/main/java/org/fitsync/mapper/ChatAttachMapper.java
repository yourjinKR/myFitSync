package org.fitsync.mapper;

import org.apache.ibatis.annotations.Param;
import org.fitsync.domain.ChatAttachVO;

public interface ChatAttachMapper {
	
	// 첨부파일 저장
    public int insertAttach(ChatAttachVO vo);
    // 첨부파일 상세 조회
    public ChatAttachVO getAttach(@Param("attach_idx") int attach_idx);
    // 첨부파일 삭제
    public int deleteAttach(@Param("attach_idx") int attach_idx);
    
}