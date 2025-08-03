package org.fitsync.service;

import java.net.http.HttpResponse;
import java.util.*;

import org.fitsync.domain.ApiLogVO;
import org.fitsync.domain.PaymentMethodVO;
import org.fitsync.domain.PaymentOrderVO;
import org.fitsync.domain.PaymentOrderWithMethodVO;
import org.fitsync.mapper.ApiLogMapper;
import org.fitsync.mapper.PaymentMethodMapper;
import org.fitsync.mapper.PaymentOrderMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.log4j.Log4j;

import java.io.IOException;
import java.math.BigDecimal;

@Log4j
@Service
public class PaymentServiceImple implements PaymentService {
    
	@Autowired
	private PaymentMethodMapper paymentMethodMapper;
	
	@Autowired
	private PaymentOrderMapper paymentOrderMapper;
	
	@Autowired
	private PortOneApiClient portOneApiClient;

	@Autowired
	private ApiLogMapper apiLogMapper;
	
	@Value("${payment.subscribe.cost}")
    private int subscribeCost;
	
	/**
	 * DB 연결 및 매퍼 상태 테스트
	 */
	public Map<String, Object> testDatabaseConnection() {
		Map<String, Object> result = new HashMap<>();
		
		try {
			log.info("=== DB 연결 테스트 시작 ===");
			
			// 매퍼 null 체크
			result.put("paymentMethodMapper", paymentMethodMapper != null ? "OK" : "NULL");
			result.put("paymentOrderMapper", paymentOrderMapper != null ? "OK" : "NULL");
			result.put("portOneApiClient", portOneApiClient != null ? "OK" : "NULL");
			
			// 간단한 조회 테스트 (존재하지 않는 memberIdx로 테스트)
			try {
				List<PaymentMethodVO> testMethods = paymentMethodMapper.selectByMemberIdx(99999);
				result.put("paymentMethodQuery", "SUCCESS - Count: " + (testMethods != null ? testMethods.size() : "NULL"));
			} catch (Exception e) {
				result.put("paymentMethodQuery", "FAILED - " + e.getMessage());
			}
			
			try {
				List<PaymentOrderVO> testOrders = paymentOrderMapper.selectPaymentOrdersByMember(99999);
				result.put("paymentOrderQuery", "SUCCESS - Count: " + (testOrders != null ? testOrders.size() : "NULL"));
			} catch (Exception e) {
				result.put("paymentOrderQuery", "FAILED - " + e.getMessage());
			}
			
			result.put("overallStatus", "COMPLETED");
			log.info("DB 연결 테스트 결과: " + result);
			
		} catch (Exception e) {
			log.error("DB 연결 테스트 중 오류: ", e);
			result.put("overallStatus", "ERROR");
			result.put("error", e.getMessage());
		}
		
		return result;
	}
	
	// 결제수단 등록 (카드 정보 포함)
	@Override
	public int saveBillingKey(PaymentMethodVO vo) {
		try {
			// 빌링키로 카드 정보 조회
			Map<String, Object> cardInfo = getCardInfoByBillingKey(vo.getMethod_key());
			
			// methodType 확인
			String methodType = (String) cardInfo.get("methodType");
			
			// 카드 결제인 경우에만 카드 정보 설정
			if ("card".equals(methodType)) {
				String cardName = (String) cardInfo.get("name");
				String cardNumber = (String) cardInfo.get("number");
				
				vo.setMethod_card(cardName != null ? cardName : "알 수 없는 카드");
				vo.setMethod_card_num(cardNumber != null ? cardNumber : "****-****-****-****");
				
				log.info("카드 정보와 함께 결제수단 저장: " + cardName + " (" + cardNumber + ")");
			} else {
				// 간편결제 등 카드가 아닌 경우 null로 설정
				vo.setMethod_card(null);
				vo.setMethod_card_num(null);
				
				log.info("간편결제 수단 저장 - 타입: " + methodType);
			}
			
			return paymentMethodMapper.insertPaymentMethod(vo);
			
		} catch (Exception e) {
			log.error("결제수단 저장 중 오류 발생: ", e);
			// 카드 정보 조회 실패 시에도 기본값으로 저장 시도
			vo.setMethod_card("정보 조회 실패");
			vo.setMethod_card_num("****-****-****-****");
			return paymentMethodMapper.insertPaymentMethod(vo);
		}
	}
	
	// 결제수단 불러오기 (빌링키 제외)
	@Override
	public List<PaymentMethodVO> getPaymentMethods(int memberIdx) {
		try {
			log.info("=== 결제수단 조회 시작 ===");
			log.info("Member ID: " + memberIdx);
			
			if (paymentMethodMapper == null) {
				log.error("PaymentMethodMapper가 null입니다!");
				throw new RuntimeException("PaymentMethodMapper가 초기화되지 않았습니다.");
			}
			
			List<PaymentMethodVO> methods = paymentMethodMapper.selectByMemberIdx(memberIdx);
			
			if (methods == null) {
				log.warn("결제수단이 null로 반환되었습니다.");
				return new ArrayList<>();
			}
			
			log.info("결제수단 조회 완료 - memberIdx: " + memberIdx + ", 건수: " + methods.size());
			
			for (int i = 0; i < methods.size(); i++) {
				PaymentMethodVO method = methods.get(i);
				log.info("결제수단[" + i + "] - MethodIdx: " + method.getMethod_idx() + 
						", Provider: " + method.getMethod_provider() + 
						", Card: " + method.getMethod_card());
			}
			
			return methods;
			
		} catch (Exception e) {
			log.error("결제수단 조회 중 오류 발생 - memberIdx: " + memberIdx, e);
			e.printStackTrace();
			throw new RuntimeException("결제수단 조회 실패: " + e.getMessage(), e);
		}
	}
	
	// 빌링키 정보 가져오기
	@Override
	public Object getBillingKeyInfo(int methodIdx) {
		try {
			String billingKey = paymentMethodMapper.selectBillingKeyByMethodIdx(methodIdx).getMethod_key();
			
			HttpResponse<String> response = portOneApiClient.getBillingKeyInfo(billingKey);
			
			if (portOneApiClient.isSuccessResponse(response)) {
				// JSON 응답을 Map으로 파싱
				ObjectMapper objectMapper = new ObjectMapper();
				@SuppressWarnings("unchecked")
				Map<String, Object> responseData = objectMapper.readValue(response.body(), Map.class);
				
				// 카드 정보 추출
				Map<String, Object> cardInfo = extractMethodInfo(responseData);
				
				// 성공 응답 반환
				Map<String, Object> result = new HashMap<>();
				result.put("statusCode", response.statusCode());
				result.put("success", true);
				result.put("data", responseData);
				result.put("cardInfo", cardInfo);  // 추출된 카드 정보 추가
				result.put("message", "빌링키 정보 조회 성공");
				
				return result;
			} else {
				// 실패 응답
				Map<String, Object> result = new HashMap<>();
				result.put("statusCode", response.statusCode());
				result.put("success", false);
				result.put("data", response.body());
				result.put("message", "빌링키 정보 조회 실패");
				return result;
			}
			
		} catch (Exception e) {
			log.error("빌링키 정보 조회 중 오류 발생: ", e);
			Map<String, Object> errorResult = new HashMap<>();
			errorResult.put("success", false);
			errorResult.put("message", "빌링키 정보 조회 실패: " + e.getMessage());
			errorResult.put("error", e.getClass().getSimpleName());
			return errorResult;
		}
	}
	
	/**
	 * PortOne API 응답에서 결제 수단 정보를 추출하는 메서드 (빌링키 조회 & 결제 단건 조회 모두 지원)
	 * @param responseData PortOne API 응답 데이터
	 * @return 추출된 카드 정보 (name, number, publisher, issuer, pgProvider 등)
	 */
	@SuppressWarnings("unchecked")
	private Map<String, Object> extractMethodInfo(Map<String, Object> responseData) {
		Map<String, Object> methodInfo = new HashMap<>();
		
		try {
			Map<String, Object> card = null;
			String methodType = null;
			
			// 1. 결제 단건 조회 응답 구조 체크 (method 객체)
			Map<String, Object> method = (Map<String, Object>) responseData.get("method");
			if (method != null) {
				methodType = (String) method.get("type");
				if ("PaymentMethodCard".equals(methodType)) {
					card = (Map<String, Object>) method.get("card");
					log.info("결제 단건 조회 응답에서 카드 정보 추출 시도");
				}
			}
			
			// 2. 빌링키 조회 응답 구조 체크 (methods 배열)
			if (card == null) {
				List<Map<String, Object>> methods = (List<Map<String, Object>>) responseData.get("methods");
				List<Map<String, Object>> channels = (List<Map<String, Object>>) responseData.get("channels");
				if (methods != null && !methods.isEmpty()) {
					// 첫번째 요소 가져오기
					Map<String, Object> firstMethod = methods.get(0);
					Map<String, Object> firstChannel = channels.get(0);

					methodType = (String) firstMethod.get("type");
					// 카드 결제
					if ("BillingKeyPaymentMethodCard".equals(methodType)) {
						card = (Map<String, Object>) firstMethod.get("card");
					}
					// 간편결제
					else if ("BillingKeyPaymentMethodEasyPay".equals(methodType)) {
						methodInfo.put("pgProvider", firstChannel.get("pgProvider"));
					} 
					// 알 수 없는 결제 수단 타입
					else {
						log.warn("알 수 없는 결제 수단 타입: " + methodType);
					}
				}
			}
			
			// 3. 카드 정보 추출
			if (card != null) {
				methodInfo.put("name", card.get("name"));           // 카드 이름 (예: "기업은행카드")
				methodInfo.put("number", card.get("number"));       // 카드 번호 (마스킹됨)
				methodInfo.put("publisher", card.get("publisher")); // 발행사
				methodInfo.put("issuer", card.get("issuer"));       // 발급사
				methodInfo.put("brand", card.get("brand"));         // 브랜드
				methodInfo.put("type", card.get("type"));           // 카드 타입 (DEBIT/CREDIT)
				methodInfo.put("bin", card.get("bin"));             // BIN 코드
				
				log.info("카드 정보 추출 성공 - 방식: " + methodType + ", 카드명: " + card.get("name"));
			}

			// 간편결제("PaymentMethodEasyPay")일 경우 카드 정보를 담지 않음
			if ("PaymentMethodEasyPay".equals(methodType)) {
				log.info("간편결제 방식으로 카드 정보가 없습니다.");
				methodInfo.put("name", null);
				methodInfo.put("number", null);
				methodInfo.put("publisher", null);
				methodInfo.put("issuer", null);
			}

			// 결제 수단 타입 저장
			switch (methodType) {
				case "PaymentMethodCard":
					methodInfo.put("methodType", "card");
					break;
				case "PaymentMethodEasyPay":
					methodInfo.put("methodType", "easyPay");
					break;
				case "BillingKeyPaymentMethodCard":
					methodInfo.put("methodType", "card");
					break;
				case "BillingKeyPaymentMethodEasyPay":
					methodInfo.put("methodType", "easyPay");
					break;
				default:
					break;
			}
			
			// 4. 카드 정보가 없는 경우 기본값 설정
			if (methodInfo.isEmpty()) {
				methodInfo.put("name", "알 수 없는 카드");
				methodInfo.put("number", "****-****-****-****");
				methodInfo.put("publisher", "UNKNOWN");
				methodInfo.put("issuer", "UNKNOWN");
				log.warn("카드 정보를 찾을 수 없어 기본값 설정");
			}
			
		} catch (Exception e) {
			log.error("카드 정보 추출 중 오류 발생: ", e);
			methodInfo.put("name", "정보 추출 실패");
			methodInfo.put("number", "****-****-****-****");
			methodInfo.put("error", e.getMessage());
		}
		
		log.info("추출된 카드 정보: " + methodInfo);
		return methodInfo;
	}

