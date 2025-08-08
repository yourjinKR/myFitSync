package org.fitsync.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.fitsync.domain.ChatAttachVO;
import org.fitsync.domain.MatchingVO;
import org.fitsync.domain.MemberVO;
import org.fitsync.domain.MessageVO;
import org.fitsync.domain.RoomVO;
import org.fitsync.service.ChatService;
import org.fitsync.service.LessonService;
import org.fitsync.service.MatchingService;
import org.fitsync.service.MemberService;
import org.fitsync.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
    private MemberService memberService;
    
    @Autowired
    private ReportService reportService;
    
    @Autowired
    private MatchingService matchingService;
    
    @Autowired
    private LessonService lessonService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    // 채팅용 member_idx 조회 API (세션스토리지 전용)
    @GetMapping("/member-info")
    public ResponseEntity<Map<String, Object>> getChatMemberInfo(HttpSession session) {
        Integer member_idx = (Integer) session.getAttribute("member_idx");
        
        
        if (member_idx != null) {
            if(session.getAttribute("block_date") != null) {
            	 Date block_date = (Date) session.getAttribute("block_date");
            	return ResponseEntity.ok(Map.of(
        			"success", true,
        			"member_idx", member_idx,
        			"block_date", block_date
    			));
            }else {
            	return ResponseEntity.ok(Map.of(
	    			"success", true,
	    			"member_idx", member_idx
    			));
            }
        } else {
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
        int trainer_idx = Integer.valueOf(request.get("trainer_idx").toString());
        String room_name = request.get("room_name").toString();
        RoomVO room = chatService.registerRoom(trainer_idx, user_idx, room_name);
        return ResponseEntity.ok(room);
    }
    
    // 사용자 채팅방 목록 조회 GET /api/chat/rooms
    @GetMapping("/rooms")
    public ResponseEntity<List<RoomVO>> readRoomList(HttpSession session) {
        int member_idx = (Integer) session.getAttribute("member_idx");
        List<RoomVO> rooms = chatService.readRoomList(member_idx);
        return ResponseEntity.ok(rooms);
    }
    
    // 채팅방 메시지 목록 조회 (페이징) GET /api/chat/room/{room_idx}/messages
    @GetMapping("/room/{room_idx}/messages")
    public ResponseEntity<List<MessageVO>> readMessageList(@PathVariable int room_idx, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size, HttpSession session) {
        
        int member_idx = (Integer) session.getAttribute("member_idx");
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
        List<MessageVO> messages = chatService.searchMessage(room_idx, keyword);
        return ResponseEntity.ok(messages);
    }
    
    // 읽지 않은 메시지 수 조회 GET /api/chat/room/{room_idx}/unread
    @GetMapping("/room/{room_idx}/unread")
    public ResponseEntity<Map<String, Integer>> unreadCount(@PathVariable int room_idx, HttpSession session) {
        
        int member_idx = (Integer) session.getAttribute("member_idx");
        int count = chatService.unreadCount(room_idx, member_idx);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }
    
    // 🔥 핵심 수정: 채팅파일 업로드 API - 실시간 첨부파일 알림 강화
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("message_idx") int message_idx, HttpSession session) {
        
        int member_idx = (Integer) session.getAttribute("member_idx");
        try {
            // 1. 파일 업로드
            ChatAttachVO attachment = chatService.uploadFile(file);
            
            // 2. 메시지와 첨부파일 연결
            chatService.linkAttachmentToMessage(message_idx, attachment.getAttach_idx());
            
            // 3. 🔥 핵심 수정: 메시지 정보 조회하여 채팅방 정보 획득
            MessageVO messageInfo = chatService.getMessage(message_idx);
            if (messageInfo != null && messageInfo.getRoom_idx() > 0) {
                // 4. 🔥 첨부파일 업로드 완료 실시간 알림 강화
                try {
                    Map<String, Object> uploadNotification = Map.of(
                        "type", "attachment_uploaded",
                        "message_idx", message_idx,
                        "room_idx", messageInfo.getRoom_idx(),
                        "cloudinary_url", attachment.getCloudinary_url(),
                        "original_filename", attachment.getOriginal_filename(),
                        "attach_idx", attachment.getAttach_idx(),
                        "file_size_bytes", attachment.getFile_size_bytes(),
                        "mime_type", attachment.getMime_type() != null ? attachment.getMime_type() : "image/jpeg",
                        "timestamp", System.currentTimeMillis()
                    );
                    
                    // 채팅방 첨부파일 전용 채널로 브로드캐스트
                    messagingTemplate.convertAndSend("/topic/room/" + messageInfo.getRoom_idx() + "/attachment", uploadNotification);
                    System.out.println("🔥 첨부파일 업로드 완료 알림 전송 강화: " + message_idx);
                    System.out.println("   - cloudinary_url: " + attachment.getCloudinary_url());
                    System.out.println("   - original_filename: " + attachment.getOriginal_filename());
                    System.out.println("   - attach_idx: " + attachment.getAttach_idx());
                    
                } catch (Exception e) {
                    // 브로드캐스트 실패는 파일 업로드 성공에 영향을 주지 않음
                    System.err.println("첨부파일 업로드 알림 전송 실패: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.err.println("메시지 정보 조회 실패 또는 room_idx 없음: message_idx=" + message_idx);
            }
            
            // 5. 응답 데이터 구성
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("attachIdx", attachment.getAttach_idx());
            result.put("originalFilename", attachment.getOriginal_filename());
            result.put("cloudinaryUrl", attachment.getCloudinary_url());
            result.put("fileSize", attachment.getFile_size_bytes());
            result.put("mimeType", attachment.getMime_type());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("파일 업로드 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "파일 업로드 실패: " + e.getMessage()));
        }
    }
    
    // 채팅파일 삭제 DELETE /api/chat/file/{attach_idx}
    @DeleteMapping("/file/{attach_idx}")
    public ResponseEntity<Map<String, Object>> deleteFile(@PathVariable int attach_idx, HttpSession session) {
        
        int member_idx = (Integer) session.getAttribute("member_idx");
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
            
            // 해당 회원이 이미 트레이너와 활성 매칭이 있는지 확인
            boolean userHasActiveMatching = matchingService.hasAnyActiveMatchingForUser(user_idx);
            if (userHasActiveMatching) {
                result.put("success", false);
                result.put("message", "해당 회원이 이미 진행 중인 PT가 있습니다.");
                return ResponseEntity.ok(result);
            }
            
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
            // 특정 매칭의 트레이너와 이미 완료된 매칭이 있는지 확인
            MatchingVO targetMatching = matchingService.getMatching(matching_idx);
            if (targetMatching == null || targetMatching.getUser_idx() != user_idx) {
                result.put("success", false);
                result.put("message", "매칭 정보가 올바르지 않습니다.");
                return ResponseEntity.ok(result);
            }
            
            // 모든 트레이너와의 진행중인 매칭이 있는지 확인
            boolean hasAnyActiveMatching = matchingService.hasAnyActiveMatchingForUser(user_idx);
            if (hasAnyActiveMatching) {
                result.put("success", false);
                result.put("message", "이미 진행중인 PT가 있어 새로운 매칭을 수락할 수 없습니다.");
                return ResponseEntity.ok(result);
            }
            
            // 매칭 수락 처리
            boolean accepted = matchingService.acceptMatching(matching_idx, user_idx);
            
            if (accepted) {
                result.put("success", true);
                result.put("message", "매칭이 성공적으로 수락되었습니다.");
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
    
    // 현재 회원의 모든 진행중인 매칭 확인 API
    @GetMapping("/check-current-user-active-matching")
    public ResponseEntity<Map<String, Object>> checkCurrentUserActiveMatching(HttpSession session) {
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            Integer member_idx = (Integer) session.getAttribute("member_idx");
            if (member_idx == null) {
                result.put("success", false);
                result.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(result);
            }
            // 현재 회원의 모든 진행중인 매칭 확인
            boolean hasAnyActiveMatching = matchingService.hasAnyActiveMatchingForUser(member_idx);
            
            result.put("success", true);
            result.put("hasAnyActiveMatching", hasAnyActiveMatching);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("매칭 상태 확인 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "매칭 상태 확인 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(result);
        }
    }
    
    // 특정 회원의 활성 매칭 상태 확인 API
    @GetMapping("/check-target-user-active-matching/{user_idx}")
    public ResponseEntity<Map<String, Object>> checkTargetUserActiveMatching(
            @PathVariable("user_idx") int user_idx,
            HttpSession session) {
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            Integer currentMemberIdx = (Integer) session.getAttribute("member_idx");
            if (currentMemberIdx == null) {
                result.put("success", false);
                result.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(result);
            }
            
            // 세션에서 member_type 가져오기
            Object memberTypeObj = session.getAttribute("member_type");
            String memberType = memberTypeObj != null ? memberTypeObj.toString() : null;
            
            // member_type이 null이거나 빈 문자열인 경우 DB에서 조회
            if (memberType == null || memberType.trim().isEmpty()) {
                try {
                    // MemberService를 통해 현재 사용자 정보 조회
                    MemberVO currentMember = memberService.getMemberByIdx(currentMemberIdx);
                    if (currentMember != null && currentMember.getMember_type() != null) {
                        memberType = currentMember.getMember_type();
                        // 세션에 저장해서 다음에 사용
                        session.setAttribute("member_type", memberType);
                    } else {
                        memberType = null;
                    }
                } catch (Exception e) {
                    System.err.println("DB에서 member_type 조회 실패: " + e.getMessage());
                    memberType = null;
                }
            }
            
            // 트레이너가 아닌 경우 기본값 반환
            if (!"trainer".equals(memberType)) {
                result.put("success", true);
                result.put("hasActiveMatching", false);
                result.put("user_idx", user_idx);
                result.put("message", "트레이너만 다른 회원의 매칭 상태를 확인할 수 있습니다.");
                return ResponseEntity.ok(result);
            }
            
            // 특정 회원의 모든 활성 매칭 확인 (트레이너만 가능)
            boolean hasActiveMatching = matchingService.hasAnyActiveMatchingForUser(user_idx);
            
            result.put("success", true);
            result.put("hasActiveMatching", hasActiveMatching);
            result.put("user_idx", user_idx);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("특정 회원 활성 매칭 확인 중 오류 발생: " + e.getMessage());
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
            
            // 매칭 정보 조회
            MatchingVO matching = matchingService.getMatching(matching_idx);
            
            if (matching != null) {
                // 권한 확인 (해당 매칭의 트레이너나 회원만 조회 가능)
                if (matching.getTrainer_idx() == member_idx || matching.getUser_idx() == member_idx) {
                    result.put("success", true);
                    result.put("matching", matching);
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
    
    // 복합 할인 매칭 가격 계산 API
    @GetMapping("/matching/price/{matching_total}")
    public ResponseEntity<Map<String, Object>> calculateMatchingPrice(
            @PathVariable int matching_total,
            HttpSession session) {
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            Integer member_idx = (Integer) session.getAttribute("member_idx");
            if (member_idx == null) {
                result.put("success", false);
                result.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(401).body(result);
            }
            
            // 복합 할인 가격 계산
            int calculatedPrice = lessonService.calculateMatchingPrice(member_idx, matching_total);
            
            result.put("success", true);
            result.put("price", calculatedPrice);
            result.put("matching_total", matching_total);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("복합 할인 가격 계산 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "가격 계산 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(result);
        }
    }
    
}