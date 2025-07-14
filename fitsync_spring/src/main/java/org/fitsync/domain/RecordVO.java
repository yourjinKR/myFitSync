package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecordVO {
	private int record_idx, member_idx, pt_idx, routine_list_idx;
	private Timestamp record_date;
	private String routine_name, routine_memo;
}