package org.fitsync.controller;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.fitsync.domain.PaymentMethodVO;
import org.fitsync.service.PaymentServiceImple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
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
    @PostMapping(value = "/bill/issue", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> issueBillingKey(@RequestBody Map<String, String> body, HttpSession session) throws IOException {
    	
    	Object memberIdx = session.getAttribute("member_idx");
    	if (memberIdx == null) {
    		return ResponseEntity.badRequest().body("User not logged in");
    	}
    	
    	String billingKey = body.get("method_key");
		String methodProvider = body.get("method_provider");

		if (billingKey == null || methodProvider == null) {
			return ResponseEntity.badRequest().body("Missing required parameters");
		}

		PaymentMethodVO vo = new PaymentMethodVO();
		vo.setMember_idx((int) memberIdx);
		vo.setMethod_key(billingKey);
		vo.setMethod_provider(methodProvider);

		try {
			int result = payService.saveBillingKey(vo);
			if (result > 0) {
				log.info("Billing key saved successfully: " + billingKey);
				return ResponseEntity.ok(Map.of("success", true, "message", "Billing key saved successfully"));
			} else {
				log.error("Failed to save billing key: " + billingKey);
				return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to save billing key"));
			}
		} catch (Exception e) {
			log.error("Exception while saving billing key: ", e);
			return ResponseEntity.status(500).body(Map.of("success", false, "message", "Internal server error"));
		}
    }
    
    // 내 결제수단 목록 조회 (빌링키 제외)
    @GetMapping("/bill/list")
    public ResponseEntity<?> getPaymentMethods(HttpSession session) {
    	Object memberIdx = session.getAttribute("member_idx");
    	if (memberIdx == null) {
    		log.error("세션에 member_idx가 없습니다.");
    		return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not logged in"));
    	}
    	
    	try {
    		List<PaymentMethodVO> paymentMethods = payService.getPaymentMethods((int) memberIdx);
    		return ResponseEntity.ok(Map.of(
    			"success", true, 
    			"message", "Payment methods retrieved successfully",
    			"data", paymentMethods
    		));
    		
    	} catch (Exception e) {
    		log.error("결제수단 목록 조회 중 오류 발생: ", e);
    		return ResponseEntity.status(500).body(Map.of(
    			"success", false, 
    			"message", "Internal server error"
    		));
    	}
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