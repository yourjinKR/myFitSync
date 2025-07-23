package org.fitsync.service;

import java.util.List;
import java.util.Map;

import org.fitsync.domain.RecordVO;

public interface RecordService {
	// 운동기록
	public String insertRecord(Map<String, Object> body, int member_idx);
	// 운동기록 날짜 조회
	public List<String> getRecordDatesByMonth(int memberIdx, String month);
	// 달력 마킹용 날짜 목록
    public List<String> getRecordDates(int memberIdx);
    // 특정 날짜의 기록 목록
    public List<RecordVO> getRecordsByDate(int memberIdx, String date);
    // 특정 기록 번호로 운동 기록 1개 가져오기
    public RecordVO getRecordById(int recordId);
    
	
}
