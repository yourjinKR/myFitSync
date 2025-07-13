package org.fitsync.controller;

import java.util.Map;

import org.fitsync.service.PaymentServiceImple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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
@CrossOrigin(origins = "*")
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
    @PostMapping(value = "/bill/pay")
    public ResponseEntity<?> payBillingKey(@RequestBody Map<String, String> body) throws IOException {
    	String payment = body.get("paymentId");
    	
    	try {
    		Object result = payService.payBillingKey(payment);
    		log.info("Payment result: " + result);
    		
    		// 결과가 Map이고 success 필드를 체크
    		if (result instanceof Map) {
    			@SuppressWarnings("unchecked")
    			Map<String, Object> resultMap = (Map<String, Object>) result;
    			Boolean success = (Boolean) resultMap.get("success");
    			
    			if (success != null && success) {
    				return ResponseEntity.ok(result);
    			} else {
    				return ResponseEntity.badRequest().body(result);
    			}
    		}
    		
    		return ResponseEntity.ok(result);
    		
    	} catch (Exception e) {
    		log.error("Payment processing error: ", e);
    		Map<String, Object> errorResponse = new java.util.HashMap<>();
    		errorResponse.put("success", false);
    		errorResponse.put("message", "Payment processing failed");
    		errorResponse.put("error", e.getMessage());
    		return ResponseEntity.status(500).body(errorResponse);
    	}
    }
    
    
    // 빌링키로 결제 예약
    @PostMapping("/bill/schedule")
    public ResponseEntity<?> scheduleBillingKey() throws IOException {
    	return null;
    }    
    
    
}