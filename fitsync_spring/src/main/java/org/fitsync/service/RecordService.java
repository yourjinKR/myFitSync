package org.fitsync.service;

import java.util.List;
import java.util.Map;

public interface RecordService {
	// 운동기록
	public boolean insertRecord(Map<String, Object> body, int member_idx);
	
	// 운동기록 날짜 조회
	public List<String> getRecordDatesByMonth(int memberIdx, String month);
}
