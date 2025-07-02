package org.fitsync.mapper;

import org.fitsync.domain.RoutineVO;

public interface RoutineMapper {
	// 루틴 운동 idx 
	public int getIdx(int routine_list_idx);
	// 루틴 운동 등록
	public int insert(RoutineVO vo);
}
