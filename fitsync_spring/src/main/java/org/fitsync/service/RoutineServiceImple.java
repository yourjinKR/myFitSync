package org.fitsync.service;

import java.util.List;
import java.util.Map;

import org.fitsync.domain.RoutineListVO;
import org.fitsync.domain.RoutineSetVO;
import org.fitsync.domain.RoutineVO;
import org.fitsync.mapper.RoutineListMapper;
import org.fitsync.mapper.RoutineMapper;
import org.fitsync.mapper.RoutineSetMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class RoutineServiceImple implements RoutineService {

	@Autowired
	private RoutineListMapper rlmapper;
	@Autowired
	private RoutineMapper rmapper;
	@Autowired
	private RoutineSetMapper rsmapper;
	
	
	
	// 루틴 리스트
	@Override
	public List<RoutineListVO> getRoutineList(int member_idx) {
		List<RoutineListVO> list = null; 
		list = rlmapper.getRoutineList(member_idx);
		return list;
	}
	
	// 루틴 등록
	@Override
	@Transactional(rollbackFor = { Exception.class, Throwable.class })
	public boolean insertRoutine(Map<String, Object> body, int member_idx) {
	    int result = 0;
	    try {
	        // RoutineListVO 등록
	        RoutineListVO rlvo = new RoutineListVO();
	        rlvo.setRoutine_name((String) body.get("routine_name"));
	        rlvo.setWriter_idx(member_idx);
	        rlvo.setMember_idx(body.get("member_idx") != null && body.get("member_idx") != "" ? (int) body.get("member_idx") : member_idx);
	        result += rlmapper.insert(rlvo);
	        
	        int routine_list_idx = rlmapper.getIdx(member_idx);

	        if (result != 1) {
	            throw new RuntimeException("RoutineList insert failed");
	        }

	        List<Map<String, Object>> list = (List<Map<String, Object>>) body.get("list");
	        int routineResult = 0;
	        for (Map<String, Object> data : list) {
	            // RoutineVO 등록
	            RoutineVO rvo = new RoutineVO();
	            rvo.setPt_idx((int) data.get("pt_idx"));
	            rvo.setRoutine_list_idx(routine_list_idx);
	            rvo.setRoutine_memo(!data.get("routine_memo").equals("") ? (String) data.get("routine_memo") : "");
	            
	            routineResult += rmapper.insert(rvo); // 루틴 운동 등록
	            int routine_idx = rmapper.getIdx(routine_list_idx);

	            List<Map<String, Object>> sets = (List<Map<String, Object>>) data.get("routineSet");

	            if (sets.size() > 0) {
	                RoutineSetVO rsvo = new RoutineSetVO();
	                int setResult = 0;
	                for (int i = 0; i < sets.size(); i++) {
	                    Map<String, Object> set = sets.get(i);
	                    rsvo.setRoutine_idx(routine_idx);
	                    rsvo.setSet_num((i + 1));
	                    rsvo.setSet_volume(set.get("set_volume") != "" ? (int) set.get("set_volume") : 0);
	                    rsvo.setSet_count(set.get("set_count") != "" ? (int) set.get("set_count") : 0);

	                    setResult += rsmapper.insert(rsvo); // 세트 등록
	                }

	                // 세트 등록 실패 시 롤백
	                if (setResult != sets.size()) {
	                    throw new RuntimeException("Set insert failed for routine_idx: " + routine_idx);
	                }
	            }
	        }

	        // 루틴 등록 실패 시 롤백
	        if (routineResult != list.size()) {
	            throw new RuntimeException("Routine insert failed for some routines");
	        }

	    } catch (Exception e) {
	        throw e; // 예외를 다시 던져 트랜잭션 롤백을 강제
	    }
	    return result == 3;
	}
}