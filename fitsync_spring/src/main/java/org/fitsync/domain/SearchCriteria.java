package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchCriteria {
    private String keyword;       // 검색어
    private String keywordType;    // 검색 기준: name, address, idx 등
    private int page = 1;         // 현재 페이지
    private int pageSize = 10;    // 페이지당 항목 수

    public int getStartRow() {
        return (page - 1) * pageSize + 1;
    }

    public int getEndRow() {
        return page * pageSize;
    }
}