package org.fitsync.mapper;

import java.util.List;
import java.util.Map;

import org.fitsync.domain.ApiLogVO;

public interface ApiLogMapper {
    void insertApiLog(ApiLogVO log);
    // idx 일치 log 불러오기
    ApiLogVO selectApiLogById(int apilog_idx);
    // api log 전부 불러오기
    List<ApiLogVO> selectApiList();
    // 예외 내용 입력
    void updateExceptionReason(ApiLogVO apiLogVO);
    // 피드백 서버
    void updateFeedBack(ApiLogVO apiLogVO);
    // 사용자 월별 토큰 사용량
    Map<String, Object> selectTokenUsageDuringLatestPaidOrder(int memberIdx);
}
