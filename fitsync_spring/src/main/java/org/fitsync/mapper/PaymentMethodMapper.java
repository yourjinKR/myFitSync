package org.fitsync.mapper;

import org.fitsync.domain.PaymentMethodVO;
import java.util.List;

public interface PaymentMethodMapper {

    // 결제수단 등록
    int insertPaymentMethod(PaymentMethodVO vo);

    // method_idx로 단건 조회
    PaymentMethodVO selectByMethodIdx(int method_idx);

    // member_idx로 조회 (1:N)
    List<PaymentMethodVO> selectByMemberIdx(int member_idx);
    
    // member_idx로 조회 (빌링키 제외)
    List<PaymentMethodVO> selectByMemberIdxExcludingKey(int member_idx);

    // 빌링키 가져오기
    PaymentMethodVO selectBillingKeyByMethodIdx(int method_idx);

    // 결제수단 이름 수정
    int updatePaymentMethodName(PaymentMethodVO vo);
    
    // 결제수단 이름 수정 (보안된 버전 - member 소유권 확인)
    int updatePaymentMethodNameSecure(PaymentMethodVO vo);

    // 결제수단 삭제
    int deletePaymentMethod(PaymentMethodVO vo);
}
