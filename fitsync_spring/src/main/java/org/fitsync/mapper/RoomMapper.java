package org.fitsync.mapper;

import java.util.List;

import org.fitsync.domain.RoomVO;

public interface RoomMapper {
	
	// 채팅방 생성
    public int insertRoom(RoomVO vo);
    // 채팅방 마지막 메시지 업데이트
    public int updateLastMessage(int room_idx, int message_idx);
    // 채팅방 조회 (트레이너 + 회원)
    public RoomVO getMembers(int trainer_idx, int user_idx);
    // 채팅방 상세 조회
    public RoomVO getRoom(int room_idx);
    // 사용자 채팅방 목록 조회
    public List<RoomVO> getRoomList(int member_idx);
	
}