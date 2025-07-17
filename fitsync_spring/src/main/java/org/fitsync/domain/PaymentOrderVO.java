package org.fitsync.domain;

import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentOrderVO {
    private int order_idx; // 고유 주문 번호 (Primary Key)
    private int member_idx; // 결제 요청한 사용자 번호 (member 테이블 외래키)
    private int method_idx; // 사용한 결제 수단 번호 (payment_method 외래키, 단건 결제 시 null 가능)
    private String payment_id; // 포트원 결제 고유 ID (imp_uid), 외부 API 호출 시 참조
    private String order_type; // 결제 유형 (DIRECT: 단건 결제, SCHEDULE: 정기 결제)
    private String order_status; // 결제 상태 (READY: 대기, PAID: 완료, FAILED: 실패, CANCELLED: 취소)
    private String order_name; // 결제한 상품명 또는 설명 (예: "1개월 구독권")
    private int order_price; // 결제 금액
    private String order_currency; // 결제 통화 (기본값 'KRW')
    private Date order_regdate; // 결제 요청 시간 (시분초 포함, SYSDATE 기본값)
    private Date order_paydate; // 결제 완료 시간 (성공 시만 값 존재)
}
