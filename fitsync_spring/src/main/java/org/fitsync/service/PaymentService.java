package org.fitsync.service;

import org.fitsync.domain.PaymentMethodVO;

import io.jsonwebtoken.io.IOException;

public interface PaymentService {
	public int saveBillingKey(PaymentMethodVO vo);
	
	public Object payBillingKey(String payment);
	
	public Object scheduleBillingKey();
}
