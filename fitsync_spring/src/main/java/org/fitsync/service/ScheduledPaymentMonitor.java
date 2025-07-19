package org.fitsync.service;

import org.fitsync.domain.PaymentOrderVO;
import org.fitsync.mapper.PaymentOrderMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.log4j.Log4j;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Timestamp;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Log4j
public class ScheduledPaymentMonitor {
    
    @Autowired
    private PaymentOrderMapper paymentOrderMapper;
    
    @Value("${portone.api.secret}")
    private String apiSecretKey;
    
    @Value("${portone.store.id}")
    private String storeId;
    
    /**
     * 모니터링 활성화 여부 (기본값: false)
     * 마스터 서버에서만 true로 설정
     */
    @Value("${payment.monitor.enabled:false}")
    private boolean monitorEnabled;
    
    /**
     * 서버 식별용 이름 (로깅용)
     */
    @Value("${server.name:unknown-server}")
    private String serverName;
    
    /**
     * API 호출 제한 (분당 최대 호출 수)
     */
    @Value("${payment.monitor.api.max.calls.per.minute:15}")
    private int maxApiCallsPerMinute;
    
    /**
     * API 호출 간격 (밀리초)
     */
    @Value("${payment.monitor.api.delay.ms:1000}")
    private long apiDelayMs;
    
    /**
     * 모니터링 시간 범위 (분)
     */
    @Value("${payment.monitor.time.range.minutes:10}")
    private int timeRangeMinutes;
    