	// 채널키 매칭
	public String getChannelKey(String channelType) {
		return portOneApiClient.getChannelKey(channelType);
	}
	
	// 빌링키로 결제 (api key, payment id, billing key == method key, channel key, ordername, amount, currency 
	@Override
	@Transactional
	public Object payBillingKey(String paymentId, int methodIdx, int memberIdx) {
	    PaymentOrderVO order = null;
	    
	    try {
	        // 1. 결제수단 정보 조회
			PaymentMethodVO method = paymentMethodMapper.selectByMethodIdx(methodIdx);
			if (method == null) {
			    log.error("결제수단을 찾을 수 없습니다. methodIdx: " + methodIdx);
			    Map<String, Object> errorResult = new HashMap<>();
			    errorResult.put("success", false);
			    errorResult.put("message", "결제수단을 찾을 수 없습니다.");
			    return errorResult;
			}
			
			String billingKey = method.getMethod_key();
			String channelKey = getChannelKey(method.getMethod_provider());
			
			log.info("결제 시작 - PaymentId: " + paymentId + ", BillingKey: " + billingKey + ", ChannelKey: " + channelKey);

			// 2. 결제 주문 정보 사전 저장 (READY 상태)
			order = new PaymentOrderVO();
			order.setMember_idx(memberIdx);
			order.setMethod_idx(methodIdx);
			order.setPayment_id(paymentId);
			order.setOrder_type("DIRECT");
			order.setOrder_status("READY");
			order.setOrder_name("FitSync Premium");
			order.setOrder_price(subscribeCost);
			order.setOrder_currency("KRW");
			order.setOrder_regdate(new java.sql.Date(System.currentTimeMillis()));
			
			System.out.println("provider!!!!!!!!! : " + method.getMethod_provider());
			order.setOrder_provider(method.getMethod_provider());
			String card = method.getMethod_card();
			System.out.println("card!!!!!!!!! : " + card);
			if (card != null) {
				order.setOrder_card(card);
			}
			String cardNum = method.getMethod_card_num();
			System.out.println("cardNum !!!!!!!!! : " + cardNum);
			if (cardNum != null) {
				order.setOrder_card_num(cardNum);
			}

			try {
			    paymentOrderMapper.insertPaymentOrder(order);
			    log.info("결제 주문 정보 저장 완료 - PaymentId: " + paymentId);
			    log.info("생성된 order_idx: " + order.getOrder_idx());
			    
			    if (order.getOrder_idx() <= 0) {
			        log.error("order_idx가 생성되지 않았습니다: " + order.getOrder_idx());
			    }
			    
			} catch (Exception dbEx) {
			    log.error("결제 주문 정보 저장 실패: ", dbEx);
			    Map<String, Object> errorResult = new HashMap<>();
			    errorResult.put("success", false);
			    errorResult.put("message", "결제 주문 정보 저장 실패: " + dbEx.getMessage());
			    return errorResult;
			}

			// 3. PortOne API 호출
			HttpResponse<String> response = portOneApiClient.payWithBillingKey(
				paymentId, billingKey, channelKey, "fitsync 구독", subscribeCost
			);
	    		
	    	// 4. 응답 처리 및 주문 상태 업데이트
	    	boolean isSuccess = portOneApiClient.isSuccessResponse(response);
	    	String orderStatus = isSuccess ? "PAID" : "FAILED";
	    	
	    	log.info("=== 결제 상태 업데이트 시작 ===");
	    	log.info("결제 결과 - isSuccess: " + isSuccess + ", orderStatus: " + orderStatus);
	    	log.info("업데이트할 주문 정보 - payment_id: " + paymentId + ", order_idx: " + order.getOrder_idx());
	    	
	    	// 주문 상태 업데이트
	    	order.setOrder_status(orderStatus);
	    	if (isSuccess) {
	    	    order.setOrder_paydate(new java.sql.Date(System.currentTimeMillis()));
	    	    log.info("결제 성공 - 결제일시 설정: " + order.getOrder_paydate());
	    	}
	    	
	    	log.info("업데이트 직전 order 객체 전체: " + order);
	    	
	    	try {
				log.info("결제 주문 정보 업데이트 - " + order);
	    	    paymentOrderMapper.updatePaymentStatus(order);
				System.out.println("결제 완료했으니 상태 변경함." + orderStatus);
	    	    log.info("결제 상태 업데이트 완료 - PaymentId: " + paymentId + ", Status: " + orderStatus);
	    	    
	    	    // 업데이트 후 실제 DB 상태 확인
	    	    try {
	    	        PaymentOrderVO updatedOrder = paymentOrderMapper.selectByPaymentId(paymentId);
	    	        if (updatedOrder != null) {
	    	            log.info("업데이트 후 DB 상태: " + updatedOrder);
	    	            if (!"PAID".equals(updatedOrder.getOrder_status()) && isSuccess) {
	    	                log.error("업데이트가 반영되지 않았습니다! 예상: PAID, 실제: " + updatedOrder.getOrder_status());
	    	            }
	    	        } else {
	    	            log.error("업데이트 후 주문을 찾을 수 없습니다!");
	    	        }
	    	    } catch (Exception selectEx) {
	    	        log.error("업데이트 후 조회 실패: ", selectEx);
	    	    }
	    	    
	    	    // 🎯 단건 결제 성공 시 다음 달 자동 결제 예약
	    	    if (isSuccess && "DIRECT".equals(order.getOrder_type())) {
	    	        try {
	    	            log.info("🎯 단건 결제 성공 - 다음 달 자동 결제 예약 시작");
	    	            Object autoScheduleResult = scheduleNextMonthPayment(order);
	    	            
	    	            @SuppressWarnings("unchecked")
	    	            Map<String, Object> scheduleResult = (Map<String, Object>) autoScheduleResult;
	    	            boolean autoSuccess = (boolean) scheduleResult.get("success");
	    	            
	    	            if (autoSuccess) {
	    	                log.info("✅ 단건 결제 후 다음 달 자동 예약 성공 - PaymentId: " + paymentId + 
	    	                        ", NextPaymentId: " + scheduleResult.get("paymentId"));
	    	            } else {
	    	                log.warn("⚠️ 단건 결제 후 다음 달 자동 예약 실패 - PaymentId: " + paymentId + 
	    	                        ", Reason: " + scheduleResult.get("message"));
	    	            }
	    	        } catch (Exception autoEx) {
	    	            log.error("❌ 단건 결제 후 자동 예약 중 예외 발생 - PaymentId: " + paymentId, autoEx);
	    	        }
	    	    }
	    	    
	    	} catch (Exception updateEx) {
	    	    log.error("결제 상태 업데이트 실패: ", updateEx);
				System.out.println("업데이트 중 오류 발생함." + updateEx.getMessage());
	    	    updateEx.printStackTrace();
	    	    // 결제는 성공했지만 상태 업데이트 실패한 경우 별도 처리 필요
	    	}
	    		
	    	// 5. JSON 응답 파싱 및 결과 반환
	    	try {
	    		ObjectMapper objectMapper = new ObjectMapper();
	    		Object responseData = objectMapper.readValue(response.body(), Object.class);
	    			
	    		Map<String, Object> result = new HashMap<>();
	    		result.put("statusCode", response.statusCode());
	    		result.put("success", isSuccess);
	    		result.put("data", responseData);
	    		result.put("message", isSuccess ? "Payment successful" : "Payment failed");
	    		result.put("paymentId", paymentId);
	    		result.put("orderStatus", orderStatus);
	    			
	    		return result;
	    		
	    	} catch (Exception jsonEx) {
	    		log.error("JSON 파싱 실패: ", jsonEx);
	    		Map<String, Object> result = new HashMap<>();
	    		result.put("statusCode", response.statusCode());
	    		result.put("success", false);
	    		result.put("data", response.body());
	    		result.put("message", "Failed to parse response");
	    		result.put("paymentId", paymentId);
	    		return result;
	    	}
	    		
	    } catch (IOException | InterruptedException e) {
	        log.error("PortOne API 호출 실패: ", e);
	        
	        // API 호출 실패 시 주문 상태를 FAILED로 업데이트
	        if (order != null) {
	            try {
	                order.setOrder_status("FAILED");
	                paymentOrderMapper.updatePaymentStatus(order);
	                log.info("API 실패로 인한 주문 상태 업데이트 완료 - PaymentId: " + paymentId);
	            } catch (Exception updateEx) {
	                log.error("API 실패 후 주문 상태 업데이트 실패: ", updateEx);
	            }
	        }
	        
	        Map<String, Object> errorResult = new HashMap<>();
	        errorResult.put("success", false);
	        errorResult.put("message", "Request failed: " + e.getMessage());
	        errorResult.put("error", e.getClass().getSimpleName());
	        errorResult.put("paymentId", paymentId);
	        return errorResult;
	    } catch (Exception e) {
	        log.error("예상치 못한 오류 발생: ", e);
	        
	        // 예상치 못한 오류 시 주문 상태를 FAILED로 업데이트
	        if (order != null) {
	            try {
	                order.setOrder_status("FAILED");
	                paymentOrderMapper.updatePaymentStatus(order);
	            } catch (Exception updateEx) {
	                log.error("예외 발생 후 주문 상태 업데이트 실패: ", updateEx);
	            }
	        }
	        
	        Map<String, Object> errorResult = new HashMap<>();
	        errorResult.put("success", false);
	        errorResult.put("message", "Unexpected error: " + e.getMessage());
	        errorResult.put("error", e.getClass().getSimpleName());
	        errorResult.put("paymentId", paymentId);
	        return errorResult;
	    }
	}

