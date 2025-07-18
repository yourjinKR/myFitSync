package org.fitsync.mapper;

import java.util.List;

import org.fitsync.domain.PaymentOrderVO;
import org.fitsync.domain.PaymentOrderWithMethodVO;

public interface PaymentOrderMapper {
    // 결제 요청 저장
    void insertPaymentOrder(PaymentOrderVO order);

    // 결제 상태 갱신
    void updatePaymentStatus(PaymentOrderVO order);

    // 단건 조회
    PaymentOrderVO selectPaymentOrderById(int order_idx);

    // 사용자별 결제 목록 조회
    List<PaymentOrderVO> selectPaymentOrdersByMember(int member_idx);
    
    // 사용자별 결제 목록 조회 (결제 수단 정보 포함)
    List<PaymentOrderWithMethodVO> selectPaymentOrdersByMemberWithMethod(int member_idx);
    
    // 디버깅용: payment_id로 주문 조회
    PaymentOrderVO selectByPaymentId(String paymentId);
}
