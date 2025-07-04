package org.fitsync.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.fitsync.domain.RoutineListVO;
import org.fitsync.domain.RoutineMemberDTO;
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
	
	@Override
	public RoutineListVO getRoutine(RoutineMemberDTO rmdto) {
		return rlmapper.getRoutine(rmdto);
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
	                int idx = 1;
	                for (Map<String, Object> set : sets) {
	                	rsvo.setRoutine_idx(routine_idx);
	                	rsvo.setSet_num(idx++);
	                	Object setVolumeObj = set.get("set_volume");
	                	rsvo.setSet_volume(setVolumeObj != null && !setVolumeObj.toString().trim().isEmpty() 
	                	    ? (int) setVolumeObj : 0);
	                	Object setCountObj = set.get("set_count");
	                	rsvo.setSet_count(setCountObj != null && !setCountObj.toString().trim().isEmpty() 
	                	    ? (int) setCountObj : 0);	                	
						
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
	
	@Override
	public boolean deleteRoutine(RoutineMemberDTO rmdto) {
		return rlmapper.deleteRoutine(rmdto) > 0;
	}
	
	@Override
	public boolean updateRoutine(Map<String, Object> body, int member_idx) {
		RoutineMemberDTO rmdto = new RoutineMemberDTO();
		rmdto.setMember_idx(member_idx);
		rmdto.setRoutine_list_idx((int) body.get("routine_list_idx"));
		RoutineListVO prevData = rlmapper.getRoutine(rmdto);
		List<Map<String, Object>> newRoutines = (List<Map<String, Object>>) body.get("routines");
		
		compareRoutines(prevData, newRoutines, body);
		
		return false;
	}
	
	// 비교 메서드
	private Map<String, Object> compareRoutines(RoutineListVO prevData, List<Map<String, Object>> newRoutines, Map<String, Object> body) {
	    Map<String, Object> result = new HashMap<>();
	    
	    // 1. 루틴 이름 비교
	    String prevName = prevData.getRoutine_name();
	    String newName = (String) body.get("routine_name");
	    boolean nameChanged = !prevName.equals(newName);
	    result.put("nameChanged", nameChanged);
	    if (nameChanged) {
	        result.put("prevName", prevName);
	        result.put("newName", newName);
	    }
	    
	    // 2. 루틴 개수 비교
	    List<RoutineVO> prevRoutines = prevData.getRoutines();
	    int prevCount = prevRoutines != null ? prevRoutines.size() : 0;
	    int newCount = newRoutines != null ? newRoutines.size() : 0;
	    result.put("routineCountChanged", prevCount != newCount);
//	    result.put("prevRoutineCount", prevCount);
//	    result.put("newRoutineCount", newCount);
	    System.out.println(result);
	    // 3. 각 루틴별 상세 비교
	    List<Map<String, Object>> routineComparisons = new ArrayList<>();
	    
	    if (prevRoutines != null && newRoutines != null) {
	        // 기존 루틴들과 새 루틴들을 비교
	        for (int i = 0; i < Math.max(prevRoutines.size(), newRoutines.size()); i++) {
	            Map<String, Object> routineComp = new HashMap<>();
	            
	            RoutineVO prevRoutine = i < prevRoutines.size() ? prevRoutines.get(i) : null;
	            Map<String, Object> newRoutine = i < newRoutines.size() ? newRoutines.get(i) : null;
	            
	            if (prevRoutine == null) {
	                // 새로 추가된 루틴
	                routineComp.put("type", "ADDED");
	                routineComp.put("newRoutine", newRoutine);
	            } else if (newRoutine == null) {
	                // 삭제된 루틴
	                routineComp.put("type", "DELETED");
	                routineComp.put("prevRoutine", prevRoutine);
	            } else {
	                // 기존 루틴 비교
	                routineComp.put("type", "MODIFIED");
	                Map<String, Object> routineDiff = compareRoutineDetails(prevRoutine, newRoutine);
	                routineComp.put("differences", routineDiff);
	            }
	            
	            routineComparisons.add(routineComp);
	        }
	    }
	    
	    result.put("routineComparisons", routineComparisons);
	    
	    return result;
	}
	
	// 개별 루틴 상세 비교
	private Map<String, Object> compareRoutineDetails(RoutineVO prevRoutine, Map<String, Object> newRoutine) {
	    Map<String, Object> diff = new HashMap<>();
	    
	    // pt_idx 비교
	    int prevPtIdx = prevRoutine.getPt_idx();
	    int newPtIdx = safeIntParse(newRoutine.get("pt_idx"));
	    if (prevPtIdx != newPtIdx) {
	        diff.put("pt_idx_changed", true);
	        diff.put("prev_pt_idx", prevPtIdx);
	        diff.put("new_pt_idx", newPtIdx);
	    }
	    
	    // routine_memo 비교
	    String prevMemo = prevRoutine.getRoutine_memo() != null ? prevRoutine.getRoutine_memo() : "";
	    String newMemo = newRoutine.get("routine_memo") != null ? (String) newRoutine.get("routine_memo") : "";
	    if (!prevMemo.equals(newMemo)) {
	        diff.put("memo_changed", true);
	        diff.put("prev_memo", prevMemo);
	        diff.put("new_memo", newMemo);
	    }
	    
	    // 세트 비교
	    List<RoutineSetVO> prevSets = prevRoutine.getSets();
	    List<Map<String, Object>> newSets = (List<Map<String, Object>>) newRoutine.get("sets");
	    
	    Map<String, Object> setsDiff = compareSets(prevSets, newSets);
	    if (!setsDiff.isEmpty()) {
	        diff.put("sets_changed", true);
	        diff.put("sets_differences", setsDiff);
	    }
	    
	    return diff;
	}

	// 세트 비교
	private Map<String, Object> compareSets(List<RoutineSetVO> prevSets, List<Map<String, Object>> newSets) {
	    Map<String, Object> diff = new HashMap<>();
	    
	    int prevSetCount = prevSets != null ? prevSets.size() : 0;
	    int newSetCount = newSets != null ? newSets.size() : 0;
	    
	    if (prevSetCount != newSetCount) {
	        diff.put("set_count_changed", true);
	        diff.put("prev_set_count", prevSetCount);
	        diff.put("new_set_count", newSetCount);
	    }
	    
	    List<Map<String, Object>> setComparisons = new ArrayList<>();
	    
	    for (int i = 0; i < Math.max(prevSetCount, newSetCount); i++) {
	        Map<String, Object> setComp = new HashMap<>();
	        
	        RoutineSetVO prevSet = i < prevSetCount ? prevSets.get(i) : null;
	        Map<String, Object> newSet = i < newSetCount ? newSets.get(i) : null;
	        
	        if (prevSet == null) {
	            setComp.put("type", "ADDED");
	            setComp.put("newSet", newSet);
	        } else if (newSet == null) {
	            setComp.put("type", "DELETED");
	            setComp.put("prevSet", prevSet);
	        } else {
	            setComp.put("type", "COMPARE");
	            
	            // 볼륨 비교
	            int prevVolume = prevSet.getSet_volume();
	            int newVolume = safeIntParse(newSet.get("set_volume"));
	            if (prevVolume != newVolume) {
	                setComp.put("volume_changed", true);
	                setComp.put("prev_volume", prevVolume);
	                setComp.put("new_volume", newVolume);
	            }
	            
	            // 횟수 비교
	            int prevCount = prevSet.getSet_count();
	            int newCount = safeIntParse(newSet.get("set_count"));
	            if (prevCount != newCount) {
	                setComp.put("count_changed", true);
	                setComp.put("prev_count", prevCount);
	                setComp.put("new_count", newCount);
	            }
	        }
	        
	        setComparisons.add(setComp);
	    }
	    
	    if (!setComparisons.isEmpty()) {
	        diff.put("set_comparisons", setComparisons);
	    }
	    
	    return diff;
	}
	
	private int safeIntParse(Object obj) {
	    if (obj == null) return 0;
	    if (obj instanceof Integer) return (Integer) obj;
	    if (obj instanceof String) {
	        try {
	            return Integer.parseInt((String) obj);
	        } catch (NumberFormatException e) {
	            return 0;
	        }
	    }
	    return 0;
	}
}