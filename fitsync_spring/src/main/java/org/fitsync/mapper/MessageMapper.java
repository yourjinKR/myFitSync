package org.fitsync.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.fitsync.domain.ChatAttachVO;
import org.fitsync.domain.MessageVO;

public interface MessageMapper {
	
	// 메시지 저장
    public int insertMessage(MessageVO vo);
    // 메시지 상세 조회
    public MessageVO getMessage(@Param("message_idx") int message_idx);
    // 채팅방 메시지 목록 조회
    public List<MessageVO> getMessageList(@Param("room_idx") int room_idx);
    // 메시지 페이징 조회
    public List<MessageVO> getMessageListPaging(@Param("room_idx") int room_idx, @Param("offset") int offset, @Param("limit") int limit);
    // 메시지 검색
    public List<MessageVO> searchMessage(@Param("room_idx") int room_idx, @Param("keyword") String keyword);
    // 메시지 읽음 처리
    public int readMark(@Param("message_idx") int message_idx, @Param("receiver_idx") int receiver_idx);
    // 읽지 않은 메시지 수 조회
    public int unreadCount(@Param("room_idx") int room_idx, @Param("receiver_idx") int receiver_idx);
    // 메시지의 첨부파일 조회
    public ChatAttachVO getMessageAttachment(@Param("message_idx") int message_idx);
    // 메시지 첨부파일 업데이트
    public int updateMessageAttachment(@Param("message_idx") int message_idx, @Param("attach_idx") int attach_idx);
    // 메시지 삭제 (논리적 삭제)
    public int deleteMessage(@Param("message_idx") int message_idx, @Param("sender_idx") int sender_idx);
    // 삭제 가능 여부 체크 (읽음 상태 및 시간 체크)
    public MessageVO getMessageForDeleteCheck(@Param("message_idx") int message_idx, @Param("sender_idx") int sender_idx);
    // 답장용 원본 메시지 조회
    public MessageVO getParentMessage(@Param("parent_idx") int parent_idx);
    // 답장 메시지들 조회 (parent_idx가 있는 메시지들)
    public List<MessageVO> getReplyMessages(@Param("parent_idx") int parent_idx);
    
}