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
        
        // 메시지 객체 생성
        MessageVO vo = new MessageVO();
        vo.setRoom_idx(Integer.valueOf(message.get("room_idx").toString()));
        vo.setSender_idx(Integer.valueOf(message.get("sender_idx").toString()));
        vo.setReceiver_idx(Integer.valueOf(message.get("receiver_idx").toString()));
        vo.setMessage_content(message.get("message_content").toString());
        
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
        int message_idx = Integer.valueOf(readData.get("message_idx").toString());
        int receiver_idx = Integer.valueOf(readData.get("receiver_idx").toString());
        
        // 읽음 처리
        chatService.readMark(message_idx, receiver_idx);
        
        // 읽음 확인 전송
        MessageVO message = chatService.readMessageList(
            Integer.valueOf(readData.get("room_idx").toString())
        ).stream()
         .filter(m -> m.getMessage_idx()==message_idx) // 해당 메시지 ID와 일치하는 메시지 찾기
         .findFirst()
         .orElse(null); // 찾지 못하면 null 반환
        
        // 메시지가 존재하는 경우에만 읽음 확인을 다른 클라이언트들에게 전송
        if (message != null) {
        	// /topic/room/{room_idx}/read를 구독하고 있는 클라이언트들에게 읽음 확인 정보 전송
            // 다른 사용자들이 메시지가 읽혔음을 알 수 있도록 함
            messagingTemplate.convertAndSend("/topic/room/" + message.getRoom_idx() + "/read", Map.of("message_idx", message_idx, "receiver_idx", receiver_idx));
        }
    }
	
}