	// 빌링키 결제 예약
	@Override
	@Transactional
	public Object scheduleBillingKey(String paymentId, int methodIdx, int memberIdx, String scheduleDateTime) {
		log.info("=== 결제 예약 시작 ===");
		log.info("PaymentId: " + paymentId + ", MethodIdx: " + methodIdx + ", MemberIdx: " + memberIdx + ", ScheduleDateTime: " + scheduleDateTime);
		
		try {
			// 1. 결제수단 정보 조회
			PaymentMethodVO method = paymentMethodMapper.selectByMethodIdx(methodIdx);
			if (method == null) {
				log.error("결제수단을 찾을 수 없습니다. methodIdx: " + methodIdx);
				return createErrorResponse("결제수단을 찾을 수 없습니다.", paymentId);
			}
			
			String billingKey = method.getMethod_key();
			String channelKey = getChannelKey(method.getMethod_provider());
			
			log.info("결제수단 정보 - BillingKey: " + billingKey + ", Provider: " + method.getMethod_provider() + ", ChannelKey: " + channelKey);
			
			// 2. 날짜/시간 처리 및 유효성 검증
			String apiTimeToPay = processScheduleDateTime(scheduleDateTime);
			if (apiTimeToPay == null) {
				return createErrorResponse("잘못된 날짜 형식이거나 시간이 유효하지 않습니다.", paymentId);
			}
			
			// 3. PortOne API 호출 먼저 실행
			log.info("=== PortOne API 호출 시작 ===");
			HttpResponse<String> response = portOneApiClient.createPaymentSchedule(
				paymentId, billingKey, channelKey, "FitSync Premium", subscribeCost, apiTimeToPay
			);
			
			// 4. API 응답 처리
			if (portOneApiClient.isSuccessResponse(response)) {
				String scheduleId = extractScheduleId(response.body());
				
				if (scheduleId != null) {
					log.info("PortOne API 성공 - ScheduleId: " + scheduleId);
					
					// 5. DB에 모든 정보를 한 번에 저장 (schedule_id 포함)
					PaymentOrderVO order = createScheduleOrder(paymentId, methodIdx, memberIdx, method, scheduleDateTime, scheduleId);
					
					log.info("=== DB 저장 시작 ===");
					log.info("저장할 주문 정보: " + order.toString());
					
					try {
						paymentOrderMapper.insertPaymentOrder(order);
						log.info("DB Insert 완료 - Auto-generated OrderIdx: " + order.getOrder_idx());
					} catch (Exception dbEx) {
						log.error("DB Insert 실패: ", dbEx);
						dbEx.printStackTrace();
						
						// DB 저장 실패 시 PortOne 예약도 취소 시도
						try {
							portOneApiClient.cancelPaymentSchedule(scheduleId);
							log.info("DB 저장 실패로 인한 PortOne 예약 취소 완료");
						} catch (Exception cancelEx) {
							log.error("PortOne 예약 취소 실패: ", cancelEx);
						}
						
						return createErrorResponse("DB 저장 실패: " + dbEx.getMessage(), paymentId);
					}
					
					if (order.getOrder_idx() == 0) {
						log.error("주문 정보 저장 실패 - OrderIdx가 0입니다");
						
						// OrderIdx 생성 실패 시 PortOne 예약도 취소 시도
						try {
							portOneApiClient.cancelPaymentSchedule(scheduleId);
							log.info("OrderIdx 생성 실패로 인한 PortOne 예약 취소 완료");
						} catch (Exception cancelEx) {
							log.error("PortOne 예약 취소 실패: ", cancelEx);
						}
						
						return createErrorResponse("주문 정보 저장에 실패했습니다.", paymentId);
					}
					
					log.info("주문 정보 저장 완료 - OrderIdx: " + order.getOrder_idx());
					
					// 저장 후 실제 DB에서 조회해서 확인
					try {
						PaymentOrderVO savedOrder = paymentOrderMapper.selectByOrderIdx(order.getOrder_idx());
						if (savedOrder != null) {
							log.info("DB 저장 검증 성공 - 저장된 데이터: PaymentId=" + savedOrder.getPayment_id() + 
									", Status=" + savedOrder.getOrder_status() + ", Type=" + savedOrder.getOrder_type() +
									", ScheduleId=" + savedOrder.getSchedule_id() + ", ScheduleDate=" + savedOrder.getSchedule_date());
						} else {
							log.warn("DB 저장 검증 실패 - 저장된 데이터를 찾을 수 없습니다");
						}
					} catch (Exception verifyEx) {
						log.warn("DB 저장 검증 중 오류: " + verifyEx.getMessage());
					}
					
					log.info("결제 예약 성공 - ScheduleId: " + scheduleId);
					return createSuccessResponse(paymentId, scheduleId, scheduleDateTime, order.getOrder_idx());
					
				} else {
					log.error("schedule_id 추출 실패 - API Response: " + response.body());
					return createErrorResponse("예약 등록에 실패했습니다. (schedule_id 추출 실패)", paymentId);
				}
			} else {
				log.error("PortOne API 호출 실패 - Status: " + response.statusCode() + ", Body: " + response.body());
				return createErrorResponse("결제 예약 API 호출에 실패했습니다.", paymentId);
			}
			
		} catch (Exception e) {
			log.error("결제 예약 중 예외 발생: ", e);
			return createErrorResponse("결제 예약 처리 중 오류가 발생했습니다: " + e.getMessage(), paymentId);
		}
	}
	
