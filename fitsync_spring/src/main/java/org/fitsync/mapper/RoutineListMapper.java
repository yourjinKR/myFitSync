package org.fitsync.mapper;

import java.util.List;

import org.fitsync.domain.RoutineListVO;

public interface RoutineListMapper {
	// 루틴 리스트
	public List<RoutineListVO> getRoutineList(int member_idx);
	// 루틴 idx
	public int getIdx(int member_idx);
	// 루틴 등록
	public int insert(RoutineListVO vo);
}
