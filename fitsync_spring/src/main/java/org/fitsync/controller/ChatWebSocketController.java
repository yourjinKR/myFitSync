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

@Controller
public class ChatWebSocketController {

    @Autowired
    private ChatService chatService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    // 중복 메시지 방지를 위한 처리된 메시지 ID 저장소
    private final Set<String> processedMessages = ConcurrentHashMap.newKeySet();
    
    @MessageMapping("/chat.send")
    public synchronized void sendMessage(@Payload Map<String, Object> message, SimpMessageHeaderAccessor headerAccessor) {
        try {
            System.out.println("🔍 수신된 메시지 데이터: " + message);
            
            // 안전한 타입 변환 및 null 체크
            Integer sender_idx = extractIntegerFromMessage(message, "sender_idx");
            Integer receiver_idx = extractIntegerFromMessage(message, "receiver_idx");
            Integer room_idx = extractIntegerFromMessage(message, "room_idx");
            String message_content = extractStringFromMessage(message, "message_content");
            String message_type = extractStringFromMessage(message, "message_type");
            String unique_id = extractStringFromMessage(message, "unique_id");
            
            // parent_idx는 null일 수 있음 (답장이 아닌 경우)
            Integer parent_idx = extractIntegerFromMessage(message, "parent_idx");
            
            // 기본값 설정
            if (message_type == null || message_type.trim().isEmpty()) {
                message_type = "text";
            }
            
            System.out.println("🔍 파싱된 데이터:");
            System.out.println("   sender_idx: " + sender_idx);
            System.out.println("   receiver_idx: " + receiver_idx);
            System.out.println("   room_idx: " + room_idx);
            System.out.println("   message_content: " + message_content);
            System.out.println("   message_type: " + message_type);
            System.out.println("   parent_idx: " + parent_idx);
            System.out.println("   unique_id: " + unique_id);
            
            // 필수 값 검증
            if (sender_idx == null || receiver_idx == null || room_idx == null || 
                message_content == null || message_content.trim().isEmpty()) {
                System.err.println("❌ 필수 메시지 데이터 누락 또는 잘못된 형식");
                return;
            }
            
            // 중복 메시지 검사
            if (unique_id != null && !unique_id.trim().isEmpty()) {
                if (processedMessages.contains(unique_id)) {
                    System.out.println("중복 메시지 감지 및 차단 - unique_id: " + unique_id);
                    return;
                }
                
                processedMessages.add(unique_id);
                
                // 메모리 누수 방지
                if (processedMessages.size() > 1000) {
                    processedMessages.clear();
                    processedMessages.add(unique_id);
                    System.out.println("🧹 처리된 메시지 캐시 정리 완료");
                }
            }
            
            System.out.println("✅ 메시지 처리 시작 - unique_id: " + unique_id + ", content: " + message_content);
            
            // MessageVO 객체 생성 (null 안전)
            MessageVO vo = new MessageVO();
            vo.setRoom_idx(room_idx);
            vo.setSender_idx(sender_idx);
            vo.setReceiver_idx(receiver_idx);
            vo.setMessage_content(message_content.trim());
            vo.setMessage_type(message_type);
            vo.setParent_idx(parent_idx); // null일 수 있음
            vo.setAttach_idx(null); // 기본값
            
            // 메시지 저장
            MessageVO savedMessage = null;
            try {
                savedMessage = chatService.registerMessage(vo);
                if (savedMessage == null) {
                    System.err.println("❌ 메시지 저장 실패: savedMessage가 null");
                    // null인 경우에도 브로드캐스트를 위해 원본 vo 사용
                    savedMessage = vo;
                    // message_idx가 없는 경우 임시로 설정
                    if (savedMessage.getMessage_idx() == 0) {
                        savedMessage.setMessage_idx(-1); // 임시 ID
                    }
                }
                System.out.println("✅ 메시지 저장 처리 - message_idx: " + savedMessage.getMessage_idx());
            } catch (Exception e) {
                System.err.println("❌ 메시지 저장 중 예외 발생: " + e.getMessage());
                e.printStackTrace();
                // 예외 발생 시에도 브로드캐스트 시도
                savedMessage = vo;
                savedMessage.setMessage_idx(-1); // 임시 ID
            }
            
            // 브로드캐스트 - null이 아닌 경우에만
            if (savedMessage != null) {
                try {
                    // 현재 시간으로 설정
                    savedMessage.setMessage_senddate(new java.sql.Timestamp(System.currentTimeMillis()));
                    
                    System.out.println("📡 메시지 브로드캐스트 시작: " + savedMessage.getMessage_idx());
                    messagingTemplate.convertAndSend("/topic/room/" + room_idx, savedMessage);
                    System.out.println("✅ 메시지 브로드캐스트 완료");
                    
                } catch (Exception e) {
                    System.err.println("❌ 메시지 브로드캐스트 실패: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
        } catch (Exception e) {
            System.err.println("❌ 메시지 처리 전체 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    @MessageMapping("/chat.read")
    public void markAsRead(@Payload Map<String, Object> readData) {
        try {
            System.out.println("🔍 읽음 처리 수신 데이터: " + readData);
            
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
            
            System.out.println("📖 읽음 처리 시작 - message_idx: " + message_idx + ", receiver_idx: " + receiver_idx);
            
            // 읽음 처리
            int result = 0;
            try {
                result = chatService.readMark(message_idx, receiver_idx);
            } catch (Exception e) {
                System.err.println("❌ 읽음 처리 실패: " + e.getMessage());
                e.printStackTrace();
                return;
            }
            
            if (result > 0) {
                System.out.println("✅ 읽음 처리 완료 - message_idx: " + message_idx);
                
                try {
                    String readTopic = "/topic/room/" + room_idx + "/read";
                    Map<String, Object> readNotification = Map.of(
                        "message_idx", message_idx, 
                        "receiver_idx", receiver_idx,
                        "read_time", System.currentTimeMillis()
                    );
                    
                    messagingTemplate.convertAndSend(readTopic, readNotification);
                    System.out.println("✅ 읽음 확인 브로드캐스트 완료");
                } catch (Exception e) {
                    System.err.println("❌ 읽음 확인 브로드캐스트 실패: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("⚠️ 읽음 처리 결과 없음 - message_idx: " + message_idx);
            }
            
        } catch (Exception e) {
            System.err.println("❌ 읽음 처리 전체 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    @MessageMapping("/chat.delete")
    public void handleMessageDelete(@Payload Map<String, Object> deleteData, SimpMessageHeaderAccessor headerAccessor) {
        try {
            System.out.println("🗑️ 메시지 삭제 알림 수신: " + deleteData);
            
            // 안전한 타입 변환
            Integer messageIdx = extractIntegerFromMessage(deleteData, "message_idx");
            Integer roomIdx = extractIntegerFromMessage(deleteData, "room_idx");
            Integer deletedBy = extractIntegerFromMessage(deleteData, "deleted_by");
            String type = extractStringFromMessage(deleteData, "type");
            
            // 필수 값 검증
            if (messageIdx == null || roomIdx == null || deletedBy == null) {
                System.err.println("❌ 삭제 알림 데이터 누락:");
                System.err.println("   message_idx: " + messageIdx);
                System.err.println("   room_idx: " + roomIdx);
                System.err.println("   deleted_by: " + deletedBy);
                return;
            }
            
            System.out.println("🗑️ 삭제 알림 처리 시작 - message_idx: " + messageIdx + ", room_idx: " + roomIdx + ", deleted_by: " + deletedBy);
            
            // 삭제 알림을 채팅방의 모든 참여자에게 브로드캐스트
            try {
                String deleteTopic = "/topic/room/" + roomIdx + "/delete";
                Map<String, Object> deleteNotification = Map.of(
                    "type", "message_deleted",
                    "message_idx", messageIdx,
                    "room_idx", roomIdx,
                    "deleted_by", deletedBy,
                    "timestamp", System.currentTimeMillis()
                );
                
                messagingTemplate.convertAndSend(deleteTopic, deleteNotification);
                System.out.println("✅ 삭제 알림 브로드캐스트 완료 - topic: " + deleteTopic);
                
            } catch (Exception e) {
                System.err.println("❌ 삭제 알림 브로드캐스트 실패: " + e.getMessage());
                e.printStackTrace();
            }
            
        } catch (Exception e) {
            System.err.println("❌ 메시지 삭제 알림 처리 전체 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // 안전한 Integer 추출
    private Integer extractIntegerFromMessage(Map<String, Object> message, String key) {
        Object value = message.get(key);
        if (value == null) {
            return null;
        }
        
        try {
            if (value instanceof Integer) {
                return (Integer) value;
            } else if (value instanceof String) {
                String strValue = ((String) value).trim();
                if (strValue.isEmpty()) {
                    return null;
                }
                return Integer.valueOf(strValue);
            } else if (value instanceof Number) {
                return ((Number) value).intValue();
            } else {
                System.err.println("⚠️ " + key + " 예상치 못한 타입: " + value.getClass().getName() + ", 값: " + value);
                return null;
            }
        } catch (NumberFormatException e) {
            System.err.println("❌ " + key + " 숫자 변환 실패: " + value + " - " + e.getMessage());
            return null;
        }
    }
    
    // 안전한 String 추출
    private String extractStringFromMessage(Map<String, Object> message, String key) {
        Object value = message.get(key);
        if (value == null) {
            return null;
        }
        
        try {
            return value.toString();
        } catch (Exception e) {
            System.err.println("❌ " + key + " 문자열 변환 실패: " + value + " - " + e.getMessage());
            return null;
        }
    }
}