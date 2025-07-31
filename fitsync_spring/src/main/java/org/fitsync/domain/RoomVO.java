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
	
	// 상대방 이름(이메일) 및 프로필 타입 이미지 정보
	private String trainer_name, user_name;
	private String trainer_image, user_image;
	private String trainer_email, user_email;
	private String trainer_type, user_type;
	private String trainer_gender, user_gender;
	
	public RoomVO(int trainer_idx, int user_idx, String room_name) {
		this.trainer_idx = trainer_idx;
        this.user_idx = user_idx;
        this.room_name = room_name;
        this.room_status = "active";
        this.room_regdate = new Timestamp(System.currentTimeMillis());
	}
}