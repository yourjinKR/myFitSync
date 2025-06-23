package org.fitsync.mapper;

import java.util.List;

import org.fitsync.domain.ChatAttachVO;

public interface ChatAttachMapper {
	//파일 등록
	public int insert(ChatAttachVO vo);
	//파일 수정
	public int update(ChatAttachVO vo);
	//파일 삭제
	public int delete(int attach_idx);
	//파일 view
	public ChatAttachVO read(int attach_idx);
	//파일 목록
	public List<ChatAttachVO> getAttach();
}