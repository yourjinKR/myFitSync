package org.fitsync.service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.fitsync.domain.ChatAttachVO;
import org.fitsync.domain.MessageVO;
import org.fitsync.domain.RoomVO;
import org.fitsync.mapper.ChatAttachMapper;
import org.fitsync.mapper.MessageMapper;
import org.fitsync.mapper.RoomMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
@Transactional
public class ChatServiceImple implements ChatService {
	
	@Autowired
    private RoomMapper roomMapper;
    
    @Autowired
    private MessageMapper messageMapper;
    
    @Autowired
    private ChatAttachMapper attachMapper;
    
    @Autowired
    private CloudinaryService cloudinaryService;

    // 채팅방 생성 또는 기존 채팅방 조회
	@Override
	public RoomVO registerRoom(int trainer_idx, int user_idx, String room_name) {
		// 기존 채팅방 확인 - 같은 트레이너와 회원 간의 채팅방이 이미 존재하는지 체크
		RoomVO existingRoom = roomMapper.getMembers(trainer_idx, user_idx);
		
		// 기존 채팅방이 있다면 해당 방 정보를 반환 (중복 생성 방지)
        if (existingRoom != null) {
            return existingRoom;
        }
        
        // 새 채팅방 생성
        RoomVO newRoom = new RoomVO(trainer_idx, user_idx, room_name);
        roomMapper.insertRoom(newRoom);
        
        return newRoom;
	}

    // 특정 채팅방의 상세 정보 조회
	@Override
	public RoomVO readRoom(int room_idx) {
		return roomMapper.getRoom(room_idx);
	}

    // 메시지 필터링이 적용된 채팅방 목록 조회
	@Override
	public List<RoomVO> readRoomList(int member_idx) {
		Map<String, Object> params = new HashMap<>();
		params.put("member_idx", member_idx);
		
		return roomMapper.getRoomListWithMessageFilter(params);
	}
	
	/*-------------------------------------------------------------------*/

    // 새로운 채팅 메시지 등록
	@Override
	public MessageVO registerMessage(MessageVO vo) {
		try {
			// 매칭 데이터가 Map 형태로 있다면 JSON 문자열로 변환하여 DB 저장 준비
			if (vo.getMatching_data_map() != null && !vo.getMatching_data_map().isEmpty()) {
				vo.setMatchingDataFromMap(vo.getMatching_data_map());
			}
			
			// 메시지 DB 저장
			int result = messageMapper.insertMessage(vo);
			
			if (result > 0) {
				// 채팅방의 마지막 메시지 정보 업데이트
				roomMapper.updateLastMessage(vo.getRoom_idx(), vo.getMessage_idx());
				
				// 저장된 메시지 재조회 (자동 생성된 ID와 매칭 데이터 포함)
				if (vo.getMessage_idx() > 0) {
					MessageVO savedMessage = messageMapper.getMessage(vo.getMessage_idx());
					if (savedMessage != null) {
						return savedMessage;
					}
				}
				
				// 재조회 실패 시 원본 VO에 타임스탬프 설정 후 반환
				vo.setMessage_senddate(new java.sql.Timestamp(System.currentTimeMillis()));
				return vo;
			}
			
		} catch (Exception e) {
			// 예외 발생 시에도 메시지 객체 반환 (WebSocket에서 처리할 수 있도록)
			vo.setMessage_senddate(new java.sql.Timestamp(System.currentTimeMillis()));
			return vo;
		}
		
		return null;
	}
	
    // 특정 메시지 정보 조회
	@Override
	public MessageVO getMessage(int message_idx) {
		return messageMapper.getMessage(message_idx);
	}

    // 특정 채팅방의 모든 메시지 조회
	@Override
	public List<MessageVO> readMessageList(int room_idx) {
		return messageMapper.getMessageList(room_idx);
	}

    // 페이징 처리된 메시지 목록 조회
	@Override
	public List<MessageVO> readMessageListPaging(int room_idx, int page, int size) {
		// 페이지 번호를 데이터베이스 OFFSET으로 변환
		int offset = page * size;
		return messageMapper.getMessageListPaging(room_idx, offset, size);
	}

    // 채팅방 내 메시지 키워드 검색
	@Override
	public List<MessageVO> searchMessage(int room_idx, String keyword) {
		return messageMapper.searchMessage(room_idx, keyword);
	}

    // 메시지 읽음 상태 업데이트
	@Override
	public int readMark(int message_idx, int receiver_idx) {
		return messageMapper.readMark(message_idx, receiver_idx);
	}

    // 특정 채팅방의 읽지 않은 메시지 개수 조회
	@Override
	public int unreadCount(int room_idx, int receiver_idx) {
		return messageMapper.unreadCount(room_idx, receiver_idx);
	}

	/*-------------------------------------------------------------------*/
	
    // 메시지에 첨부파일 업로드
	@Override
    public ChatAttachVO uploadFile(MultipartFile file) throws Exception {
        return cloudinaryService.uploadFile(file);
    }
    
    // 메시지 첨부파일 삭제
    @Override
    public boolean deleteFile(int attach_idx) {
        return cloudinaryService.deleteFile(attach_idx);
    }

    // 특정 메시지의 첨부파일 정보 조회
    @Override
    public ChatAttachVO readFile(int message_idx) {
        return messageMapper.getMessageAttachment(message_idx);
    }
    
    //메시지와 첨부파일 연결
    @Override
    public int linkAttachmentToMessage(int message_idx, int attach_idx) {
        return messageMapper.updateMessageAttachment(message_idx, attach_idx);
    }
    
    // 메시지 삭제 (논리적 삭제)
    @Override
    public boolean deleteMessage(int message_idx, int sender_idx) {
        try {
            // 1. 삭제 가능 여부 체크 - 메시지 존재 여부와 발신자 권한 확인
            MessageVO message = messageMapper.getMessageForDeleteCheck(message_idx, sender_idx);
            
            if (message == null) {
                return false;
            }
            
            // 2. 삭제 가능한지 시간 체크 - 읽음 상태와 시간 경과 확인
            if (!canDeleteMessage(message)) {
                return false;
            }
            
            // 3. 논리적 삭제 실행
            int result = messageMapper.deleteMessage(message_idx, sender_idx);
            
            return result > 0;
            
        } catch (Exception e) {
            throw new RuntimeException("메시지 삭제에 실패했습니다.", e);
        }
    }
    
    // 메시지 삭제 가능 여부 체크
    private boolean canDeleteMessage(MessageVO message) {
        // 읽지 않은 상태면 항상 삭제 가능
        if (message.getMessage_readdate() == null) {
            return true;
        }
        
        // 읽은 상태면 1분 내에만 삭제 가능
        Date readTime = message.getMessage_readdate();
        Date now = new Date();
        long diffInMillis = now.getTime() - readTime.getTime();
        long diffInMinutes = diffInMillis / (1000 * 60);
        
        return diffInMinutes <= 1;
    }
    
    // 답장용 원본 메시지 조회
    @Override
    public MessageVO getParentMessage(int parent_idx) {
        return messageMapper.getParentMessage(parent_idx);
    }
    
    // 특정 메시지에 대한 답장 메시지들 조회
    @Override
    public List<MessageVO> getReplyMessages(int parent_idx) {
        return messageMapper.getReplyMessages(parent_idx);
    }
}