	/**
	 * 스케줄 날짜/시간 처리 및 유효성 검증
	 */
	private String processScheduleDateTime(String scheduleDateTime) {
		try {
			// 한국 시간대 설정
			java.time.ZoneId koreaZone = java.time.ZoneId.of("Asia/Seoul");
			java.time.LocalDateTime scheduleTime;
			
			// 입력 형식 처리: "yyyy-MM-dd HH:mm:ss" 또는 "yyyy-MM-ddTHH:mm:ss"
			if (scheduleDateTime.contains("T")) {
				scheduleTime = java.time.LocalDateTime.parse(scheduleDateTime);
			} else {
				scheduleTime = java.time.LocalDateTime.parse(scheduleDateTime.replace(" ", "T"));
			}
			
			// 한국 시간대로 변환
			java.time.ZonedDateTime koreaZonedTime = scheduleTime.atZone(koreaZone);
			
			// 현재 시간과 비교하여 유효성 검사
			java.time.ZonedDateTime nowKorea = java.time.ZonedDateTime.now(koreaZone);
			if (koreaZonedTime.isBefore(nowKorea) || koreaZonedTime.isEqual(nowKorea)) {
				log.error("예약 시간이 현재 시간보다 이전입니다 - 현재: " + nowKorea + ", 예약: " + koreaZonedTime);
				return null;
			}
			
			// PortOne API 형식으로 변환 (ISO 8601 형식)
			String apiTimeToPay = koreaZonedTime.format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME);
			
			log.info("시간 처리 완료 - 입력: " + scheduleDateTime + ", API 형식: " + apiTimeToPay);
			return apiTimeToPay;
			
		} catch (Exception e) {
			log.error("날짜 형식 오류 - 입력값: " + scheduleDateTime, e);
			return null;
		}
	}
	
	/**
	 * 스케줄 주문 정보 생성 (schedule_id 포함)
	 */
	private PaymentOrderVO createScheduleOrder(String paymentId, int methodIdx, int memberIdx, PaymentMethodVO method, String scheduleDateTime, String scheduleId) {
		PaymentOrderVO order = new PaymentOrderVO();
		order.setMember_idx(memberIdx);
		order.setMethod_idx(methodIdx);
		order.setPayment_id(paymentId);
		order.setOrder_type("SCHEDULE");
		order.setOrder_status("READY"); // 초기 상태
		order.setOrder_name("FitSync Premium");
		order.setOrder_price(subscribeCost);
		order.setOrder_currency("KRW");
		order.setOrder_regdate(new java.sql.Date(System.currentTimeMillis()));
		order.setOrder_provider(method.getMethod_provider());
		
		// PortOne API에서 받은 schedule_id 설정
		order.setSchedule_id(scheduleId);
		
		// 카드 정보 설정
		if (method.getMethod_card() != null) {
			order.setOrder_card(method.getMethod_card());
		}
		if (method.getMethod_card_num() != null) {
			order.setOrder_card_num(method.getMethod_card_num());
		}
		
		// 스케줄 날짜 설정
		try {
			java.time.LocalDateTime scheduleTime;
			if (scheduleDateTime.contains("T")) {
				scheduleTime = java.time.LocalDateTime.parse(scheduleDateTime);
			} else {
				scheduleTime = java.time.LocalDateTime.parse(scheduleDateTime.replace(" ", "T"));
			}
			order.setSchedule_date(java.sql.Timestamp.valueOf(scheduleTime));
			log.info("스케줄 날짜 설정 완료: " + order.getSchedule_date());
		} catch (Exception e) {
			log.error("스케줄 날짜 설정 실패: " + e.getMessage(), e);
		}
		
		log.info("스케줄 주문 정보 생성 완료 - PaymentId: " + paymentId + ", ScheduleId: " + scheduleId + ", ScheduleDate: " + order.getSchedule_date());
		return order;
	}
	
	/**
	 * API 응답에서 schedule_id 추출
	 */
	private String extractScheduleId(String responseBody) {
		try {
			ObjectMapper objectMapper = new ObjectMapper();
			@SuppressWarnings("unchecked")
			Map<String, Object> responseData = objectMapper.readValue(responseBody, Map.class);
			
			// PortOne API v2 응답 구조에 따라 schedule_id 추출
			// 응답 구조: {"schedule": {"id": "schedule_id"}} 또는 {"id": "schedule_id"}
			Object scheduleObj = responseData.get("schedule");
			if (scheduleObj instanceof Map) {
				@SuppressWarnings("unchecked")
				Map<String, Object> schedule = (Map<String, Object>) scheduleObj;
				return (String) schedule.get("id");
			}
			
			// 직접 id 필드가 있는 경우
			return (String) responseData.get("id");
			
		} catch (Exception e) {
			log.error("schedule_id 추출 중 오류 발생: ", e);
			return null;
		}
	}
	
	/**
	 * 성공 응답 생성
	 */
	private Map<String, Object> createSuccessResponse(String paymentId, String scheduleId, String scheduleDateTime, int orderIdx) {
		Map<String, Object> result = new HashMap<>();
		result.put("success", true);
		result.put("message", "결제 예약이 성공적으로 등록되었습니다.");
		result.put("paymentId", paymentId);
		result.put("scheduleId", scheduleId);
		result.put("scheduleDateTime", scheduleDateTime);
		result.put("orderIdx", orderIdx);
		return result;
	}
	
	/**
	 * 오류 응답 생성
	 */
	private Map<String, Object> createErrorResponse(String message, String paymentId) {
		Map<String, Object> result = new HashMap<>();
		result.put("success", false);
		result.put("message", message);
		result.put("paymentId", paymentId);
		return result;
	}

	// 빌링키 결제 예약 취소 (단건)
	@Override
	public Object cancelScheduledPayment(int orderIdx, int memberIdx) {
		try {
			// 예약 취소를 위해 order_idx로 schedule_id 조회
			PaymentOrderVO order = paymentOrderMapper.selectPaymentOrderById(orderIdx);
			if (order == null) {
				log.error("예약 취소 실패 - order_idx: " + orderIdx + "에 해당하는 주문이 없습니다.");
				return Map.of("success", false, "message", "주문을 찾을 수 없습니다.");
			}
			
			String scheduleId = order.getSchedule_id();
			if (scheduleId == null) {
				log.error("예약 취소 실패 - schedule_id가 없습니다. order_idx: " + orderIdx);
				return Map.of("success", false, "message", "예약 정보를 찾을 수 없습니다.");
			}
			
			log.info("단건 예약 취소 시작 - orderIdx: " + orderIdx + ", scheduleId: " + scheduleId);

			// PortOne API로 예약 취소
			HttpResponse<String> response = portOneApiClient.cancelPaymentSchedule(scheduleId);
			log.info("예약 취소 API 응답: Status=" + response.statusCode() + ", Body=" + response.body());

			// API 호출 성공 시 DB 상태 업데이트
			if (portOneApiClient.isSuccessResponse(response)) {
				// API 응답 파싱하여 실제 취소된 스케줄 ID 확인
				ObjectMapper objectMapper = new ObjectMapper();
				@SuppressWarnings("unchecked")
				Map<String, Object> responseData = objectMapper.readValue(response.body(), Map.class);
				
				@SuppressWarnings("unchecked")
				List<String> revokedScheduleIds = (List<String>) responseData.get("revokedScheduleIds");
				
				if (revokedScheduleIds != null && revokedScheduleIds.contains(scheduleId)) {
					// 예약 상태를 CANCELLED로 업데이트
					order.setOrder_status("CANCELLED");
					paymentOrderMapper.updatePaymentStatus(order);
					
					log.info("단건 예약 취소 성공 - ScheduleId: " + scheduleId + " -> CANCELLED");
					return Map.of("success", true, "message", "예약이 성공적으로 취소되었습니다.", "orderIdx", orderIdx, "scheduleId", scheduleId);
				} else {
					log.warn("API 응답에서 해당 스케줄 ID를 찾을 수 없습니다: " + scheduleId);
					return Map.of("success", false, "message", "예약 취소 확인 실패");
				}
			} else {
				log.error("예약 취소 API 실패 - Status: " + response.statusCode() + ", Body: " + response.body());
				return Map.of("success", false, "message", "예약 취소에 실패했습니다. 상태 코드: " + response.statusCode());
			}
		} catch (Exception e) {
			log.error("예약 취소 중 오류 발생 - orderIdx: " + orderIdx, e);
			return Map.of("success", false, "message", "예약 취소 처리 중 오류가 발생했습니다: " + e.getMessage());
		}
	}
	
	// 결제수단명 변경
	@Override
	public boolean renameBillingKey(int memberIdx, int methodIdx, String methodName) {
		try {
			// VO 객체 생성하여 파라미터 전달
			PaymentMethodVO vo = new PaymentMethodVO();
			vo.setMember_idx(memberIdx);
			vo.setMethod_idx(methodIdx);
			vo.setMethod_name(methodName);
			
			int updatedRows = paymentMethodMapper.updatePaymentMethodNameSecure(vo);
			return updatedRows > 0;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}
	
	// 결제수단별 모든 예약 취소 (내부 메서드, 리스트 불러올 필요 없음 추후 수정)
	private void cancelAllSchedulesByMethodIdx(int methodIdx) throws Exception {
		try {
			// 해당 결제수단의 모든 예약 조회
			List<PaymentOrderVO> scheduledPayments = paymentOrderMapper.selectScheduledPaymentsByMethodIdx(methodIdx);
			
			if (scheduledPayments.isEmpty()) {
				log.info("취소할 예약이 없습니다. methodIdx: " + methodIdx);
				return;
			}
			
			// 빌링키 조회
			PaymentMethodVO paymentMethod = paymentMethodMapper.selectBillingKeyByMethodIdx(methodIdx);
			if (paymentMethod == null) {
				throw new RuntimeException("결제수단을 찾을 수 없습니다. methodIdx: " + methodIdx);
			}
			
			String billingKey = paymentMethod.getMethod_key();
			log.info("빌링키로 모든 예약 취소 시작 - billingKey: " + billingKey + ", 예약 건수: " + scheduledPayments.size());
			
			// PortOne API로 빌링키의 모든 예약 취소
			HttpResponse<String> response = portOneApiClient.cancelScheduleByBillingKey(billingKey);
			log.info("예약 취소 API 응답: Status=" + response.statusCode() + ", Body=" + response.body());
			
			if (!portOneApiClient.isSuccessResponse(response)) {
				throw new RuntimeException("예약 취소 API 호출 실패. Status: " + response.statusCode() + ", Body: " + response.body());
			}
			
			// API 응답 파싱하여 취소된 스케줄 ID 확인
			ObjectMapper objectMapper = new ObjectMapper();
			@SuppressWarnings("unchecked")
			Map<String, Object> responseData = objectMapper.readValue(response.body(), Map.class);
			
			@SuppressWarnings("unchecked")
			List<String> revokedScheduleIds = (List<String>) responseData.get("revokedScheduleIds");
			
			if (revokedScheduleIds != null && !revokedScheduleIds.isEmpty()) {
				// DB에서 해당 예약들의 상태를 CANCELLED로 업데이트
				for (PaymentOrderVO scheduledPayment : scheduledPayments) {
					String scheduleId = scheduledPayment.getSchedule_id();
					if (scheduleId != null && revokedScheduleIds.contains(scheduleId)) {
						scheduledPayment.setOrder_status("CANCELLED");
						paymentOrderMapper.updatePaymentStatus(scheduledPayment);
						log.info("예약 상태 업데이트 완료 - scheduleId: " + scheduleId + " -> CANCELLED");
					}
				}
				log.info("총 " + revokedScheduleIds.size() + "개의 예약이 취소되었습니다.");
			} else {
				log.warn("API 응답에서 취소된 스케줄 ID를 찾을 수 없습니다.");
			}
			
		} catch (Exception e) {
			log.error("예약 취소 중 오류 발생: ", e);
			throw new RuntimeException("예약 취소 실패: " + e.getMessage(), e);
		}
	}

	// 결제수단 및 빌링키 삭제 (트랜잭션 필요)
	@Transactional(rollbackFor = Exception.class) // 모든 Exception에 대해 롤백
	@Override
	public boolean deletePaymentMethod(int memberIdx, int methodIdx) {
		try {
			log.info("결제수단 삭제 시작 - memberIdx: " + memberIdx + ", methodIdx: " + methodIdx);
			
			// 1. 먼저 해당 결제수단의 모든 예약 취소 (PortOne API + DB 업데이트)
			cancelAllSchedulesByMethodIdx(methodIdx);
			
			// 2. 빌링키 조회
			PaymentMethodVO paymentMethod = paymentMethodMapper.selectBillingKeyByMethodIdx(methodIdx);
			if (paymentMethod == null) {
				throw new RuntimeException("결제수단을 찾을 수 없습니다. methodIdx: " + methodIdx);
			}
			
			String billingKey = paymentMethod.getMethod_key();
			log.info("빌링키 삭제 시작 - billingKey: " + billingKey);
			
			// 3. PortOne API로 빌링키 삭제
			if (billingKey != null && !billingKey.isEmpty()) {
				HttpResponse<String> response = portOneApiClient.deleteBillingKey(billingKey);
				log.info("빌링키 삭제 API 응답: Status=" + response.statusCode() + ", Body=" + response.body());
				
				// 빌링키 삭제 실패시 예외 발생으로 트랜잭션 롤백
				if (!portOneApiClient.isSuccessResponse(response)) {
					throw new RuntimeException("빌링키 삭제에 실패했습니다. 상태 코드: " + response.statusCode() + ", 응답: " + response.body());
				}
				
				log.info("빌링키 삭제 성공 - billingKey: " + billingKey);
			}
			
			// 4. DB에서 결제수단 삭제
			PaymentMethodVO vo = new PaymentMethodVO();
			vo.setMember_idx(memberIdx);
			vo.setMethod_idx(methodIdx);
			
			int deletedRows = paymentMethodMapper.deletePaymentMethod(vo);
			log.info("DB 결제수단 삭제 결과: " + deletedRows + "건");
			
			if (deletedRows == 0) {
				throw new RuntimeException("DB에서 결제수단 삭제 실패. 해당 결제수단이 존재하지 않거나 권한이 없습니다.");
			}
			
			log.info("결제수단 삭제 완료 - memberIdx: " + memberIdx + ", methodIdx: " + methodIdx);
			return true;
			
		} catch (Exception e) {
			log.error("결제수단 삭제 중 오류 발생 - memberIdx: " + memberIdx + ", methodIdx: " + methodIdx, e);
			// RuntimeException을 다시 throw하여 트랜잭션 롤백 발생
			throw new RuntimeException("결제수단 삭제 실패: " + e.getMessage(), e);
		}
	}

	/**
	 * 빌링키로 카드 정보만 조회
	 * @param billingKey 빌링키
	 * @return 카드 정보 (name, number)
	 */
	public Map<String, Object> getCardInfoByBillingKey(String billingKey) {
		try {
			HttpResponse<String> response = portOneApiClient.getBillingKeyInfo(billingKey);
			
			if (portOneApiClient.isSuccessResponse(response)) {
				ObjectMapper objectMapper = new ObjectMapper();
				@SuppressWarnings("unchecked")
				Map<String, Object> responseData = objectMapper.readValue(response.body(), Map.class);
				
				return extractMethodInfo(responseData);
			} else {
				log.error("카드 정보 조회 실패 - Status: " + response.statusCode() + ", Body: " + response.body());
				Map<String, Object> errorInfo = new HashMap<>();
				errorInfo.put("name", "조회 실패");
				errorInfo.put("number", "****-****-****-****");
				errorInfo.put("error", "API 호출 실패");
				return errorInfo;
			}
			
		} catch (Exception e) {
			log.error("카드 정보 조회 중 오류 발생: ", e);
			Map<String, Object> errorInfo = new HashMap<>();
			errorInfo.put("name", "조회 실패");
			errorInfo.put("number", "****-****-****-****");
			errorInfo.put("error", e.getMessage());
			return errorInfo;
		}
	}
	
	/**
	 * 결제수단 등록 전 중복 체크
	 * @param billingKey 빌링키
	 * @param memberIdx 회원 인덱스
	 * @return 중복 체크 결과와 카드 정보
	 */
	@Override
	public Map<String, Object> checkDuplicatePaymentMethod(String billingKey, int memberIdx) {
		Map<String, Object> result = new HashMap<>();
		
		try {
			// 1. 빌링키로 카드 정보 조회
			Map<String, Object> cardInfo = getCardInfoByBillingKey(billingKey);
			
			if (cardInfo.containsKey("error")) {
				result.put("success", false);
				result.put("message", "카드 정보 조회에 실패했습니다.");
				result.put("error", cardInfo.get("error"));
				return result;
			}
			
			String methodType = (String) cardInfo.get("methodType");
			
			// 2. 카드 결제인 경우에만 중복 확인
			if ("card".equals(methodType)) {
				PaymentMethodVO checkVO = new PaymentMethodVO();
				checkVO.setMember_idx(memberIdx);
				checkVO.setMethod_card((String) cardInfo.get("name"));
				checkVO.setMethod_card_num((String) cardInfo.get("number"));
				
				int duplicateCount = paymentMethodMapper.countDuplicateCard(checkVO);
				
				result.put("success", true);
				result.put("cardInfo", cardInfo);
				result.put("isDuplicate", duplicateCount > 0);
				result.put("duplicateCount", duplicateCount);
				
				if (duplicateCount > 0) {
					PaymentMethodVO duplicateMethod = paymentMethodMapper.findDuplicateCard(checkVO);
					result.put("duplicateMethod", duplicateMethod);
					result.put("message", "동일한 카드가 이미 등록되어 있습니다.");
				} else {
					result.put("message", "새로운 카드입니다.");
				}
			} else {
				// 간편결제 등 카드가 아닌 경우는 중복 체크 안함
				result.put("success", true);
				result.put("cardInfo", cardInfo);
				result.put("isDuplicate", false);
				result.put("duplicateCount", 0);
				result.put("message", "새로운 " + methodType + " 결제수단입니다.");
			}
			
			log.info("중복 체크 결과: " + result);
			return result;
			
		} catch (Exception e) {
			log.error("중복 체크 중 오류 발생: ", e);
			result.put("success", false);
			result.put("message", "중복 체크 중 오류가 발생했습니다: " + e.getMessage());
			result.put("error", e.getClass().getSimpleName());
			return result;
		}
	}
	
	/**
	 * 중복 처리 후 결제수단 저장 (기존 삭제 후 새로 등록)
	 * @param vo 새로운 결제수단 정보
	 * @param replaceExisting 기존 결제수단 교체 여부
	 * @return 처리 결과
	 */
	@Override
	public Map<String, Object> saveBillingKeyWithDuplicateHandling(PaymentMethodVO vo, boolean replaceExisting) {
		Map<String, Object> result = new HashMap<>();
		
		try {
			// 1. 빌링키로 카드 정보 조회
			Map<String, Object> cardInfo = getCardInfoByBillingKey(vo.getMethod_key());
			
			if (cardInfo.containsKey("error")) {
				result.put("success", false);
				result.put("message", "카드 정보 조회에 실패했습니다.");
				return result;
			}
			
			String methodType = (String) cardInfo.get("methodType");
			
			// 2. 결제수단 타입에 따라 카드 정보 설정
			if ("card".equals(methodType)) {
				// 카드 결제인 경우에만 카드 정보 설정
				String cardName = (String) cardInfo.get("name");
				String cardNumber = (String) cardInfo.get("number");
				
				vo.setMethod_card(cardName != null ? cardName : "알 수 없는 카드");
				vo.setMethod_card_num(cardNumber != null ? cardNumber : "****-****-****-****");
				
				// 3. 기존 결제수단 교체인 경우 삭제 먼저 처리 (카드인 경우에만)
				if (replaceExisting) {
					PaymentMethodVO duplicateMethod = paymentMethodMapper.findDuplicateCard(vo);
					if (duplicateMethod != null) {
						PaymentMethodVO deleteVO = new PaymentMethodVO();
						deleteVO.setMember_idx(vo.getMember_idx());
						deleteVO.setMethod_idx(duplicateMethod.getMethod_idx());
						
						int deleteResult = paymentMethodMapper.deletePaymentMethod(deleteVO);
						log.info("기존 중복 결제수단 삭제 결과: " + deleteResult);
					}
				}
			} else {
				// 간편결제 등 카드가 아닌 경우 카드 정보 null로 설정
				vo.setMethod_card(null);
				vo.setMethod_card_num(null);
			}
			
			// 4. 새로운 결제수단 등록
			int insertResult = paymentMethodMapper.insertPaymentMethod(vo);
			
			if (insertResult > 0) {
				result.put("success", true);
				result.put("message", replaceExisting ? "기존 결제수단이 새로운 결제수단으로 교체되었습니다." : "새로운 결제수단이 등록되었습니다.");
				result.put("cardInfo", cardInfo);
				result.put("method_idx", vo.getMethod_idx()); // 새로 등록된 결제수단 ID
			} else {
				result.put("success", false);
				result.put("message", "결제수단 등록에 실패했습니다.");
			}
			
		} catch (Exception e) {
			log.error("결제수단 등록/교체 중 오류 발생: ", e);
			result.put("success", false);
			result.put("message", "결제수단 처리 중 오류가 발생했습니다: " + e.getMessage());
			result.put("error", e.getClass().getSimpleName());
		}
		
		return result;
	}

	/**
	 * 사용자별 결제 기록 조회
	 * @param memberIdx 회원 인덱스
	 * @return 결제 기록 리스트 (최신순)
	 */
	@Override
	public List<PaymentOrderVO> getPaymentHistory(int memberIdx) {
		try {
			log.info("=== 결제 기록 조회 시작 ===");
			log.info("Member ID: " + memberIdx);
			
			// DB 연결 및 매퍼 상태 확인
			if (paymentOrderMapper == null) {
				log.error("PaymentOrderMapper가 null입니다!");
				throw new RuntimeException("PaymentOrderMapper가 초기화되지 않았습니다.");
			}
			
			log.info("PaymentOrderMapper 정상 - DB 조회 시작");
			List<PaymentOrderVO> paymentHistory = paymentOrderMapper.selectPaymentOrdersByMember(memberIdx);
			
			if (paymentHistory == null) {
				log.warn("결제 기록이 null로 반환되었습니다.");
				return new ArrayList<>();
			}
			
			log.info("결제 기록 조회 완료 - memberIdx: " + memberIdx + ", 건수: " + paymentHistory.size());
			
			// 각 결제 기록 상세 정보 로깅
			for (int i = 0; i < paymentHistory.size(); i++) {
				PaymentOrderVO order = paymentHistory.get(i);
				log.info("결제기록[" + i + "] - PaymentId: " + order.getPayment_id() + 
						", Type: " + order.getOrder_type() + ", Status: " + order.getOrder_status() + 
						", Amount: " + order.getOrder_price());
			}
			
			return paymentHistory;
			
		} catch (Exception e) {
			log.error("결제 기록 조회 중 오류 발생 - memberIdx: " + memberIdx, e);
			e.printStackTrace(); // 스택 트레이스 출력
			throw new RuntimeException("결제 기록 조회 실패: " + e.getMessage(), e);
		}
	}

	/**
	 * 사용자별 결제 기록 조회 (결제 수단 정보 포함)
	 * @param memberIdx 회원 인덱스
	 * @return 결제 기록 리스트 (최신순, 결제 수단 정보 포함)
	 */
	@Override
	public List<PaymentOrderWithMethodVO> getPaymentHistoryWithMethod(int memberIdx) {
		try {
			System.out.println("=== 결제 기록 조회 (API) 함수 시작 ===");
			log.info("결제 기록 조회 시작 (API) - memberIdx: " + memberIdx);
			
			// DB에서 기본 결제 주문 정보만 조회 (JOIN 없이)
			List<PaymentOrderWithMethodVO> paymentHistory = paymentOrderMapper.selectPaymentOrdersByMemberWithMethod(memberIdx);
			
			System.out.println("DB 조회 완료 - 건수: " + paymentHistory.size());
			log.info("결제 기록 조회 완료 (API) - memberIdx: " + memberIdx + ", 건수: " + paymentHistory.size());
			
			// 각 결제에 대해 PortOne API로 결제 수단 정보 조회
			for (PaymentOrderWithMethodVO order : paymentHistory) {
				System.out.println("처리 중인 결제 - PaymentId: " + order.getPayment_id() + 
						", OrderType: " + order.getOrder_type() + ", Status: " + order.getOrder_status());

				// 결제 유형에 따라 다른 API 호출
				String orderType = order.getOrder_type();
				String orderStatus = order.getOrder_status();

				try {
					if ("SCHEDULE".equals(orderType) && 
						("READY".equals(orderStatus) || "CANCELLED".equals(orderStatus))) {
						
						// 예약 결제의 경우: schedule_id로 빌링키 조회 후 결제수단 정보 조회
						String scheduleId = order.getSchedule_id();
						if (scheduleId != null) {
							System.out.println("예약 결제 처리 중 - ScheduleId: " + scheduleId);
							
							// PortOne API에서 예약 정보 조회
							HttpResponse<String> scheduleResponse = portOneApiClient.getPaymentSchedule(scheduleId);
							
							System.out.println("예약 정보 API 응답 상태: " + scheduleResponse.statusCode());
							
							if (scheduleResponse.statusCode() >= 200 && scheduleResponse.statusCode() < 300) {
								ObjectMapper objectMapper = new ObjectMapper();
								@SuppressWarnings("unchecked")
								Map<String, Object> scheduleData = objectMapper.readValue(scheduleResponse.body(), Map.class);
								
								// billingKey 추출
								String billingKey = (String) scheduleData.get("billingKey");
								if (billingKey != null) {
									System.out.println("빌링키 조회 성공 - billingKey: " + billingKey);
									
									// 빌링키로 결제수단 정보 조회
									Map<String, Object> cardInfo = getCardInfoByBillingKey(billingKey);
									
									// PaymentOrderWithMethodVO에 API 정보 설정
									String methodType = (String) cardInfo.get("methodType");
									order.setApiMethodType(methodType);
									order.setApiMethodProvider((String) cardInfo.get("provider"));
									order.setApiPgProvider((String) cardInfo.get("pgProvider"));
									
									// 카드 결제인 경우에만 카드 정보 설정
									if ("card".equals(methodType)) {
										order.setApiCardName((String) cardInfo.get("name"));
										order.setApiCardNumber((String) cardInfo.get("number"));
										order.setApiCardPublisher((String) cardInfo.get("publisher"));
										order.setApiCardIssuer((String) cardInfo.get("issuer"));
										order.setApiCardBrand((String) cardInfo.get("brand"));
										order.setApiCardType((String) cardInfo.get("type"));
									} else {
										// 간편결제 등 카드가 아닌 경우 카드 정보 null로 설정
										order.setApiCardName(null);
										order.setApiCardNumber(null);
										order.setApiCardPublisher(null);
										order.setApiCardIssuer(null);
										order.setApiCardBrand(null);
										order.setApiCardType(null);
									}
									
									System.out.println("예약 결제 정보 업데이트 완료 - ScheduleId: " + scheduleId + 
											", 결제수단: " + methodType + ", 카드: " + order.getApiCardName());
								} else {
									System.out.println("예약 정보에서 빌링키를 찾을 수 없습니다.");
									setDefaultApiMethodInfo(order);
								}
							} else {
								System.out.println("예약 정보 API 호출 실패 - Status: " + scheduleResponse.statusCode());
								setDefaultApiMethodInfo(order);
							}
						} else {
							System.out.println("Schedule ID가 없습니다.");
							setDefaultApiMethodInfo(order);
						}
						
					} else {
						// 일반 결제의 경우: payment_id로 결제 정보 조회
						System.out.println("일반 결제 처리 중 - PaymentId: " + order.getPayment_id());
						
						HttpResponse<String> response = portOneApiClient.getPaymentInfo(order.getPayment_id());
						System.out.println("일반 결제 API 응답 상태: " + response.statusCode());
						
						if (portOneApiClient.isSuccessResponse(response)) {
							// JSON 응답 파싱
							ObjectMapper objectMapper = new ObjectMapper();
							@SuppressWarnings("unchecked")
							Map<String, Object> responseData = objectMapper.readValue(response.body(), Map.class);
							
							System.out.println("API 응답 파싱 완료");
							
							// 카드 정보 추출 (개선된 extractMethodInfo 함수 사용)
							Map<String, Object> cardInfo = extractMethodInfo(responseData);
							
							// PaymentOrderWithMethodVO에 API 정보 설정
							String methodType = (String) cardInfo.get("methodType");
							order.setApiMethodType(methodType);
							
							// 카드 결제인 경우에만 카드 정보 설정
							if ("card".equals(methodType)) {
								order.setApiCardName((String) cardInfo.get("name"));
								order.setApiCardNumber((String) cardInfo.get("number"));
								order.setApiCardPublisher((String) cardInfo.get("publisher"));
								order.setApiCardIssuer((String) cardInfo.get("issuer"));
								order.setApiCardBrand((String) cardInfo.get("brand"));
								order.setApiCardType((String) cardInfo.get("type"));
							} else {
								// 간편결제 등 카드가 아닌 경우 카드 정보 null로 설정
								order.setApiCardName(null);
								order.setApiCardNumber(null);
								order.setApiCardPublisher(null);
								order.setApiCardIssuer(null);
								order.setApiCardBrand(null);
								order.setApiCardType(null);
							}

							// channel 정보에서 결제 채널 확인
							@SuppressWarnings("unchecked")
							Map<String, Object> channel = (Map<String, Object>) responseData.get("channel");
							if (channel != null) {
								String pgProvider = (String) channel.get("pgProvider");
								order.setApiMethodProvider(pgProvider != null ? pgProvider : "UNKNOWN");
							} else {
								order.setApiMethodProvider("UNKNOWN");
							}
							
							System.out.println("일반 결제 정보 업데이트 완료 - PaymentId: " + order.getPayment_id() + 
									", 카드: " + order.getApiCardName() + " " + order.getApiCardNumber());
							
						} else {
							System.out.println("API 호출 실패 - Status: " + response.statusCode());
							log.warn("PortOne API 호출 실패 - PaymentId: " + order.getPayment_id() + 
									", Status: " + response.statusCode());
							// API 호출 실패 시 기본값 설정
							setDefaultApiMethodInfo(order);
						}
					}
					
				} catch (Exception apiEx) {
					System.out.println("API 호출 중 예외: " + apiEx.getMessage());
					apiEx.printStackTrace();
					log.error("PortOne API 호출 중 오류 발생 - PaymentId: " + order.getPayment_id(), apiEx);
					// API 호출 실패 시 기본값 설정
					setDefaultApiMethodInfo(order);
				}
			}
			
			System.out.println("=== 결제 기록 조회 (API) 함수 완료 ===");
			log.info("결제 기록 조회 및 API 정보 업데이트 완료 - memberIdx: " + memberIdx);
			return paymentHistory;
			
		} catch (Exception e) {
			System.out.println("전체 프로세스 중 예외 발생: " + e.getMessage());
			e.printStackTrace();
			log.error("결제 기록 조회 실패 (API) - memberIdx: " + memberIdx, e);
			throw new RuntimeException("결제 기록 조회 중 오류가 발생했습니다.", e);
		}
	}

	/**
	 * API 정보 조회 실패 시 기본값 설정
	 * @param order 결제 주문 VO
	 */
	private void setDefaultApiMethodInfo(PaymentOrderWithMethodVO order) {
		order.setApiMethodProvider("UNKNOWN");
		order.setApiMethodType("unknown");
		order.setApiCardName("정보 조회 실패");
		order.setApiCardNumber("****-****-****-****");
		order.setApiCardPublisher("UNKNOWN");
		order.setApiCardIssuer("UNKNOWN");
		order.setApiCardBrand("UNKNOWN");
		order.setApiCardType("UNKNOWN");
	}

	// 결제 예약 정보 조회
	@Override
	public PaymentOrderWithMethodVO getScheduledPaymentOrder(int memberIdx) {
		try {
			PaymentOrderWithMethodVO scheduleOrder = paymentOrderMapper.selectScheduledPaymentOrderByMember(memberIdx);
			if (scheduleOrder == null) {
				log.warn("예약된 결제 주문이 없습니다. memberIdx: " + memberIdx);
				return null;
			}
			// schedule_id로 PortOne API에서 결제 예약 정보 조회
			HttpResponse<String> response = portOneApiClient.getPaymentSchedule(scheduleOrder.getSchedule_id());
			System.out.println(response.body());

			if (portOneApiClient.isSuccessResponse(response)) {
				ObjectMapper objectMapper = new ObjectMapper();
				@SuppressWarnings("unchecked")
				Map<String, Object> responseData = objectMapper.readValue(response.body(), Map.class);
				
				// billingKey 추출
				String billingKey = (String) responseData.get("billingKey");
				if (billingKey != null) {
					System.out.println("빌링키 조회 성공 - billingKey: " + billingKey);
				} else {
					System.out.println("응답에서 billingKey를 찾을 수 없습니다.");
				}
				// billingKey의 카드 정보 추출
				Map<String, Object> cardInfo = getCardInfoByBillingKey(billingKey);
				if (cardInfo != null && !cardInfo.isEmpty()) {
					scheduleOrder.setApiCardName((String) cardInfo.get("name"));
					scheduleOrder.setApiCardNumber((String) cardInfo.get("number"));
					scheduleOrder.setApiMethodType((String) cardInfo.get("methodType"));
					scheduleOrder.setApiMethodProvider((String) cardInfo.get("provider"));
					scheduleOrder.setApiCardPublisher((String) cardInfo.get("publisher"));
					scheduleOrder.setApiCardIssuer((String) cardInfo.get("issuer"));
					scheduleOrder.setApiCardBrand((String) cardInfo.get("brand"));
					scheduleOrder.setApiCardType((String) cardInfo.get("type"));
				} else {
					System.out.println("카드 정보 조회 실패 또는 카드가 아닙니다.");
				}
				
			} else {
				System.out.println("PortOne API 호출 실패 - Status: " + response.statusCode() + ", Body: " + response.body());
			}

			return scheduleOrder;
		} catch (Exception e) {
			e.printStackTrace();
			return null; // TODO: 예외 처리 로직 추가 필요
		}
	}

	// 예약 id로 결제수단 정보 조회
	public Object getPaymentMethodByScheduleId(String scheduleId) {
		try {
			HttpResponse<String> response = portOneApiClient.getPaymentSchedule(scheduleId);
			
			log.info("예약 결제수단 조회 - Status: " + response.statusCode());
			
			if (portOneApiClient.isSuccessResponse(response)) {
				ObjectMapper objectMapper = new ObjectMapper();
				@SuppressWarnings("unchecked")
				Map<String, Object> responseData = objectMapper.readValue(response.body(), Map.class);
				
				return extractMethodInfo(responseData);
			} else {
				log.error("예약 결제수단 조회 실패 - Status: " + response.statusCode() + ", Body: " + response.body());
				Map<String, Object> errorInfo = new HashMap<>();
				errorInfo.put("name", "조회 실패");
				errorInfo.put("number", "****-****-****-****");
				errorInfo.put("error", "API 호출 실패");
				return errorInfo;
			}
			
		} catch (Exception e) {
			log.error("예약 결제수단 조회 중 오류 발생: ", e);
			Map<String, Object> errorInfo = new HashMap<>();
			errorInfo.put("name", "조회 실패");
			errorInfo.put("number", "****-****-****-****");
			errorInfo.put("error", e.getMessage());
			return errorInfo;
		}
	}

	// 예약건 결제수단 변경 (기존 오더 번호, 새로운 결제수단 번호)
	@Override
	@Transactional
	public Map<String, Object> changeSchedulePaymentMethod(int orderIdx, int methodIdx) {
		try {
			log.info("예약 결제수단 변경 시작 - orderIdx: " + orderIdx + ", methodIdx: " + methodIdx);
			
			// 1. 기존 결제 예약 정보 조회
			PaymentOrderVO oldOrder = paymentOrderMapper.selectByOrderIdx(orderIdx);
			if (oldOrder == null) {
				log.error("기존 주문을 찾을 수 없습니다 - orderIdx: " + orderIdx);
				return createErrorResponse("주문을 찾을 수 없습니다.", null);
			}
			
			// 2. 새로운 결제수단 정보 조회
			PaymentMethodVO newMethod = paymentMethodMapper.selectByMethodIdx(methodIdx);
			if (newMethod == null) {
				log.error("새 결제수단을 찾을 수 없습니다 - methodIdx: " + methodIdx);
				return createErrorResponse("결제수단을 찾을 수 없습니다.", null);
			}
			
			String oldScheduleId = oldOrder.getSchedule_id();
			if (oldScheduleId == null) {
				log.error("기존 예약의 schedule_id가 없습니다 - orderIdx: " + orderIdx);
				return createErrorResponse("예약 정보가 올바르지 않습니다.", null);
			}
			
			log.info("기존 예약 정보 - ScheduleId: " + oldScheduleId + ", ScheduleDate: " + oldOrder.getSchedule_date());
			
			// 3. Date → PortOne API 형식 문자열 변환
			String scheduleDateTime = convertDateToPortOneFormat(oldOrder.getSchedule_date());
			if (scheduleDateTime == null) {
				log.error("날짜 변환 실패 - ScheduleDate: " + oldOrder.getSchedule_date());
				return createErrorResponse("예약 날짜 처리 중 오류가 발생했습니다.", null);
			}
			
			log.info("변환된 예약 시간 - Original: " + oldOrder.getSchedule_date() + ", Converted: " + scheduleDateTime);
			
			// 4. 기존 예약 취소
			log.info("기존 예약 취소 시작 - ScheduleId: " + oldScheduleId);
			HttpResponse<String> cancelResponse = portOneApiClient.cancelPaymentSchedule(oldScheduleId);
			
			if (!portOneApiClient.isSuccessResponse(cancelResponse)) {
				log.error("기존 예약 취소 실패 - Status: " + cancelResponse.statusCode() + ", Body: " + cancelResponse.body());
				return createErrorResponse("기존 예약 취소에 실패했습니다.", null);
			}
			
			log.info("기존 예약 취소 성공");
			
			// 5. 새로운 결제수단으로 예약 생성
			String newPaymentId = generatePaymentId();
			String billingKey = newMethod.getMethod_key();
			String channelKey = getChannelKey(newMethod.getMethod_provider());
			
			log.info("새 예약 생성 시작 - PaymentId: " + newPaymentId + ", BillingKey: " + billingKey + 
					", ChannelKey: " + channelKey + ", ScheduleTime: " + scheduleDateTime);
			
			HttpResponse<String> createResponse = portOneApiClient.createPaymentSchedule(
				newPaymentId, billingKey, channelKey, "FitSync Premium", subscribeCost, scheduleDateTime
			);
			
			if (!portOneApiClient.isSuccessResponse(createResponse)) {
				log.error("새 예약 생성 실패 - Status: " + createResponse.statusCode() + ", Body: " + createResponse.body());
				return createErrorResponse("새 예약 생성에 실패했습니다.", newPaymentId);
			}
			
			// 6. 새 schedule_id 추출
			String newScheduleId = extractScheduleId(createResponse.body());
			if (newScheduleId == null) {
				log.error("새 schedule_id 추출 실패 - Response: " + createResponse.body());
				return createErrorResponse("새 예약 등록에 실패했습니다.", newPaymentId);
			}
			
			log.info("새 예약 생성 성공 - NewScheduleId: " + newScheduleId);
			
			// 7. DB 업데이트 - 기존 주문 정보를 새로운 정보로 업데이트
			oldOrder.setPayment_id(newPaymentId);
			oldOrder.setMethod_idx(methodIdx);
			oldOrder.setSchedule_id(newScheduleId);
			oldOrder.setOrder_provider(newMethod.getMethod_provider());
			
			// 카드 정보 업데이트
			if (newMethod.getMethod_card() != null) {
				oldOrder.setOrder_card(newMethod.getMethod_card());
			} else {
				oldOrder.setOrder_card(null);
			}
			if (newMethod.getMethod_card_num() != null) {
				oldOrder.setOrder_card_num(newMethod.getMethod_card_num());
			} else {
				oldOrder.setOrder_card_num(null);
			}
			
			// DB 업데이트
			paymentOrderMapper.updateScheduledPaymentMethod(oldOrder);
			
			log.info("DB 업데이트 완료 - OrderIdx: " + orderIdx + ", NewMethodIdx: " + methodIdx + 
					", NewScheduleId: " + newScheduleId);
			
			// 8. 성공 응답 반환
			Map<String, Object> result = new HashMap<>();
			result.put("success", true);
			result.put("message", "결제수단이 성공적으로 변경되었습니다.");
			result.put("orderIdx", orderIdx);
			result.put("newPaymentId", newPaymentId);
			result.put("newMethodIdx", methodIdx);
			result.put("newScheduleId", newScheduleId);
			result.put("scheduleDateTime", scheduleDateTime);
			result.put("oldScheduleId", oldScheduleId);
			
			return result;
			
		} catch (Exception e) {
			log.error("예약 결제수단 변경 중 오류 발생 - orderIdx: " + orderIdx + ", methodIdx: " + methodIdx, e);
			
			Map<String, Object> errorResult = new HashMap<>();
			errorResult.put("success", false);
			errorResult.put("message", "결제수단 변경 중 오류가 발생했습니다: " + e.getMessage());
			errorResult.put("error", e.getClass().getSimpleName());
			errorResult.put("orderIdx", orderIdx);
			
			return errorResult;
		}
	}

	/**
	 * Date/Timestamp를 PortOne API 형식으로 변환
	 * @param scheduleDate DB의 schedule_date (java.util.Date 또는 java.sql.Timestamp)
	 * @return PortOne API 형식 문자열 (ISO 8601 with timezone)
	 */
	private String convertDateToPortOneFormat(java.util.Date scheduleDate) {
		try {
			if (scheduleDate == null) {
				log.error("scheduleDate가 null입니다.");
				return null;
			}
			
			// 1. Date를 LocalDateTime으로 변환
			java.time.LocalDateTime localDateTime;
			
			if (scheduleDate instanceof java.sql.Timestamp) {
				// Timestamp인 경우
				localDateTime = ((java.sql.Timestamp) scheduleDate).toLocalDateTime();
			} else {
				// 일반 Date인 경우
				localDateTime = scheduleDate.toInstant()
					.atZone(java.time.ZoneId.systemDefault())
					.toLocalDateTime();
			}
			
			// 2. 한국 시간대 적용
			java.time.ZoneId koreaZone = java.time.ZoneId.of("Asia/Seoul");
			java.time.ZonedDateTime koreaZonedTime = localDateTime.atZone(koreaZone);
			
			// 3. PortOne API 형식으로 변환 (ISO 8601 with offset)
			String portOneFormat = koreaZonedTime.format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME);
			
			log.info("날짜 변환 성공 - Input: " + scheduleDate + " → Output: " + portOneFormat);
			return portOneFormat;
			
		} catch (Exception e) {
			log.error("날짜 변환 실패 - Input: " + scheduleDate, e);
			return null;
		}
	}

	/**
	 * 다음 달 자동 결제 예약 (정기 결제용)
	 * 결제 성공 시 31일 후 동일한 결제수단으로 자동 예약
	 * @param completedOrder 완료된 결제 주문 정보
	 * @return 예약 결과
	 */
	@Override
	public Map<String, Object> scheduleNextMonthPayment(PaymentOrderVO completedOrder) {
		try {
			log.info("다음 달 자동 결제 예약 시작 - CompletedOrderIdx: " + completedOrder.getOrder_idx() + 
					", MemberIdx: " + completedOrder.getMember_idx() + ", MethodIdx: " + completedOrder.getMethod_idx());
			
			// 1. 결제수단이 여전히 유효한지 확인
			PaymentMethodVO paymentMethod = paymentMethodMapper.selectByMethodIdx(completedOrder.getMethod_idx());
			if (paymentMethod == null) {
				log.warn("결제수단을 찾을 수 없음 - MethodIdx: " + completedOrder.getMethod_idx());
				return Map.of("success", false, "message", "결제수단을 찾을 수 없습니다.");
			}
			
			// 2. 다음 결제일 계산 (31일 후)
			java.time.LocalDateTime nextPaymentDateTime = java.time.LocalDateTime.now()
					.plusDays(31)
					.withHour(0)  // 자정으로 고정
					.withMinute(0)
					.withSecond(0)
					.withNano(0);
			
			log.info("다음 결제 예정일: " + nextPaymentDateTime);
			
			// 3. 새로운 PaymentId 생성
			String nextPaymentId = generatePaymentId();
			
			// 4. 다음 달 결제 예약 호출
			String scheduleDateTime = nextPaymentDateTime.format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME);
			Object scheduleResult = scheduleBillingKey(
				nextPaymentId, 
				completedOrder.getMethod_idx(), 
				completedOrder.getMember_idx(), 
				scheduleDateTime
			);
			
			// 5. 결과 확인 및 로깅
			@SuppressWarnings("unchecked")
			Map<String, Object> result = (Map<String, Object>) scheduleResult;
			boolean isSuccess = (boolean) result.get("success");
			
			if (isSuccess) {
				log.info("다음 달 자동 결제 예약 성공 - NextPaymentId: " + nextPaymentId + 
						", NextPaymentDate: " + nextPaymentDateTime + ", ScheduleId: " + result.get("scheduleId"));
				System.out.println("🔄 [자동 예약] 다음 달 결제 예약 완료 - MemberIdx: " + completedOrder.getMember_idx() + 
						", 예약일: " + nextPaymentDateTime.toLocalDate());
						
				// 성공 응답에 추가 정보 포함
				result.put("originalOrderIdx", completedOrder.getOrder_idx());
				result.put("nextPaymentDate", nextPaymentDateTime.toString());
				result.put("isAutoScheduled", true);
			} else {
				log.error("다음 달 자동 결제 예약 실패 - " + result.get("message"));
				System.err.println("❌ [자동 예약] 다음 달 결제 예약 실패 - MemberIdx: " + completedOrder.getMember_idx());
			}
			
			return result;
			
		} catch (Exception e) {
			log.error("다음 달 자동 결제 예약 중 오류 발생 - CompletedOrderIdx: " + completedOrder.getOrder_idx(), e);
			
			Map<String, Object> errorResult = new HashMap<>();
			errorResult.put("success", false);
			errorResult.put("message", "다음 달 자동 결제 예약 중 오류가 발생했습니다: " + e.getMessage());
			errorResult.put("error", e.getClass().getSimpleName());
			errorResult.put("originalOrderIdx", completedOrder.getOrder_idx());
			errorResult.put("isAutoScheduled", true);
			
			return errorResult;
		}
	}

	/**
	 * PaymentId 생성 유틸리티 메서드
	 * @return 고유한 PaymentId
	 */
	private String generatePaymentId() {
		return "auto_" + System.currentTimeMillis() + "_" + 
			   java.util.UUID.randomUUID().toString().substring(0, 8);
	}

	/**
	 * 구독자 여부 확인 및 상세 정보 반환
	 * @param memberIdx 회원 인덱스
	 * @return 구독 상태 정보
	 */
	@Override
	public Map<String, Object> checkSubscriptionStatus(int memberIdx) {
		Map<String, Object> result = new HashMap<>();
		
		try {
			log.info("구독자 상태 확인 시작 - memberIdx: " + memberIdx);
			
			// 1. 활성 구독 확인
			PaymentOrderVO activeSubscription = paymentOrderMapper.selectActiveSubscription(memberIdx);
			
			boolean isSubscriber = (activeSubscription != null);
			result.put("isSubscriber", isSubscriber);
			result.put("memberIdx", memberIdx);
			
			if (isSubscriber) {
				// 2. 구독 상세 정보 설정
//				result.put("subscriptionType", activeSubscription.getOrder_type());
//				result.put("subscriptionStatus", activeSubscription.getOrder_status());
				
				// 3. 구독 유효기간 계산
				if ("PAID".equals(activeSubscription.getOrder_status()) && activeSubscription.getOrder_paydate() != null) {
					// 결제 완료된 구독의 경우
					java.util.Date payDate = activeSubscription.getOrder_paydate();
					java.util.Calendar cal = java.util.Calendar.getInstance();
					cal.setTime(payDate);
					cal.add(java.util.Calendar.DAY_OF_MONTH, 31);
					java.util.Date expiryDate = cal.getTime();
					
					result.put("lastPaymentDate", payDate);
//					result.put("subscriptionExpiryDate", expiryDate);
//					result.put("subscriptionDaysLeft", calculateDaysLeft(expiryDate));
					
					log.info("✅ 활성 구독자 - 마지막 결제일: " + payDate + ", 만료일: " + expiryDate);
					
				} else if ("READY".equals(activeSubscription.getOrder_status()) && activeSubscription.getSchedule_date() != null) {
					// 예약 결제 대기 중인 구독의 경우
//					result.put("nextPaymentDate", activeSubscription.getSchedule_date());
//					result.put("scheduleId", activeSubscription.getSchedule_id());
					
					log.info("📅 예약 구독자 - 다음 결제 예정일: " + activeSubscription.getSchedule_date());
				}
				
				// 4. 결제 수단 정보 (있는 경우)
				if (activeSubscription.getMethod_idx() > 0) {
//					result.put("paymentMethodIdx", activeSubscription.getMethod_idx());
				}
				
				// 5. 구독 시작 정보
//				result.put("subscriptionStartDate", activeSubscription.getOrder_regdate());
//				result.put("subscriptionAmount", activeSubscription.getOrder_price());
//				result.put("orderIdx", activeSubscription.getOrder_idx());

				// 사용량 조회
				Map<String, Object> userUseage = apiLogMapper.selectTokenUsageDuringLatestPaidOrder(memberIdx);
				System.out.println("userUseage!!!!! : " + userUseage);
				int inputTokens = ((BigDecimal) userUseage.get("INPUT_TOKENS")).intValue();
				int outputTokens = ((BigDecimal) userUseage.get("OUTPUT_TOKENS")).intValue();

				double totalCost = calculateCost(inputTokens, outputTokens);

//				result.put("inputToken", inputTokens);
//				result.put("outputToken", outputTokens);
				result.put("totalCost", totalCost);
				result.put("isLog", true);

				
			} else {
				log.info("❌ 비구독자 - memberIdx: " + memberIdx);
				result.put("message", "현재 유효한 구독이 없습니다.");
				ApiLogVO log = apiLogMapper.selectFirstRoutineLog(memberIdx);
				System.out.println(log);
				boolean isLog = log != null ? true : false;
				result.put("isLog", isLog);
			}
			
			// result.put("checkTimestamp", System.currentTimeMillis());
			log.info("구독자 상태 확인 완료 - memberIdx: " + memberIdx + ", isSubscriber: " + isSubscriber);
			
			return result;
			
		} catch (Exception e) {
			log.error("구독자 상태 확인 중 오류 발생 - memberIdx: " + memberIdx, e);
			result.put("isSubscriber", false);
			result.put("error", true);
			result.put("message", "구독 상태 확인 중 오류가 발생했습니다: " + e.getMessage());
			return result;
		}
	}
	
	// 최근 결제완료건 or 최근 결제예약건 (구독 메인 페이지)
	@Override
	public PaymentOrderVO getRecentOrder(int memberIdx) {
		return paymentOrderMapper.selectRecentOrederBymemberIdx(memberIdx);
	}

	/**
	 * 만료일까지 남은 일수 계산
	 * @param expiryDate 만료일
	 * @return 남은 일수 (음수면 만료됨)
	 */
	private int calculateDaysLeft(java.util.Date expiryDate) {
		long currentTime = System.currentTimeMillis();
		long expiryTime = expiryDate.getTime();
		long diffTime = expiryTime - currentTime;
		return (int) (diffTime / (1000 * 60 * 60 * 24));
	}

	// 포트원 예약 취소 api
	private HttpResponse<String> portOneCancelSchedules(String scheduleId) {
		try {
			return portOneApiClient.cancelPaymentSchedule(scheduleId);
		} catch (Exception e) {
			log.error("예약 취소 API 호출 중 오류 발생: ", e);
			return null;
		}
	}

	// GPT-4o 요금 (USD 기준, 2024년 6월 기준)
    private static final double INPUT_COST_PER_1000 = 0.005;   // $5 / 1M tokens
    private static final double OUTPUT_COST_PER_1000 = 0.015;  // $15 / 1M tokens

    /**
     * 예상 비용 계산 (USD 기준)
     * @param inputTokens 입력 토큰 수
     * @param outputTokens 출력 토큰 수
     * @return 총 비용 (소수점 6자리 반올림)
     */
    public static double calculateCost(int inputTokens, int outputTokens) {
        double inputCost = inputTokens * INPUT_COST_PER_1000 / 1000.0;
        double outputCost = outputTokens * OUTPUT_COST_PER_1000 / 1000.0;
        double total = inputCost + outputCost;

        // 소수점 6자리까지 반올림
        return Math.round(total * 1_000_000) / 1_000_000.0;
    }
}

