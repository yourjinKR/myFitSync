package org.fitsync.service;

import java.util.Date;
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

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

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

    // 채팅방생성 or 기존방 조회
	@Override
	public RoomVO registerRoom(int trainer_idx, int user_idx, String room_name) {
		log.info("registerRoom..." + trainer_idx + ", " + user_idx + ", " + room_name);
		// 기존 채팅방 확인
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

	// 채팅방 상세정보 조회
	@Override
	public RoomVO readRoom(int room_idx) {
		log.info("readRoom..." + room_idx);
		return roomMapper.getRoom(room_idx);
	}

	// 특정 사용자의 모든 채팅방 목록 조회
	@Override
	public List<RoomVO> readRoomList(int member_idx) {
		log.info("readRoomList..." + member_idx);
		return roomMapper.getRoomList(member_idx);
	}
	
	/*-------------------------------------------------------------------*/

	// 새채팅 메시지 등록
	@Override
	public MessageVO registerMessage(MessageVO vo) {
		log.info("registerMessage (매칭 데이터 지원)..." + vo);
		
		try {
			// 매칭 데이터가 Map 형태로 있다면 JSON 문자열로 변환
			if (vo.getMatching_data_map() != null && !vo.getMatching_data_map().isEmpty()) {
				vo.setMatchingDataFromMap(vo.getMatching_data_map());
				log.info("✅ 매칭 데이터 JSON 변환 완료: " + vo.getMatching_data());
			}
			
			// 메시지 저장
			int result = messageMapper.insertMessage(vo);
			log.info("메시지 저장 결과: " + result + ", message_idx: " + vo.getMessage_idx());
			
			if (result > 0) {
				// 채팅방 마지막 메시지 업데이트
				roomMapper.updateLastMessage(vo.getRoom_idx(), vo.getMessage_idx());
				
				// 저장된 메시지 재조회 (매칭 데이터 포함)
				if (vo.getMessage_idx() > 0) {
					MessageVO savedMessage = messageMapper.getMessage(vo.getMessage_idx());
					if (savedMessage != null) {
						log.info("✅ 저장된 메시지 조회 성공 (매칭 데이터 포함): " + savedMessage);
						
						// 🔥 매칭 데이터 로그 출력
						if (savedMessage.hasMatchingData()) {
							log.info("✅ 매칭 데이터 확인: " + savedMessage.getMatching_data());
							log.info("✅ 매칭 IDX: " + savedMessage.getMatchingIdx());
							log.info("✅ 매칭 총 횟수: " + savedMessage.getMatchingTotal());
						}
						
						return savedMessage;
					}
				}
				
				// 재조회 실패 시 원본 VO 반환
				log.warn("저장된 메시지 재조회 실패, 원본 반환");
				vo.setMessage_senddate(new java.sql.Timestamp(System.currentTimeMillis()));
				return vo;
			}
			
		} catch (Exception e) {
			log.error("메시지 저장 중 예외 발생: ", e);
			vo.setMessage_senddate(new java.sql.Timestamp(System.currentTimeMillis()));
			return vo;
		}
		
		log.error("메시지 저장 실패");
		return null;
	}
	
	@Override
	public MessageVO getMessage(int message_idx) {
		log.info("getMessage..." + message_idx);
		MessageVO message = messageMapper.getMessage(message_idx);
		
		return message;
	}

	@Override
	public List<MessageVO> readMessageList(int room_idx) {
		log.info("readMessageList..." + room_idx);
		List<MessageVO> messages = messageMapper.getMessageList(room_idx);
		
		// 매칭 데이터가 포함된 메시지 로그 출력
		long matchingMessageCount = messages.stream()
			.filter(MessageVO::hasMatchingData)
			.count();
		
		if (matchingMessageCount > 0) {
			log.info("✅ 매칭 데이터 포함 메시지 개수: " + matchingMessageCount);
			
			// 각 매칭 메시지의 상세 정보 로그
			messages.stream()
				.filter(MessageVO::hasMatchingData)
				.forEach(msg -> {
					log.info("✅ 매칭 메시지 - IDX: " + msg.getMessage_idx() + 
							", 매칭 IDX: " + msg.getMatchingIdx() + 
							", 매칭 총 횟수: " + msg.getMatchingTotal());
				});
		}
		
		return messages;
	}

	// 모든 메시지 페이징처리 조회
	@Override
	public List<MessageVO> readMessageListPaging(int room_idx, int page, int size) {
		log.info("readMessageListPaging..." + room_idx + ", " + page + ", " + size);
		// 페이지 번호를 데이터베이스 OFFSET으로 변환
		int offset = page * size;
		return messageMapper.getMessageListPaging(room_idx, offset, size);
	}

	// 채팅방의 메시지를 키워드로 검색
	@Override
	public List<MessageVO> searchMessage(int room_idx, String keyword) {
		log.info("searchMessage..." + room_idx + ", " + keyword);
		return messageMapper.searchMessage(room_idx, keyword);
	}

	// 메시지를 읽었을때 읽음 상태 업데이트 처리
	@Override
	public int readMark(int message_idx, int receiver_idx) {
		log.info("readMark..." + message_idx + ", " + receiver_idx);
		return messageMapper.readMark(message_idx, receiver_idx);
	}

	// 채팅방의 읽지 않은 메시지 개수를 조회
	@Override
	public int unreadCount(int room_idx, int receiver_idx) {
		log.info("unreadCount..." + room_idx + ", " + receiver_idx);
		return messageMapper.unreadCount(room_idx, receiver_idx);
	}

	/*-------------------------------------------------------------------*/
	
	// 메시지에 첨부파일을 업로드(Cloudinary에 실제파일을 업로드하고 DB에 파일정보를 저장)
	@Override
    public ChatAttachVO uploadFile(MultipartFile file) throws Exception {
        log.info("uploadFile..." + file.getOriginalFilename());
        return cloudinaryService.uploadFile(file);
    }
    
    // 메시지에 첨부된 파일 삭제
    @Override
    public boolean deleteFile(int attach_idx) {
        log.info("deleteFile..." + attach_idx);
        return cloudinaryService.deleteFile(attach_idx);
    }

    // 메시지 첨부파일 조회
    @Override
    public ChatAttachVO readFile(int message_idx) {
        log.info("readFile..." + message_idx);
        return messageMapper.getMessageAttachment(message_idx);
    }
    
    // 메시지와 첨부파일 연결
    @Override
    public int linkAttachmentToMessage(int message_idx, int attach_idx) {
        log.info("linkAttachmentToMessage..." + message_idx + ", " + attach_idx);
        return messageMapper.updateMessageAttachment(message_idx, attach_idx);
    }
    
    // 메시지 삭제 (논리적 삭제)
    @Override
    public boolean deleteMessage(int message_idx, int sender_idx) {
        log.info("deleteMessage... message_idx: " + message_idx + ", sender_idx: " + sender_idx);
        
        try {
            // 1. 삭제 가능 여부 체크
            MessageVO message = messageMapper.getMessageForDeleteCheck(message_idx, sender_idx);
            
            if (message == null) {
                log.warn("메시지를 찾을 수 없거나 삭제 권한이 없습니다.");
                return false;
            }
            
            // 2. 삭제 가능한지 시간 체크
            if (!canDeleteMessage(message)) {
                log.warn("메시지 삭제 시간이 경과했습니다.");
                return false;
            }
            
            // 3. 논리적 삭제 실행
            int result = messageMapper.deleteMessage(message_idx, sender_idx);
            
            if (result > 0) {
                log.info("메시지 삭제 완료: " + message_idx);
                return true;
            } else {
                log.error("메시지 삭제 실패: " + message_idx);
                return false;
            }
            
        } catch (Exception e) {
            log.error("메시지 삭제 중 오류 발생: " + e.getMessage(), e);
            throw new RuntimeException("메시지 삭제에 실패했습니다.", e);
        }
    }
    
    // 메시지 삭제 가능 여부 체크
    private boolean canDeleteMessage(MessageVO message) {
        // 읽지 않은 상태면 항상 삭제 가능
        if (message.getMessage_readdate() == null) {
            log.info("읽지 않은 메시지 - 삭제 가능");
            return true;
        }
        
        // 읽은 상태면 1분 내에만 삭제 가능
        Date readTime = message.getMessage_readdate();
        Date now = new Date();
        long diffInMillis = now.getTime() - readTime.getTime();
        long diffInMinutes = diffInMillis / (1000 * 60);
        
        boolean canDelete = diffInMinutes <= 1;
        log.info("읽은 메시지 삭제 가능 여부: " + canDelete + " (경과 시간: " + diffInMinutes + "분)");
        
        return canDelete;
    }
    
    // 답장용 원본 메시지 조회
    @Override
    public MessageVO getParentMessage(int parent_idx) {
        log.info("getParentMessage... parent_idx: " + parent_idx);
        return messageMapper.getParentMessage(parent_idx);
    }
    
    // 답장 메시지들 조회
    @Override
    public List<MessageVO> getReplyMessages(int parent_idx) {
        log.info("getReplyMessages... parent_idx: " + parent_idx);
        return messageMapper.getReplyMessages(parent_idx);
    }

}