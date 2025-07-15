package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.PaymentMethodVO;

import io.jsonwebtoken.io.IOException;

public interface PaymentService {
	public int saveBillingKey(PaymentMethodVO vo);
	
	public List<PaymentMethodVO> getPaymentMethods(int memberIdx);
	
	public Object payBillingKey(String payment);
	
	public Object scheduleBillingKey();
	
	public boolean renameBillingKey(int memberIdx, int methodIdx, String methodName);
	
	public boolean deletePaymentMethod(int memberIdx, int methodIdx);
}
