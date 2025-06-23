package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoutineVO {
	private int routine_idx, routine_list_idx, pt_idx;
	private String routine_memo;
}