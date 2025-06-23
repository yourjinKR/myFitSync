package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageVO {
	private int message_idx, room_idx, sender_idx, receiver_idx, parent_idx, message_order;
	private String message_content, message_type, message_delete;
	private Timestamp message_senddate, message_deleverdate, message_readdate, message_editdate;
}