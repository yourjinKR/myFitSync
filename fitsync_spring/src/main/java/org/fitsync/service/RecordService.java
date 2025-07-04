package org.fitsync.service;

import java.util.Map;

public interface RecordService {
	// 운동기록
	public boolean insertRecord(Map<String, Object> body, int member_idx);
}
