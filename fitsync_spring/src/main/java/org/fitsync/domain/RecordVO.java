package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecordVO {
	private int record_idx, member_idx;
	private Timestamp record_date;
	private String routine_title, pt_name, routinept_memo;
}