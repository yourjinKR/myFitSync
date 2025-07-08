package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleVO {
	private int schedule_idx, trainer_idx, user_idx, schedule_check;
	private Date schedule_date, schedule_regdate;
	private String schedule_stime, schedule_etime, schedule_content, user_name;
}