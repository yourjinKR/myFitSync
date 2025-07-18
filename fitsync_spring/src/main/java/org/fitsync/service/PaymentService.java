package org.fitsync.service;

import java.util.List;
import java.util.Map;

import org.fitsync.domain.PaymentMethodVO;
import org.fitsync.domain.PaymentOrderVO;
import org.fitsync.domain.PaymentOrderWithMethodVO;

import io.jsonwebtoken.io.IOException;

public interface PaymentService {
	public int saveBillingKey(PaymentMethodVO vo);
	
	public List<PaymentMethodVO> getPaymentMethods(int memberIdx);
	
	public Object getBillingKeyInfo(int methodIdx);
	
	public Object payBillingKey(String paymentId, int methodIdx, int memberIdx) throws IOException;
	
	// 결제 예약 추가
	public Object scheduleBillingKey(String paymentId, int methodIdx, int memberIdx, String scheduleDateTime) throws IOException;

	// 결제 예약 취소
	public Object cancelScheduledPayment(int orderIdx, int memberIdx) throws IOException;
	
	public boolean renameBillingKey(int memberIdx, int methodIdx, String methodName);
	
	public boolean deletePaymentMethod(int memberIdx, int methodIdx);
	
	public Map<String, Object> getCardInfoByBillingKey(String billingKey);
	
	// 결제수단 등록 전 중복 체크
	public Map<String, Object> checkDuplicatePaymentMethod(String billingKey, int memberIdx);
	
	// 중복 처리 후 결제수단 저장 (기존 삭제 후 새로 등록)
	public Map<String, Object> saveBillingKeyWithDuplicateHandling(PaymentMethodVO vo, boolean replaceExisting);
	
	// 사용자별 결제 기록 조회 (기존)
	public List<PaymentOrderVO> getPaymentHistory(int memberIdx);
	
	// 사용자별 결제 기록 조회 (결제 수단 정보 포함)
	public List<PaymentOrderWithMethodVO> getPaymentHistoryWithMethod(int memberIdx);
}
