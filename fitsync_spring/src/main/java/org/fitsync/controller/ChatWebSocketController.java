package org.fitsync.controller;

import java.util.Map;

import org.fitsync.domain.MessageVO;
import org.fitsync.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

// WebSocket을 통한 실시간 채팅 기능을 처리하는 컨트롤러
// STOMP 프로토콜을 사용하여 실시간 메시지 송수신 및 읽음 처리 담당
@Controller
public class ChatWebSocketController {

	@Autowired
    private ChatService chatService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate; // WebSocket을 통해 메시지를 전송하는 템플릿
    
    // 클라이언트에서 /app/chat.send로 메시지를 보내면 이 메서드가 처리하고 다른 참여자들에게 브로드캐스트
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Map<String, Object> message, SimpMessageHeaderAccessor headerAccessor) {
    	// 프론트엔드에서 전송한 sender_idx 직접 사용
        Integer sender_idx = extractIntegerFromMessage(message, "sender_idx");
        Integer receiver_idx = extractIntegerFromMessage(message, "receiver_idx");
        Integer room_idx = extractIntegerFromMessage(message, "room_idx");
        String message_content = (String) message.get("message_content");
        String message_type = message.containsKey("message_type") ? 
            (String) message.get("message_type") : "text";
        
        // 필수 값 검증
        if (sender_idx == null || receiver_idx == null || room_idx == null || message_content == null) {
            System.err.println("❌ 필수 메시지 데이터 누락:");
            System.err.println("   sender_idx: " + sender_idx);
            System.err.println("   receiver_idx: " + receiver_idx);
            System.err.println("   room_idx: " + room_idx);
            System.err.println("   message_content: " + message_content);
            return;
        }
    	
        // 메시지 객체 생성
        MessageVO vo = new MessageVO();
        vo.setRoom_idx(room_idx);
        vo.setSender_idx(sender_idx);
        vo.setReceiver_idx(receiver_idx);
        vo.setMessage_content(message_content);
        vo.setMessage_type(message_type);
        
        // 메시지 타입이 있는 경우 설정 (text, image, file)
        if (message.containsKey("message_type")) {
            vo.setMessage_type(message.get("message_type").toString());
        }
        
        // 메시지 저장
        MessageVO savedMessage = chatService.registerMessage(vo);
        
        // 수신자에게 메시지 전송
        // 해당 채팅방을 구독하고 있는 모든 클라이언트에게 메시지 브로드캐스트
        // /topic/room/{room_idx}를 구독하고 있는 클라이언트들이 메시지를 받음
        messagingTemplate.convertAndSend("/topic/room/" + vo.getRoom_idx(), savedMessage);
    }
    
    // 클라이언트에서 /app/chat.read로 읽음 정보를 보내면 이 메서드가 처리
    @MessageMapping("/chat.read")
    public void markAsRead(@Payload Map<String, Object> readData) {
    	// 프론트엔드에서 전송한 receiver_idx 직접 사용
        Integer receiver_idx = extractIntegerFromMessage(readData, "receiver_idx");
        Integer message_idx = extractIntegerFromMessage(readData, "message_idx");
        Integer room_idx = extractIntegerFromMessage(readData, "room_idx");
        
        // 필수 값 검증
        if (receiver_idx == null || message_idx == null || room_idx == null) {
            System.err.println("❌ 읽음 처리 데이터 누락:");
            System.err.println("   receiver_idx: " + receiver_idx);
            System.err.println("   message_idx: " + message_idx);
            System.err.println("   room_idx: " + room_idx);
            return;
        }
        
        // 읽음 처리
        chatService.readMark(message_idx, receiver_idx);
        
        // 읽음 확인 전송
        String readTopic = "/topic/room/" + room_idx + "/read";
        Map<String, Object> readNotification = Map.of(
            "message_idx", message_idx, 
            "receiver_idx", receiver_idx
        );
        
        messagingTemplate.convertAndSend(readTopic, readNotification);
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