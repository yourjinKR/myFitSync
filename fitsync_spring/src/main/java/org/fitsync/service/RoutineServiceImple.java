package org.fitsync.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.fitsync.domain.RoutineArrVO;
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
		List<RoutineListVO> sortList = new ArrayList<RoutineListVO>();
		RoutineArrVO sort = rlmapper.sortGet(member_idx);
		list = rlmapper.getRoutineList(member_idx);
		if(list.size() > 0 && sort != null) {
			String[] arr =  sort.getRoutine_arr().split(",");
			for (String str : arr) {
				for (RoutineListVO vo : list) {
					if(str.equals(Integer.toString(vo.getRoutine_list_idx()))) {
						sortList.add(vo);
					}
				}
			}
		}else {
			sortList = list;
		}
		return sortList;
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
	        int targetMemberIdx = member_idx;
	        if (body.get("member_idx") != null && !body.get("member_idx").toString().isBlank()) {
	            targetMemberIdx = Integer.parseInt(body.get("member_idx").toString());
	        }

	        int writerIdx = body.get("writer_idx") != null && !body.get("writer_idx").toString().isBlank()
	        	    ? Integer.parseInt(body.get("writer_idx").toString())
	        	    : member_idx;

	        // RoutineListVO 등록
	       RoutineListVO rlvo = new RoutineListVO();
	       	rlvo.setRoutine_name(body.get("routine_name") != null && !body.get("routine_name").toString().isBlank()
	        ? body.get("routine_name").toString() : " ");
	       	rlvo.setWriter_idx(writerIdx);
	       	rlvo.setMember_idx(targetMemberIdx);
	        result += rlmapper.insert(rlvo);

	        int routine_list_idx = rlmapper.getIdx(targetMemberIdx);

	        if (result != 1) {
	            throw new RuntimeException("RoutineList insert failed");
	        }

	        List<Map<String, Object>> routines = (List<Map<String, Object>>) body.get("routines");
	        int routineResult = 0;

	        for (Map<String, Object> data : routines) {
	            RoutineVO rvo = new RoutineVO();
	            rvo.setPt_idx((int) data.get("pt_idx"));
	            rvo.setRoutine_list_idx(routine_list_idx);
	            rvo.setRoutine_memo(data.get("routine_memo") != null && !data.get("routine_memo").equals("")
	                    ? data.get("routine_memo").toString() : "");
	            routineResult += rmapper.insert(rvo);

	            int routine_idx = rmapper.getIdx(routine_list_idx);
	            List<Map<String, Object>> sets = (List<Map<String, Object>>) data.get("sets");

	            if (sets.size() > 0) {
	                RoutineSetVO rsvo = new RoutineSetVO();
	                int setResult = 0;

	                for (Map<String, Object> set : sets) {
	                    rsvo.setRoutine_idx(routine_idx);
	                    rsvo.setSet_volume(safeIntParse(set.get("set_volume")));
	                    rsvo.setSet_count(safeIntParse(set.get("set_count")));
	                    rsvo.setRoutine_list_idx(routine_list_idx);
	                    setResult += rsmapper.insert(rsvo);
	                }

	                if (setResult != sets.size()) {
	                    throw new RuntimeException("Set insert failed for routine_idx: " + routine_idx);
	                }
	            }
	        }

	        RoutineArrVO str = rlmapper.sortGet(targetMemberIdx);
	        RoutineArrVO arrvo = new RoutineArrVO();
	        if (str != null) {
	            arrvo.setMember_idx(targetMemberIdx);
	            arrvo.setRoutine_arr(str.getRoutine_arr() + "," + routine_list_idx);
	            rlmapper.sortUpdate(arrvo);
	        } else {
	            arrvo.setMember_idx(targetMemberIdx);
	            arrvo.setRoutine_arr(Integer.toString(routine_list_idx));
	            rlmapper.insertSort(arrvo);
	        }

	        if (routineResult != routines.size()) {
	            throw new RuntimeException("Routine insert failed for some routines");
	        }
	    } catch (Exception e) {
	        throw e;
	    }

	    return result == 3;
	}


	
	@Override
	public boolean deleteRoutine(RoutineMemberDTO rmdto) {
		boolean result = false;
		RoutineArrVO str = rlmapper.sortGet(rmdto.getMember_idx());
		if(str != null) {
			String[] arr = str.getRoutine_arr().split(",");
			List<String> tempList = new ArrayList<>();
	        for (String item : arr) {
	            if (!item.equals(Integer.toString(rmdto.getRoutine_list_idx()))) {
	                tempList.add(item);
	            }
	        }
	        String newData = tempList.stream()
	        	    .collect(Collectors.joining(","));
	        RoutineArrVO vo = new RoutineArrVO();
	        vo.setMember_idx(rmdto.getMember_idx());
	        vo.setRoutine_arr(newData);
			rlmapper.sortUpdate(vo);
		}
		result = rlmapper.deleteRoutine(rmdto) > 0;
		return result;
	}

	
	// 정렬 업데이트
	@Override
	public boolean sortUpdate(List<Integer> body, int member_idx) {
		boolean result = false;
		String arr = body.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
		RoutineArrVO vo = new RoutineArrVO();
		vo.setMember_idx(member_idx);
		vo.setRoutine_arr(arr);
		return rlmapper.sortUpdate(vo) > 0;
	}
	
	@Override
	public boolean updateRoutine(Map<String, Object> body, int member_idx) {
		boolean result = false;
		RoutineMemberDTO rmdto = new RoutineMemberDTO();
		rmdto.setMember_idx(member_idx);
		rmdto.setRoutine_list_idx((int) body.get("routine_list_idx"));
		RoutineListVO prevData = rlmapper.getRoutine(rmdto);
		List<Map<String, Object>> newRoutines = (List<Map<String, Object>>) body.get("routines");
		
		Map<String, Object> compareData = compareRoutines(prevData, newRoutines, body);
		if(compareData.get("newName") != null) {
			RoutineListVO newData = new RoutineListVO();
			newData.setRoutine_list_idx(prevData.getRoutine_list_idx());
			newData.setRoutine_name((String) compareData.get("newName"));
			result = rlmapper.routineNameUpdate(newData) > 0;
		}

		List<Map<String, Object>> routineComparisons = (List<Map<String, Object>>) compareData.get("routineComparisons");
		for (Map<String, Object> routineComparison : routineComparisons) {
			if(routineComparison.get("type") != null) {
				if((boolean) routineComparison.get("type").equals("MODIFIED")) {
					Map<String, Object> differences = (Map<String, Object>) routineComparison.get("differences");
					if((boolean) differences.get("sets_changed")) {
						Map<String, Object> sets_differences = (Map<String, Object>) differences.get("sets_differences");
						List<Map<String, Object>> set_comparisons = (List<Map<String, Object>>) sets_differences.get("set_comparisons");
						for (Map<String, Object> set_comparison : set_comparisons) {
							RoutineSetVO rsvo = new RoutineSetVO();
							rsvo.setRoutine_list_idx(safeIntParse(body.get("routine_list_idx")));
							// 세트 추가
							if(set_comparison.get("type").equals("ADDED")) {
								Map<String, Object> newSet = (Map<String, Object>)set_comparison.get("newSet");
								
								rsvo.setRoutine_idx(safeIntParse(set_comparison.get("routine_idx")));
								rsvo.setSet_count(safeIntParse(newSet.get("set_count")));
								rsvo.setSet_volume(safeIntParse(newSet.get("set_volume")));
								result = rsmapper.insert(rsvo) > 0;
							}
							
							// 세트 삭제
							if(set_comparison.get("type").equals("DELETED")) {
								rsvo = (RoutineSetVO) set_comparison.get("prevSet");
								result = rsmapper.delete(rsvo) > 0;
							}
							
							// 세트 업데이트
							if(set_comparison.get("type").equals("COMPARE")) {
								if(set_comparison.get("count_changed") != null || set_comparison.get("volume_changed") != null) {
									rsvo.setSet_count(
											set_comparison.get("count_changed") != null && (boolean) set_comparison.get("count_changed") ? 
													safeIntParse(set_comparison.get("new_count")) : 
														safeIntParse(set_comparison.get("prev_count")) 
											);
									rsvo.setSet_volume(
											set_comparison.get("volume_changed") != null && (boolean) set_comparison.get("volume_changed") ? 
													safeIntParse(set_comparison.get("new_volume")) : 
														safeIntParse(set_comparison.get("prev_volume")) 
											);
									rsvo.setSet_num(safeIntParse(set_comparison.get("set_num")));
									rsvo.setRoutine_idx(safeIntParse(set_comparison.get("routine_idx")));
									result = rsmapper.update(rsvo) > 0;
								}
							}
							
						}
					}
					// 추가 운동 루틴
				} else if((boolean) routineComparison.get("type").equals("ADDED")){
					Map<String, Object> newRoutine = (Map<String, Object>) routineComparison.get("newRoutine");
					RoutineVO rvo = new RoutineVO();
					rvo.setPt_idx(safeIntParse(newRoutine.get("pt_idx")));
					rvo.setRoutine_list_idx(safeIntParse(newRoutine.get("routine_list_idx")));
					rvo.setRoutine_memo(newRoutine.get("routine_memo") != null && !newRoutine.get("routine_memo").equals("") ? (String) newRoutine.get("routine_memo") : "");
					result = rmapper.insert(rvo) > 0;
					
					List<Map<String, Object>> sets = (List<Map<String, Object>>) newRoutine.get("sets");
					for (Map<String, Object> set : sets) {
						RoutineSetVO rsvo = new RoutineSetVO();
						rsvo.setSet_num(safeIntParse(set.get("set_num")));
						rsvo.setSet_volume(safeIntParse(set.get("set_volume")));
						rsvo.setSet_count(safeIntParse(set.get("set_count")));
						rsvo.setRoutine_list_idx(safeIntParse(newRoutine.get("routine_list_idx")));
						result = rsmapper.insert(rsvo) > 0; // 세트 등록
					}
					
				} else {
					RoutineVO rvo = (RoutineVO) routineComparison.get("prevRoutine");
					result = rmapper.delete(rvo) > 0;
				}
			}
			
		}
		return result;
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
	    result.put("prevRoutineCount", prevCount);
	    result.put("newRoutineCount", newCount);
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
	    int routine_idx = prevRoutine.getRoutine_idx();
	    List<Map<String, Object>> newSets = (List<Map<String, Object>>) newRoutine.get("sets");
	    Map<String, Object> setsDiff = compareSets(prevSets, newSets, routine_idx);
	    if (!setsDiff.isEmpty()) {
	        diff.put("sets_changed", true);
	        diff.put("sets_differences", setsDiff);
	    }
	    return diff;
	}

	// 세트 비교
	private Map<String, Object> compareSets(List<RoutineSetVO> prevSets, List<Map<String, Object>> newSets, int routine_idx) {
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
	        	setComp.put("routine_idx", routine_idx);
	            setComp.put("type", "ADDED");
	            setComp.put("newSet", newSet);
	        } else if (newSet == null) {
	            setComp.put("type", "DELETED");
	            setComp.put("prevSet", prevSet);
	        } else {
        		setComp.put("set_num", newSet.get("set_num"));
	        	setComp.put("routine_idx", routine_idx);
	            setComp.put("type", "COMPARE");
	            // 볼륨 비교
	            int prevVolume = prevSet.getSet_volume();
	            int newVolume = safeIntParse(newSet.get("set_volume"));
	            setComp.put("prev_volume", prevVolume);
	            if (prevVolume != newVolume) {
	                setComp.put("volume_changed", true);
	                setComp.put("new_volume", newVolume);
	            }
	            
	            // 횟수 비교
	            int prevCount = prevSet.getSet_count();
	            int newCount = safeIntParse(newSet.get("set_count"));
	            setComp.put("prev_count", prevCount);
	            if (prevCount != newCount) {
	                setComp.put("count_changed", true);
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