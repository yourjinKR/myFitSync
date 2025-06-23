package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomVO {
	private int room_idx, trainer_idx, user_idx, last_message;
	private Timestamp room_regdate, room_msgdate;
	private String room_status, room_name;
}