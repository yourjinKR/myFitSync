package org.fitsync.mapper;

import java.sql.Timestamp;
import java.util.List;

import org.fitsync.domain.PaymentOrderVO;
import org.fitsync.domain.PaymentOrderWithMethodVO;

public interface PaymentOrderMapper {
    // 결제 요청 저장
    void insertPaymentOrder(PaymentOrderVO order);

    // 결제 상태 갱신
    void updatePaymentStatus(PaymentOrderVO order);
    
    // 조건부 결제 상태 업데이트 (동시성 제어용)
    int updatePaymentStatusConditional(PaymentOrderVO order);

    // 단건 조회
    PaymentOrderVO selectPaymentOrderById(int order_idx);
    
    // order_idx로 단건 조회 (별칭)
    PaymentOrderVO selectByOrderIdx(int order_idx);

    // 사용자별 결제 목록 조회
    List<PaymentOrderVO> selectPaymentOrdersByMember(int member_idx);
    
    // 사용자별 결제 목록 조회 (결제 수단 정보 포함)
    List<PaymentOrderWithMethodVO> selectPaymentOrdersByMemberWithMethod(int member_idx);
    
    // 결제 예약 대기건 조회 (정기 결제 예약)
    PaymentOrderWithMethodVO selectScheduledPaymentOrderByMember(int member_idx);

    // 디버깅용: payment_id로 주문 조회
    PaymentOrderVO selectByPaymentId(String paymentId);
    
    // 시간 범위 내 예약 결제 조회 (스마트 폴링용)
    List<PaymentOrderVO> selectScheduledPaymentsByTimeRange(Timestamp startTime, Timestamp endTime);

    // 구독자 판별
    PaymentOrderVO selectActiveSubscription(int member_idx);
    
    // 특정 결제수단의 예약 결제 조회
    List<PaymentOrderVO> selectScheduledPaymentsByMethodIdx(int method_idx);
}
