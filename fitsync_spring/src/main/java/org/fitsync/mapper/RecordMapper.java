package org.fitsync.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.fitsync.domain.RecordVO;

public interface RecordMapper {
	public int insertRecord(RecordVO vo);
	
	// 운동기록 날짜 조회
	public List<String> findRecordDatesByMonth(@Param("memberIdx") int memberIdx, @Param("month") String month);
	
	// 운동 기록이 존재하는 날짜 목록 반환 (yyyy-MM-dd 형식)
    public List<String> selectRecordDates(@Param("memberIdx") int memberIdx);

    // 특정 날짜의 운동 기록 목록 반환
    public List<RecordVO> selectRecordsByDate(@Param("memberIdx") int memberIdx, @Param("date") String date);
}
