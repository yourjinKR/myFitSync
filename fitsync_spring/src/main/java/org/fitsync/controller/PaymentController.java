package org.fitsync.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.fitsync.domain.PaymentMethodVO;
import org.fitsync.domain.PaymentOrderVO;
import org.fitsync.domain.PaymentOrderWithMethodVO;
import org.fitsync.service.PaymentServiceImple;
import org.fitsync.service.ScheduledPaymentMonitor;
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
import org.springframework.web.bind.annotation.RequestParam;
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

    @Autowired
    private ScheduledPaymentMonitor scheduledPaymentMonitor;

    /**
     * 공통 응답 생성 헬퍼 메서드들
     */
    private ResponseEntity<Map<String, Object>> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    private ResponseEntity<Map<String, Object>> createSuccessResponse(String message) {
        return createSuccessResponse(message, null);
    }
    
    private ResponseEntity<Map<String, Object>> createErrorResponse(HttpStatus status, String message, String errorCode) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("errorCode", errorCode);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.status(status).body(response);
    }
    
    private Integer getMemberIdxFromSession(HttpSession session) {
        Object memberIdx = session.getAttribute("member_idx");
        return memberIdx != null ? (Integer) memberIdx : null;
    }

    /**
     * 결제창을 통해 생성한 빌링키를 발급 후 결제수단을 저장
     * @param body {method_key: string, method_provider: string, method_name?: string}
     * @return ResponseEntity<Map<String, Object>> - {success: boolean, message: string, data?: PaymentMethodVO, timestamp: number}
     */
    @PostMapping(value = "/bill/issue", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> issueBillingKey(@RequestBody Map<String, String> body, HttpSession session) throws IOException {
        
        Integer memberIdx = getMemberIdxFromSession(session);
        if (memberIdx == null) {
            return createErrorResponse(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.", "AUTHENTICATION_REQUIRED");
        }
        
        log.info("빌링키 발급 요청: " + body);
        
        String billingKey = body.get("method_key");
        String methodProvider = body.get("method_provider");
        String methodName = body.get("method_name");

        if (billingKey == null || methodProvider == null) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "필수 파라미터가 누락되었습니다. (method_key, method_provider)", "MISSING_PARAMETERS");
        }

        PaymentMethodVO vo = new PaymentMethodVO();
        vo.setMember_idx(memberIdx);
        vo.setMethod_key(billingKey);
        vo.setMethod_provider(methodProvider);
        vo.setMethod_name(methodName);
        
        try {
            int result = payService.saveBillingKey(vo);
            if (result > 0) {
                log.info("빌링키 저장 성공: " + billingKey);
                return createSuccessResponse("결제수단이 성공적으로 등록되었습니다.", vo);
            } else {
                log.error("빌링키 저장 실패: " + billingKey);
                return createErrorResponse(HttpStatus.BAD_REQUEST, "결제수단 등록에 실패했습니다.", "BILLING_KEY_SAVE_FAILED");
            }
        } catch (Exception e) {
            log.error("빌링키 저장 중 예외 발생: ", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다.", "INTERNAL_SERVER_ERROR");
        }
    }

    /**
     * 내 결제수단 목록 조회 (빌링키 제외)
     * @return ResponseEntity<Map<String, Object>> - {success: boolean, message: string, data: PaymentMethodVO[], timestamp: number}
     */
    @GetMapping("/bill/list")
    public ResponseEntity<Map<String, Object>> getPaymentMethods(HttpSession session) {
        Integer memberIdx = getMemberIdxFromSession(session);
        if (memberIdx == null) {
            return createErrorResponse(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.", "AUTHENTICATION_REQUIRED");
        }
        
        try {
            List<PaymentMethodVO> paymentMethods = payService.getPaymentMethods(memberIdx);
            return createSuccessResponse("결제수단 목록 조회 성공", paymentMethods);
            
        } catch (Exception e) {
            log.error("결제수단 목록 조회 중 오류 발생: ", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "결제수단 목록 조회 중 오류가 발생했습니다.", "FETCH_METHODS_FAILED");
        }
    }
    
    /**
     * 빌링키 정보 조회
     * @param body {method_idx: string}
     * @return ResponseEntity<Map<String, Object>> - {success: boolean, message: string, data?: Object, timestamp: number}
     */
    @PostMapping("/bill/info")
    public ResponseEntity<Map<String, Object>> getBillingKeyInfo(@RequestBody Map<String, String> body, HttpSession session) throws IOException {
        Integer memberIdx = getMemberIdxFromSession(session);
        if (memberIdx == null) {
            return createErrorResponse(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.", "AUTHENTICATION_REQUIRED");
        }
        
        String methodIdxStr = body.get("method_idx");
        if (methodIdxStr == null) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "method_idx는 필수 파라미터입니다.", "MISSING_METHOD_IDX");
        }
        
        try {
            int methodIdx = Integer.parseInt(methodIdxStr);
            Object result = payService.getBillingKeyInfo(methodIdx);
            
            log.info("빌링키 정보 조회 결과: " + result);
            return createSuccessResponse("빌링키 정보 조회 성공", result);
            
        } catch (NumberFormatException e) {
            log.error("method_idx 형식 오류: ", e);
            return createErrorResponse(HttpStatus.BAD_REQUEST, "잘못된 method_idx 형식입니다.", "INVALID_METHOD_IDX_FORMAT");
        } catch (Exception e) {
            log.error("빌링키 정보 조회 중 오류 발생: ", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "빌링키 정보 조회 중 오류가 발생했습니다.", "FETCH_BILLING_INFO_FAILED");
        }
    }
    
    /**
     * 빌링키로 즉시 결제
     * @param body {payment_id: string, method_idx: string}
     * @return ResponseEntity<Map<String, Object>> - {success: boolean, message: string, data?: PaymentResult, timestamp: number}
     */
    @PostMapping(value = "/bill/pay")
    public ResponseEntity<Map<String, Object>> payBillingKey(@RequestBody Map<String, String> body, HttpSession session) throws IOException {
        Integer memberIdx = getMemberIdxFromSession(session);
        if (memberIdx == null) {
            return createErrorResponse(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.", "AUTHENTICATION_REQUIRED");
        }
        
        String paymentId = body.get("payment_id");
        String methodIdxStr = body.get("method_idx");
        
        if (paymentId == null || methodIdxStr == null) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "필수 파라미터가 누락되었습니다. (payment_id, method_idx)", "MISSING_PARAMETERS");
        }
        
        log.info("즉시 결제 요청 - PaymentId: " + paymentId + ", MethodIdx: " + methodIdxStr);
        
        try {
            int methodIdx = Integer.parseInt(methodIdxStr);
            Object result = payService.payBillingKey(paymentId, methodIdx, memberIdx);
            
            log.info("결제 처리 결과: " + result);
            
            // 결과가 Map이고 success 필드를 체크
            if (result instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> resultMap = (Map<String, Object>) result;
                Boolean success = (Boolean) resultMap.get("success");
                
                if (success != null && success) {
                    return createSuccessResponse("결제가 성공적으로 처리되었습니다.", result);
                } else {
                    return createErrorResponse(HttpStatus.BAD_REQUEST, "결제 처리에 실패했습니다.", "PAYMENT_FAILED");
                }
            }
            
            return createSuccessResponse("결제 처리 완료", result);
            
        } catch (NumberFormatException e) {
            log.error("method_idx 형식 오류: ", e);
            return createErrorResponse(HttpStatus.BAD_REQUEST, "잘못된 method_idx 형식입니다.", "INVALID_METHOD_IDX_FORMAT");
        } catch (Exception e) {
            log.error("결제 처리 중 오류 발생: ", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "결제 처리 중 오류가 발생했습니다.", "PAYMENT_PROCESS_FAILED");
        }
    }
    
    /**
     * 빌링키로 결제 예약
     * @param body {payment_id: string, method_idx: number, schedule_datetime: string}
     * @return ResponseEntity<Map<String, Object>> - {success: boolean, message: string, data?: ScheduleResult, timestamp: number}
     */
    @PostMapping("/bill/schedule")
    public ResponseEntity<Map<String, Object>> scheduleBillingKey(@RequestBody Map<String, Object> body, HttpSession session) throws IOException {
        Integer memberIdx = getMemberIdxFromSession(session);
        if (memberIdx == null) {
            return createErrorResponse(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.", "AUTHENTICATION_REQUIRED");
        }
        
        String paymentId = (String) body.get("payment_id");
        Object methodIdxObj = body.get("method_idx");
        String scheduleDateTime = (String) body.get("schedule_datetime");
        
        // 필수 파라미터 검증
        if (paymentId == null || methodIdxObj == null || scheduleDateTime == null) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "필수 파라미터가 누락되었습니다. (payment_id, method_idx, schedule_datetime)", "MISSING_PARAMETERS");
        }
        
        try {
            int methodIdx = Integer.parseInt(methodIdxObj.toString());
            
            log.info("결제 예약 요청 - PaymentId: " + paymentId + ", MethodIdx: " + methodIdx + ", Schedule: " + scheduleDateTime);

            // 서비스 호출하여 예약 처리
            Object result = payService.scheduleBillingKey(paymentId, methodIdx, memberIdx, scheduleDateTime);
            
            return createSuccessResponse("결제 예약이 완료되었습니다.", result);
            
        } catch (NumberFormatException e) {
            log.error("숫자 형식 오류: ", e);
            return createErrorResponse(HttpStatus.BAD_REQUEST, "잘못된 숫자 형식입니다.", "INVALID_NUMBER_FORMAT");
        } catch (IllegalArgumentException e) {
            log.error("날짜 형식 오류: ", e);
            return createErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage(), "INVALID_DATE_FORMAT");
        } catch (Exception e) {
            log.error("결제 예약 중 오류 발생: ", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "결제 예약 처리 중 오류가 발생했습니다.", "SCHEDULE_FAILED");
        }
    }    

    /**
     * 결제 예약 취소
     * @param requestData {order_idx: number}
     * @return ResponseEntity<Map<String, Object>> - {success: boolean, message: string, data?: Object, timestamp: number}
     */
    @DeleteMapping("/bill/schedule")
    public ResponseEntity<Map<String, Object>> cancelBillingKey(@RequestBody Map<String, Object> requestData, HttpSession session) {
        Integer memberIdx = getMemberIdxFromSession(session);
        if (memberIdx == null) {
            return createErrorResponse(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.", "AUTHENTICATION_REQUIRED");
        }
        
        try {
            int orderIdx = Integer.parseInt(requestData.get("order_idx").toString());
            Object result = payService.cancelScheduledPayment(orderIdx, memberIdx);
            
            return createSuccessResponse("결제 예약이 취소되었습니다.", result);
            
        } catch (NumberFormatException e) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "잘못된 order_idx 형식입니다.", "INVALID_ORDER_IDX_FORMAT");
        } catch (Exception e) {
            log.error("결제 예약 취소 중 오류 발생: ", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "결제 예약 취소 중 오류가 발생했습니다.", "CANCEL_SCHEDULE_FAILED");
        }
    }

    /**
     * 결제수단 이름 변경
     * @param requestData {method_idx: number, method_name: string}
     * @return ResponseEntity<Map<String, Object>> - {success: boolean, message: string, timestamp: number}
     */
    @PatchMapping("/bill/rename")
    public ResponseEntity<Map<String, Object>> renameBillingKey(
            @RequestBody Map<String, Object> requestData,
            HttpSession session) {
        
        Integer memberIdx = getMemberIdxFromSession(session);
        if (memberIdx == null) {
            return createErrorResponse(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.", "AUTHENTICATION_REQUIRED");
        }
        
        log.info("결제수단 이름 변경 요청: " + requestData);
        
        try {
            // 요청 데이터 검증
            if (requestData.get("method_idx") == null || requestData.get("method_name") == null) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "필수 데이터가 누락되었습니다. (method_idx, method_name)", "MISSING_PARAMETERS");
            }
            
            int methodIdx = Integer.parseInt(requestData.get("method_idx").toString());
            String methodName = requestData.get("method_name").toString().trim();
            
            // 이름 길이 검증
            if (methodName.length() == 0 || methodName.length() > 50) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "결제수단 이름은 1~50자 사이여야 합니다.", "INVALID_METHOD_NAME_LENGTH");
            }
            
            // 서비스 호출하여 이름 변경
            boolean success = payService.renameBillingKey(memberIdx, methodIdx, methodName);
            
            if (success) {
                return createSuccessResponse("결제수단 이름이 성공적으로 변경되었습니다.");
            } else {
                return createErrorResponse(HttpStatus.NOT_FOUND, "결제수단을 찾을 수 없거나 변경 권한이 없습니다.", "METHOD_NOT_FOUND_OR_NO_PERMISSION");
            }
            
        } catch (NumberFormatException e) {
            log.error("잘못된 숫자 형식: ", e);
            return createErrorResponse(HttpStatus.BAD_REQUEST, "잘못된 데이터 형식입니다.", "INVALID_NUMBER_FORMAT");
        } catch (Exception e) {
            log.error("결제수단 이름 변경 중 오류 발생: ", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다.", "RENAME_FAILED");
        }
    }
    
    /**
     * 결제수단 삭제
     * @param requestData {method_idx: number}
     * @return ResponseEntity<Map<String, Object>> - {success: boolean, message: string, timestamp: number}
     */
    @DeleteMapping("/bill/delete")
    public ResponseEntity<Map<String, Object>> deletePaymentMethod(
            @RequestBody Map<String, Object> requestData,
            HttpSession session) {
        
        Integer memberIdx = getMemberIdxFromSession(session);
        if (memberIdx == null) {
            return createErrorResponse(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.", "AUTHENTICATION_REQUIRED");
        }
        
        try {
            // 요청 데이터 검증
            if (requestData.get("method_idx") == null) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "결제수단 ID가 누락되었습니다.", "MISSING_METHOD_IDX");
            }
            
            int methodIdx = Integer.parseInt(requestData.get("method_idx").toString());
            
            // 서비스 호출하여 결제수단 삭제
            boolean success = payService.deletePaymentMethod(memberIdx, methodIdx);
            
            if (success) {
                return createSuccessResponse("결제수단이 성공적으로 삭제되었습니다.");
            } else {
                return createErrorResponse(HttpStatus.NOT_FOUND, "결제수단을 찾을 수 없거나 삭제 권한이 없습니다.", "METHOD_NOT_FOUND_OR_NO_PERMISSION");
            }
            
        } catch (NumberFormatException e) {
            log.error("잘못된 숫자 형식: ", e);
            return createErrorResponse(HttpStatus.BAD_REQUEST, "잘못된 데이터 형식입니다.", "INVALID_NUMBER_FORMAT");
        } catch (Exception e) {
            log.error("결제수단 삭제 중 오류 발생: ", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다.", "DELETE_FAILED");
        }
    }

    /**
     * 결제수단 등록 전 중복 체크 API
     * @param body {billing_key: string}
     * @return ResponseEntity<Map<String, Object>> - {success: boolean, message: string, data?: DuplicateCheckResult, timestamp: number}
     */
    @PostMapping("/bill/check")
    public ResponseEntity<Map<String, Object>> checkDuplicatePaymentMethod(@RequestBody Map<String, String> body, HttpSession session) {
        Integer memberIdx = getMemberIdxFromSession(session);
        if (memberIdx == null) {
            return createErrorResponse(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.", "AUTHENTICATION_REQUIRED");
        }
        
        String billingKey = body.get("billing_key");
        if (billingKey == null || billingKey.trim().isEmpty()) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "billing_key는 필수 파라미터입니다.", "MISSING_BILLING_KEY");
        }
        
        try {
            log.info("중복 체크 요청 - 빌링키: " + billingKey + ", 회원ID: " + memberIdx);
            
            // 서비스 계층에서 비즈니스 로직 처리
            Map<String, Object> result = payService.checkDuplicatePaymentMethod(billingKey, memberIdx);
            
            log.info("중복 체크 결과: " + result);
            return createSuccessResponse("중복 체크 완료", result);
            
        } catch (Exception e) {
            log.error("중복 체크 중 오류 발생: ", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "중복 체크 중 오류가 발생했습니다.", "DUPLICATE_CHECK_FAILED");
        }
    }
    
    /**
     * 중복 처리 후 결제수단 저장 API  
     * @param body {billing_key: string, method_provider: string, method_name?: string, replace_existing: boolean}
     * @return ResponseEntity<Map<String, Object>> - {success: boolean, message: string, data?: PaymentMethodVO, timestamp: number}
     */
    @PostMapping("/bill/save")
    public ResponseEntity<Map<String, Object>> saveBillingKeyWithDuplicateHandling(@RequestBody Map<String, Object> body, HttpSession session) {
        Integer memberIdx = getMemberIdxFromSession(session);
        if (memberIdx == null) {
            return createErrorResponse(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.", "AUTHENTICATION_REQUIRED");
        }
        
        // 요청 데이터 검증
        String billingKey = (String) body.get("billing_key");
        String methodProvider = (String) body.get("method_provider");
        String methodName = (String) body.get("method_name");
        Boolean replaceExisting = (Boolean) body.get("replace_existing");
        
        if (billingKey == null || methodProvider == null || replaceExisting == null) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "필수 파라미터가 누락되었습니다. (billing_key, method_provider, replace_existing)", "MISSING_PARAMETERS");
        }
        
        try {
            log.info("중복 처리 후 저장 요청 - 빌링키: " + billingKey + ", 교체여부: " + replaceExisting);
            
            // VO 객체 생성
            PaymentMethodVO vo = new PaymentMethodVO();
            vo.setMember_idx(memberIdx);
            vo.setMethod_key(billingKey);
            vo.setMethod_provider(methodProvider);
            vo.setMethod_name(methodName);
            
            // 서비스 계층에서 비즈니스 로직 처리
            Map<String, Object> result = payService.saveBillingKeyWithDuplicateHandling(vo, replaceExisting);
            
            log.info("중복 처리 후 저장 결과: " + result);
            
            Boolean success = (Boolean) result.get("success");
            if (success != null && success) {
                return createSuccessResponse((String) result.get("message"), result.get("data"));
            } else {
                return createErrorResponse(HttpStatus.BAD_REQUEST, (String) result.get("message"), "SAVE_WITH_DUPLICATE_HANDLING_FAILED");
            }
            
        } catch (Exception e) {
            log.error("결제수단 저장 중 오류 발생: ", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "결제수단 저장 중 오류가 발생했습니다.", "SAVE_FAILED");
        }
    }
    
    /**
     * 사용자별 결제 기록 조회 API
     * @return ResponseEntity<Map<String, Object>> - {success: boolean, message: string, data: {history: PaymentOrderWithMethodVO[], totalCount: number}, timestamp: number}
     */
    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getPaymentHistory(HttpSession session) {
        Integer memberIdx = getMemberIdxFromSession(session);
        if (memberIdx == null) {
            return createErrorResponse(HttpStatus.UNAUTHORIZED, "사용자 인증이 필요합니다.", "AUTHENTICATION_REQUIRED");
        }
        
        try {
            List<PaymentOrderWithMethodVO> paymentHistory = payService.getPaymentHistoryWithMethod(memberIdx);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("history", paymentHistory);
            responseData.put("totalCount", paymentHistory.size());
            
            return createSuccessResponse("결제 기록 조회 성공", responseData);
            
        } catch (Exception e) {
            log.error("결제 기록 조회 중 오류 발생: ", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "결제 기록 조회 중 오류가 발생했습니다.", "PAYMENT_HISTORY_FETCH_FAILED");
        }
    }

    /**
     * 사용자별 결제 기록 조회 API2
     * @return ResponseEntity<Map<String, Object>> - {success: boolean, message: string, data: {history: PaymentOrderWithMethodVO[], totalCount: number}, timestamp: number}
     */
    @GetMapping("/history/v2")
    public ResponseEntity<Map<String, Object>> getPaymentHistory2(HttpSession session) {
        Integer memberIdx = getMemberIdxFromSession(session);
        if (memberIdx == null) {
            return createErrorResponse(HttpStatus.UNAUTHORIZED, "사용자 인증이 필요합니다.", "AUTHENTICATION_REQUIRED");
        }
        
        try {
            List<PaymentOrderVO> paymentHistory = payService.getPaymentHistory(memberIdx);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("history", paymentHistory);
            responseData.put("totalCount", paymentHistory.size());
            
            return createSuccessResponse("결제 기록 조회 성공", responseData);
            
        } catch (Exception e) {
            log.error("결제 기록 조회 중 오류 발생: ", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "결제 기록 조회 중 오류가 발생했습니다.", "PAYMENT_HISTORY_FETCH_FAILED");
        }
    }

    /**
     * 결제 예약 조회 (정기 결제 예약)
     * @return ResponseEntity<Map<String, Object>> - {success: boolean, message: string, data?: PaymentOrderWithMethodVO, timestamp: number}
     */
    @GetMapping("/bill/schedule")
    public ResponseEntity<Map<String, Object>> getScheduledPaymentOrder(HttpSession session) {
        Integer memberIdx = getMemberIdxFromSession(session);
        if (memberIdx == null) {
            return createErrorResponse(HttpStatus.UNAUTHORIZED, "사용자 인증이 필요합니다.", "AUTHENTICATION_REQUIRED");
        }
        
        try {
            PaymentOrderWithMethodVO scheduledOrder = payService.getScheduledPaymentOrder(memberIdx);
            log.info("예약 결제 조회 결과: " + scheduledOrder);
            
            if (scheduledOrder != null) {
                return createSuccessResponse("결제 예약 조회 성공", scheduledOrder);
            } else {
                return createSuccessResponse("결제 예약이 없습니다.", null);
            }
            
        } catch (Exception e) {
            log.error("결제 예약 조회 중 오류 발생: ", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "결제 예약 조회 중 오류가 발생했습니다.", "SCHEDULED_PAYMENT_FETCH_FAILED");
        }
    }

    /**
     * 해당 유저가 구독자인지 여부를 확인하는 API
     * @param session HTTP 세션
     * @return 구독 상태 정보
     */
    @GetMapping("/subscription")
    public ResponseEntity<Map<String, Object>> getSubscriptionStatus(HttpSession session) {
        log.info("=== 구독자 상태 확인 API 시작 ===");
        
        try {
            // 1. 세션에서 사용자 정보 조회
            Integer memberIdx = (Integer) session.getAttribute("member_idx");
            
            if (memberIdx == null) {
                log.warn("❌ 세션에 memberIdx 정보가 없음");
                return createErrorResponse(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.", "LOGIN_REQUIRED");
            }
            
            log.info("구독자 상태 확인 요청 - memberIdx: " + memberIdx);
            
            // 2. 구독 상태 확인 서비스 호출
            Map<String, Object> subscriptionInfo = payService.checkSubscriptionStatus(memberIdx);
            
            if (subscriptionInfo.containsKey("error")) {
                log.error("구독 상태 확인 서비스 오류: " + subscriptionInfo.get("message"));
                return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                    subscriptionInfo.get("message").toString(), 
                    "CHECK_FAILED");
            }
            
            // 3. 성공 응답 생성
            boolean isSubscriber = (Boolean) subscriptionInfo.get("isSubscriber");
            String message = isSubscriber ? 
                "구독자입니다. 단건 결제는 이용할 수 없습니다." : 
                "비구독자입니다. 구독권 구매가 가능합니다.";
            
            log.info("✅ 구독 상태 확인 완료 - memberIdx: " + memberIdx + 
                    ", isSubscriber: " + isSubscriber);
            
            return createSuccessResponse(message, subscriptionInfo);
            
        } catch (Exception e) {
            log.error("구독자 상태 확인 API 예외 발생", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                "구독 상태 확인 중 시스템 오류가 발생했습니다: " + e.getMessage(), 
                "SYSTEM_ERROR");
        }
    }

    // 최근 결제 내역 1개 불러오기 (paid or ready)
    @GetMapping("/history/recent")
    public ResponseEntity<Map<String, Object>> getRecentOrder(HttpSession session) {
        log.info("=== 구독자 상태 확인 API 시작 ===");
        
        try {
            // 1. 세션에서 사용자 정보 조회
            Integer memberIdx = (Integer) session.getAttribute("member_idx");
            
            if (memberIdx == null) {
                log.warn("❌ 세션에 memberIdx 정보가 없음");
                return createErrorResponse(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.", "LOGIN_REQUIRED");
            }
            
            log.info("구독자 상태 확인 요청 - memberIdx: " + memberIdx);
            
            // 2. 구독 상태 확인 서비스 호출
            PaymentOrderVO recentOrder = payService.getRecentOrder(memberIdx);
            return createSuccessResponse("정상적으로 불러옴", recentOrder);
            
            
        } catch (Exception e) {
            log.error("구독자 상태 확인 API 예외 발생", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                "구독 상태 확인 중 시스템 오류가 발생했습니다: " + e.getMessage(), 
                "SYSTEM_ERROR");
        }
    }


    @PostMapping("/monitor/manual")
    public ResponseEntity<String> triggerManualPaymentMonitor(@RequestParam(defaultValue = "false") boolean force) {
        if (force) {
            scheduledPaymentMonitor.processDailyPaymentBatch();
            return ResponseEntity.ok("✅ 결제 모니터링 강제 실행 완료 (forceRun=true)");
        } else {
            scheduledPaymentMonitor.processDailyPaymentBatch(); // monitorEnabled 값 따름
            return ResponseEntity.ok("✅ 결제 모니터링 실행 완료 (forceRun=false)");
        }
    }
}