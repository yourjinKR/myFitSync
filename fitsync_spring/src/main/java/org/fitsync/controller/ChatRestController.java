package org.fitsync.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.fitsync.domain.ChatAttachVO;
import org.fitsync.domain.MatchingVO;
import org.fitsync.domain.MessageVO;
import org.fitsync.domain.RoomVO;
import org.fitsync.service.ChatService;
import org.fitsync.service.MatchingService;
import org.fitsync.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatRestController {

    @Autowired
    private ChatService chatService;
    
    @Autowired
    private ReportService reportService;
    
    @Autowired
    private MatchingService matchingService;
    
    // 채팅용 member_idx 조회 API (세션스토리지 전용)
    @GetMapping("/member-info")
    public ResponseEntity<Map<String, Object>> getChatMemberInfo(HttpSession session) {
        Integer member_idx = (Integer) session.getAttribute("member_idx");
        
        System.out.println("채팅용 member_idx 조회 요청 - 세션 member_idx: " + member_idx);
        
        if (member_idx != null) {
            System.out.println("member_idx 조회 성공: " + member_idx);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "member_idx", member_idx
            ));
        } else {
            System.out.println("세션에 member_idx 없음 - 로그인 필요");
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "로그인이 필요합니다."
            ));
        }
    }
    
    // 채팅방 생성 또는 조회 POST /api/chat/room
    @PostMapping("/room")
    public ResponseEntity<RoomVO> registerRoom(@RequestBody Map<String, Object> request, HttpSession session) {
        int user_idx = (Integer) session.getAttribute("member_idx");
        System.out.println("세션에서 가져온 member_idx: " + user_idx);
        
        int trainer_idx = Integer.valueOf(request.get("trainer_idx").toString());
        String room_name = request.get("room_name").toString();
        
        System.out.println("채팅방 생성 - trainer_idx: " + trainer_idx + ", user_idx: " + user_idx);
        
        RoomVO room = chatService.registerRoom(trainer_idx, user_idx, room_name);
        return ResponseEntity.ok(room);
    }
    
    // 사용자 채팅방 목록 조회 GET /api/chat/rooms
    @GetMapping("/rooms")
    public ResponseEntity<List<RoomVO>> readRoomList(HttpSession session) {
        int member_idx = (Integer) session.getAttribute("member_idx");
        System.out.println("채팅방 목록 조회 - member_idx: " + member_idx);
        
        List<RoomVO> rooms = chatService.readRoomList(member_idx);
        return ResponseEntity.ok(rooms);
    }
    
    // 채팅방 메시지 목록 조회 (페이징) GET /api/chat/room/{room_idx}/messages
    @GetMapping("/room/{room_idx}/messages")
    public ResponseEntity<List<MessageVO>> readMessageList(@PathVariable int room_idx, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size, HttpSession session) {
        
        int member_idx = (Integer) session.getAttribute("member_idx");
        System.out.println("메시지 목록 조회 - room_idx: " + room_idx + ", member_idx: " + member_idx);
        
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
    public ResponseEntity<List<MessageVO>> searchMessage(@PathVariable int room_idx, @RequestParam String keyword, HttpSession session) {
        
        int member_idx = (Integer) session.getAttribute("member_idx");
        System.out.println("메시지 검색 - room_idx: " + room_idx + ", keyword: " + keyword + ", member_idx: " + member_idx);
        
        List<MessageVO> messages = chatService.searchMessage(room_idx, keyword);
        return ResponseEntity.ok(messages);
    }
    
    // 읽지 않은 메시지 수 조회 GET /api/chat/room/{room_idx}/unread
    @GetMapping("/room/{room_idx}/unread")
    public ResponseEntity<Map<String, Integer>> unreadCount(@PathVariable int room_idx, HttpSession session) {
        
        int member_idx = (Integer) session.getAttribute("member_idx");
        System.out.println("읽지 않은 메시지 수 조회 - room_idx: " + room_idx + ", receiver_idx: " + member_idx);
        
        int count = chatService.unreadCount(room_idx, member_idx);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }
    
    // 채팅파일 업로드 POST /api/chat/upload
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("message_idx") int message_idx, HttpSession session) {
        
        int member_idx = (Integer) session.getAttribute("member_idx");
        try {
            // 1. 파일 업로드
            ChatAttachVO attachment = chatService.uploadFile(file);
            // 2. 메시지와 첨부파일 연결
            chatService.linkAttachmentToMessage(message_idx, attachment.getAttach_idx());
            // 3. 응답 데이터 구성
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("attachIdx", attachment.getAttach_idx());
            result.put("originalFilename", attachment.getOriginal_filename());
            result.put("cloudinaryUrl", attachment.getCloudinary_url());
            result.put("fileSize", attachment.getFile_size_bytes());
            result.put("mimeType", attachment.getMime_type());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "파일 업로드 실패: " + e.getMessage()));
        }
    }
    
    // 채팅파일 삭제 DELETE /api/chat/file/{attach_idx}
    @DeleteMapping("/file/{attach_idx}")
    public ResponseEntity<Map<String, Object>> deleteFile(@PathVariable int attach_idx, HttpSession session) {
        
        int member_idx = (Integer) session.getAttribute("member_idx");
        System.out.println("파일 삭제 - attach_idx: " + attach_idx + ", member_idx: " + member_idx);
        
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
    public ResponseEntity<ChatAttachVO> readFile(@PathVariable int message_idx, HttpSession session) {
        
        int member_idx = (Integer) session.getAttribute("member_idx");
        
        ChatAttachVO attachment = chatService.readFile(message_idx);
        
        if (attachment != null) {
            return ResponseEntity.ok(attachment);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // 메시지 삭제 API
    @DeleteMapping("/message/{message_idx}")
    public ResponseEntity<Map<String, Object>> deleteMessage(
            @PathVariable int message_idx, 
            HttpSession session) {
        
        Integer member_idx = (Integer) session.getAttribute("member_idx");
        Map<String, Object> result = new HashMap<>();
        
        if (member_idx == null) {
            result.put("success", false);
            result.put("message", "로그인이 필요합니다.");
            return ResponseEntity.status(401).body(result);
        }
        
        System.out.println("메시지 삭제 요청 - message_idx: " + message_idx + ", member_idx: " + member_idx);
        
        try {
            boolean deleteResult = chatService.deleteMessage(message_idx, member_idx);
            
            if (deleteResult) {
                result.put("success", true);
                result.put("message", "메시지가 삭제되었습니다.");
                return ResponseEntity.ok(result);
            } else {
                result.put("success", false);
                result.put("message", "메시지를 삭제할 수 없습니다. (시간 경과 또는 권한 없음)");
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            System.err.println("메시지 삭제 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "메시지 삭제 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(result);
        }
    }
    
    // 메시지 신고 API
    @PostMapping("/message/{message_idx}/report")
    public ResponseEntity<Map<String, Object>> reportMessage(
            @PathVariable int message_idx,
            @RequestBody Map<String, String> requestBody,
            HttpSession session) {
        
        Integer member_idx = (Integer) session.getAttribute("member_idx");
        Map<String, Object> result = new HashMap<>();
        
        if (member_idx == null) {
            result.put("success", false);
            result.put("message", "로그인이 필요합니다.");
            return ResponseEntity.status(401).body(result);
        }
        
        String reportContent = requestBody.get("reportContent");
        if (reportContent == null || reportContent.trim().isEmpty()) {
            result.put("success", false);
            result.put("message", "신고 사유를 입력해주세요.");
            return ResponseEntity.badRequest().body(result);
        }
        
        System.out.println("메시지 신고 요청 - message_idx: " + message_idx + 
                          ", member_idx: " + member_idx + 
                          ", reportContent: " + reportContent);
        
        try {
            boolean reportResult = reportService.reportMessage(message_idx, reportContent.trim(), member_idx);
            
            if (reportResult) {
                result.put("success", true);
                result.put("message", "신고가 접수되었습니다.");
                return ResponseEntity.ok(result);
            } else {
                result.put("success", false);
                result.put("message", "이미 신고한 메시지입니다.");
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            System.err.println("메시지 신고 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "신고 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(result);
        }
    }
    
    // 답장용 원본 메시지 조회 API
    @GetMapping("/message/{message_idx}/parent")
    public ResponseEntity<Map<String, Object>> getParentMessage(
            @PathVariable int message_idx,
            HttpSession session) {
        
        Integer member_idx = (Integer) session.getAttribute("member_idx");
        Map<String, Object> result = new HashMap<>();
        
        if (member_idx == null) {
            result.put("success", false);
            result.put("message", "로그인이 필요합니다.");
            return ResponseEntity.status(401).body(result);
        }
        
        try {
            MessageVO parentMessage = chatService.getParentMessage(message_idx);
            
            if (parentMessage != null) {
                result.put("success", true);
                result.put("parentMessage", parentMessage);
                return ResponseEntity.ok(result);
            } else {
                result.put("success", false);
                result.put("message", "원본 메시지를 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            System.err.println("원본 메시지 조회 중 오류 발생: " + e.getMessage());
            result.put("success", false);
            result.put("message", "원본 메시지 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(result);
        }
    }
    
    // 매칭 요청 생성 POST /api/chat/matching
    @PostMapping("/matching")
    public ResponseEntity<Map<String, Object>> createMatching(
            @RequestBody Map<String, Object> request, 
            HttpSession session) {
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            Integer trainer_idx = (Integer) session.getAttribute("member_idx");
            if (trainer_idx == null) {
                result.put("success", false);
                result.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(result);
            }
            
            Integer user_idx = Integer.valueOf(request.get("user_idx").toString());
            Integer matching_total = Integer.valueOf(request.get("matching_total").toString());
            
            System.out.println("매칭 생성 요청 - trainer_idx: " + trainer_idx + 
                              ", user_idx: " + user_idx + 
                              ", matching_total: " + matching_total);
            
            // 매칭 데이터 생성
            MatchingVO matching = new MatchingVO();
            matching.setTrainer_idx(trainer_idx);
            matching.setUser_idx(user_idx);
            matching.setMatching_total(matching_total);
            matching.setMatching_remain(matching_total); // 총 횟수와 동일하게 설정
            matching.setMatching_complete(0); // 미완료 상태
            
            // 매칭 생성
            MatchingVO createdMatching = matchingService.createMatching(matching);
            
            if (createdMatching != null) {
                result.put("success", true);
                result.put("matching", createdMatching);
                result.put("message", "매칭 요청이 생성되었습니다.");
                
                System.out.println("✅ 매칭 생성 완료 - matching_idx: " + createdMatching.getMatching_idx());
            } else {
                result.put("success", false);
                result.put("message", "매칭 생성에 실패했습니다.");
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("매칭 생성 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "매칭 생성 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(result);
        }
    }
    
    // 매칭 수락 (완료 처리) PUT /api/chat/accept/{matching_idx}
    @PutMapping("/accept/{matching_idx}")
    public ResponseEntity<Map<String, Object>> acceptMatching(
            @PathVariable int matching_idx, 
            HttpSession session) {
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            Integer user_idx = (Integer) session.getAttribute("member_idx");
            if (user_idx == null) {
                result.put("success", false);
                result.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(result);
            }
            
            System.out.println("매칭 수락 요청 - matching_idx: " + matching_idx + ", user_idx: " + user_idx);
            
            // 특정 매칭의 트레이너와 이미 완료된 매칭이 있는지 확인
            MatchingVO targetMatching = matchingService.getMatching(matching_idx);
            if (targetMatching == null || targetMatching.getUser_idx() != user_idx) {
                result.put("success", false);
                result.put("message", "매칭 정보가 올바르지 않습니다.");
                return ResponseEntity.ok(result);
            }
            
            // 해당 트레이너와 이미 완료된 매칭이 있는지 확인
            boolean hasCompletedMatchingWithTrainer = matchingService.hasCompletedMatchingBetween(targetMatching.getTrainer_idx(), user_idx);
            if (hasCompletedMatchingWithTrainer) {
                result.put("success", false);
                result.put("message", "해당 트레이너와 이미 완료된 매칭이 존재합니다.");
                return ResponseEntity.ok(result);
            }
            
            // 매칭 수락 처리
            boolean accepted = matchingService.acceptMatching(matching_idx, user_idx);
            
            if (accepted) {
                result.put("success", true);
                result.put("message", "매칭이 성공적으로 수락되었습니다.");
                System.out.println("✅ 매칭 수락 완료 - matching_idx: " + matching_idx);
            } else {
                result.put("success", false);
                result.put("message", "매칭 수락에 실패했습니다.");
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("매칭 수락 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "매칭 수락 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(result);
        }
    }
    
    // 특정 트레이너-회원간 완료된 매칭 존재 여부 확인 API
    @GetMapping("/check-completed/{trainer_idx}/{user_idx}")
    public ResponseEntity<Map<String, Object>> checkCompletedMatchingBetween(
            @PathVariable int trainer_idx,
            @PathVariable int user_idx,
            HttpSession session) {
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            System.out.println("특정 트레이너-회원간 완료된 매칭 확인 요청 - trainer_idx: " + trainer_idx + ", user_idx: " + user_idx);
            
            boolean hasCompleted = matchingService.hasCompletedMatchingBetween(trainer_idx, user_idx);
            
            result.put("success", true);
            result.put("hasCompletedMatching", hasCompleted);
            
            System.out.println("✅ 특정 매칭 확인 완료 - hasCompleted: " + hasCompleted);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("매칭 상태 확인 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "매칭 상태 확인 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(result);
        }
    }
    
    // 특정 매칭의 현재 상태 조회 API
    @GetMapping("/matching/{matching_idx}/status")
    public ResponseEntity<Map<String, Object>> getMatchingStatus(
            @PathVariable int matching_idx,
            HttpSession session) {
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            Integer member_idx = (Integer) session.getAttribute("member_idx");
            if (member_idx == null) {
                result.put("success", false);
                result.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(result);
            }
            
            System.out.println("매칭 상태 조회 요청 - matching_idx: " + matching_idx + ", member_idx: " + member_idx);
            
            // 매칭 정보 조회
            MatchingVO matching = matchingService.getMatching(matching_idx);
            
            if (matching != null) {
                // 권한 확인 (해당 매칭의 트레이너나 회원만 조회 가능)
                if (matching.getTrainer_idx() == member_idx || matching.getUser_idx() == member_idx) {
                    result.put("success", true);
                    result.put("matching", matching);
                    
                    System.out.println("매칭 상태 조회 성공:");
                    System.out.println("   매칭 IDX: " + matching.getMatching_idx());
                    System.out.println("   매칭 완료 상태: " + matching.getMatching_complete());
                    System.out.println("   매칭 남은 횟수: " + matching.getMatching_remain());
                    
                    return ResponseEntity.ok(result);
                } else {
                    result.put("success", false);
                    result.put("message", "해당 매칭에 대한 접근 권한이 없습니다.");
                    return ResponseEntity.status(403).body(result);
                }
            } else {
                result.put("success", false);
                result.put("message", "매칭 정보를 찾을 수 없습니다.");
                return ResponseEntity.status(404).body(result);
            }
            
        } catch (Exception e) {
            System.err.println("매칭 상태 조회 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "매칭 상태 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(result);
        }
    }
    
}