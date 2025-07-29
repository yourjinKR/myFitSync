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
    
    private final Set<String> processedMessages = ConcurrentHashMap.newKeySet();
    
    @MessageMapping("/chat.send")
    public synchronized void sendMessage(@Payload Map<String, Object> message, SimpMessageHeaderAccessor headerAccessor) {
        try {
            
            // 기본 데이터 추출
            Integer sender_idx = extractIntegerFromMessage(message, "sender_idx");
            Integer receiver_idx = extractIntegerFromMessage(message, "receiver_idx");
            Integer room_idx = extractIntegerFromMessage(message, "room_idx");
            String message_content = extractStringFromMessage(message, "message_content");
            String message_type = extractStringFromMessage(message, "message_type");
            String unique_id = extractStringFromMessage(message, "unique_id");
            Integer parent_idx = extractIntegerFromMessage(message, "parent_idx");
            
            // 매칭 데이터 추출 및 검증
            Map<String, Object> matching_data = null;
            if ("matching_request".equals(message_type)) {
                matching_data = (Map<String, Object>) message.get("matching_data");
                
                // 매칭 데이터 유효성 검증
                if (matching_data != null && !matching_data.isEmpty()) {
                    // 필수 필드 확인
                    Object matchingIdx = matching_data.get("matching_idx");
                    Object trainerIdx = matching_data.get("trainer_idx");
                    Object userIdx = matching_data.get("user_idx");
                    Object matchingTotal = matching_data.get("matching_total");
                    
                    if (matchingIdx == null || trainerIdx == null || userIdx == null || matchingTotal == null) {
                        System.err.println("매칭 데이터 필수 필드 누락");
                        matching_data = null;
                    } else {
                        System.out.println("매칭 데이터 유효성 검증 통과");
                    }
                } else {
                    System.err.println("매칭 데이터가 없거나 비어있음");
                }
            }
            
            // 기본값 설정
            if (message_type == null || message_type.trim().isEmpty()) {
                message_type = "text";
            }
            
            // 필수 값 검증
            if (sender_idx == null || receiver_idx == null || room_idx == null || 
                message_content == null || message_content.trim().isEmpty()) {
                System.err.println("필수 메시지 데이터 누락");
                return;
            }
            
            // 중복 메시지 검사
            if (unique_id != null && !unique_id.trim().isEmpty()) {
                if (processedMessages.contains(unique_id)) {
                    return;
                }
                
                processedMessages.add(unique_id);
                
                if (processedMessages.size() > 1000) {
                    processedMessages.clear();
                    processedMessages.add(unique_id);
                }
            }
            
            // MessageVO 객체 생성 - 매칭 데이터 지원
            MessageVO vo = new MessageVO();
            vo.setRoom_idx(room_idx);
            vo.setSender_idx(sender_idx);
            vo.setReceiver_idx(receiver_idx);
            vo.setMessage_content(message_content.trim());
            vo.setMessage_type(message_type);
            vo.setParent_idx(parent_idx);
            vo.setAttach_idx(null);
            
            // 매칭 데이터 설정 (Map 형태로)
            if (matching_data != null && !matching_data.isEmpty()) {
                vo.setMatching_data_map(matching_data);
            }
            
            // 메시지 저장
            MessageVO savedMessage = null;
            try {
                savedMessage = chatService.registerMessage(vo);
                if (savedMessage == null) {
                    System.err.println("메시지 저장 실패: savedMessage가 null");
                    savedMessage = vo;
                    if (savedMessage.getMessage_idx() == 0) {
                        savedMessage.setMessage_idx(-1);
                    }
                } else {
                    System.out.println("메시지 저장 성공 - message_idx: " + savedMessage.getMessage_idx());
                    
                    // 저장된 매칭 데이터 확인
                    if (savedMessage.hasMatchingData()) {
                        System.out.println("저장된 매칭 데이터 확인:");
                        System.out.println("   매칭 IDX: " + savedMessage.getMatchingIdx());
                        System.out.println("   매칭 총 횟수: " + savedMessage.getMatchingTotal());
                        System.out.println("   매칭 완료 상태: " + savedMessage.getMatchingComplete());
                    }
                }
            } catch (Exception e) {
                System.err.println("메시지 저장 중 예외 발생: " + e.getMessage());
                e.printStackTrace();
                savedMessage = vo;
                savedMessage.setMessage_idx(-1);
            }
            
            // 브로드캐스트
            if (savedMessage != null) {
                try {
                    savedMessage.setMessage_senddate(new java.sql.Timestamp(System.currentTimeMillis()));
                    
                    // 매칭 데이터도 브로드캐스트에 포함 (Map 형태로)
                    if (savedMessage.hasMatchingData()) {
                        Map<String, Object> matchingDataMap = savedMessage.getMatchingDataAsMap();
                        savedMessage.setMatching_data_map(matchingDataMap);
                        System.out.println("브로드캐스트용 매칭 데이터 설정: " + matchingDataMap);
                    }
                    
                    System.out.println("메시지 브로드캐스트 시작: " + savedMessage.getMessage_idx());
                    messagingTemplate.convertAndSend("/topic/room/" + room_idx, savedMessage);
                    System.out.println("메시지 브로드캐스트 완료 (매칭 데이터 포함)");
                    
                } catch (Exception e) {
                    System.err.println("메시지 브로드캐스트 실패: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
        } catch (Exception e) {
            System.err.println("메시지 처리 전체 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // 새로운 매칭 상태 브로드캐스트 메서드 추가
    @MessageMapping("/matching.status")
    public void broadcastMatchingStatus(@Payload Map<String, Object> statusData) {
        try {
            
            Integer trainer_idx = extractIntegerFromMessage(statusData, "trainer_idx");
            Integer user_idx = extractIntegerFromMessage(statusData, "user_idx");
            String status_type = extractStringFromMessage(statusData, "status_type"); // "accepted", "rejected"
            Integer matching_idx = extractIntegerFromMessage(statusData, "matching_idx");
            
            if (trainer_idx == null || user_idx == null || status_type == null) {
                System.err.println("매칭 상태 브로드캐스트 필수 데이터 누락");
                return;
            }
            
            // 매칭 상태 변경 알림 데이터 구성
            Map<String, Object> matchingStatusUpdate = Map.of(
                "type", "matching_status_changed",
                "trainer_idx", trainer_idx,
                "user_idx", user_idx,
                "status_type", status_type,
                "matching_idx", matching_idx != null ? matching_idx : -1,
                "timestamp", System.currentTimeMillis()
            );
            
            // 트레이너에게 알림 - 트레이너 전용 구독 채널
            messagingTemplate.convertAndSend("/topic/trainer/" + trainer_idx + "/matching", matchingStatusUpdate);
            
            // 해당 트레이너와 진행 중인 모든 채팅방에 알림
            messagingTemplate.convertAndSend("/topic/trainer/" + trainer_idx + "/rooms/matching", matchingStatusUpdate);
            
        } catch (Exception e) {
            System.err.println("매칭 상태 브로드캐스트 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    @MessageMapping("/chat.read")
    public void markAsRead(@Payload Map<String, Object> readData) {
        try {
            System.out.println("읽음 처리 수신 데이터: " + readData);
            
            Integer receiver_idx = extractIntegerFromMessage(readData, "receiver_idx");
            Integer message_idx = extractIntegerFromMessage(readData, "message_idx");
            Integer room_idx = extractIntegerFromMessage(readData, "room_idx");
            
            if (receiver_idx == null || message_idx == null || room_idx == null) {
                System.err.println("읽음 처리 데이터 누락");
                return;
            }
            
            int result = 0;
            try {
                result = chatService.readMark(message_idx, receiver_idx);
            } catch (Exception e) {
                System.err.println("읽음 처리 실패: " + e.getMessage());
                e.printStackTrace();
                return;
            }
            
            if (result > 0) {
                
                try {
                    String readTopic = "/topic/room/" + room_idx + "/read";
                    Map<String, Object> readNotification = Map.of(
                        "message_idx", message_idx, 
                        "receiver_idx", receiver_idx,
                        "read_time", System.currentTimeMillis()
                    );
                    
                    messagingTemplate.convertAndSend(readTopic, readNotification);
                    System.out.println("읽음 확인 브로드캐스트 완료");
                } catch (Exception e) {
                    System.err.println("읽음 확인 브로드캐스트 실패: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("읽음 처리 결과 없음 - message_idx: " + message_idx);
            }
            
        } catch (Exception e) {
            System.err.println("읽음 처리 전체 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    @MessageMapping("/chat.delete")
    public void handleMessageDelete(@Payload Map<String, Object> deleteData, SimpMessageHeaderAccessor headerAccessor) {
        try {
            
            Integer messageIdx = extractIntegerFromMessage(deleteData, "message_idx");
            Integer roomIdx = extractIntegerFromMessage(deleteData, "room_idx");
            Integer deletedBy = extractIntegerFromMessage(deleteData, "deleted_by");
            
            if (messageIdx == null || roomIdx == null || deletedBy == null) {
                System.err.println("삭제 알림 데이터 누락");
                return;
            }
            
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
                System.out.println("삭제 알림 브로드캐스트 완료");
                
            } catch (Exception e) {
                System.err.println("삭제 알림 브로드캐스트 실패: " + e.getMessage());
                e.printStackTrace();
            }
            
        } catch (Exception e) {
            System.err.println("메시지 삭제 알림 처리 전체 실패: " + e.getMessage());
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
                System.err.println(key + " 예상치 못한 타입: " + value.getClass().getName());
                return null;
            }
        } catch (NumberFormatException e) {
            System.err.println(key + " 숫자 변환 실패: " + value);
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
            System.err.println(key + " 문자열 변환 실패: " + value);
            return null;
        }
    }
}