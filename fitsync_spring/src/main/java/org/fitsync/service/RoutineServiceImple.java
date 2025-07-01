package org.fitsync.service;

import java.util.Map;

import org.fitsync.domain.RoutineListVO;
import org.fitsync.domain.RoutineVO;
import org.fitsync.mapper.RoutineMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class RoutineServiceImple implements RoutineService {

	@Autowired
	private RoutineMapper mapper;
	
	@Override
	public boolean insertRoutine(Map<String, Object> body, int member_idx) {
		RoutineListVO rvo = new RoutineListVO();
		rvo.setRoutine_name((String) body.get("routine_name"));
		rvo.setMember_idx(member_idx);
		rvo.setWriter_idx((int) body.get("writer_idx"));
		
		

		System.out.println(body);
		return false;
	}
}