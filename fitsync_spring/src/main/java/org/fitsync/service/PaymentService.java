package org.fitsync.service;

import io.jsonwebtoken.io.IOException;

public interface PaymentService {
	public Object saveBillingKey();
	
	public Object payBillingKey(String payment);
	
	public Object scheduleBillingKey();
}
