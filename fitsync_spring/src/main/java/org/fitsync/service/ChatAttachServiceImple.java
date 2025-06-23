package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.ChatAttachVO;
import org.fitsync.mapper.ChatAttachMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class ChatAttachServiceImple implements ChatAttachService {
	
	@Autowired
	private ChatAttachMapper mapper;
	
	@Override
	public int register(ChatAttachVO vo) {
		log.info("register..."+vo);
		return mapper.insert(vo);
	}
	
	@Override
	public int modify(ChatAttachVO vo) {
		log.info("modify..."+vo);
		return mapper.update(vo);
	}
	
	@Override
	public int remove(int attach_idx) {
		log.info("remove..."+attach_idx);
		return mapper.delete(attach_idx);
	}
	
	@Override
	public ChatAttachVO get(int attach_idx) {
		log.info("get..."+attach_idx);
		return mapper.read(attach_idx);
	}
	
	@Override
	public List<ChatAttachVO> getList() {
		log.info("getList...");
		return mapper.getAttach();
	}
	
}