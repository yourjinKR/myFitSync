package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderWithMethodVO {
    
    // 결제 주문 정보 (payment_order)
    private int order_idx;
    private int member_idx;
    private int method_idx;
    private String payment_id;
    private String order_type;
    private String order_status;
    private String order_name;
    private int order_price;
    private String order_currency;
    private String order_regdate;    // TO_CHAR로 변환된 문자열
    private String order_paydate;    // TO_CHAR로 변환된 문자열
    private String schedule_id;      // 정기 결제 예약 ID (정기 결제 시만 값 존재)
    private String schedule_date;    // 정기 결제 예약 시간 (정기 결제 시만 값 존재)
    private String order_provider; // 제공하는 pg사
    private String order_card; // 결제에 사용된 카드사
    private String order_card_num; // 결제에 사용된 카드 번호
    
    // 결제 수단 정보 (payment_method)
    private String method_key;
    private String method_provider;
    private String method_name;
    private String method_card;
    private String method_card_num;
    private String method_regdate;   // TO_CHAR로 변환된 문자열
    
    // API에서 조회한 결제 수단 정보 (PortOne API 응답)
    private String apiMethodType;      // 결제 수단 타입 (카드, 간편결제 등)
    private String apiMethodProvider;  // API에서 조회한 결제 수단 제공자
    private String apiCardName;        // API에서 조회한 카드명
    private String apiCardNumber;      // API에서 조회한 카드번호
    private String apiCardPublisher;   // API에서 조회한 카드사
    private String apiCardIssuer;      // API에서 조회한 발급사
    private String apiCardBrand;       // API에서 조회한 카드 브랜드
    private String apiCardType;        // API에서 조회한 카드 타입 (DEBIT/CREDIT)
    private String apiPgProvider;       // API에서 조회한 pg제공사
    
    /**
     * 카드 결제 방식인지 확인
     * @return 카드 결제 여부
     */
    public boolean isCardPayment() {
        return "card".equals(apiMethodType);
    }

    /**
     * 간편결제 방식인지 확인
     * @return 간편결제 여부
     */
    public boolean isEasyPayment() {
        return "easyPay".equals(apiMethodType);
    }
    
    /**
     * 결제 수단 표시명 반환 (사용자 친화적)
     * API 정보가 있으면 우선 사용, 없으면 DB 정보 사용
     */
    public String getDisplayMethodName() {
        // API 정보 우선 사용
        if (apiMethodType != null && !apiMethodType.trim().isEmpty()) {
            if (isEasyPayment()) {
                // 간편결제의 경우 결제 채널명 표시
                switch (apiMethodProvider != null ? apiMethodProvider : apiPgProvider) {
                    case "KAKAOPAY": return "카카오페이";
                    case "TOSSPAYMENTS": return "토스페이먼츠";
                    default: return "간편결제";
                }
            } else if (isCardPayment()) {
                // 카드 결제의 경우 "카드 결제" 표시
                return "카드 결제";
            } else {
                // 기타
                return "기타 결제수단";
            }
        }
        
        // API 정보가 없는 경우 기존 DB 정보 사용 (하위 호환성)
        if (method_name != null && !method_name.trim().isEmpty() && 
            !method_name.equals("카카오페이") && !method_name.equals("토스페이먼츠")) {
            return method_name;
        }
        
        // 기본 표시명 생성
        switch (method_provider != null ? method_provider : "") {
            case "KAKAOPAY":
                return "카카오페이";
            case "TOSSPAYMENTS":
                return "토스페이먼츠";
            default:
                return "기타 결제수단";
        }
    }
    
    /**
     * 마스킹된 카드번호 반환
     * API 정보가 있으면 우선 사용, 없으면 DB 정보 사용
     */
    public String getMaskedCardNumber() {
        String cardNumber = null;
        
        // API 정보 우선 사용
        if (apiCardNumber != null && !apiCardNumber.trim().isEmpty()) {
            cardNumber = apiCardNumber;
        } else if (method_card_num != null && !method_card_num.trim().isEmpty()) {
            cardNumber = method_card_num;
        }
        
        if (cardNumber == null || cardNumber.length() < 4) {
            return "****-****-****-****";
        }
        
        // 이미 마스킹된 번호인지 확인
        if (cardNumber.contains("*")) {
            return cardNumber;
        }
        
        // 마지막 4자리만 표시
        String last4 = cardNumber.substring(cardNumber.length() - 4);
        return "****-****-****-" + last4;
    }
    
    /**
     * 카드 정보 표시 (카드사 + 마스킹된 번호)
     * 카드 결제일 때만 카드 정보 표시, 간편결제는 결제수단명만 표시
     */
    public String getCardDisplayInfo() {
        if (isCardPayment() && apiCardName != null && apiCardNumber != null) {
            // 카드 결제: 카드명 + 번호 표시
            return apiCardName + " " + apiCardNumber;
        } else if (isEasyPayment()) {
            // 간편결제: 결제수단명만 표시
            return getDisplayMethodName();
        } else {
            // API 정보가 없는 경우 기존 DB 정보 사용 (하위 호환성)
            String cardName = null;
            
            if (method_card != null && !method_card.equals("정보 조회 실패") && !method_card.equals("알 수 없는 카드")) {
                cardName = method_card;
            }
            
            if (cardName == null || cardName.trim().isEmpty()) {
                return getDisplayMethodName();
            }
            
            String maskedNumber = getMaskedCardNumber();
            return cardName + " " + maskedNumber;
        }
    }
    
    /**
     * 결제 상태 한글 변환
     */
    public String getStatusDisplayName() {
        switch (order_status != null ? order_status : "") {
            case "PAID":
                return "결제완료";
            case "FAILED":
                return "결제실패";
            case "READY":
                return "결제대기";
            case "CANCELLED":
                return "결제취소";
            default:
                return "알 수 없음";
        }
    }
    
    /**
     * 금액 포맷팅
     */
    public String getFormattedPrice() {
        return String.format("%,d원", order_price);
    }
}
