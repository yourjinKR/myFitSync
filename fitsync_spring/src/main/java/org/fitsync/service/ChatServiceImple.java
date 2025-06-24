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
    private Cloudinary cloudinary;
//    @Autowired
//    private CloudinaryService cloudinaryService;

	@Override
	public RoomVO registerRoom(int trainer_idx, int user_idx, String room_name) {
		log.info("registerRoom..." + trainer_idx + ", " + user_idx + ", " + room_name);
		// 기존 채팅방 확인
		RoomVO existingRoom = roomMapper.getMembers(trainer_idx, user_idx);
        
        if (existingRoom != null) {
            return existingRoom;
        }
        
        // 새 채팅방 생성
        RoomVO newRoom = new RoomVO(trainer_idx, user_idx, room_name);
        roomMapper.insertRoom(newRoom);
        
        return newRoom;
	}

	@Override
	public RoomVO readRoom(int room_idx) {
		log.info("readRoom..." + room_idx);
		return roomMapper.getRoom(room_idx);
	}

	@Override
	public List<RoomVO> readRoomList(int member_idx) {
		log.info("readRoomList..." + member_idx);
		return roomMapper.getRoomList(member_idx);
	}

	@Override
	public MessageVO registerMessage(MessageVO vo) {
		log.info("registerMessage..." + vo);
		// 메시지 저장
		messageMapper.insertMessage(vo);
        
        // 채팅방 마지막 메시지 업데이트
		roomMapper.updateLastMessage(vo.getRoom_idx(), vo.getMessage_idx());
        
        return vo;
	}

	@Override
	public List<MessageVO> readMessageList(int room_idx) {
		log.info("readMessageList..." + room_idx);
		return messageMapper.getMessageList(room_idx);
	}

	@Override
	public List<MessageVO> readMessageListPaging(int room_idx, int page, int size) {
		log.info("readMessageListPaging..." + room_idx + ", " + page + ", " + size);
		int offset = page * size;
		return messageMapper.getMessageListPaging(room_idx, offset, size);
	}

	@Override
	public List<MessageVO> searchMessage(int room_idx, String keyword) {
		log.info("searchMessage..." + room_idx + ", " + keyword);
		return messageMapper.searchMessage(room_idx, keyword);
	}

	@Override
	public int readMark(int message_idx, int member_idx) {
		log.info("readMark..." + message_idx + ", " + member_idx);
		return messageMapper.readMark(message_idx, member_idx);
	}

	@Override
	public int unreadCount(int room_idx, int member_idx) {
		log.info("unreadCount..." + room_idx + ", " + member_idx);
		return messageMapper.unreadCount(room_idx, member_idx);
	}

	@Override
	public Map<String, Object> uploadFile(MultipartFile file, int message_idx) throws Exception {
		log.info("uploadFile..." + file + ", " + message_idx);
		// Cloudinary 업로드 설정
        Map<String, Object> uploadParams = ObjectUtils.asMap(
            "resource_type", "image",
            "folder", "pt-chat-images",
            "public_id", "chat_" + System.currentTimeMillis(),
            "overwrite", false,
            "quality", "auto:good"
        );
        
        // Cloudinary에 업로드
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
        
        // 첨부파일 정보 저장
        ChatAttachVO vo = new ChatAttachVO();
        vo.setMessage_idx(message_idx);
        vo.setOriginal_filename(file.getOriginalFilename());
        vo.setCloudinary_url((String) uploadResult.get("secure_url"));
        vo.setCloudinary_public_id((String) uploadResult.get("public_id"));
        vo.setFile_size_bytes(file.getSize());
        vo.setMime_type(file.getContentType());
        
        // 파일 확장자 추출
        String filename = file.getOriginalFilename();
        if (filename != null && filename.contains(".")) {
            String extension = filename.substring(filename.lastIndexOf("."));
            vo.setFile_extension(extension);
        }
        
        attachMapper.insertAttach(vo);
        
        return ObjectUtils.asMap(
            "attachIdx", vo.getAttach_idx(),
            "originalFilename", vo.getOriginal_filename(),
            "cloudinaryUrl", vo.getCloudinary_url(),
            "fileSize", vo.getFile_size_bytes()
        );
	}

	@Override
	public List<ChatAttachVO> readAttachList(int message_idx) {
		log.info("readAttachList..." + message_idx);
		return attachMapper.getAttachList(message_idx);
	}

}
