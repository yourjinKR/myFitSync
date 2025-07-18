package org.fitsync.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.fitsync.domain.PaymentMethodVO;
import org.fitsync.domain.PaymentOrderWithMethodVO;
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
    
    // 빌링키 정보
    @PostMapping("/bill/info")
    public ResponseEntity<?> getBillingKeyInfo(@RequestBody Map<String, String> body, HttpSession session) throws IOException {
    	Object sessionMemberIdx = session.getAttribute("member_idx");
    	if (sessionMemberIdx == null) {
    		log.error("세션에 member_idx가 없습니다.");
    		return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not logged in"));
    	}
    	
    	Object methodIdx = body.get("method_idx");
    	if (methodIdx == null) {
    		log.error("method_idx가 요청에 없습니다.");
    		return ResponseEntity.badRequest().body(Map.of("success", false, "message", "method_idx is required"));
    	}
    	
    	try {
    		int methodIdxInt = Integer.parseInt(methodIdx.toString());
    		Object result = payService.getBillingKeyInfo(methodIdxInt);
    		
    		log.info("빌링키 정보 조회 결과: " + result);
    		return ResponseEntity.ok(result);
    		
    	} catch (NumberFormatException e) {
    		log.error("method_idx 형식 오류: ", e);
    		return ResponseEntity.badRequest().body(Map.of(
    			"success", false, 
    			"message", "잘못된 method_idx 형식입니다."
    		));
    	} catch (Exception e) {
    		log.error("빌링키 정보 조회 중 오류 발생: ", e);
    		return ResponseEntity.status(500).body(Map.of(
    			"success", false, 
    			"message", "Internal server error: " + e.getMessage()
    		));
    	}
    }
    
    
    
    // 빌링키로 결제
    @PostMapping(value = "/bill/pay")
    public ResponseEntity<?> payBillingKey(@RequestBody Map<String, String> body, HttpSession session) throws IOException {
    	Object session_member_idx = session.getAttribute("member_idx");
    	String payment_id = body.get("payment_id");
    	String method_idx = body.get("method_idx");
    	 	
        log.info(payment_id + ", " + method_idx);
    	
    	try {
    		Object result = payService.payBillingKey(payment_id, Integer.parseInt(method_idx), (int)session_member_idx);
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
    public ResponseEntity<?> scheduleBillingKey(@RequestBody Map<String, Object> body, HttpSession session) throws IOException {
        Object memberIdxObj = session.getAttribute("member_idx");
        if (memberIdxObj == null) {
            log.error("세션에 member_idx가 없습니다.");
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not logged in"));
        }
        
        String paymentId = (String) body.get("payment_id");
        Object methodIdxObj = body.get("method_idx");
        String scheduleDateTime = (String) body.get("schedule_datetime");
        
        // 필수 파라미터 검증
        if (paymentId == null || methodIdxObj == null || scheduleDateTime == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false, 
                "message", "필수 파라미터가 누락되었습니다. (payment_id, method_idx, schedule_datetime)"
            ));
        }
        
        try {
            int methodIdx = Integer.parseInt(methodIdxObj.toString());
            int memberIdx = Integer.parseInt(memberIdxObj.toString());

            log.info("결제 예약 요청 - Payment ID: " + paymentId + ", Method Index: " + methodIdx + ", Member Index: " + memberIdx + ", Schedule: " + scheduleDateTime);

            // 서비스 호출하여 예약 처리
            Object result = payService.scheduleBillingKey(paymentId, methodIdx, memberIdx, scheduleDateTime);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "결제 예약이 완료되었습니다.");
            response.put("data", result);
            response.put("paymentId", paymentId);
            response.put("scheduleDateTime", scheduleDateTime);
            
            return ResponseEntity.ok(response);
            
        } catch (NumberFormatException e) {
            log.error("숫자 형식 오류: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false, 
                "message", "잘못된 숫자 형식입니다."
            ));
        } catch (IllegalArgumentException e) {
            log.error("날짜 형식 오류: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false, 
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("결제 예약 중 오류 발생: ", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "결제 예약 처리 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
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

    /**
     * 결제수단 등록 전 중복 체크 API
     * - 역할: 요청 검증, 세션 확인, 서비스 호출, 응답 형식 통일
     */
    @PostMapping("/bill/check-duplicate")
    public ResponseEntity<?> checkDuplicatePaymentMethod(@RequestBody Map<String, String> body, HttpSession session) {
        Object memberIdx = session.getAttribute("member_idx");
        if (memberIdx == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not logged in"));
        }
        
        String billingKey = body.get("billing_key");
        if (billingKey == null || billingKey.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "billing_key is required"));
        }
        
        try {
            log.info("중복 체크 요청 - 빌링키: " + billingKey + ", 회원ID: " + memberIdx);
            
            // 서비스 계층에서 비즈니스 로직 처리
            Map<String, Object> result = payService.checkDuplicatePaymentMethod(billingKey, (int) memberIdx);
            
            log.info("중복 체크 결과: " + result);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("중복 체크 중 오류 발생: ", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "중복 체크 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 중복 처리 후 결제수단 저장 API  
     * - 역할: 요청 검증, 세션 확인, VO 생성, 서비스 호출, 응답 형식 통일
     */
    @PostMapping("/bill/save-with-duplicate-handling")
    public ResponseEntity<?> saveBillingKeyWithDuplicateHandling(@RequestBody Map<String, Object> body, HttpSession session) {
        Object memberIdx = session.getAttribute("member_idx");
        if (memberIdx == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not logged in"));
        }
        
        // 요청 데이터 검증
        String billingKey = (String) body.get("billing_key");
        String methodProvider = (String) body.get("method_provider");
        String methodName = (String) body.get("method_name");
        Boolean replaceExisting = (Boolean) body.get("replace_existing");
        
        if (billingKey == null || methodProvider == null || replaceExisting == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Missing required parameters"));
        }
        
        try {
            log.info("중복 처리 후 저장 요청 - 빌링키: " + billingKey + ", 교체여부: " + replaceExisting);
            
            // VO 객체 생성
            PaymentMethodVO vo = new PaymentMethodVO();
            vo.setMember_idx((int) memberIdx);
            vo.setMethod_key(billingKey);
            vo.setMethod_provider(methodProvider);
            vo.setMethod_name(methodName);
            
            // 서비스 계층에서 비즈니스 로직 처리
            Map<String, Object> result = payService.saveBillingKeyWithDuplicateHandling(vo, replaceExisting);
            
            log.info("중복 처리 후 저장 결과: " + result);
            
            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            log.error("결제수단 저장 중 오류 발생: ", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "결제수단 저장 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 사용자별 결제 기록 조회 API
     * - 역할: 세션 확인, 서비스 호출, 응답 형식 통일
     */
    @GetMapping("/history")
    public ResponseEntity<?> getPaymentHistory(HttpSession session) {
        Object memberIdx = session.getAttribute("member_idx");
        if (memberIdx == null) {
            log.error("세션에 member_idx가 없습니다.");
            return ResponseEntity.badRequest().body(Map.of(
                "success", false, 
                "message", "사용자 인증이 필요합니다.",
                "errorCode", "AUTHENTICATION_REQUIRED"
            ));
        }
        
        try {
            List<PaymentOrderWithMethodVO> paymentHistory = payService.getPaymentHistoryWithMethod((int) memberIdx);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "결제 기록 조회 성공",
                "data", paymentHistory,
                "totalCount", paymentHistory.size()
            ));
            
        } catch (Exception e) {
            log.error("결제 기록 조회 중 오류 발생: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "결제 기록 조회 중 오류가 발생했습니다.",
                "error", e.getClass().getSimpleName(),
                "errorCode", "PAYMENT_HISTORY_FETCH_FAILED"
            ));
        }
    }
    
}