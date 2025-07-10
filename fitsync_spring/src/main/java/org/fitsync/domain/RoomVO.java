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
	
	// 상대방 이름 및 프로필 이미지 정보 추가
	private String trainer_name, user_name;
	private String trainer_image, user_image;
	
	public RoomVO(int trainer_idx, int user_idx, String room_name) {
		this.trainer_idx = trainer_idx;
        this.user_idx = user_idx;
        this.room_name = room_name;
        this.room_status = "active";
        this.room_regdate = new Timestamp(System.currentTimeMillis());
	}
}