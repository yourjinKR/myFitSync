package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageVO {
	private int message_idx, room_idx, sender_idx, receiver_idx;
	private Integer attach_idx, parent_idx;
	private String message_content, message_type, message_delete;
	private Timestamp message_senddate, message_readdate, message_editdate;
	private Map<String, Object> matching_data; // WebSocket 전송용
	
	public MessageVO(int room_idx, int sender_idx, int receiver_idx, String message_content) {
        this();
        this.room_idx = room_idx;
        this.sender_idx = sender_idx;
        this.receiver_idx = receiver_idx;
        this.message_content = message_content;
        this.attach_idx = null;
        this.parent_idx = null;
    }
	
	public ChatAttachVO attach;
}