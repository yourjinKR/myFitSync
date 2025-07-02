package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import oracle.sql.DATE;

import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemberVO {
	private int member_idx, member_price, gym_idx;
	private String member_email, member_name, member_num, member_image, member_status, member_day, member_type, member_purpose, member_time, member_disease, member_activity_area, member_info, member_info_image;
	private DATE member_birth;
}