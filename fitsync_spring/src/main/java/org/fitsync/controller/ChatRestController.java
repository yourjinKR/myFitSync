package org.fitsync.controller;

import java.util.List;
import java.util.Map;

import org.fitsync.domain.ChatAttachVO;
import org.fitsync.domain.MessageVO;
import org.fitsync.domain.RoomVO;
import org.fitsync.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/chat")// 모든 요청 경로가 /api/chat으로 시작
@CrossOrigin(origins = "*")	// 모든 도메인에서의 CORS 요청 허용
public class ChatRestController {

	@Autowired
    private ChatService chatService;
	
	// 채팅방 생성 또는 조회 POST /api/chat/room
    @PostMapping("/room")
    public ResponseEntity<RoomVO> registerRoom(@RequestBody Map<String, Object> request) {
    	
        int trainer_idx = Integer.valueOf(request.get("trainer_idx").toString());
        int user_idx = Integer.valueOf(request.get("user_idx").toString());
        String room_name = request.get("room_name").toString();
        
        RoomVO room = chatService.registerRoom(trainer_idx, user_idx, room_name);
        return ResponseEntity.ok(room);
    }
    
    // 사용자 채팅방 목록 조회 GET /api/chat/rooms/{member_idx}
    @GetMapping("/rooms/{member_idx}")
    public ResponseEntity<List<RoomVO>> readRoomList(@PathVariable int member_idx) {
    	
        List<RoomVO> rooms = chatService.readRoomList(member_idx);
        return ResponseEntity.ok(rooms);
    }
    
    // 채팅방 메시지 목록 조회 (페이징) GET /api/chat/room/{room_idx}/messages
    @GetMapping("/room/{room_idx}/messages")
    public ResponseEntity<List<MessageVO>> readMessageList(@PathVariable int room_idx, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        
        List<MessageVO> messages;
        // 기본값인 경우 전체 메시지 조회, 그렇지 않으면 페이징 처리
        if (page == 0 && size == 50) {
            messages = chatService.readMessageList(room_idx);
        } else {
            messages = chatService.readMessageListPaging(room_idx, page, size);
        }
        
        return ResponseEntity.ok(messages);
    }
    
    // 메시지 검색 GET /api/chat/room/{room_idx}/search
    @GetMapping("/room/{room_idx}/search")
    public ResponseEntity<List<MessageVO>> searchMessage(@PathVariable int room_idx, @RequestParam String keyword) {
        
        List<MessageVO> messages = chatService.searchMessage(room_idx, keyword);
        return ResponseEntity.ok(messages);
    }
    
    // 읽지 않은 메시지 수 조회 GET /api/chat/room/{room_idx}/unread/{receiver_idx}
    @GetMapping("/room/{room_idx}/unread/{receiver_idx}")
    public ResponseEntity<Map<String, Integer>> unreadCount(@PathVariable int room_idx, @PathVariable int receiver_idx) {
        
        int count = chatService.unreadCount(room_idx, receiver_idx);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }
    
    // 채팅파일 업로드 POST /api/chat/upload
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("message_idx") int message_idx) {
        
        try {
            Map<String, Object> result = chatService.uploadFile(file, message_idx);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "파일 업로드 실패: " + e.getMessage()));
        }
    }
    
    // 채팅파일 삭제 DELETE /api/chat/file/{attach_idx}
    @DeleteMapping("/file/{attach_idx}")
    public ResponseEntity<Map<String, Object>> deleteFile(@PathVariable int attach_idx) {
        
        try {
            boolean isDeleted = chatService.deleteFile(attach_idx);
            
            if (isDeleted) {
                return ResponseEntity.ok(Map.of("success", true, "message", "첨부파일이 성공적으로 삭제되었습니다."));
            } else {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "첨부파일 삭제에 실패했습니다."));
            }
        } catch (Exception e) {
            // 삭제 실패 시 오류 메시지 반환
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "첨부파일 삭제 실패: " + e.getMessage()));
        }
    }
    
    // 메시지 첨부파일 조회 GET /api/chat/message/{message_idx}/files
    @GetMapping("/message/{message_idx}/files")
    public ResponseEntity<List<ChatAttachVO>> readFile(@PathVariable int message_idx) {
        List<ChatAttachVO> attachments = chatService.readFile(message_idx);
        return ResponseEntity.ok(attachments);
    }
	
}