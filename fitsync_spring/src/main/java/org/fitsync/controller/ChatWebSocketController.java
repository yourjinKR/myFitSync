package org.fitsync.controller;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.fitsync.domain.MessageVO;
import org.fitsync.domain.ReportVO;
import org.fitsync.service.ChatService;
import org.fitsync.service.ReportServiceImple;
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
    private ReportServiceImple reportService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    // 중복 메시지 처리 방지를 위한 Set (메모리 기반)
    private final Set<String> processedMessages = ConcurrentHashMap.newKeySet();
    
    //실시간 메시지 전송 처리
    @MessageMapping("/chat.send")
    public synchronized void sendMessage(@Payload Map<String, Object> message, SimpMessageHeaderAccessor headerAccessor) {
        try {
            // 기본 메시지 데이터 추출 및 검증
            Integer sender_idx = extractIntegerFromMessage(message, "sender_idx");
            Integer receiver_idx = extractIntegerFromMessage(message, "receiver_idx");
            Integer room_idx = extractIntegerFromMessage(message, "room_idx");
            String message_content = extractStringFromMessage(message, "message_content");
            String message_type = extractStringFromMessage(message, "message_type");
            String unique_id = extractStringFromMessage(message, "unique_id");
            Integer parent_idx = extractIntegerFromMessage(message, "parent_idx");
            
            // 필수 값 검증
            if (sender_idx == null || receiver_idx == null || room_idx == null || 
                message_content == null || message_content.trim().isEmpty()) {
                return;
            }
            
            // 차단된 사용자의 메시지 전송 차단 처리
            try {
                ReportVO reportVO = reportService.getBlockData(sender_idx);
                if (reportVO != null && reportVO.getReport_time() != null) {
                    java.util.Date currentTime = new java.util.Date();
                    java.util.Date blockTime = reportVO.getReport_time();
                    
                    // 현재 시간이 차단 해제 시간보다 이전이면 (아직 차단 중이면) 메시지 차단
                    if (currentTime.before(blockTime)) {
                        // 차단 알림을 보낸 사용자에게만 전송
                        Map<String, Object> blockNotification = Map.of(
                            "type", "blocked_user",
                            "message", "현재 차단된 상태입니다. 차단 해제 시간: " + blockTime,
                            "block_until", blockTime.toString(),
                            "timestamp", System.currentTimeMillis()
                        );
                        
                        // 차단된 사용자에게만 개별 알림 전송
                        messagingTemplate.convertAndSendToUser(
                            sender_idx.toString(), 
                            "/queue/notification", 
                            blockNotification
                        );
                        
                        return; // 메시지 처리 중단
                    }
                }
            } catch (Exception e) {
                // 차단 상태 확인 실패 시에도 메시지 처리 계속 진행
            }
            
            // 매칭 요청 메시지인 경우 매칭 데이터 추출 및 검증
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
                        matching_data = null; // 필수 필드 누락 시 매칭 데이터 무효화
                    }
                } else {
                    matching_data = null;
                }
            }
            
            // 메시지 타입 기본값 설정
            if (message_type == null || message_type.trim().isEmpty()) {
                message_type = "text";
            }
            
            // 중복 메시지 검사 및 처리
            if (unique_id != null && !unique_id.trim().isEmpty()) {
                if (processedMessages.contains(unique_id)) {
                    return; // 이미 처리된 메시지면 중단
                }
                
                processedMessages.add(unique_id);
                
                // 메모리 관리: 1000개 초과 시 초기화
                if (processedMessages.size() > 1000) {
                    processedMessages.clear();
                    processedMessages.add(unique_id);
                }
            }
            
            // MessageVO 객체 생성 및 설정
            MessageVO vo = new MessageVO();
            vo.setRoom_idx(room_idx);
            vo.setSender_idx(sender_idx);
            vo.setReceiver_idx(receiver_idx);
            vo.setMessage_content(message_content.trim());
            vo.setMessage_type(message_type);
            vo.setParent_idx(parent_idx);
            vo.setAttach_idx(null); // 첨부파일은 별도 처리
            
            // 매칭 데이터 설정 (Map 형태로 저장)
            if (matching_data != null && !matching_data.isEmpty()) {
                vo.setMatching_data_map(matching_data);
            }
            
            // 메시지 DB 저장
            MessageVO savedMessage = null;
            try {
                savedMessage = chatService.registerMessage(vo);
                if (savedMessage == null) {
                    // 저장 실패 시 원본 객체 사용
                    savedMessage = vo;
                    if (savedMessage.getMessage_idx() == 0) {
                        savedMessage.setMessage_idx(-1); // 실패 표시
                    }
                }
            } catch (Exception e) {
                // 예외 발생 시 원본 객체 사용
                savedMessage = vo;
                savedMessage.setMessage_idx(-1);
            }
            
            // 이미지 메시지 특별 처리: attach_idx 없이도 즉시 브로드캐스트
            if ("image".equals(message_type) && savedMessage != null && savedMessage.getMessage_idx() > 0) {
                handleImageMessageBroadcast(savedMessage, room_idx);
                return;
            }
            
            // 일반 메시지 브로드캐스트
            if (savedMessage != null) {
                try {
                    savedMessage.setMessage_senddate(new java.sql.Timestamp(System.currentTimeMillis()));
                    
                    // 매칭 데이터도 브로드캐스트에 포함 (Map 형태로)
                    if (savedMessage.hasMatchingData()) {
                        Map<String, Object> matchingDataMap = savedMessage.getMatchingDataAsMap();
                        savedMessage.setMatching_data_map(matchingDataMap);
                    }
                    
                    // 채팅방 구독자들에게 실시간 브로드캐스트
                    messagingTemplate.convertAndSend("/topic/room/" + room_idx, savedMessage);
                    
                } catch (Exception e) {
                    // 브로드캐스트 실패는 로그만 남기고 계속 진행
                }
            }
            
        } catch (Exception e) {
            // 전체 메시지 처리 실패 시에도 예외를 던지지 않음
        }
    }
    
    //이미지 메시지 특별 처리 메서드
    private void handleImageMessageBroadcast(MessageVO savedMessage, Integer room_idx) {
        try {
            savedMessage.setMessage_senddate(new java.sql.Timestamp(System.currentTimeMillis()));
            
            // attach_idx가 없어도 즉시 브로드캐스트 (첨부파일 정보는 별도 업데이트)
            messagingTemplate.convertAndSend("/topic/room/" + room_idx, savedMessage);
            
        } catch (Exception e) {
            // 이미지 메시지 브로드캐스트 실패 로그
        }
    }
    
    //매칭 상태 변경 브로드캐스트
    @MessageMapping("/matching.status")
    public void broadcastMatchingStatus(@Payload Map<String, Object> statusData) {
        try {
            Integer trainer_idx = extractIntegerFromMessage(statusData, "trainer_idx");
            Integer user_idx = extractIntegerFromMessage(statusData, "user_idx");
            String status_type = extractStringFromMessage(statusData, "status_type"); // "accepted", "rejected"
            Integer matching_idx = extractIntegerFromMessage(statusData, "matching_idx");
            
            if (trainer_idx == null || user_idx == null || status_type == null) {
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
            
            // 트레이너에게 개별 알림 전송
            messagingTemplate.convertAndSend("/topic/trainer/" + trainer_idx + "/matching", matchingStatusUpdate);
            
            // 해당 트레이너와 진행 중인 모든 채팅방에 알림 전송
            messagingTemplate.convertAndSend("/topic/trainer/" + trainer_idx + "/rooms/matching", matchingStatusUpdate);
            
        } catch (Exception e) {
            // 매칭 상태 브로드캐스트 실패
        }
    }
    
    //메시지 읽음 처리
    @MessageMapping("/chat.read")
    public void markAsRead(@Payload Map<String, Object> readData) {
        try {
            Integer receiver_idx = extractIntegerFromMessage(readData, "receiver_idx");
            Integer message_idx = extractIntegerFromMessage(readData, "message_idx");
            Integer room_idx = extractIntegerFromMessage(readData, "room_idx");
            
            if (receiver_idx == null || message_idx == null || room_idx == null) {
                return;
            }
            
            // DB에서 읽음 상태 업데이트
            int result = 0;
            try {
                result = chatService.readMark(message_idx, receiver_idx);
            } catch (Exception e) {
                return;
            }
            
            // 읽음 처리 성공 시 상대방에게 읽음 확인 알림 전송
            if (result > 0) {
                try {
                    String readTopic = "/topic/room/" + room_idx + "/read";
                    Map<String, Object> readNotification = Map.of(
                        "message_idx", message_idx, 
                        "receiver_idx", receiver_idx,
                        "read_time", System.currentTimeMillis()
                    );
                    
                    // 채팅방 읽음 전용 채널로 브로드캐스트
                    messagingTemplate.convertAndSend(readTopic, readNotification);
                } catch (Exception e) {
                    // 읽음 확인 브로드캐스트 실패
                }
            }
            
        } catch (Exception e) {
            // 읽음 처리 전체 실패
        }
    }
    
    //메시지 삭제 알림 처리
    @MessageMapping("/chat.delete")
    public void handleMessageDelete(@Payload Map<String, Object> deleteData, SimpMessageHeaderAccessor headerAccessor) {
        try {
            Integer messageIdx = extractIntegerFromMessage(deleteData, "message_idx");
            Integer roomIdx = extractIntegerFromMessage(deleteData, "room_idx");
            Integer deletedBy = extractIntegerFromMessage(deleteData, "deleted_by");
            
            if (messageIdx == null || roomIdx == null || deletedBy == null) {
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
                
                // 채팅방 삭제 전용 채널로 브로드캐스트
                messagingTemplate.convertAndSend(deleteTopic, deleteNotification);
                
            } catch (Exception e) {
                // 삭제 알림 브로드캐스트 실패
            }
            
        } catch (Exception e) {
            // 메시지 삭제 알림 처리 전체 실패
        }
    }
    
    //메시지에서 안전하게 Integer 값을 추출하는 유틸리티 메서드
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
                return null;
            }
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    //메시지에서 안전하게 String 값을 추출하는 유틸리티 메서드
    private String extractStringFromMessage(Map<String, Object> message, String key) {
        Object value = message.get(key);
        if (value == null) {
            return null;
        }
        
        try {
            return value.toString();
        } catch (Exception e) {
            return null;
        }
    }
}