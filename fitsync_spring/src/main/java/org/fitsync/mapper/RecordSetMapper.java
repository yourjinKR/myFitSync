package org.fitsync.mapper;

import java.util.List;
import java.util.Map;

import org.fitsync.domain.RecordSetVO;

public interface RecordSetMapper {
	public int insertSetRecord(Map<String, Object> map);
	
	public List<RecordSetVO> selectRecordSetsByRecordId(int recordId);
}
