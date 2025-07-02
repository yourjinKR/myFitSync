package org.fitsync.mapper;

import org.fitsync.domain.RoutineListVO;

public interface RoutineListMapper {
	// 루틴 idx
	public int getIdx(int member_idx);
	// 루틴 등록
	public int insert(RoutineListVO vo);
}
