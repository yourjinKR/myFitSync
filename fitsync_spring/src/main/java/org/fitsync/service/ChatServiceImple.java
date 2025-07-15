package org.fitsync.service;

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
		log.info("registerMessage..." + vo);
		// 메시지 저장
		messageMapper.insertMessage(vo);
        
        // 채팅방 마지막 메시지 업데이트(최신 메시지 표시용)
		roomMapper.updateLastMessage(vo.getRoom_idx(), vo.getMessage_idx());
        
        return vo;
	}
	
	// 메시지 상세 조회
	@Override
	public MessageVO getMessage(int message_idx) {
		log.info("getMessage..." + message_idx);
		return messageMapper.getMessage(message_idx);
	}

	// 채팅방의 모든 메시지 조회
	@Override
	public List<MessageVO> readMessageList(int room_idx) {
		log.info("readMessageList..." + room_idx);
		return messageMapper.getMessageList(room_idx);
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

}
