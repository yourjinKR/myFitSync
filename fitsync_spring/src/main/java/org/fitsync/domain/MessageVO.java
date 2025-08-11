package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageVO {
	private int message_idx, room_idx, sender_idx, receiver_idx;
	private Integer attach_idx, parent_idx;
	private String message_content, message_type, message_delete;
	private Timestamp message_senddate, message_readdate, message_editdate;
	// DB 저장용 JSON 문자열
	private String matching_data;
	// WebSocket 전송용 Map
	private Map<String, Object> matching_data_map;
	// Jackson ObjectMapper (JSON 변환용)
	private static final ObjectMapper objectMapper = new ObjectMapper();
	
	public MessageVO(int room_idx, int sender_idx, int receiver_idx, String message_content) {
        this();
        this.room_idx = room_idx;
        this.sender_idx = sender_idx;
        this.receiver_idx = receiver_idx;
        this.message_content = message_content;
        this.attach_idx = null;
        this.parent_idx = null;
    }
	
	// 매칭 데이터 Map을 JSON 문자열로 변환하여 DB 저장
	public void setMatchingDataFromMap(Map<String, Object> matchingDataMap) {
		this.matching_data_map = matchingDataMap;
		
		if (matchingDataMap != null && !matchingDataMap.isEmpty()) {
			try {
				this.matching_data = objectMapper.writeValueAsString(matchingDataMap);
			} catch (JsonProcessingException e) {
				this.matching_data = null;
			}
		} else {
			this.matching_data = null;
		}
	}
	
	// DB에서 조회한 JSON 문자열을 Map으로 변환
	public Map<String, Object> getMatchingDataAsMap() {
		if (matching_data_map != null) {
			return matching_data_map;
		}
		
		if (matching_data != null && !matching_data.trim().isEmpty()) {
			try {
				this.matching_data_map = objectMapper.readValue(
					matching_data, 
					new TypeReference<Map<String, Object>>() {}
				);
				return this.matching_data_map;
			} catch (JsonProcessingException e) {
				return null;
			}
		}
		
		return null;
	}
	
	// 매칭 데이터 존재 여부 확인
	public boolean hasMatchingData() {
		return (matching_data != null && !matching_data.trim().isEmpty()) || 
			   (matching_data_map != null && !matching_data_map.isEmpty());
	}
	
	// 특정 매칭 데이터 필드 추출
	public Object getMatchingField(String fieldName) {
		Map<String, Object> matchingMap = getMatchingDataAsMap();
		return matchingMap != null ? matchingMap.get(fieldName) : null;
	}
	
	// 매칭 IDX 추출 (자주 사용되는 필드)
	public Integer getMatchingIdx() {
		Object value = getMatchingField("matching_idx");
		if (value instanceof Number) {
			return ((Number) value).intValue();
		}
		return null;
	}
	
	// 매칭 총 횟수 추출
	public Integer getMatchingTotal() {
		Object value = getMatchingField("matching_total");
		if (value instanceof Number) {
			return ((Number) value).intValue();
		}
		return null;
	}
	
	// 매칭 완료 상태 추출
	public Integer getMatchingComplete() {
		Object value = getMatchingField("matching_complete");
		if (value instanceof Number) {
			return ((Number) value).intValue();
		}
		return null;
	}
	
	public ChatAttachVO attach;
}