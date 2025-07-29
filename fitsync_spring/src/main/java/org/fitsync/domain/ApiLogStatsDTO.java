package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiLogStatsDTO {
    private int totalCount;              // 총 요청 수
    private int successCount;            // 성공 수
    private int exceptionCount;          // 예외 수
    private int failCount;               // 실패 수
    private double avgResponseTime;      // 평균 응답 시간 (초)
    private long inputTokens;			 // 총 입력 토큰
    private long outputTokens;			 // 총 출력 토큰
    private long totalTokens;            // 총 토큰 수
    private int uniqueUsers;             // 고유 사용자 수
    private double totalProcessingTime;  // 총 처리 시간 (초)
}
