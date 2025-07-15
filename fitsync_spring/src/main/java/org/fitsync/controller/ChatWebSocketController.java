package org.fitsync.controller;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.fitsync.domain.MessageVO;
import org.fitsync.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

// WebSocket을 통한 실시간 채팅 기능을 처리하는 컨트롤러
@Controller
public class ChatWebSocketController {

	@Autowired
    private ChatService chatService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    // 중복 메시지 방지를 위한 처리된 메시지 ID 저장소
    private final Set<String> processedMessages = ConcurrentHashMap.newKeySet();
    
    // 클라이언트에서 /app/chat.send로 메시지를 보내면 이 메서드가 처리
    @MessageMapping("/chat.send")
    public synchronized void sendMessage(@Payload Map<String, Object> message, SimpMessageHeaderAccessor headerAccessor) {
        // 기본 정보 추출
        Integer sender_idx = extractIntegerFromMessage(message, "sender_idx");
        Integer receiver_idx = extractIntegerFromMessage(message, "receiver_idx");
        Integer room_idx = extractIntegerFromMessage(message, "room_idx");
        String message_content = (String) message.get("message_content");
        String message_type = message.containsKey("message_type") ? 
            (String) message.get("message_type") : "text";
        String unique_id = (String) message.get("unique_id");
        
        // 필수 값 검증
        if (sender_idx == null || receiver_idx == null || room_idx == null || message_content == null) {
            System.err.println("❌ 필수 메시지 데이터 누락:");
            System.err.println("   sender_idx: " + sender_idx);
            System.err.println("   receiver_idx: " + receiver_idx);
            System.err.println("   room_idx: " + room_idx);
            System.err.println("   message_content: " + message_content);
            return;
        }
        
        // 중복 메시지 검사 및 방지
        if (unique_id != null) {
            if (processedMessages.contains(unique_id)) {
                System.out.println("중복 메시지 감지 및 차단 - unique_id: " + unique_id);
                return; // 중복 메시지는 처리하지 않음
            }
            
            // 처리된 메시지로 등록
            processedMessages.add(unique_id);
            
            // 메모리 누수 방지: 1000개 이상이면 오래된 것부터 제거
            if (processedMessages.size() > 1000) {
                // ConcurrentHashMap.newKeySet()은 insertion order를 보장하지 않으므로
                // 간단하게 일정 개수 이상이면 전체 클리어
                processedMessages.clear();
                processedMessages.add(unique_id); // 현재 메시지는 다시 추가
                System.out.println("🧹 처리된 메시지 캐시 정리 완료");
            }
        }
        
        System.out.println("메시지 처리 시작 - unique_id: " + unique_id + ", content: " + message_content);
        
        // 메시지 객체 생성
        MessageVO vo = new MessageVO();
        vo.setRoom_idx(room_idx);
        vo.setSender_idx(sender_idx);
        vo.setReceiver_idx(receiver_idx);
        vo.setMessage_content(message_content);
        vo.setMessage_type(message_type);
        vo.setAttach_idx(null);
        
        // 메시지 저장
        MessageVO savedMessage = chatService.registerMessage(vo);
        
        System.out.println("✅ 메시지 저장 완료 - message_idx: " + savedMessage.getMessage_idx());
        
        // 저장된 메시지를 즉시 브로드캐스트 (완전한 정보 조회 없이)
        try {
            // 저장된 메시지에 추가 정보 설정
            savedMessage.setMessage_senddate(new java.sql.Timestamp(System.currentTimeMillis()));
            
            System.out.println("즉시 메시지 브로드캐스트: " + savedMessage.getMessage_idx());
            messagingTemplate.convertAndSend("/topic/room/" + room_idx, savedMessage);
            
        } catch (Exception e) {
            System.err.println("메시지 브로드캐스트 중 오류: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // 클라이언트에서 /app/chat.read로 읽음 정보를 보내면 이 메서드가 처리
    @MessageMapping("/chat.read")
    public void markAsRead(@Payload Map<String, Object> readData) {
        Integer receiver_idx = extractIntegerFromMessage(readData, "receiver_idx");
        Integer message_idx = extractIntegerFromMessage(readData, "message_idx");
        Integer room_idx = extractIntegerFromMessage(readData, "room_idx");
        
        // 필수 값 검증
        if (receiver_idx == null || message_idx == null || room_idx == null) {
            System.err.println("읽음 처리 데이터 누락:");
            System.err.println("   receiver_idx: " + receiver_idx);
            System.err.println("   message_idx: " + message_idx);
            System.err.println("   room_idx: " + room_idx);
            return;
        }
        
        System.out.println("읽음 처리 시작 - message_idx: " + message_idx + ", receiver_idx: " + receiver_idx);
        
        // 읽음 처리
        int result = chatService.readMark(message_idx, receiver_idx);
        
        if (result > 0) {
            System.out.println("읽음 처리 완료 - message_idx: " + message_idx);
            
            // 읽음 확인 즉시 전송
            String readTopic = "/topic/room/" + room_idx + "/read";
            Map<String, Object> readNotification = Map.of(
                "message_idx", message_idx, 
                "receiver_idx", receiver_idx,
                "read_time", System.currentTimeMillis() // 읽은 시간 추가
            );
            
            messagingTemplate.convertAndSend(readTopic, readNotification);
            System.out.println("읽음 확인 브로드캐스트 완료");
        } else {
            System.out.println("읽음 처리 실패 - message_idx: " + message_idx);
        }
    }
    
    // 메시지에서 Integer 값 안전하게 추출
    private Integer extractIntegerFromMessage(Map<String, Object> message, String key) {
        Object value = message.get(key);
        if (value == null) {
            return null;
        }
        
        try {
            if (value instanceof Integer) {
                return (Integer) value;
            } else if (value instanceof String) {
                return Integer.valueOf((String) value);
            } else if (value instanceof Number) {
                return ((Number) value).intValue();
            }
        } catch (NumberFormatException e) {
            System.err.println("❌ " + key + " 변환 실패: " + value);
        }
        
        return null;
    }
}