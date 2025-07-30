package org.fitsync.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.fitsync.domain.AiExerciseDTO;
import org.fitsync.domain.AiRoutineDTO;
import org.fitsync.domain.ApiLogSearchCriteria;
import org.fitsync.domain.ApiLogStatsDTO;
import org.fitsync.domain.ApiLogVO;
import org.fitsync.domain.PtVO;
import org.fitsync.mapper.ApiLogMapper;
import org.fitsync.mapper.PtMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ApiLogServiceImple implements ApiLogService{
	@Autowired
	ApiLogMapper apiLogMapper;
	@Autowired
	PtMapper ptMapper;
	
	@Override
	public void insertApiLog(ApiLogVO log) {
		apiLogMapper.insertApiLog(log);
		
	}
	
	@Override
	public ApiLogVO selectApiLogById(int apilog_idx) {
		return apiLogMapper.selectApiLogById(apilog_idx);
	}
	
	// idx와 이름 매핑하여 부르기
	public Map<Integer, String> getWorkoutNameMap() {
	    List<PtVO> ptList = ptMapper.getWorkOutNameMap();
	    return ptList.stream().collect(Collectors.toMap(PtVO::getPt_idx, PtVO::getPt_name));
	}
	
	@Override
	public List<ApiLogVO> selectApiList() {
	    List<ApiLogVO> list = apiLogMapper.selectApiList();

	    // 1. idx → name 매핑 Map 준비
	    Map<Integer, String> ptNameMap = getWorkoutNameMap();

	    // 2. Jackson ObjectMapper
	    ObjectMapper objectMapper = new ObjectMapper();

	    for (ApiLogVO log : list) {
	        String version = log.getApilog_version();  // ex: "0.2.0"
	        String json = log.getApilog_response();

	        // 1. 응답이 JSON이 아닌 경우 → 스킵
	        if (json == null || !json.trim().startsWith("[")) {
	            continue;
	        }

	        // 2. 버전별 파싱 분기
	        try {
	            if (version != null && version.startsWith("0.2")) {
	                // pt_idx만 존재 → 매핑 필요
	                List<AiRoutineDTO> routines = objectMapper.readValue(json, new TypeReference<List<AiRoutineDTO>>() {});
	                for (AiRoutineDTO routine : routines) {
	                    for (AiExerciseDTO ex : routine.getExercises()) {
	                        String name = ptNameMap.get(ex.getPt_idx());
	                        ex.setPt_name(name != null ? name : "Unknown");
	                    }
	                }
	                log.setApilog_response(objectMapper.writeValueAsString(routines));
	            }
	            // 0.1.x는 pt_name 포함된 구조이므로 그대로 유지
	        } catch (Exception e) {
	            log.setApilog_status("exception");
	            log.setApilog_status_reason("response_parsing_failed");
	            log.setApilog_response(json); // 원본 유지
	        }
	    }

	    return list;
	}
	
	@Override
	public ApiLogStatsDTO selectApiLogStats(ApiLogSearchCriteria cri) {
		return apiLogMapper.selectApiLogStats(cri);
	}
	
	@Override
	public void updateExceptionReason(ApiLogVO log) {
		apiLogMapper.updateExceptionReason(log);
	}
	
	@Override
	public void updateFeedBack(ApiLogVO apiLogVO) {
		apiLogMapper.updateFeedBack(apiLogVO);
	}
	
	@Override
	public List<ApiLogVO> getByMemberId(int memberIdx) {
	    List<ApiLogVO> list = apiLogMapper.selectByMemberId(memberIdx);

	    // 1. idx → name 매핑 Map 준비
	    Map<Integer, String> ptNameMap = getWorkoutNameMap();

	    // 2. Jackson ObjectMapper
	    ObjectMapper objectMapper = new ObjectMapper();

	    for (ApiLogVO log : list) {
	        String version = log.getApilog_version();  // ex: "0.2.0"
	        String json = log.getApilog_response();

	        // 1. 응답이 JSON이 아닌 경우 → 스킵
	        if (json == null || !json.trim().startsWith("[")) {
	            continue;
	        }

	        // 2. 버전별 파싱 분기
	        try {
	            if (version != null && version.startsWith("0.2")) {
	                // pt_idx만 존재 → 매핑 필요
	                List<AiRoutineDTO> routines = objectMapper.readValue(json, new TypeReference<List<AiRoutineDTO>>() {});
	                for (AiRoutineDTO routine : routines) {
	                    for (AiExerciseDTO ex : routine.getExercises()) {
	                        String name = ptNameMap.get(ex.getPt_idx());
	                        ex.setPt_name(name != null ? name : "Unknown");
	                    }
	                }
	                log.setApilog_response(objectMapper.writeValueAsString(routines));
	            }
	            // 0.1.x는 pt_name 포함된 구조이므로 그대로 유지
	        } catch (Exception e) {
	            log.setApilog_status("exception");
	            log.setApilog_status_reason("response_parsing_failed");
	            log.setApilog_response(json); // 원본 유지
	        }
	    }

	    return list;
	}
}
