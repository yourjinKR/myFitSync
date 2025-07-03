package org.fitsync.mapper;

import java.util.List;

import org.fitsync.domain.RoutineListVO;
import org.fitsync.domain.RoutineMemberDTO;

public interface RoutineListMapper {
	// 루틴 리스트
	public List<RoutineListVO> getRoutineList(int member_idx);
	// 루틴 리스트
	public RoutineListVO getRoutine(RoutineMemberDTO rmdto);
	// 루틴 idx
	public int getIdx(int member_idx);
	// 루틴 등록
	public int insert(RoutineListVO vo);
	// 루틴 삭제
	public int deleteRoutine(RoutineMemberDTO rmdto);
}
