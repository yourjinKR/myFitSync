package org.fitsync.service;

import java.util.List;
import java.util.Map;

import org.fitsync.domain.RoutineListVO;

public interface RoutineService {
	public List<RoutineListVO> getRoutineList(int member_idx);
	
	public boolean insertRoutine(Map<String, Object> body, int member_idx);
}
