package org.fitsync.mapper;

import java.util.List;

import org.fitsync.domain.MessageVO;

public interface MessageMapper {
	
	// 메시지 저장
    public int insertMessage(MessageVO vo);
    // 메시지 상세 조회
    public MessageVO getMessage(int message_idx);
    // 채팅방 메시지 목록 조회
    public List<MessageVO> getMessageList(int room_idx);
    // 메시지 페이징 조회
    public List<MessageVO> getMessageListPaging(int room_idx, int offset, int limit);
    // 메시지 검색
    public List<MessageVO> searchMessage(int room_idx, String keyword);
    // 메시지 읽음 처리
    public int readMark(int message_idx, int member_idx);
    // 읽지 않은 메시지 수 조회
    public int unreadCount(int room_idx, int member_idx);
	
}