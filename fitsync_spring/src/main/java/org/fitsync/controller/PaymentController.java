package org.fitsync.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.fitsync.domain.PaymentMethodVO;
import org.fitsync.service.PaymentServiceImple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.jsonwebtoken.io.IOException;
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
    	
    	log.info(body);
    	String billingKey = body.get("method_key");
		String methodProvider = body.get("method_provider");
		String methodName = body.get("method_name");

		if (billingKey == null || methodProvider == null) {
			return ResponseEntity.badRequest().body("Missing required parameters");
		}

		PaymentMethodVO vo = new PaymentMethodVO();
		vo.setMember_idx((int) memberIdx);
		vo.setMethod_key(billingKey);
		vo.setMethod_provider(methodProvider);
		vo.setMethod_name(methodName);
		
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
    
    // 결제수단 이름 변경
    @PatchMapping("/bill/rename")
    public ResponseEntity<Map<String, Object>> renameBillingKey(
            @RequestBody Map<String, Object> requestData,
            HttpSession session) {
    	log.info(requestData);
    	
        try {
            // 세션에서 사용자 ID 가져오기
            Object memberIdxObj = session.getAttribute("member_idx");
            if (memberIdxObj == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
            
            int memberIdx = (Integer) memberIdxObj;
            
            // 요청 데이터 검증
            if (requestData.get("method_idx") == null || requestData.get("method_name") == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "필수 데이터가 누락되었습니다.");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            int methodIdx = Integer.parseInt(requestData.get("method_idx").toString());
            String methodName = requestData.get("method_name").toString().trim();
            
            // 이름 길이 검증
            if (methodName.length() == 0 || methodName.length() > 50) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "결제수단 이름은 1~50자 사이여야 합니다.");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // 서비스 호출하여 이름 변경
            boolean success = payService.renameBillingKey(memberIdx, methodIdx, methodName);
            
            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("success", true);
                response.put("message", "결제수단 이름이 성공적으로 변경되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "결제수단을 찾을 수 없거나 변경 권한이 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (NumberFormatException e) {
            log.error("잘못된 숫자 형식: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "잘못된 데이터 형식입니다.");
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("결제수단 이름 변경 중 오류 발생: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "서버 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // 결제수단 삭제
    @DeleteMapping("/bill/delete")
    public ResponseEntity<Map<String, Object>> deletePaymentMethod(
            @RequestBody Map<String, Object> requestData,
            HttpSession session) {
        try {
            // 세션에서 사용자 ID 가져오기
            Object memberIdxObj = session.getAttribute("member_idx");
            if (memberIdxObj == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
            
            int memberIdx = (Integer) memberIdxObj;
            
            // 요청 데이터 검증
            if (requestData.get("method_idx") == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "결제수단 ID가 누락되었습니다.");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            int methodIdx = Integer.parseInt(requestData.get("method_idx").toString());
            
            // 서비스 호출하여 결제수단 삭제
            boolean success = payService.deletePaymentMethod(memberIdx, methodIdx);
            
            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("success", true);
                response.put("message", "결제수단이 성공적으로 삭제되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "결제수단을 찾을 수 없거나 삭제 권한이 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (NumberFormatException e) {
            log.error("잘못된 숫자 형식: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "잘못된 데이터 형식입니다.");
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("결제수단 삭제 중 오류 발생: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "서버 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }


}