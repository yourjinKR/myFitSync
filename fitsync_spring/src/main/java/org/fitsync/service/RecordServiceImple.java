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
				
				// pt_idx 안전한 변환
				Object ptIdxObj = routine.get("pt_idx");
				int ptIdx = 0;
				if (ptIdxObj instanceof Integer) {
					ptIdx = (Integer) ptIdxObj;
				} else if (ptIdxObj instanceof String) {
					ptIdx = Integer.parseInt((String) ptIdxObj);
				}
				vo.setPt_idx(ptIdx);
				
				Object setMemo = routine.get("routine_memo");
				vo.setRoutine_memo(setMemo != null && !setMemo.toString().trim().isEmpty() 
							? (String) setMemo : "");
				Object setRoutineName = body.get("routine_name");
				vo.setRoutine_name(setRoutineName != null && !setRoutineName.toString().trim().isEmpty() 
						? (String) setRoutineName : "");
				
				// Record 삽입
				int recordResult = mapper.insertRecord(vo);
				if (recordResult != 1) {
					return false; 
				}
				
				// Set 삽입
				List<Map<String, Object>> sets = (List<Map<String, Object>>) routine.get("sets");
				int setRecordResult = 0;
				int idx = 1;
				
				for (Map<String, Object> set : sets) {
					RecordSetVO setvo = new RecordSetVO();
					setvo.setSet_num(idx++);
					
					// set_volume 안전한 변환
					Object volumeObj = set.get("set_volume");
					int volume = 0;
					if (volumeObj != null && !volumeObj.toString().trim().isEmpty()) {
						if (volumeObj instanceof Integer) {
							volume = (Integer) volumeObj;
						} else if (volumeObj instanceof String) {
							try {
								volume = Integer.parseInt((String) volumeObj);
							} catch (NumberFormatException e) {
								volume = 0;
							}
						}
					}
					setvo.setSet_volume(volume);
					
					// set_count 안전한 변환
					Object countObj = set.get("set_count");
					int count = 0;
					if (countObj != null && !countObj.toString().trim().isEmpty()) {
						if (countObj instanceof Integer) {
							count = (Integer) countObj;
						} else if (countObj instanceof String) {
							try {
								count = Integer.parseInt((String) countObj);
							} catch (NumberFormatException e) {
								count = 0;
							}
						}
					}
					setvo.setSet_count(count);
					
					Map<String, Object> map = new HashMap<>();
					map.put("vo", setvo);
					map.put("member_idx", member_idx);
					
					setRecordResult += setmapper.insertSetRecord(map);
				}
				
				// 모든 set이 정상 삽입되었는지 확인
				if (setRecordResult != sets.size()) {
					return false; // Set 삽입 실패
				}
			}
			
			return true; // 모든 루틴 처리 성공
			
		} catch (Exception e) {
			log.error("insertRecord 실행 중 오류 발생", e);
			return false;
		}
	}
	
}