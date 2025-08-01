package org.fitsync.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

// WebSocket 및 STOMP 메시징을 위한 설정 클래스
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
	
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
    	// 메시지 브로커를 등록하고 목적지 prefix를 설정
        // /topic: 일대다 브로드캐스트 메시지용 (채팅방의 모든 사용자에게 메시지 전송)
        // /queue: 일대일 개인 메시지용 (특정 사용자에게만 메시지 전송)
        config.enableSimpleBroker("/topic", "/queue");
        // 클라이언트에서 서버로 메시지를 보낼 때 도착 경로에 대한 prefix
        // 클라이언트가 /app/chat.send로 메시지를 보내면 @MessageMapping("/chat.send")가 처리
        // 실제 구독 경로와 구분하기 위해 /app prefix 사용
        config.setApplicationDestinationPrefixes("/app");
        // 특정 사용자에게 개인 메시지를 보낼 때 사용할 prefix 설정
        // /user/{userId}/queue/messages 형태로 개인 메시지 전송 가능
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // socket 연결을 위한 STOMP 엔드포인트 설정
        registry.addEndpoint("/chat")	// 클라이언트가 ws://localhost:7070/chat으로 연결
		        .setAllowedOrigins("*")
        		.withSockJS();			// SockJS 지원 활성화 (WebSocket을 지원하지 않는 브라우저를 위한 폴백)
        /*
         * 1. 메시지 브로커 구조:
         *    - /topic/room/{room_idx}: 채팅방 내 모든 사용자에게 메시지 브로드캐스트
         *    - /topic/room/{room_idx}/read: 채팅방 내 읽음 확인 브로드캐스트
         *    - /queue/user/{member_idx}: 특정 사용자에게 개인 메시지 전송
         * 
         * 2. 클라이언트 메시지 전송:
         *    - /app/chat.send: 채팅 메시지 전송
         *    - /app/chat.read: 메시지 읽음 처리
         * 
         * 3. 연결 플로우:
         *    클라이언트 → ws://localhost:7070/chat 연결 → STOMP 프로토콜 사용 → 구독: /topic/room/1 → 메시지 전송: /app/chat.send
         */
    }
    
}