package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.ApiLogSearchCriteria;
import org.fitsync.domain.ApiLogStatsDTO;
import org.fitsync.domain.ApiLogVO;

public interface ApiLogService {
    void insertApiLog(ApiLogVO log);
    
    ApiLogVO selectApiLogById(int apilog_idx);
    
    List<ApiLogVO> selectApiList();
    
    ApiLogStatsDTO selectApiLogStats(ApiLogSearchCriteria cri);
    
    void updateExceptionReason(ApiLogVO log);
    
    void updateFeedBack(ApiLogVO apiLogVO);
    
    int updateUserAction(ApiLogVO apiLogVO);
    
    List<ApiLogVO> getByMemberId(int memberIdx); 
}
