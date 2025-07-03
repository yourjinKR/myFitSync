package org.fitsync.domain;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoutineVO {
	private int routine_idx, routine_list_idx, pt_idx;
	private String routine_memo;
	
    private List<RoutineSetVO> sets;
    
    private PtVO pt;
}