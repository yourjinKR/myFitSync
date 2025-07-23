package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.RecordSetVO;

public interface RecordSetService {
	
	public List<RecordSetVO> getRecordSetsByRecordId(int recordId);
}
