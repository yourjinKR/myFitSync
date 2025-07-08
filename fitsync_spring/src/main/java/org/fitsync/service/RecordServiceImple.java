package org.fitsync.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.fitsync.domain.RecordSetVO;
import org.fitsync.domain.RecordVO;
import org.fitsync.mapper.RecordMapper;
import org.fitsync.mapper.RecordSetMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class RecordServiceImple implements RecordService {

	@Autowired
	private RecordMapper mapper;
	@Autowired
	private RecordSetMapper setmapper;
	
	@Override
	@Transactional
	public boolean insertRecord(Map<String, Object> body, int member_idx) {
		try {
			List<Map<String, Object>> routines = (List<Map<String, Object>>) body.get("routines");
			
			for (Map<String, Object> routine : routines) {
				RecordVO vo = new RecordVO();
				vo.setMember_idx(member_idx);

				// pt_idx 변환
				Object ptIdxObj = routine.get("pt_idx");
				int ptIdx = 0;
				if (ptIdxObj != null) ptIdx = Integer.parseInt(ptIdxObj.toString());
				vo.setPt_idx(ptIdx);

				// routine_memo 변환
				Object setMemo = routine.get("routine_memo");
				vo.setRoutine_memo(setMemo != null ? setMemo.toString() : "");

				// routine_name 변환 (routine에서 가져옴)
				Object setRoutineName = routine.get("routine_name");
				vo.setRoutine_name(setRoutineName != null ? setRoutineName.toString() : "");

				// Record 삽입
				int recordResult = mapper.insertRecord(vo);
				if (recordResult != 1) {
					return false;
				}
				int recordIdx = vo.getRecord_idx(); // insert 후 PK 획득

				// Set 삽입
				List<Map<String, Object>> sets = (List<Map<String, Object>>) routine.get("sets");
				int idx = 1;
				for (Map<String, Object> set : sets) {
					RecordSetVO setvo = new RecordSetVO();
					setvo.setSet_num(idx++);

					Object volumeObj = set.get("set_volume");
					int volume = (volumeObj != null && !volumeObj.toString().trim().isEmpty()) ? Integer.parseInt(volumeObj.toString()) : 0;
					setvo.setSet_volume(volume);

					Object countObj = set.get("set_count");
					int count = (countObj != null && !countObj.toString().trim().isEmpty()) ? Integer.parseInt(countObj.toString()) : 0;
					setvo.setSet_count(count);

					setvo.setRecord_idx(recordIdx); // ★ record_idx 할당

					Map<String, Object> map = new HashMap<>();
					map.put("vo", setvo);
					map.put("member_idx", member_idx);

					int setResult = setmapper.insertSetRecord(map);
					if (setResult != 1) {
						return false;
					}
				}
			}
			
			return true; // 모든 루틴 처리 성공
			
		} catch (Exception e) {
			log.error("insertRecord 실행 중 오류 발생", e);
			return false;
		}
	}
	
}