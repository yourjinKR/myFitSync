package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.ChatAttachVO;

public interface ChatAttachService {
	//파일 등록
	public int register(ChatAttachVO vo);
	//파일 수정
	public int modify(ChatAttachVO vo);
	//파일 삭제
	public int remove(int attach_idx);
	//파일 view
	public ChatAttachVO get(int attach_idx);
	//파일 목록
	public List<ChatAttachVO> getList();
}