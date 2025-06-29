package org.fitsync.mapper;

import org.fitsync.domain.ApiLogVO;

public interface ApiLogMapper {
    void insertApiLog(ApiLogVO log);
    
    ApiLogVO selectApiLogById(int apilog_idx);
}
