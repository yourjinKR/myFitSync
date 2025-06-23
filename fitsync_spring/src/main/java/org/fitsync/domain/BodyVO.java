package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BodyVO {
	private int body_idx, member_idx;
	private Double body_height, body_weight, body_skeletal_muscle, body_fat, body_fat_percentage, body_bmi;
	private Date body_regdate;
}