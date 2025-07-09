package org.fitsync.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.fitsync.domain.RecordVO;

public interface RecordMapper {
	public int insertRecord(RecordVO vo);
	
	// 운동기록 날짜 조회
	public List<String> findRecordDatesByMonth(@Param("memberIdx") int memberIdx, @Param("month") String month);
}