    // ObjectMapper 재사용을 위한 필드 (메모리 효율성)
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // HttpClient 재사용 (타임아웃 설정 포함)
    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))  // 연결 타임아웃 10초
        .build();
    
    // API 호출 횟수 카운터 (분당 제한용)
    private final AtomicInteger currentApiCallCount = new AtomicInteger(0);
    
    /**
     * 예약 결제 상태 모니터링 (매 1분마다 실행)
     * 마스터 서버에서만 실행됨
     */
    @Scheduled(cron = "0 * * * * ?")
    public void monitorScheduledPayments() {
        
        // 모니터링이 비활성화된 서버는 실행하지 않음
        if (!monitorEnabled) {
            log.debug("모니터링 비활성화 서버 (" + serverName + ") - 스케줄러 건너뛰기");
            return;
        }
        
        // API 호출 카운터 초기화 (매분)
        currentApiCallCount.set(0);
        
        long startTime = System.currentTimeMillis();
        
        try {
            log.info("=== 예약 결제 상태 모니터링 시작 (마스터 서버: " + serverName + ") ===");
            
            // 1. 모니터링 대상 시간 범위 계산
            Timestamp now = new Timestamp(System.currentTimeMillis());
            Timestamp rangeStart = new Timestamp(now.getTime() - (timeRangeMinutes * 60 * 1000));
            Timestamp rangeEnd = new Timestamp(now.getTime() + (timeRangeMinutes * 60 * 1000));
            
            // 2. 모니터링 대상 예약 결제 조회
            List<PaymentOrderVO> targetOrders = paymentOrderMapper
                .selectScheduledPaymentsByTimeRange(rangeStart, rangeEnd);
            
            if (targetOrders.isEmpty()) {
                log.debug("모니터링 대상 예약 결제가 없습니다. (서버: " + serverName + ")");
                return;
            }
            
            log.info("모니터링 대상 예약 결제: " + targetOrders.size() + "건 (시간 범위: " + rangeStart + " ~ " + rangeEnd + ")");
            System.out.println("[" + serverName + "] 모니터링 대상 예약 결제: " + targetOrders.size() + "건");
            
            // 3. API 호출 제한 적용
            int processableCount = Math.min(targetOrders.size(), maxApiCallsPerMinute);
            if (targetOrders.size() > processableCount) {
                log.warn("API 호출 제한으로 인해 " + targetOrders.size() + "건 중 " + processableCount + "건만 처리합니다.");
            }
            
            // 4. 각 예약 결제 상태 확인 및 업데이트
            int successCount = 0;
            int failureCount = 0;
            int unchangedCount = 0;
            int skippedCount = 0;
            
            for (int i = 0; i < processableCount; i++) {
                PaymentOrderVO order = targetOrders.get(i);
                
                // API 호출 제한 체크
                if (currentApiCallCount.get() >= maxApiCallsPerMinute) {
                    log.warn("API 호출 제한 도달 - 남은 " + (targetOrders.size() - i) + "건은 다음 분에 처리");
                    skippedCount = targetOrders.size() - i;
                    break;
                }
                
                String result = checkAndUpdateScheduledPayment(order);
                
                switch (result) {
                    case "SUCCESS": successCount++; break;
                    case "FAILED": failureCount++; break;
                    case "UNCHANGED": unchangedCount++; break;
                    case "API_LIMIT_EXCEEDED": skippedCount++; break;
                }
                
                // API 호출 간격 조절
                if (i < processableCount - 1) { // 마지막이 아닌 경우만
                    try {
                        Thread.sleep(apiDelayMs);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        log.warn("API 호출 간격 대기 중 인터럽트 발생");
                        break;
                    }
                }
            }
            
            long executionTime = System.currentTimeMillis() - startTime;
            log.info("=== 예약 결제 상태 모니터링 완료 (서버: " + serverName + ", 실행시간: " + executionTime + "ms) === " +
                "성공: " + successCount + "건, 실패: " + failureCount + "건, 변경없음: " + unchangedCount + "건, 건너뜀: " + skippedCount + "건");
            System.out.println("[" + serverName + "] 모니터링 완료 - 성공: " + successCount + "건, 실패: " + failureCount + "건, 변경없음: " + unchangedCount + "건");
            
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("예약 결제 모니터링 중 오류 발생 (서버: " + serverName + ", 실행시간: " + executionTime + "ms): ", e);
            System.err.println("[" + serverName + "] 모니터링 오류: " + e.getMessage());
        }
    }
    
    /**
     * 개별 예약 결제 상태 확인 및 업데이트
     * API 호출과 DB 업데이트를 분리하여 트랜잭션 최적화
     */
    public String checkAndUpdateScheduledPayment(PaymentOrderVO order) {
        
        // API 호출 제한 체크
        if (currentApiCallCount.get() >= maxApiCallsPerMinute) {
            log.warn("API 호출 제한 초과 - OrderIdx: " + order.getOrder_idx());
            return "API_LIMIT_EXCEEDED";
        }
        
        try {
            String scheduleId = order.getSchedule_id();
            
            log.info("예약 결제 상태 확인 - OrderIdx: " + order.getOrder_idx() + 
                ", ScheduleId: " + scheduleId + ", ScheduleDate: " + order.getSchedule_date());
            
            // 1. PortOne API로 예약 상태 조회 (트랜잭션 외부에서 실행)
            String apiResponseBody = callPortOneScheduleAPI(scheduleId);
            
            if (apiResponseBody == null) {
                return "FAILED"; // API 호출 실패
            }
            
            // 2. API 응답 파싱
            @SuppressWarnings("unchecked")
            Map<String, Object> responseData = objectMapper.readValue(apiResponseBody, Map.class);
            String apiStatus = (String) responseData.get("status");
            
            log.debug("API 응답 상태 - ScheduleId: " + scheduleId + ", Status: " + apiStatus);
            
            // 3. 상태 변경이 필요한 경우에만 DB 트랜잭션 실행
            return processStatusUpdate(order, apiStatus, responseData);
            
        } catch (Exception e) {
            log.error("예약 결제 상태 확인 중 오류 - OrderIdx: " + order.getOrder_idx(), e);
            return "FAILED";
        }
    }
    
    /**
     * PortOne API 호출 (타임아웃 및 재사용 최적화)
     */
    private String callPortOneScheduleAPI(String scheduleId) {
        try {
            // API 호출 카운터 증가
            currentApiCallCount.incrementAndGet();
            
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.portone.io/payment-schedules/" + scheduleId + "?storeId=" + storeId))
                .header("Content-Type", "application/json")
                .header("Authorization", "PortOne " + apiSecretKey)
                .timeout(Duration.ofSeconds(15)) // 응답 타임아웃 15초
                .method("GET", HttpRequest.BodyPublishers.noBody())
                .build();
            
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return response.body();
            } else {
                log.warn("예약 상태 조회 실패 - ScheduleId: " + scheduleId + 
                    ", StatusCode: " + response.statusCode() + ", Body: " + response.body());
                return null;
            }
            
        } catch (java.net.http.HttpTimeoutException e) {
            log.error("API 호출 타임아웃 - ScheduleId: " + scheduleId, e);
            return null;
        } catch (java.io.IOException e) {
            log.error("API 호출 네트워크 오류 - ScheduleId: " + scheduleId, e);
            return null;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("API 호출 인터럽트 - ScheduleId: " + scheduleId, e);
            return null;
        } catch (Exception e) {
            log.error("API 호출 중 예상치 못한 오류 - ScheduleId: " + scheduleId, e);
            return null;
        }
    }
    
    /**
     * 상태 업데이트 처리 (필요한 경우에만 짧은 트랜잭션 실행)
     */
    private String processStatusUpdate(PaymentOrderVO order, String apiStatus, Map<String, Object> responseData) {
        
        String newStatus = null;
        String resultType = "UNCHANGED";
        
        // 상태 매핑
        switch (apiStatus != null ? apiStatus : "") {
            case "SUCCEEDED":
                newStatus = "PAID";
                resultType = "SUCCESS";
                break;
            case "FAILED":
                newStatus = "FAILED";
                resultType = "FAILED";
                break;
            case "CANCELLED":
                newStatus = "CANCELLED";
                resultType = "FAILED";
                break;
            case "SCHEDULED":
            case "PENDING":
                // 아직 대기 상태 - 상태 변경 없음
                log.debug("⏳ 예약 결제 대기 중 - OrderIdx: " + order.getOrder_idx() + ", API Status: " + apiStatus);
                return "UNCHANGED";
            default:
                log.warn("❓ 알 수 없는 API 상태 - OrderIdx: " + order.getOrder_idx() + ", Status: " + apiStatus);
                return "UNCHANGED";
        }
        
        // 상태 변경이 필요한 경우에만 트랜잭션 실행
        if (newStatus != null) {
            try {
                updateOrderStatusInTransaction(order, newStatus, responseData);
                
                // 로깅
                switch (newStatus) {
                    case "PAID":
                        log.info("🎉 예약 결제 성공 감지 - OrderIdx: " + order.getOrder_idx() + ", 상태 변경: READY -> PAID");
                        System.out.println("✅ [" + serverName + "] 결제 성공! OrderIdx: " + order.getOrder_idx());
                        break;
                    case "FAILED":
                        log.info("❌ 예약 결제 실패 감지 - OrderIdx: " + order.getOrder_idx() + ", 상태 변경: READY -> FAILED");
                        System.out.println("❌ [" + serverName + "] 결제 실패! OrderIdx: " + order.getOrder_idx());
                        break;
                    case "CANCELLED":
                        log.info("🚫 예약 결제 취소 감지 - OrderIdx: " + order.getOrder_idx() + ", 상태 변경: READY -> CANCELLED");
                        System.out.println("🚫 [" + serverName + "] 결제 취소! OrderIdx: " + order.getOrder_idx());
                        break;
                }
                
                // 알림 처리
                sendPaymentNotification(order, newStatus);
                
            } catch (Exception e) {
                log.error("상태 업데이트 실패 - OrderIdx: " + order.getOrder_idx(), e);
                return "FAILED";
            }
        }
        
        return resultType;
    }
    
    /**
     * DB 상태 업데이트 전용 트랜잭션 (짧고 효율적)
     */
    @Transactional(rollbackFor = Exception.class)
    public void updateOrderStatusInTransaction(PaymentOrderVO order, String newStatus, Map<String, Object> responseData) {
        
        // 업데이트 전 현재 상태 확인 (동시성 체크)
        PaymentOrderVO currentOrder = paymentOrderMapper.selectByOrderIdx(order.getOrder_idx());
        
        if (!"READY".equals(currentOrder.getOrder_status())) {
            log.warn("이미 처리된 주문 - OrderIdx: " + order.getOrder_idx() + 
                ", 현재 상태: " + currentOrder.getOrder_status() + ", 요청 상태: " + newStatus);
            return; // 이미 처리됨
        }
        
        // 주문 정보 업데이트
        order.setOrder_status(newStatus);
        
        if ("PAID".equals(newStatus)) {
            order.setOrder_paydate(new Timestamp(System.currentTimeMillis()));
            
            // 실제 결제 정보 저장
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> payments = (List<Map<String, Object>>) responseData.get("payments");
            if (payments != null && !payments.isEmpty()) {
                Map<String, Object> payment = payments.get(0);
                String actualPaymentId = (String) payment.get("id");
                if (actualPaymentId != null) {
                    order.setPayment_id(actualPaymentId);
                }
            }
        }
        
        // 조건부 업데이트 실행 (현재 상태가 READY일 때만)
        int updatedRows = paymentOrderMapper.updatePaymentStatusConditional(order);
        
        if (updatedRows == 0) {
            log.warn("동시성 이슈로 업데이트 실패 - 다른 프로세스에서 이미 처리됨: OrderIdx " + order.getOrder_idx());
            throw new RuntimeException("Concurrent modification detected");
        }
        
        System.out.println("✅ 예약 결제 상태 업데이트 완료 - OrderIdx: " + order.getOrder_idx() + ", READY -> " + newStatus);
    }

    /**
     * 결제 완료/실패 알림 처리 (선택사항)
     */
    private void sendPaymentNotification(PaymentOrderVO order, String status) {
        try {
            log.info("📢 결제 알림 발송 - OrderIdx: " + order.getOrder_idx() + ", Status: " + status + ", MemberIdx: " + order.getMember_idx());
            
            // 결제 성공 시 추가 비즈니스 로직
            if ("PAID".equals(status)) {
                log.info("💎 구독 활성화 처리 - MemberIdx: " + order.getMember_idx());
                // TODO: 구독 활성화 로직 구현
            }
            
        } catch (Exception e) {
            log.error("알림 발송 중 오류 발생 - OrderIdx: " + order.getOrder_idx(), e);
            // 알림 실패는 전체 프로세스에 영향주지 않음
        }
    }
    
    /**
     * 모니터링 상태 확인용 메서드 (디버깅/관리용)
     */
    public String getMonitorStatus() {
        return "서버명: " + serverName + 
               ", 모니터링 활성화: " + monitorEnabled + 
               ", 현재 API 호출 횟수: " + currentApiCallCount.get() + "/" + maxApiCallsPerMinute;
    }
}
