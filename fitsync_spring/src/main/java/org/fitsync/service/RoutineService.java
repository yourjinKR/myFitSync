package org.fitsync.service;

import java.util.List;
import java.util.Map;

import org.fitsync.domain.RoutineListVO;
import org.fitsync.domain.RoutineMemberDTO;

public interface RoutineService {
	// MY 루틴
	public List<RoutineListVO> getRoutineList(int member_idx);
	// 루틴 불러오기
	public RoutineListVO getRoutine(RoutineMemberDTO rmdto);
	// 루틴 추가
	public boolean insertRoutine(Map<String, Object> body, int member_idx);
	// 루틴 삭제
	public boolean deleteRoutine(RoutineMemberDTO rmdto);
	// 루틴 운동 기록
	public boolean updateRoutine(Map<String, Object> body, int member_idx);
}
