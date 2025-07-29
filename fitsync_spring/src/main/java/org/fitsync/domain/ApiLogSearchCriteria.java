package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiLogSearchCriteria {

    // 페이징
    private int page = 1;
    private int pageSize = 10;

    // 검색어 필터
    private String keyword;          // member_idx, model 등 통합 검색
    private String keywordType;      // 검색 기준: idx, member, model 등

    // 상태/모델/서비스 타입/버전 필터
    private String status;           // success, fail, exception
    private String model;            // gpt-4o 등
    private String serviceType;      // 운동 루틴 추천 등
    private String version;          // v0.0.1 등

    // 날짜 필터
    private String fromDate;         // YYYY-MM-DD
    private String toDate;           // YYYY-MM-DD

    // 정렬 조건
    private String sortBy = "newest";  // newest, oldest, tokens, time

    // 페이징 계산용
    public int getStartRow() {
        return (page - 1) * pageSize + 1;
    }

    public int getEndRow() {
        return page * pageSize;
    }
}

