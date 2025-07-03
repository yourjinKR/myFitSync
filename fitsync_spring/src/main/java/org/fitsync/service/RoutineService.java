package org.fitsync.service;

import java.util.List;
import java.util.Map;

import org.fitsync.domain.RoutineListVO;
import org.fitsync.domain.RoutineMemberDTO;

public interface RoutineService {
	public List<RoutineListVO> getRoutineList(int member_idx);
	
	public RoutineListVO getRoutine(RoutineMemberDTO rmdto);
	
	public boolean insertRoutine(Map<String, Object> body, int member_idx);
	
	public boolean deleteRoutine(RoutineMemberDTO rmdto);
}
