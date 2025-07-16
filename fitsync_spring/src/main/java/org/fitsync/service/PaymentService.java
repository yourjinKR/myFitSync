package org.fitsync.service;

import java.util.List;
import java.util.Map;

import org.fitsync.domain.PaymentMethodVO;

import io.jsonwebtoken.io.IOException;

public interface PaymentService {
	public int saveBillingKey(PaymentMethodVO vo);
	
	public List<PaymentMethodVO> getPaymentMethods(int memberIdx);
	
	public Object getBillingKeyInfo(int methodIdx);
	
	public Object payBillingKey(String paymentId, int methodIdx) throws IOException;
	
	public Object scheduleBillingKey();
	
	public boolean renameBillingKey(int memberIdx, int methodIdx, String methodName);
	
	public boolean deletePaymentMethod(int memberIdx, int methodIdx);
	
	public Map<String, Object> getCardInfoByBillingKey(String billingKey);
	
	// 결제수단 등록 전 중복 체크
	public Map<String, Object> checkDuplicatePaymentMethod(String billingKey, int memberIdx);
	
	// 중복 처리 후 결제수단 저장 (기존 삭제 후 새로 등록)
	public Map<String, Object> saveBillingKeyWithDuplicateHandling(PaymentMethodVO vo, boolean replaceExisting);
}
