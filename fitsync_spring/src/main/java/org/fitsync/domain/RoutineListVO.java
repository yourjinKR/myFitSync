package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoutineListVO {
	private int routine_list_idx, member_idx, writer_idx;
	private String routine_name;
}