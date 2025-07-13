package org.fitsync.controller;

import org.fitsync.service.PaymentServiceImple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.jsonwebtoken.io.IOException;
import io.portone.sdk.server.payment.Trigger.PortoneAdmin;
import lombok.extern.log4j.Log4j;

@Log4j
@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Value("${portone.api.secret}")
    private String apiSecret;

    @Value("${portone.channel.key}")
    private String channelKey;
    
    @Autowired
    private PaymentServiceImple payService;
    
    // 결제창을 통해 생성한 빌링키를 저장
    @PostMapping("/bill/issue")
    public ResponseEntity<?> issueBillingKey() throws IOException {
    	return null;
    }
    
    // 빌링키로 결제
    @PostMapping("/bill/pay")
    public ResponseEntity<?> payBillingKey() throws IOException {
    	return null;
    }
    
    
    // 빌링키로 결제 예약
    @PostMapping("/bill/schedule")
    public ResponseEntity<?> scheduleBillingKey() throws IOException {
    	payService.payBillingKey();
    	return null;
    }    
    
    
}