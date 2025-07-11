package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.ApiLogVO;

public interface ApiLogService {
    void insertApiLog(ApiLogVO log);
    
    ApiLogVO selectApiLogById(int apilog_idx);
    
    List<ApiLogVO> selectApiList();
    
    void updateExceptionReason(ApiLogVO log);
    
    void updateFeedBack(ApiLogVO apiLogVO);
}
