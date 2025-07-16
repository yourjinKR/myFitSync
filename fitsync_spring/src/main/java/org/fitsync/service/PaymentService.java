package org.fitsync.service;

import java.util.List;
import java.util.Map;

import org.fitsync.domain.PaymentMethodVO;

import io.jsonwebtoken.io.IOException;

public interface PaymentService {
	public int saveBillingKey(PaymentMethodVO vo);
	
	public List<PaymentMethodVO> getPaymentMethods(int memberIdx);
	
	public Object getBillingKeyInfo(int methodIdx);
	
	public Object payBillingKey(String payment);
	
	public Object scheduleBillingKey();
	
	public boolean renameBillingKey(int memberIdx, int methodIdx, String methodName);
	
	public boolean deletePaymentMethod(int memberIdx, int methodIdx);
	
	public Map<String, Object> getCardInfoByBillingKey(String billingKey);
}
