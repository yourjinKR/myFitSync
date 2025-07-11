package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.ApiLogVO;
import org.fitsync.mapper.ApiLogMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ApiLogServiceImple implements ApiLogService{
	@Autowired
	ApiLogMapper apiLogMapper;
	
	@Override
	public void insertApiLog(ApiLogVO log) {
		apiLogMapper.insertApiLog(log);
		
	}
	
	@Override
	public ApiLogVO selectApiLogById(int apilog_idx) {
		return apiLogMapper.selectApiLogById(apilog_idx);
	}
	
	@Override
	public List<ApiLogVO> selectApiList() {
		return apiLogMapper.selectApiList();
	}
	
	@Override
	public void updateExceptionReason(ApiLogVO log) {
		apiLogMapper.updateExceptionReason(log);
	}
	
	@Override
	public void updateFeedBack(ApiLogVO apiLogVO) {
		apiLogMapper.updateFeedBack(apiLogVO);
	}
}
